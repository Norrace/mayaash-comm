import crypto from 'crypto'
import axios, { AxiosInstance } from 'axios'

// M-Pesa Configuration Types
export interface MpesaConfig {
  consumerKey: string
  consumerSecret: string
  environment: 'sandbox' | 'production'
  businessShortCode: string
  passKey: string
  callbackUrl: string
}

export interface StkPushRequest {
  phoneNumber: string
  amount: number
  accountReference: string
  transactionDesc?: string
}

export interface MpesaCallbackResponse {
  MerchantRequestID?: string
  CheckoutRequestID?: string
  ResultCode?: number
  ResultDesc?: string
  ResultParameters?: {
    ResultCode?: string
    ResultDesc?: string
    MpesaReceiptNumber?: string
    TransactionDate?: string
    Amount?: number
    MpesaPhoneNumber?: string
    Balance?: number
  }
}

export interface StkPushResponse {
  MerchantRequestID?: string
  CheckoutRequestID?: string
  ResponseCode?: number
  ResponseMessage?: string
  CustomerMessage?: string
}

/**
 * Generate timestamp in M-Pesa format (YYYYMMDDHHmmss)
 */
export const generateTimestamp = (): string => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}${month}${day}${hours}${minutes}${seconds}`
}

/**
 * Generate password for STK Push
 * Password = Base64 encoded string of shortcode + passkey + timestamp
 */
export const generatePassword = (timestamp: string, shortCode: string, passKey: string): string => {
  const password = `${shortCode}${passKey}${timestamp}`
  return Buffer.from(password).toString('base64')
}

/**
 * Format phone number for M-Pesa (254 prefix)
 * M-Pesa requires phone numbers to start with 254
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleanPhone = phone.replace(/[^0-9]/g, '')

  if (cleanPhone.startsWith('0')) {
    return `254${cleanPhone.slice(1)}`
  } else if (cleanPhone.startsWith('7')) {
    return `254${cleanPhone}`
  } else if (cleanPhone.startsWith('01')) {
    return `254${cleanPhone.slice(2)}`
  } else if (cleanPhone.startsWith('254')) {
    return cleanPhone
  } else {
    throw new Error('Invalid phone number format. Use format: 07XXXXXXXX or 01XXXXXXXX')
  }
}

/**
 * Generate basic auth header
 */
export const getAuthHeader = (consumerKey: string, consumerSecret: string): string => {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')
  return `Basic ${auth}`
}

/**
 * Get OAuth access token from M-Pesa
 */
export const getAccessToken = async (
  config: MpesaConfig
): Promise<string> => {
  const authHeader = getAuthHeader(config.consumerKey, config.consumerSecret)

  const url = config.environment === 'sandbox'
    ? 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
    : 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'

  try {
    const response = await axios.post(url, {}, {
      headers: {
        Authorization: authHeader
      }
    })

    return response.data.access_token
  } catch (error: any) {
    console.error('Error getting access token:', error)
    throw new Error(`Failed to get access token: ${error.message}`)
  }
}

/**
 * Initiate STK Push payment
 */
export const initiateStkPush = async (
  config: MpesaConfig,
  requestData: StkPushRequest
): Promise<StkPushResponse> => {
  const accessToken = await getAccessToken(config)
  const timestamp = generateTimestamp()
  const password = generatePassword(timestamp, config.businessShortCode, config.passKey)

  const formattedPhone = formatPhoneNumber(requestData.phoneNumber)

  const url = config.environment === 'sandbox'
    ? 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
    : 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'

  const payload = {
    BusinessShortCode: config.businessShortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: requestData.amount,
    PartyA: formattedPhone,
    PartyB: config.businessShortCode,
    PhoneNumber: formattedPhone,
    CallBackURL: config.callbackUrl,
    AccountReference: requestData.accountReference,
    TransactionDesc: requestData.transactionDesc || 'Work ID Card Download'
  }

  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    return response.data
  } catch (error: any) {
    console.error('Error initiating STK push:', error)
    throw new Error(`STK Push failed: ${error.response?.data?.errorMessage || error.message}`)
  }
}

/**
 * Validate callback signature from M-Pesa (production only)
 */
export const validateCallback = (
  callbackData: any,
  passKey: string
): boolean => {
  // In production, validate the callback signature
  // For now, we'll skip signature validation
  return true
}
