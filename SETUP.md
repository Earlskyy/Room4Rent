# Room Rental Management System - Setup Guide

Complete setup guide for the Room Rental Management System project.

## Prerequisites

- Node.js v16+ and npm
- PostgreSQL database (or Neon PostgreSQL account)
- Git
- VS Code or any code editor

## Initial Setup

### 1. Clone/Setup Project

```bash
cd c:\Users\EarlyWindows\Desktop\Room4Rent
```

### 2. Backend Setup

#### Step 1: Install Dependencies

```bash
cd backend
npm install
```

#### Step 2: Configure Environment

Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` with your database details:

```env
DATABASE_URL=postgresql://user:password@host:5432/room4rent
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
ADMIN_EMAIL=admin@room4rent.com
ADMIN_PASSWORD=admin123
PORT=5000
NODE_ENV=development
```

**Important:** Replace `DATABASE_URL` with your actual PostgreSQL connection string.

#### Step 3: Initialize Database

```bash
npm run migrate
```

This will create all necessary tables (users, rooms, tenants, bills, etc.).

#### Step 4: Start Backend Server

```bash
npm run dev
```

You should see:
```
✅ Server running on port 5000
Environment: development
```

**Backend is now running at:** `http://localhost:5000`

---

### 3. Frontend Setup

Open a new terminal window and navigate to frontend:

#### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

#### Step 2: Configure Environment

Create `.env.local` file from `.env.local.example`:

```bash
cp .env.local.example .env.local
```

The default should be fine:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

#### Step 3: Start Frontend Server

```bash
npm run dev
```

You should see:
```
- ready started server on [::1]:3000
- ready started server on 127.0.0.1:3000
```

**Frontend is now running at:** `http://localhost:3000`

---

## Accessing the Application

### Admin Login

1. Open in browser: `http://localhost:3000`
2. You'll be redirected to `/auth/login`
3. Login with admin credentials:
   - Email: `admin@room4rent.com`
   - Password: `admin123`
4. You'll be directed to `/admin` dashboard

### Admin Dashboard Features

After logging in as admin, you can access:

- **Dashboard** (`/admin`): View statistics and quick access
- **Rooms** (`/admin/rooms`): 
  - View all rooms
  - Add new rooms with base rent and internet fees
  - Delete rooms
  
- **Tenants** (`/admin/tenants`):
  - List all tenants
  - Assign tenants to rooms
  - Manage tenant details
  
- **Meter Readings** (`/admin/meter-readings`):
  - Input electricity meter readings
  - Set rate per kWh
  - System calculates electricity usage automatically
  
- **Bills** (`/admin/bills`):
  - Generate bills for any tenant
  - System auto-calculates: room fee + internet fee + water fee + electricity fee
  - Record payments
  - Update bill status
  
- **Reports** (`/admin/reports`):
  - Monthly income report
  - Unpaid bills report
  - Utility usage report

### Tenant Login

To test tenant features, you need to:

1. Create a user with 'tenant' role (via a registration or create endpoint)
2. Create a room first
3. Assign the tenant to a room
4. Login with tenant credentials

Tenant can access:
- **Dashboard** (`/tenant`): View current bill and room info
- **Bills** (`/tenant/bills`): See detailed bill breakdown
- **History** (`/tenant/history`): View all past bills
- **Receipts** (`/tenant/receipts`): Download receipts for paid bills
- **Announcements** (`/announcements`): View admin announcements

---

## Database Setup Instructions

### Using Neon PostgreSQL (Cloud)

