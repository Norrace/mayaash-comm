import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  MpesaCallbackResponse,
  validateCallback
} from '@/lib/mpesa'

// POST /api/mpesa/callback - M-Pesa STK Push Callback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('M-Pesa Callback received:', JSON.stringify(body, null, 2))

    // Extract callback data
    const { Body } = body
    const { stkCallback }: { stkCallback?: MpesaCallbackResponse } = Body

    if (!stkCallback) {
      console.error('Invalid callback format:', body)
      return NextResponse.json({ ResultCode: 1, ResultDesc: 'Invalid format' })
    }

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      ResultParameters
    } = stkCallback

    // Validate callback signature (in production)
    const passKey = process.env.MPESA_PASS_KEY
    const isValidSignature = validateCallback(stkCallback, passKey)

    if (!isValidSignature) {
      console.error('Invalid callback signature')
      return NextResponse.json({ ResultCode: 1, ResultDesc: 'Invalid signature' })
    }

    // Find the payment by merchant request ID or checkout request ID
    const payment = await db.payment.findFirst({
      where: {
        OR: [
          { mpesaRef: MerchantRequestID },
          { mpesaRef: CheckoutRequestID }
        ]
      }
    })

    if (!payment) {
      console.error('Payment not found for request:', MerchantRequestID)
      return NextResponse.json({ ResultCode: 1, ResultDesc: 'Payment not found' })
    }

    // Process the result
    const isSuccessful = ResultCode === '0' || ResultCode === 0
    const transactionResult = ResultParameters?.ResultCode || ResultCode
    const transactionMessage = ResultDesc || ResultParameters?.ResultDesc || 'Payment processing'

    // Update payment based on result
    const updateData: any = {
      mpesaRef: MerchantRequestID || CheckoutRequestID,
      status: isSuccessful ? 'completed' : 'failed',
      updatedAt: new Date()
    }

    if (isSuccessful && ResultParameters) {
      // Add M-Pesa transaction details
      updateData.mpesaReceiptNumber = ResultParameters.MpesaReceiptNumber
      updateData.transactionDate = ResultParameters.TransactionDate
      updateData.transactionMessage = ResultDesc
    } else {
      // Add failure reason
      updateData.transactionMessage = ResultDesc
    }

    await db.payment.update({
      where: { id: payment.id },
      data: updateData
    })

    console.log(`Payment ${payment.merchantRef} updated to status: ${isSuccessful ? 'completed' : 'failed'}`)

    // Return success response to M-Pesa
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Callback processed successfully',
      ThirdPartyTransID: MerchantRequestID
    })
  } catch (error: any) {
    console.error('Error processing M-Pesa callback:', error)

    return NextResponse.json({
      ResultCode: 1,
      ResultDesc: 'Error processing callback'
    }, { status: 500 })
  }
}
