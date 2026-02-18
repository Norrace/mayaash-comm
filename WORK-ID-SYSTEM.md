# Work ID Card System - Mayaash Communication Limited

A modern, professional work ID card generation system for Mayaash Communication Limited, a Safaricom subsidiary. Built with Next.js 16, TypeScript, Prisma, and featuring Safaricom branding.

## Features

### For Employees
- **Professional ID Card Design**: Elegant Safaricom-themed cards with gradient backgrounds
- **Role Selection**: Choose between "Safaricom Team Leader" and "Safaricom Brand Ambassador"
- **Smart ID Search**: Enter first 5 digits to find and select your profile
- **Territory & Region Selection**: Dropdown options for all Kenyan territories and regions
- **Photo Upload**: Upload your passport photo (not stored in database)
- **QR Code**: Automatically generated QR code containing all card details
- **Flexible Payment Options**:
  - M-Pesa STK Push (50 KSH)
  - Download code verification
- **Instant Download**: PNG format download after successful payment/code verification

### For Administrators
- **Secure Login**: Protected admin dashboard with password authentication
- **Worker Management**:
  - View all workers
  - Add new workers (name, ID number, phone)
  - Delete workers
- **Download Code Generation**:
  - Generate 7-day codes
  - Generate 30-day codes
  - Track code status (Active, Used, Expired)
  - Copy codes with one click

## Getting Started

### Admin Login
1. Click the "Admin Login" button in the header
2. Enter credentials:
   - Email: `admin@mayaacomm.co.ke`
   - Password: `admin123`
3. Access the admin dashboard

### Adding Workers (Admin)
1. Log in to admin dashboard
2. Go to "Workers" tab
3. Click "Add Worker"
4. Fill in:
   - Full Name
   - ID Number
   - Phone Number
5. Click "Add Worker"

### Generating Download Codes (Admin)
1. Log in to admin dashboard
2. Go to "Download Codes" tab
3. Click either:
   - "Generate 7-Day Code"
   - "Generate 30-Day Code"
4. Copy the generated code and share with employees

### Downloading ID Card (Employee)
1. **Select Role**: Choose your role (Team Leader or Brand Ambassador)
2. **Search for ID**: Enter first 5 digits of your ID number
3. **Select Your Profile**: Choose from the dropdown list
4. **Choose Territory**: Select your territory
5. **Choose Region**: Select your region
6. **Upload Photo**: Click to upload your passport photo
7. **Pay or Use Code**:
   - Option A: Click "Pay with M-Pesa" (50 KSH)
   - Option B: Enter download code and click "Verify"
8. **Download**: Click "Download ID Card (PNG)" button

## Sample Data for Testing

**Workers (ID prefix: 12345)**
- John Kamau - 1234500001 - 0712345678
- Mary Wanjiku - 1234500002 - 0712345679
- Peter Ochieng - 1234500003 - 0712345680
- Grace Nyambura - 1234500004 - 0712345681
- David Mutua - 1234500005 - 0712345682

**Test the System:**
1. Enter "12345" in ID Number field
2. Select any worker from the dropdown
3. Fill in territory, region, and upload a photo
4. Use a download code or simulate M-Pesa payment
5. See the professional ID card preview with QR code

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Database**: SQLite with Prisma ORM
- **UI Components**: shadcn/ui (New York style)
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **QR Code**: qrcode library
- **Security**: bcryptjs for password hashing
- **Payment**: M-Pesa STK Push (ready for production integration)

## API Endpoints

### Workers
- `GET /api/workers` - List all workers
- `POST /api/workers` - Add new worker
- `DELETE /api/workers/[id]` - Delete worker
- `GET /api/workers/search?prefix=xxx` - Search workers by ID prefix

### Download Codes
- `GET /api/codes` - List all codes
- `POST /api/codes` - Generate new code
- `POST /api/codes/verify` - Verify download code

### Payments
- `POST /api/mpesa/stkpush` - Initiate M-Pesa STK push
- `GET /api/payments/[merchantRef]` - Get payment status

### Admin
- `POST /api/admin/login` - Admin login
- `POST /api/admin/init` - Initialize admin account

## Database Schema

**Worker**
- id, fullName, idNumber (unique), phone, createdAt, updatedAt

**DownloadCode**
- id, code (unique), isUsed, usedBy, usedAt, createdAt, expiresAt

**Payment**
- id, workerId, phone, amount, mpesaRef (unique), merchantRef (unique), status, createdAt, updatedAt

**Admin**
- id, email (unique), password (hashed), name, createdAt, updatedAt

## Design Features

- **Safaricom Branding**: Green (#30B54A) and Red color scheme
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Smooth Animations**: Framer Motion transitions
- **Professional Card**: Gradient background with proper spacing
- **Modern UI**: Clean, elegant interface with shadcn/ui components
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Loading States**: Visual feedback during async operations
- **Error Handling**: Clear error messages for users

## Security

- Password hashing with bcryptjs
- Admin authentication
- Code expiry validation
- Payment status verification
- SQL injection protection (Prisma ORM)

## Future Enhancements

- Actual M-Pesa API integration
- PNG download generation
- Email notifications for code generation
- Bulk worker import (CSV/Excel)
- ID card templates customization
- Multi-language support
- Audit trail for admin actions

## Support

For issues or questions, contact the system administrator.

---

**© 2025 Mayaash Communication Limited - A Safaricom Subsidiary**
