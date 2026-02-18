# Mayaash Communication Limited - ID Card System

## Setup Complete ✓

### Testing Data Removed
All testing data has been cleared from the database:
- ✅ All workers removed
- ✅ All territories removed
- ✅ All regions removed
- ✅ All download codes removed
- ✅ All payments removed
- ✅ All old admin accounts removed

### New Admin Accounts Added

Two admin accounts have been created with default credentials:

1. **greencorairtime@gmail.com**
   - Email: `greencorairtime@gmail.com`
   - Default Password: `Admin@123`
   - Name: GreenCor Airtime

2. **Gatutunewton1@gmail.com**
   - Email: `Gatutunewton1@gmail.com`
   - Default Password: `Admin@123`
   - Name: Gatutunewton

## Admin Dashboard Features

### 1. Workers Management
- Add new workers with name, ID number, and phone
- Edit existing worker details
- Delete workers
- Search workers by name, ID, or phone
- Export worker list to CSV

### 2. Territories Management
- Add new territories
- Toggle territories as active/inactive
- Delete territories
- Only active territories are shown on frontend

### 3. Regions Management
- Add new regions
- Toggle regions as active/inactive
- Delete regions
- Only active regions are shown on frontend

### 4. Download Codes Management
- Generate download codes with configurable expiry (7/30/60/90 days)
- View all generated codes with status
- Copy codes to clipboard
- Codes are one-time use only

### 5. Settings - Change Password (NEW!)
- Admins can now change their own password
- Current password required for verification
- Password must be at least 8 characters
- Shows logged-in admin email
- Form validation for password matching

## How to Use Admin Password Change

1. Log in to admin dashboard with your credentials
2. Click on the **"Settings"** tab (5th tab)
3. Fill in the form:
   - **Current Password**: Your existing password
   - **New Password**: New password (min 8 characters)
   - **Confirm New Password**: Re-type new password
4. Click **"Change Password"** button
5. You'll receive a success notification

## Important Notes

⚠️ **First Login**: Both admins should log in immediately and change their default passwords

⚠️ **Password Security**: Passwords must be at least 8 characters long

⚠️ **Logout**: When closing the admin dashboard, you're automatically logged out

## Frontend Features (Employee Side)

### ID Card Generation
- Role selection (Team Leader / Brand Ambassador)
- Worker ID search (first 5 digits)
- Territory and region selection
- Photo upload
- Automatic QR code generation
- Payment integration (M-Pesa)

### ID Card Specifications
- **Dimensions**: 85.6mm x 54mm (standard ID card size)
- **Layout**: Compact and professional
- **Fonts**: 9px - 15px (large and readable)
- **Photo**: 95px x 125px (passport size)
- **QR Code**: 85px x 85px (large and scannable)
- **Colors**: Safaricom green gradient (#30B54A)
- **Positioning**: Photo and QR code on right side

### Payment Options
1. **M-Pesa STK Push**: 50 KSH payment
   - Automatic payment processing
   - Real-time status checking
   - Polling every 2 seconds
   - 3-minute timeout

2. **Download Codes**: Alternative payment method
   - Admin-generated codes
   - One-time use
   - Configurable expiry

## Database Schema

### Models
- **Admin**: Email, password (hashed), name
- **Worker**: Full name, ID number, phone
- **Territory**: Name, active status
- **Region**: Name, active status
- **DownloadCode**: Code, usage status, expiry
- **Payment**: Transaction details, status, merchant ref

## API Endpoints

### Admin
- `POST /api/admin/login` - Admin login
- `POST /api/admin/change-password` - Change password (NEW!)
- `POST /api/admin/init` - Initialize first admin

### Workers
- `GET /api/workers` - Get all workers
- `POST /api/workers` - Add worker
- `PATCH /api/workers/[id]` - Update worker
- `DELETE /api/workers/[id]` - Delete worker
- `GET /api/workers/search?prefix=xxx` - Search workers
- `GET /api/workers/export` - Export to CSV

### Territories & Regions
- `GET /api/territories` - List territories
- `POST /api/territories` - Add territory
- `PATCH /api/territories/[id]` - Update territory
- `DELETE /api/territories/[id]` - Delete territory
- `GET /api/regions` - List regions
- `POST /api/regions` - Add region
- `PATCH /api/regions/[id]` - Update region
- `DELETE /api/regions/[id]` - Delete region

### Codes
- `GET /api/codes` - List codes
- `POST /api/codes` - Generate code
- `POST /api/codes/verify` - Verify code (frontend)

### Payments
- `POST /api/mpesa/stkpush` - Initiate payment
- `POST /api/mpesa/callback` - M-Pesa callback
- `GET /api/payments/[merchantRef]` - Check payment status

## Default Credentials

### Admin Accounts
1. greencorairtime@gmail.com / Admin@123
2. Gatutunewton1@gmail.com / Admin@123

⚠️ **IMPORTANT**: Change these passwords after first login!

## Next Steps

1. ✅ Testing data removed
2. ✅ Real admin accounts added
3. ✅ Password change feature implemented
4. ⚠️ **TODO**: Log in and change default passwords immediately
5. ⚠️ **TODO**: Add territories and regions as needed
6. ⚠️ **TODO**: Add workers as needed
7. ⚠️ **TODO**: Configure M-Pesa API credentials for production

## M-Pesa Configuration (for Production)

Add these to `.env` file:
```env
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_PASS_KEY=your_pass_key
MPESA_SHORT_CODE=your_short_code
MPESA_ENVIRONMENT=production  # or 'sandbox'
```

Get credentials from: https://developer.safaricom.co.ke/

## Support

For assistance with:
- Admin accounts
- Password issues
- System configuration
- Feature requests

Contact the system administrator.

---

**System Ready for Production Use** ✓
