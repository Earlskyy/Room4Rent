# Backend - Room Rental Management System

Express.js backend for room rental management system with PostgreSQL database.

## Features

- User authentication with JWT
- Room and tenant management
- Billing system with automatic calculations
- Payment tracking
- Meter readings for electricity usage
- Admin announcements system
- Reports generation

## Tech Stack

- Express.js v4.18+
- Node.js
- PostgreSQL (Neon)
- JWT for authentication
- bcryptjs for password hashing

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure database connection in `.env`:
```
DATABASE_URL=postgresql://user:password@neon.tech:5432/room4rent
JWT_SECRET=your_secure_secret_key
ADMIN_EMAIL=admin@room4rent.com
ADMIN_PASSWORD=admin123
PORT=5000
NODE_ENV=development
```

## Database Setup

Initialize the database with schema:
```bash
npm run migrate
```

This will create all required tables:
- users
- rooms
- tenants
- meter_readings
- bills
- payments
- announcements

## Running the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on port 5000 (configurable via PORT env variable).

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user profile (requires token)

### Rooms
- `GET /api/rooms` - List all rooms
- `GET /api/rooms/:id` - Get room details
- `POST /api/rooms` - Create room (admin only)
- `PUT /api/rooms/:id` - Update room (admin only)
- `DELETE /api/rooms/:id` - Delete room (admin only)

### Tenants
- `GET /api/tenants` - List all tenants (admin only)
- `GET /api/tenants/:id` - Get tenant details
- `GET /api/tenants/user/:userId` - Get tenant by user ID
- `POST /api/tenants` - Create tenant (admin only)
- `PUT /api/tenants/:id` - Update tenant (admin only)
- `DELETE /api/tenants/:id` - Remove tenant (admin only)

### Meter Readings
- `GET /api/meter/:roomId` - Get meter readings for room
- `POST /api/meter` - Create/update meter reading (admin only)

### Bills
- `GET /api/bills` - Get all bills (admin only)
- `GET /api/bills/tenant/:tenantId` - Get bills for tenant
- `GET /api/bills/tenant/:tenantId/current` - Get current month bill
- `POST /api/bills/generate` - Generate bill for tenant (admin only)
- `PUT /api/bills/:id/status` - Update bill status (admin only)
- `POST /api/bills/payment` - Record payment (admin only)
- `GET /api/bills/payment/:billId` - Get payment history

### Announcements
- `GET /api/announcements` - Get all announcements
- `GET /api/announcements/:id` - Get announcement details
- `POST /api/announcements` - Create announcement (admin only)
- `PUT /api/announcements/:id` - Update announcement (admin only)
- `DELETE /api/announcements/:id` - Delete announcement (admin only)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics (admin only)
- `GET /api/dashboard/income-report` - Get income report (admin only)
- `GET /api/dashboard/unpaid-bills` - Get unpaid bills report (admin only)
- `GET /api/dashboard/utility-usage` - Get utility usage report (admin only)

## Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

Token is obtained from login endpoint and stored in client localStorage.

## File Structure

```
backend/
├── db/
│   ├── connection.js - Database connection
│   └── init.js - Schema initialization
├── controllers/
│   ├── authController.js
│   ├── roomController.js
│   ├── tenantController.js
│   ├── meterController.js
│   ├── billController.js
│   ├── announcementController.js
│   └── dashboardController.js
├── routes/
│   ├── authRoutes.js
│   ├── roomRoutes.js
│   ├── tenantRoutes.js
│   ├── meterRoutes.js
│   ├── billRoutes.js
│   ├── announcementRoutes.js
│   └── dashboardRoutes.js
├── middleware/
│   └── auth.js - JWT and role verification
├── utils/
│   └── auth.js - Password hashing and JWT generation
├── server.js - Main Express app
├── package.json
├── .env.example
└── README.md
```

## Key Calculations

### Water Fee
```
water_fee = number_of_occupants × 100
```

### Electricity Usage
```
usage = current_reading - previous_reading
electricity_fee = usage × rate_per_kwh
```

### Total Bill Amount
```
total_amount = room_fee + internet_fee + water_fee + electricity_fee
```

## Error Handling

The API returns appropriate HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad request
- 401: Unauthorized
- 403: Forbidden (insufficient permissions)
- 404: Not found
- 500: Server error

All responses include a `message` field describing the result.

## Database Schema Notes

- All tables include `created_at` timestamps
- Passwords are hashed with bcryptjs (salt rounds: 10)
- JWT tokens expire in 30 days
- Unique constraints on email, room_name, and meter readings per month
- Foreign key relationships for data integrity

## Development Notes

- The system uses connection pooling for database efficiency
- All user inputs are validated before database operations
- Role-based access control via JWT payload
- Payment tracking supports partial payments

## Troubleshooting

**Database connection failed:**
- Verify DATABASE_URL is correct
- Ensure PostgreSQL server is running
- Check network connectivity to database host

**Authentication errors:**
- Verify JWT_SECRET matches between backend and any token generation
- Check JWT token expiration (30 days from issue)
- Ensure Authorization header format is correct

**Bill generation fails:**
- Verify tenant exists and is assigned to a room
- Check that meter readings have been input for the month
- Ensure occupant count is set for water fee calculation

## License

MIT
