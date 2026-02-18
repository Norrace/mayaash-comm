import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  initiateStkPush,
  StkPushRequest,
  MpesaCallbackResponse,
  validateCallback
} from '@/lib/mpesa'

// POST /api/mpesa/stkpush - Initiate M-Pesa STK Push
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, amount, workerId } = body

    // Validate required fields
    if (!phone || !amount) {
      return NextResponse.json(
        { success: false, error: 'Phone number and amount are required' },
        { status: 400 }
      )
    }

    // Validate phone number format (must start with 07, 01, or 254)
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    if (
      !cleanPhone.startsWith('07') &&
      !cleanPhone.startsWith('01') &&
      !cleanPhone.startsWith('254') &&
      cleanPhone.length !== 10
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format. Use format: 07XXXXXXXX or 01XXXXXXXX' },
        { status: 400 }
      )
    }

    // Validate amount (must be exactly 50 KSH)
    if (amount !== 50) {
      return NextResponse.json(
        { success: false, error: 'Amount must be 50 KSH' },
        { status: 400 }
      )
    }

    // M-Pesa Configuration
    const config = {
      consumerKey: process.env.MPESA_CONSUMER_KEY || '',
      consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
      environment: (process.env.MPESA_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
      businessShortCode: process.env.MPESA_BUSINESS_SHORT_CODE || '6604923',
      passKey: process.env.MPESA_PASS_KEY || '',
      callbackUrl: process.env.MPESA_CALLBACK_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/mpesa/callback`
    }

    // Validate configuration
    if (!config.consumerKey || !config.consumerSecret || !config.businessShortCode || !config.passKey) {
      return NextResponse.json(
        { success: false, error: 'M-Pesa API credentials not configured' },
        { status: 500 }
      )
    }

    // Generate merchant reference
    const merchantRef = `MAY-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Create payment record with pending status
    const payment = await db.payment.create({
      data: {
        workerId: workerId || null,
        phone: cleanPhone,
        amount,
        merchantRef,
        status: 'pending'
      }
    })

    // Initiate STK Push
    const stkResponse = await initiateStkPush(config, {
      phoneNumber: cleanPhone,
      amount,
      accountReference: merchantRef
    })

    console.log('STK Push Response:', stkResponse)

    // Check if STK push was accepted
    if (stkResponse.ResponseCode === '0') {
      return NextResponse.json({
        success: true,
        payment: {
          id: payment.id,
          merchantRef,
          phone: cleanPhone,
          amount,
          status: 'pending',
          merchantRequestID: stkResponse.MerchantRequestID,
          checkoutRequestID: stkResponse.CheckoutRequestID,
          customerMessage: stkResponse.CustomerMessage
        },
        message: 'STK push initiated. Please check your phone to complete payment.',
        tillNumber: '6604923 BUY GOODS GREEN COLOR NETWORKS'
      })
    } else {
      // Payment request failed
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: 'failed'
        }
      })

      return NextResponse.json({
        success: false,
        error: stkResponse.ResponseMessage || 'Failed to initiate STK push'
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Error initiating STK push:', error)

    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to initiate payment',
        details: process.env.MPESA_ENVIRONMENT === 'production' ? undefined : error?.stack
      },
      { status: 500 }
    )
  }
}
