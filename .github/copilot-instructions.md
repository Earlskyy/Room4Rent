# Room Rental Management System - Copilot Instructions

## Project Overview

Full-stack web application for managing room rentals with separate interfaces for administrators and tenants. Built with Next.js frontend and Express.js backend using PostgreSQL.

## Technology Stack

- **Frontend:** Next.js 14 (App Router), Tailwind CSS, React
- **Backend:** Express.js, Node.js, PostgreSQL (Neon)
- **Authentication:** JWT, bcryptjs
- **API:** REST with Axios

## Project Structure Guidelines

### Backend (`/backend`)
- **db/**: Database connection and initialization
- **controllers/**: Business logic handlers
- **routes/**: API endpoint definitions
- **middleware/**: Authentication and error handling
- **utils/**: Helper functions and auth utilities

### Frontend (`/frontend`)
- **app/**: Next.js app router pages
  - `auth/`: Login page
  - `admin/`: Admin dashboard and management pages
  - `tenant/`: Tenant dashboard and bill pages
  - `announcements/`: Shared announcements page
- **components/**: Reusable React components (AdminLayout, TenantLayout)
- **lib/**: API services and helper functions

## Database Schema

Tables created by `npm run migrate`:
- users: User accounts with role-based access
- rooms: Rental room information
- tenants: Tenant-room assignments
- meter_readings: Electricity meter data
- bills: Monthly billing records
- payments: Payment transactions
- announcements: Admin announcements

## Key Implementation Details

### Authentication Flow
1. User registers or logs in via `/auth/login`
2. System returns JWT token + user data
3. Token stored in localStorage for subsequent requests
4. Role-based routing directs to admin or tenant dashboard

### Billing Calculation
- Automatic: Water fee = occupants × 100
- From meter readings: Electricity fee = usage × rate_per_kwh
- Total = room_fee + internet_fee + water_fee + electricity_fee

### Admin Capabilities
- Full CRUD on rooms and tenants
- Input meter readings and generate bills
- Record payments and update bill status
- View financial reports and announcements

### Tenant Capabilities
- View personal bill information
- Check payment history and status
- Download receipts for paid bills
- Read announcements

## Code Standards

- Use async/await for promises
- Validate user inputs before processing
- Check JWT and role permissions on protected routes
- Handle errors gracefully with appropriate HTTP status codes
- Use descriptive endpoint naming

## Common Tasks

### Adding New Admin Feature
1. Create controller function in `/backend/controllers/`
2. Add route in `/backend/routes/`
3. Create page/component in `/frontend/app/admin/`
4. Add API service call in `/frontend/lib/services.js`

### Modifying Bill Calculation
- Update logic in `billController.js` `generateBill` function
- Ensure meter readings are available for the month
- Test with sample data using the Reports page

### Customizing Styling
- Edit `tailwind.config.js` for theme changes
- Modify `globals.css` for component styles
- Use Tailwind utility classes in JSX components

## Environment Setup

### Backend `.env`
```
DATABASE_URL=postgresql://user:password@localhost:5432/room4rent
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
```

### Frontend `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Testing Credentials

- Admin: admin@room4rent.com / admin123
- Use `/admin/auth/login` route to access

## Common Issues & Solutions

- **Cannot connect to database**: Check DATABASE_URL and ensure PostgreSQL is running
- **Unauthorized error**: Verify JWT token in localStorage
- **Bill generation failing**: Ensure meter readings exist for the month
- **CORS errors**: Check backend CORS configuration in Express setup

## Performance Considerations

- Bills load historical data only when needed
- Pagination recommended for large tenant/bill lists
- Consider caching frequently accessed data (rooms, announcements)

## Security Reminders

- Never commit `.env` files
- Validate all user inputs server-side
- Always hash passwords before storing
- Use HTTPS in production
- Set strong JWT secret in production
