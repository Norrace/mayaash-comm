'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { X, Plus, Edit, Trash2, Download, Copy, Users, MapPin, Globe, Key, CheckCircle, XCircle, Search, Lock, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface AdminDashboardProps {
  isOpen: boolean
  onClose: () => void
  adminEmail?: string
}

export default function AdminDashboard({ isOpen, onClose, adminEmail }: AdminDashboardProps) {
  const [workers, setWorkers] = useState<any[]>([])
  const [territories, setTerritories] = useState<any[]>([])
  const [regions, setRegions] = useState<any[]>([])
  const [codes, setCodes] = useState<any[]>([])
  const [filteredWorkers, setFilteredWorkers] = useState<any[]>([])
  const [filterRegion, setFilterRegion] = useState('')
  const [filterTerritory, setFilterTerritory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Form states
  const [workerForm, setWorkerForm] = useState({ fullName: '', idNumber: '', phone: '' })
  const [editingWorker, setEditingWorker] = useState<any>(null)
  const [newTerritory, setNewTerritory] = useState('')
  const [newRegion, setNewRegion] = useState('')
  const [codeExpiry, setCodeExpiry] = useState('30')

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const fetchAllData = async () => {
    try {
      const [workersRes, territoriesRes, regionsRes, codesRes] = await Promise.all([
        fetch('/api/workers'),
        fetch('/api/territories'),
        fetch('/api/regions'),
        fetch('/api/codes')
      ])

      const [workersData, territoriesData, regionsData, codesData] = await Promise.all([
        workersRes.json(),
        territoriesRes.json(),
        regionsRes.json(),
        codesRes.json()
      ])

      if (workersData.success) setWorkers(workersData.workers)
      if (territoriesData.success) setTerritories(territoriesData.territories)
      if (regionsData.success) setRegions(regionsData.regions)
      if (codesData.success) setCodes(codesData.codes)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  useEffect(() => {
    if (isOpen) {
      (async () => {
        try {
          const [workersRes, territoriesRes, regionsRes, codesRes] = await Promise.all([
            fetch('/api/workers'),
            fetch('/api/territories'),
            fetch('/api/regions'),
            fetch('/api/codes')
          ])

          const [workersData, territoriesData, regionsData, codesData] = await Promise.all([
            workersRes.json(),
            territoriesRes.json(),
            regionsRes.json(),
            codesRes.json()
          ])

          if (workersData.success) setWorkers(workersData.workers)
          if (territoriesData.success) setTerritories(territoriesData.territories)
          if (regionsData.success) setRegions(regionsData.regions)
          if (codesData.success) setCodes(codesData.codes)
        } catch (error) {
          console.error('Error fetching data:', error)
        }
      })()
    }
  }, [isOpen])

  useEffect(() => {
    let filtered = [...workers]

    if (searchQuery) {
      filtered = filtered.filter(w =>
        w.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.idNumber.includes(searchQuery) ||
        w.phone.includes(searchQuery)
      )
    }

    // Defer setState to avoid synchronous updates in effect
    setTimeout(() => setFilteredWorkers(filtered), 0)
  }, [workers, filterRegion, filterTerritory, searchQuery])

  const handleAddWorker = async () => {
    try {
      const response = await fetch('/api/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workerForm)
      })
      const data = await response.json()
      if (data.success) {
        toast.success('Worker added successfully')
        setWorkerForm({ fullName: '', idNumber: '', phone: '' })
        fetchAllData()
      } else {
        toast.error(data.error || 'Failed to add worker')
      }
    } catch (error) {
      toast.error('Failed to add worker')
    }
  }

  const handleUpdateWorker = async () => {
    if (!editingWorker) return

    try {
      const response = await fetch(`/api/workers/${editingWorker.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workerForm)
      })
      const data = await response.json()
      if (data.success) {
        toast.success('Worker updated successfully')
        setEditingWorker(null)
        setWorkerForm({ fullName: '', idNumber: '', phone: '' })
        fetchAllData()
      } else {
        toast.error(data.error || 'Failed to update worker')
      }
    } catch (error) {
      toast.error('Failed to update worker')
    }
  }

  const handleDeleteWorker = async (id: string) => {
    if (!confirm('Are you sure you want to delete this worker?')) return

    try {
      const response = await fetch(`/api/workers/${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        toast.success('Worker deleted successfully')
        fetchAllData()
      } else {
        toast.error('Failed to delete worker')
      }
    } catch (error) {
      toast.error('Failed to delete worker')
    }
  }

  const handleEditWorker = (worker: any) => {
    setEditingWorker(worker)
    setWorkerForm({
      fullName: worker.fullName,
      idNumber: worker.idNumber,
      phone: worker.phone
    })
  }

  const handleCancelEdit = () => {
    setEditingWorker(null)
    setWorkerForm({ fullName: '', idNumber: '', phone: '' })
  }

  const handleAddTerritory = async () => {
    if (!newTerritory) return

    try {
      const response = await fetch('/api/territories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTerritory })
      })
      const data = await response.json()
      if (data.success) {
        toast.success('Territory added successfully')
        setNewTerritory('')
        fetchAllData()
      } else {
        toast.error(data.error || 'Failed to add territory')
      }
    } catch (error) {
      toast.error('Failed to add territory')
    }
  }

  const handleToggleTerritory = async (territory: any) => {
    try {
      const response = await fetch(`/api/territories/${territory.id}`, {
        method: 'PATCH'
      })
      const data = await response.json()
      if (data.success) {
        fetchAllData()
      }
    } catch (error) {
      toast.error('Failed to update territory')
    }
  }

  const handleDeleteTerritory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this territory?')) return

    try {
      const response = await fetch(`/api/territories/${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        toast.success('Territory deleted successfully')
        fetchAllData()
      } else {
        toast.error('Failed to delete territory')
      }
    } catch (error) {
      toast.error('Failed to delete territory')
    }
  }

  const handleAddRegion = async () => {
    if (!newRegion) return

    try {
      const response = await fetch('/api/regions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newRegion })
      })
      const data = await response.json()
      if (data.success) {
        toast.success('Region added successfully')
        setNewRegion('')
        fetchAllData()
      } else {
        toast.error(data.error || 'Failed to add region')
      }
    } catch (error) {
      toast.error('Failed to add region')
    }
  }

  const handleToggleRegion = async (region: any) => {
    try {
      const response = await fetch(`/api/regions/${region.id}`, {
        method: 'PATCH'
      })
      const data = await response.json()
      if (data.success) {
        fetchAllData()
      }
    } catch (error) {
      toast.error('Failed to update region')
    }
  }

  const handleDeleteRegion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this region?')) return

    try {
      const response = await fetch(`/api/regions/${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        toast.success('Region deleted successfully')
        fetchAllData()
      } else {
        toast.error('Failed to delete region')
      }
    } catch (error) {
      toast.error('Failed to delete region')
    }
  }

  const handleGenerateCode = async () => {
    try {
      const response = await fetch('/api/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiresIn: parseInt(codeExpiry) })
      })
      const data = await response.json()
      if (data.success) {
        toast.success(`Code generated: ${data.downloadCode.code}`)
        fetchAllData()
      } else {
        toast.error('Failed to generate code')
      }
    } catch (error) {
      toast.error('Failed to generate code')
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Code copied to clipboard')
  }

  const handleExportWorkers = async () => {
    try {
      const url = `/api/workers/export${filterRegion ? `?region=${filterRegion}` : ''}${filterTerritory ? `&territory=${filterTerritory}` : ''}`
      window.open(url, '_blank')
      toast.success('Workers exported successfully')
    } catch (error) {
      toast.error('Failed to export workers')
    }
  }

  const handleChangePassword = async () => {
    if (!adminEmail) {
      toast.error('Admin email not found. Please log in again.')
      return
    }

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('All password fields are required')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters')
      return
    }

    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminEmail,
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Password changed successfully')
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        toast.error(data.error || 'Failed to change password')
      }
    } catch (error) {
      toast.error('Failed to change password')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-6xl shadow-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Admin Dashboard</h2>
            <p className="text-green-100 text-sm mt-1">Manage workers, territories, regions & codes</p>
          </div>
          <Button
            onClick={onClose}
            variant="outline"
            className="bg-white/10 text-white border-white/30 hover:bg-white hover:text-green-700"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          <Tabs defaultValue="workers" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="workers" className="data-[state=active]:bg-green-600">
                <Users className="w-4 h-4 mr-2" />
                Workers
              </TabsTrigger>
              <TabsTrigger value="territories" className="data-[state=active]:bg-green-600">
                <MapPin className="w-4 h-4 mr-2" />
                Territories
              </TabsTrigger>
              <TabsTrigger value="regions" className="data-[state=active]:bg-green-600">
                <Globe className="w-4 h-4 mr-2" />
                Regions
              </TabsTrigger>
              <TabsTrigger value="codes" className="data-[state=active]:bg-green-600">
                <Key className="w-4 h-4 mr-2" />
                Codes
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-green-600">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Workers Tab */}
            <TabsContent value="workers" className="space-y-4">
              <Card>
                <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                  <CardTitle className="text-lg">Manage Workers</CardTitle>
                  <CardDescription>Add, edit, or remove workers from the system</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {/* Add/Edit Form */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label>Full Name</Label>
                      <Input
                        value={workerForm.fullName}
                        onChange={(e) => setWorkerForm({ ...workerForm, fullName: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="flex-1">
                      <Label>ID Number</Label>
                      <Input
                        value={workerForm.idNumber}
                        onChange={(e) => setWorkerForm({ ...workerForm, idNumber: e.target.value })}
                        placeholder="1234567890"
                      />
                    </div>
                    <div className="flex-1">
                      <Label>Phone</Label>
                      <Input
                        value={workerForm.phone}
                        onChange={(e) => setWorkerForm({ ...workerForm, phone: e.target.value })}
                        placeholder="07XXXXXXXXX"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      {editingWorker ? (
                        <>
                          <Button onClick={handleUpdateWorker} className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Update
                          </Button>
                          <Button onClick={handleCancelEdit} variant="outline">
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button onClick={handleAddWorker} className="bg-green-600 hover:bg-green-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Add
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Search & Filter */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search by name, ID, or phone..."
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleExportWorkers}
                      variant="outline"
                      className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export List
                    </Button>
                  </div>

                  {/* Workers Table */}
                  <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                    <Table>
                      <TableHeader className="bg-green-50">
                        <TableRow>
                          <TableHead>ID Number</TableHead>
                          <TableHead>Full Name</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredWorkers.map((worker) => (
                          <TableRow key={worker.id}>
                            <TableCell className="font-medium">{worker.idNumber}</TableCell>
                            <TableCell>{worker.fullName}</TableCell>
                            <TableCell>{worker.phone}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditWorker(worker)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteWorker(worker.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredWorkers.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                              No workers found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  <p className="text-sm text-gray-500 text-center">
                    Total: {filteredWorkers.length} workers
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Territories Tab */}
            <TabsContent value="territories" className="space-y-4">
              <Card>
                <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                  <CardTitle className="text-lg">Manage Territories</CardTitle>
                  <CardDescription>Add, activate, or deactivate territories</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-4">
                    <Input
                      value={newTerritory}
                      onChange={(e) => setNewTerritory(e.target.value)}
                      placeholder="Enter territory name"
                      className="flex-1"
                    />
                    <Button onClick={handleAddTerritory} className="bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Territory
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {territories.map((territory) => (
                      <div
                        key={territory.id}
                        className="p-4 border rounded-lg flex items-center justify-between hover:shadow-md transition-shadow"
                      >
                        <div>
                          <p className="font-medium">{territory.name}</p>
                          <Badge variant={territory.isActive ? 'default' : 'secondary'} className="mt-1">
                            {territory.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleTerritory(territory)}
                          >
                            {territory.isActive ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-gray-400" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteTerritory(territory.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Regions Tab */}
            <TabsContent value="regions" className="space-y-4">
              <Card>
                <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                  <CardTitle className="text-lg">Manage Regions</CardTitle>
                  <CardDescription>Add, activate, or deactivate regions</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-4">
                    <Input
                      value={newRegion}
                      onChange={(e) => setNewRegion(e.target.value)}
                      placeholder="Enter region name"
                      className="flex-1"
                    />
                    <Button onClick={handleAddRegion} className="bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Region
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {regions.map((region) => (
                      <div
                        key={region.id}
                        className="p-4 border rounded-lg flex items-center justify-between hover:shadow-md transition-shadow"
                      >
                        <div>
                          <p className="font-medium">{region.name}</p>
                          <Badge variant={region.isActive ? 'default' : 'secondary'} className="mt-1">
                            {region.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleRegion(region)}
                          >
                            {region.isActive ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-gray-400" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteRegion(region.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Codes Tab */}
            <TabsContent value="codes" className="space-y-4">
              <Card>
                <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                  <CardTitle className="text-lg">Generate Download Codes</CardTitle>
                  <CardDescription>Create codes for users to download ID cards without payment</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-4 items-end">
                    <div>
                      <Label>Code Validity (Days)</Label>
                      <Select value={codeExpiry} onValueChange={setCodeExpiry}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7 Days</SelectItem>
                          <SelectItem value="30">30 Days</SelectItem>
                          <SelectItem value="60">60 Days</SelectItem>
                          <SelectItem value="90">90 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleGenerateCode} className="bg-green-600 hover:bg-green-700">
                      <Key className="w-4 h-4 mr-2" />
                      Generate Code
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {codes.map((code) => (
                      <div
                        key={code.id}
                        className="p-4 border rounded-lg flex items-center justify-between hover:shadow-md transition-shadow"
                      >
                        <div>
                          <p className="font-mono font-bold text-lg text-green-700">{code.code}</p>
                          <p className="text-sm text-gray-500">
                            Expires: {new Date(code.expiresAt).toLocaleDateString()}
                          </p>
                          <Badge variant={code.isUsed ? 'secondary' : 'default'} className="mt-1">
                            {code.isUsed ? 'Used' : 'Available'}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopyCode(code.code)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {codes.length === 0 && (
                      <div className="col-span-2 text-center py-8 text-gray-500">
                        No codes generated yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab - Password Change */}
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                  <CardTitle className="text-lg">Change Password</CardTitle>
                  <CardDescription>Update your admin password for security</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {adminEmail && (
                    <>
                      <div className="text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-green-600" />
                          <span className="font-medium">Logged in as:</span>
                        </div>
                        <div className="ml-6 text-green-700 font-semibold">{adminEmail}</div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label>Current Password</Label>
                          <Input
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            placeholder="Enter current password"
                          />
                        </div>
                        <div>
                          <Label>New Password</Label>
                          <Input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            placeholder="Enter new password (min 8 characters)"
                          />
                        </div>
                        <div>
                          <Label>Confirm New Password</Label>
                          <Input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            placeholder="Re-enter new password"
                          />
                        </div>
                      </div>

                      <Button
                        onClick={handleChangePassword}
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                      >
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Change Password
                      </Button>

                      <div className="text-xs text-gray-500 text-center space-y-1">
                        <p>• Password must be at least 8 characters long</p>
                        <p>• Make sure to remember your new password</p>
                      </div>
                    </>
                  )}

                  {!adminEmail && (
                    <div className="text-center py-8 text-gray-500">
                      <Lock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p>Please log in to access settings</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  )
}