1. Sign up at [https://neon.tech](https://neon.tech)
2. Create a new project
3. Get connection string from Neon dashboard
4. Format: `postgresql://user:password@ep-xxxxx.neon.tech:5432/dbname`
5. Update `DATABASE_URL` in `.env`

### Using Local PostgreSQL

1. Install PostgreSQL locally
2. Create a new database:
   ```sql
   CREATE DATABASE room4rent;
   ```
3. Connection string:
   ```
   postgresql://postgres:password@localhost:5432/room4rent
   ```
4. Update `DATABASE_URL` in `.env`

---

## First Time Workflow

### 1. Create Rooms

Admin → Rooms → Add Room
- Room Name: "Room 1"
- Base Rent: 5000
- Internet Fee: 500

### 2. Create Users (via API or direct SQL)

Option A: Via SQL:
```sql
INSERT INTO users (name, email, password, role) 
VALUES ('John Doe', 'john@example.com', 'hashed_password', 'tenant');
```

Option B: Via API with curl:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123","role":"tenant"}'
```

### 3. Assign Tenant to Room

Admin → Tenants → Add Tenant
- Select user and room
- Set occupants (for water fee calculation)
- Set move-in date

### 4. Input Meter Reading

Admin → Meter Readings → Input Reading
- Select room
- Previous reading: 1000
- Current reading: 1150
- Rate per kWh: 12.5
- Month/Year: Current

### 5. Generate Bill

Admin → Bills → Generate Bill
- Select tenant
- Month/Year
- Set due date
- System calculates automatically

### 6. Record Payment

Admin → Bills → (Select Bill) → Record Payment
- Enter amount
- Set payment date
- Choose payment method

### 7. View as Tenant

Logout and login as tenant to see:
- Current bill
- Bill breakdown
- Payment status

---

## Common Commands

### Backend

```bash
# Development server with auto-reload
npm run dev

# Start production server
npm start

# Initialize/Reset database
npm run migrate

# Install new package
npm install package-name
```

### Frontend

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Install new package
npm install package-name
```

---

## Troubleshooting

### Port Already in Use

If port 5000 or 3000 is in use:

```bash
# Kill process on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database Connection Error

1. Verify DATABASE_URL is correct
2. Check PostgreSQL is running
3. Test connection:
   ```bash
   psql "your_database_url"
   ```

### CORS Error

Backend should allow frontend requests. Check:
- Backend PORT matches `NEXT_PUBLIC_API_URL`
- CORS is enabled in Express app

### JWT Token Expired

- Clear localStorage in browser
- Login again to get new token

### Cannot Find Module Error

Install missing dependencies:
```bash
# In backend folder
npm install

# In frontend folder
npm install
```

---

## File Structure Overview

```
Room4Rent/
├── backend/                    # Express.js API
│   ├── db/                     # Database setup
│   ├── controllers/            # Business logic
│   ├── routes/                 # API endpoints
│   ├── middleware/             # Auth middleware
│   ├── server.js              # Main app
│   ├── package.json
│   └── .env (copy from .env.example)
│
├── frontend/                   # Next.js app
│   ├── app/                    # Pages & routing
│   │   ├── admin/              # Admin pages
│   │   ├── tenant/             # Tenant pages
│   │   └── auth/               # Auth pages
│   ├── components/             # React components
│   ├── lib/                    # Utilities & API
│   ├── package.json
│   └── .env.local (copy from .env.local.example)
│
└── README.md                   # Main documentation
```

---

## Next Steps

1. ✅ Install dependencies for backend and frontend
2. ✅ Setup database connection
3. ✅ Initialize database schema
4. ✅ Start servers (backend and frontend)
5. ✅ Test login with admin credentials
6. ✅ Create rooms and tenants
7. ✅ Test billing workflow
8. ✅ Customize as needed

---

## Feature Checklist

- [x] User authentication (register/login)
- [x] Admin dashboard with statistics
- [x] Room management (CRUD)
- [x] Tenant management (CRUD)
- [x] Meter reading input
- [x] Automatic bill generation
- [x] Payment recording
- [x] Financial reports
- [x] Tenant portal
- [x] Bill breakdown view
- [x] Billing history
- [x] Announcements system
- [x] Responsive design

---

## Customize for Production

Before deploying to production:

1. Change admin password
2. Set strong JWT_SECRET
3. Use HTTPS
4. Install SSL certificate
5. Setup proper error logging
6. Configure backup strategy for database
7. Setup monitoring and alerts
8. Update API_URL for production domain
9. Setup CI/CD pipeline
10. Configure email notifications

---

## Support & Documentation

- Backend docs: `backend/README.md`
- Frontend docs: `frontend/README.md`
- Copilot instructions: `.github/copilot-instructions.md`

---

## License

MIT License - Feel free to use and modify as needed.

Happy coding! 🎉
