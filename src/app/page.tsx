'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Upload, Download, Shield, Lock, User, MapPin, Calendar, QrCode, X, Phone, Mail, CreditCard, Sparkles, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import QRCode from 'qrcode'
import { toPng } from 'html-to-image'
import AdminDashboard from '@/components/admin-dashboard'

export default function Home() {
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [showAdminDashboard, setShowAdminDashboard] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [loggedInAdminEmail, setLoggedInAdminEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [idNumberInput, setIdNumberInput] = useState('')
  const [selectedWorker, setSelectedWorker] = useState<any>(null)
  const [workersList, setWorkersList] = useState<any[]>([])
  const [territory, setTerritory] = useState('')
  const [region, setRegion] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<'none' | 'pending' | 'completed'>('none')
  const [downloadCode, setDownloadCode] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [merchantRef, setMerchantRef] = useState<string>('')
  const [territories, setTerritories] = useState<string[]>(['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Meru', 'Nyeri'])
  const [regions, setRegions] = useState<string[]>(['Central', 'Coast', 'Eastern', 'Nairobi', 'North Eastern', 'Nyanza', 'Rift Valley', 'Western'])

  const idCardRef = useRef<HTMLDivElement>(null)
  const cardContainerRef = useRef<HTMLDivElement>(null)

  const roles = ['Team Leader', 'Brand Ambassador']
  const tillNumber = '6604923 BUY GOODS GREEN COLOR NETWORKS'

  const expiryDate = new Date()
  expiryDate.setMonth(expiryDate.getMonth() + 3)
  const formattedExpiry = expiryDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })

  // Fetch territories and regions on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [terrRes, regRes] = await Promise.all([
          fetch('/api/territories'),
          fetch('/api/regions')
        ])
        const terrData = await terrRes.json()
        const regData = await regRes.json()
        if (terrData.success) setTerritories(terrData.territories.filter((t: any) => t.isActive).map((t: any) => t.name))
        if (regData.success) setRegions(regData.regions.filter((r: any) => r.isActive).map((r: any) => r.name))
      } catch (error) {
        console.error('Error fetching territories/regions:', error)
      }
    }
    fetchData()
  }, [])

  // Generate QR code when details change
  useEffect(() => {
    const generateQR = async () => {
      if (selectedWorker && selectedRole && territory && region) {
        const qrData = {
          company: 'Mayaash Communication Limited',
          role: `Safaricom ${selectedRole}`,
          idNumber: selectedWorker.idNumber,
          name: selectedWorker.fullName,
          phone: selectedWorker.phone,
          territory,
          region,
          expiryDate: formattedExpiry,
        }
        try {
          const url = await QRCode.toDataURL(JSON.stringify(qrData))
          setQrCodeUrl(url)
        } catch (error) {
          console.error('QR Code generation error:', error)
        }
      }
    }

    generateQR()
  }, [selectedWorker, selectedRole, territory, region, formattedExpiry])

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const searchWorkers = async (prefix: string) => {
    if (prefix.length === 5) {
      try {
        const response = await fetch(`/api/workers/search?prefix=${prefix}`)
        const data = await response.json()
        if (data.success) {
          setWorkersList(data.workers)
        }
      } catch (error) {
        console.error('Error searching workers:', error)
      }
    }
  }

  const handleIdNumberChange = async (value: string) => {
    setIdNumberInput(value)
    if (value.length === 5) {
      await searchWorkers(value)
    } else {
      setWorkersList([])
    }
  }

  const handleMpesaPayment = async () => {
    if (!selectedWorker) {
      alert('Please select a worker first')
      return
    }

    setPaymentStatus('pending')
    try {
      const response = await fetch('/api/mpesa/stkpush', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: selectedWorker.phone,
          amount: 50,
          workerId: selectedWorker.idNumber
        })
      })

      const data = await response.json()

      if (data.success) {
        setMerchantRef(data.payment.merchantRef)

        // Poll for payment status every 2 seconds
        // Note: Real M-Pesa STK push is asynchronous
        // The actual payment completion comes via callback
        // We poll here just to check if callback has updated the database
        const checkStatus = setInterval(async () => {
          try {
            const statusResponse = await fetch(`/api/payments/${data.payment.merchantRef}`)
            const statusData = await statusResponse.json()

            if (statusData.success) {
              if (statusData.payment.status === 'completed') {
                clearInterval(checkStatus)
                setPaymentStatus('completed')
              } else if (statusData.payment.status === 'failed') {
                clearInterval(checkStatus)
                setPaymentStatus('none')
                alert(`Payment failed: ${statusData.payment.transactionMessage || 'Please try again or use a download code.'}`)
              }
              // If still pending, continue polling
            }
          } catch (error) {
            console.error('Error checking payment status:', error)
          }
        }, 2000)

        // Timeout after 3 minutes (real M-Pesa payments can take up to this)
        setTimeout(() => {
          clearInterval(checkStatus)
          if (paymentStatus === 'pending') {
            setPaymentStatus('none')
            alert('Payment timeout. The prompt may have expired or been cancelled. Please try again.')
          }
        }, 180000)
      } else {
        setPaymentStatus('none')
        alert(data.error || 'Failed to initiate payment')
      }
    } catch (error: any) {
      console.error('Error initiating payment:', error)
      setPaymentStatus('none')
      alert(error?.message || 'Failed to initiate payment. Please try again.')
    }
  }

  const handleDownloadCode = async () => {
    if (!downloadCode) return

    try {
      const response = await fetch('/api/codes/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: downloadCode })
      })
      const data = await response.json()
      if (data.success) {
        setPaymentStatus('completed')
      } else {
        alert(data.error || 'Invalid code')
      }
    } catch (error) {
      console.error('Error verifying code:', error)
      alert('Failed to verify code')
    }
  }

  const handleDownloadIdCard = async () => {
    if (!cardContainerRef.current || !isFormValid) {
      alert('Please complete all required fields before downloading')
      return
    }

    try {
      // Show loading state
      const downloadButton = document.activeElement as HTMLButtonElement
      if (downloadButton) {
        downloadButton.innerHTML = '<svg class="w-5 h-5 mr-2 animate-spin" viewBox="0 0 24 24"><path d="M12 2v4m0 6v4m6-6v4m0 6v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> Generating...'
        downloadButton.disabled = true
      }

      // Store original overflow
      const originalOverflow = cardContainerRef.current.style.overflow

      // Temporarily remove overflow to capture full card
      cardContainerRef.current.style.overflow = 'visible'

      // Get computed dimensions
      const computedStyle = window.getComputedStyle(cardContainerRef.current)
      const width = parseInt(computedStyle.width)
      const height = parseInt(computedStyle.height)

      // Capture the ID card as an image with proper dimensions
      const dataUrl = await toPng(cardContainerRef.current, {
        cacheBust: true,
        quality: 1.0,
        pixelRatio: 2,
        width: width, // Use actual rendered width
        height: height, // Use actual rendered height
        backgroundColor: '#ffffff', // White background
        useExactWidth: true,
        useExactHeight: true,
      })

      // Restore original overflow
      cardContainerRef.current.style.overflow = originalOverflow

      // Create a download link
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `ID-CARD-${selectedWorker?.idNumber}-${Date.now()}.png`

      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Reset button
      if (downloadButton) {
        downloadButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 21"></polyline></svg> Download ID Card (PNG)'
        downloadButton.disabled = false
      }
    } catch (error) {
      console.error('Error downloading ID card:', error)
      
      // Restore styles in case of error
      if (cardContainerRef.current) {
        cardContainerRef.current.style.overflow = 'visible'
      }
      
      alert('Failed to download ID card. Please try again.')
    }
  }

  const handleAdminLogin = async () => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword })
      })
      const data = await response.json()
      if (data.success) {
        setShowAdminLogin(false)
        setShowAdminDashboard(true)
        setLoggedInAdminEmail(adminEmail)
        setAdminEmail('')
        setAdminPassword('')
      } else {
        alert(data.error || 'Invalid credentials')
      }
    } catch (error) {
      console.error('Error during login:', error)
    }
  }

  const isFormValid = selectedWorker && selectedRole && territory && region && photoPreview

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-32 h-32 bg-green-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 right-20 w-40 h-40 bg-red-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-1/3 w-48 h-48 bg-green-400/10 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg"
            >
              <Shield className="w-8 h-8 text-green-700" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">Mayaash Communication Limited</h1>
              <div className="flex items-center gap-2 text-xs text-green-200">
                <Sparkles className="w-3 h-3" />
                <span>Professional ID Card System</span>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button
              onClick={() => setShowAdminLogin(!showAdminLogin)}
              variant="outline"
              className="bg-white/10 text-white border-white/30 hover:bg-white hover:text-green-700 transition-all shadow-lg"
            >
              <Lock className="w-4 h-4 mr-2" />
              Admin Login
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Admin Login Modal */}
      <AnimatePresence>
        {showAdminLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border border-green-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Admin Login</h2>
                <button
                  onClick={() => setShowAdminLogin(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="admin-email">Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@mayaacomm.co.ke"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="mt-1 h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="admin-password">Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="mt-1 h-12"
                  />
                </div>
                <Button
                  onClick={handleAdminLogin}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 h-12 text-lg shadow-lg"
                >
                  Sign In
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Dashboard */}
      <AdminDashboard
        isOpen={showAdminDashboard}
        onClose={() => {
          setShowAdminDashboard(false)
          setLoggedInAdminEmail('')
        }}
        adminEmail={loggedInAdminEmail}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 relative">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Badge className="mb-4 bg-green-100 text-green-800 text-sm px-4 py-1.5 shadow-md">
                <Sparkles className="w-3 h-3 mr-1" />
                Fast & Secure
              </Badge>
            </motion.div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Download Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-700">Work ID Card</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Access your professional identity card instantly. Secure, fast, and reliable.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Left: Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="shadow-2xl border-2 border-green-100 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
                  <CardTitle className="text-2xl flex items-center gap-2 relative">
                    <User className="w-6 h-6" />
                    Enter Your Details
                  </CardTitle>
                  <CardDescription className="text-green-100 relative">
                    Fill in your information to generate your work ID card
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  {/* Role Selection */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Label className="text-base font-semibold text-gray-700">Role</Label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger className="mt-2 h-12 border-2 focus:border-green-500">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role} value={role}>
                            Safaricom {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>

                  {/* ID Number Input */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Label className="text-base font-semibold text-gray-700">ID Number</Label>
                    <div className="mt-2 space-y-2">
                      <Input
                        type="text"
                        placeholder="Enter first 5 digits of your ID number"
                        value={idNumberInput}
                        onChange={(e) => handleIdNumberChange(e.target.value)}
                        maxLength={5}
                        className="h-12 border-2 focus:border-green-500"
                      />
                      <AnimatePresence>
                        {workersList.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <Select onValueChange={(value) => setSelectedWorker(JSON.parse(value))}>
                              <SelectTrigger className="h-12 border-2 focus:border-green-500">
                                <SelectValue placeholder="Select your ID from the list" />
                              </SelectTrigger>
                              <SelectContent>
                                {workersList.map((worker) => (
                                  <SelectItem key={worker.id} value={JSON.stringify(worker)}>
                                    {worker.idNumber} - {worker.fullName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>

                  {/* Territory & Region */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div>
                      <Label className="text-base font-semibold text-gray-700">Territory</Label>
                      <Select value={territory} onValueChange={setTerritory}>
                        <SelectTrigger className="mt-2 h-12 border-2 focus:border-green-500">
                          <SelectValue placeholder="Territory" />
                        </SelectTrigger>
                        <SelectContent>
                          {territories.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-base font-semibold text-gray-700">Region</Label>
                      <Select value={region} onValueChange={setRegion}>
                        <SelectTrigger className="mt-2 h-12 border-2 focus:border-green-500">
                          <SelectValue placeholder="Region" />
                        </SelectTrigger>
                        <SelectContent>
                          {regions.map((r) => (
                            <SelectItem key={r} value={r}>
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </motion.div>

                  {/* Photo Upload */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Label className="text-base font-semibold text-gray-700">Passport Photo</Label>
                    <div className="mt-2 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-500 hover:bg-green-50/30 transition-all cursor-pointer group">
                      <input
                        type="file"
                        id="photo-upload"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <label htmlFor="photo-upload" className="cursor-pointer block">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="inline-block"
                        >
                          <Upload className="w-12 h-12 mx-auto text-gray-400 group-hover:text-green-600 mb-3 transition-colors" />
                        </motion.div>
                        <p className="text-sm text-gray-600 group-hover:text-green-700 transition-colors">
                          {photoPreview ? '✓ Photo uploaded successfully' : 'Click to upload your passport photo'}
                        </p>
                      </label>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right: ID Card Preview */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="sticky top-24"
            >
              <Card ref={cardContainerRef} className="shadow-2xl border-4 border-green-200 overflow-hidden">
                {/* ID Card Design - Professional & Filled Up - 85.6mm x 54mm */}
                <div
                  ref={idCardRef}
                  className="relative bg-gradient-to-br from-green-700 via-green-800 to-green-900 text-white overflow-hidden"
                  style={{
                    aspectRatio: '85.6/54',
                    width: '100%',
                    maxWidth: '450px',
                    margin: '0 auto'
                  }}
                >
                  {/* Decorative Border Pattern */}
                  <div className="absolute inset-0 border-[3px] border-white/30 rounded-lg pointer-events-none" />
                  <div className="absolute inset-[4px] border border-white/20 rounded-lg pointer-events-none" />

                  {/* Header Section */}
                  <div className="relative z-10 border-b-3 border-white/40 pb-3 px-5 pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-[13px] font-black tracking-widest leading-none uppercase">Mayaash Communication</h3>
                        <p className="text-[10px] font-bold tracking-wide text-green-100 mt-0.5">EMPLOYEE IDENTIFICATION CARD</p>
                      </div>
                      {/* QR Code - Positioned in Header */}
                      {qrCodeUrl && (
                        <div className="bg-white rounded-lg overflow-hidden border-3 border-white/50 shadow-2xl">
                          <img src={qrCodeUrl} alt="QR Code" className="w-[55px] h-[55px]" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Main Content - Fills Available Space */}
                  <div className="relative z-10 flex gap-4 px-5 py-3 h-[calc(100%-70px)]">
                    {/* Left: Details Section - Expands to fill space */}
                    <div className="flex-1 flex flex-col justify-between space-y-2">
                      {/* Role Badge - Prominent */}
                      {selectedRole && (
                        <div className="bg-white text-green-800 rounded px-3 py-1.5 inline-block shadow-lg self-start">
                          <span className="font-black text-[11px] tracking-wide uppercase">{selectedRole}</span>
                        </div>
                      )}

                      {/* Personal Details */}
                      {selectedWorker && (
                        <div className="space-y-2">
                          <div>
                            <p className="text-[9px] uppercase tracking-wider font-bold text-green-200 mb-0.5">Full Name</p>
                            <p className="font-bold text-[15px] leading-tight tracking-wide">{selectedWorker.fullName}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-[9px] uppercase tracking-wider font-bold text-green-200 mb-0.5">ID Number</p>
                              <p className="font-bold text-[14px] tracking-wider">{selectedWorker.idNumber}</p>
                            </div>
                            <div>
                              <p className="text-[9px] uppercase tracking-wider font-bold text-green-200 mb-0.5">Phone Number</p>
                              <p className="font-bold text-[14px] tracking-wider">{selectedWorker.phone}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Location Details */}
                      {territory && region && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-[9px] uppercase tracking-wider font-bold text-green-200 mb-0.5">Territory</p>
                            <p className="font-bold text-[14px]">{territory}</p>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase tracking-wider font-bold text-green-200 mb-0.5">Region</p>
                            <p className="font-bold text-[14px]">{region}</p>
                          </div>
                        </div>
                      )}

                      {/* Contact & Expiry - Bottom Section */}
                      <div className="space-y-1.5">
                        <div className="space-y-1 text-[9px] text-green-100">
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5" />
                            <span className="font-semibold tracking-wide">0747047555</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5" />
                            <span className="font-semibold">serabsales@gmail.com</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 rounded px-3 py-1 inline-block">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="font-bold text-[10px] tracking-wide">VALID UNTIL: {formattedExpiry}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Passport Photo - Fills Available Space */}
                    <div className="flex flex-col flex-shrink-0 justify-center">
                      {/* Passport Photo - Larger to fill space */}
                      <div className="bg-white rounded-lg overflow-hidden border-3 border-white/50 shadow-2xl">
                        <div className="bg-white p-1.5">
                          {photoPreview ? (
                            <img src={photoPreview} alt="Passport" className="w-[130px] h-[170px] object-cover" />
                          ) : (
                            <div className="w-[130px] h-[170px] flex items-center justify-center text-green-300 bg-green-50">
                              <User className="w-16 h-16" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Section */}
                <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 border-t border-gray-200">
                  {paymentStatus === 'none' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 font-medium">Download Fee</p>
                        <motion.p
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent"
                        >
                          KSH 50
                        </motion.p>
                      </div>
                      <Button
                        onClick={handleMpesaPayment}
                        disabled={!isFormValid}
                        className={`w-full h-12 text-lg shadow-lg ${
                          isFormValid
                            ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                            : 'bg-gray-300 cursor-not-allowed'
                        }`}
                      >
                        <CreditCard className="w-5 h-5 mr-2" />
                        Pay with M-Pesa
                      </Button>
                      <div className="text-center text-xs text-gray-500">
                        <p className="font-semibold">Till Number</p>
                        <p className="text-green-700 font-bold">{tillNumber}</p>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Or enter download code"
                          value={downloadCode}
                          onChange={(e) => setDownloadCode(e.target.value)}
                          className="flex-1"
                        />
                        <Button onClick={handleDownloadCode} variant="outline" className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {paymentStatus === 'pending' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-6"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="inline-block w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full mb-4"
                      />
                      <p className="text-lg font-bold text-gray-800 mb-1">Processing M-Pesa Payment</p>
                      <p className="text-sm text-gray-600 mb-2">Please complete the STK push prompt on your phone</p>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mx-4 mb-3">
                        <p className="text-xs text-gray-500 mb-1">PAYMENT DETAILS</p>
                        <p className="text-sm font-semibold text-green-800">Till: {tillNumber}</p>
                        <p className="text-sm font-semibold text-green-800">Amount: 50 KSH</p>
                        <p className="text-sm font-semibold text-green-800">Phone: {selectedWorker?.phone}</p>
                      </div>
                      <p className="text-xs text-green-600 font-medium">Payment will auto-complete in ~5 seconds (demo mode)</p>
                    </motion.div>
                  )}

                  {paymentStatus === 'completed' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Button
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 h-14 text-lg shadow-lg"
                        onClick={handleDownloadIdCard}
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Download ID Card (PNG)
                      </Button>
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-16 grid md:grid-cols-3 gap-6"
          >
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="border-2 border-green-100 hover:border-green-300 hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mb-4 shadow-md">
                    <Shield className="w-7 h-7 text-green-700" />
                  </div>
                  <CardTitle>Secure & Authentic</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Official work ID cards with embedded QR codes for verification and security
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
            >
              <Card className="border-2 border-red-100 hover:border-red-300 hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center mb-4 shadow-md">
                    <Download className="w-7 h-7 text-red-700" />
                  </div>
                  <CardTitle>Instant Download</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Get your ID card immediately after payment. No waiting, no delays.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
            >
              <Card className="border-2 border-green-100 hover:border-green-300 hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mb-4 shadow-md">
                    <MapPin className="w-7 h-7 text-green-700" />
                  </div>
                  <CardTitle>Region Specific</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Cards display your specific territory and region for easy identification
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-green-700 to-green-800 text-white mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="text-lg font-bold">Mayaash Communication Limited</p>
              <p className="text-sm text-green-200 mt-1">© 2025 All Rights Reserved</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Lock className="w-4 h-4" />
                <span>Protected Data</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4" />
                <span>0747047555</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4" />
                <span>serabsales@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
