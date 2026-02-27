# Room Rental Management System with Tenant Portal

A comprehensive web-based room rental management and billing system for house-based room-for-rent businesses.

## Features

### Admin Dashboard
- **Dashboard**: View monthly income, unpaid bills, occupied/vacant rooms
- **Room Management**: Add, edit, delete rooms
- **Tenant Management**: Assign tenants to rooms
- **Meter Readings**: Record electricity usage
- **Bill Generation**: Automatically compute monthly bills
- **Payment Recording**: Track tenant payments
- **Reports**: Income, unpaid bills, and utility usage reports
- **Announcements**: Post updates for tenants

### Tenant Portal
- **Dashboard**: View current bill status
- **Bill Breakdown**: Detailed charge breakdown
- **Billing History**: Past bills and payment status
- **Receipt Download**: Get paid bill receipts
- **Announcements**: View admin updates

## Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- Tailwind CSS
- Axios

**Backend:**
- Express.js
- Node.js
- JWT Authentication
- bcryptjs

**Database:**
- Neon PostgreSQL

## Project Structure

```
room4rent/
├── backend/
│   ├── db/
│   │   ├── connection.js
│   │   └── init.js
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── app/
│   │   ├── admin/
│   │   ├── tenant/
│   │   ├── auth/
│   │   ├── announcements/
│   │   ├── globals.css
│   │   ├── layout.jsx
│   │   └── page.jsx
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env.local.example
└── README.md
```

## Installation & Setup

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your database connection:
```
DATABASE_URL=postgresql://user:password@host:5432/room4rent
JWT_SECRET=your_secret_key_here
```

4. Initialize database:
```bash
npm run migrate
```

5. Start backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
npm install
```

2. Create `.env.local` file from `.env.local.example`:
```bash
cp .env.local.example .env.local
```

3. Start frontend development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Default Credentials

- **Admin Email:** admin@room4rent.com
- **Admin Password:** admin123

## Usage

### For Admins
1. Login with admin credentials
2. Navigate to admin dashboard
3. Manage rooms, tenants, and billing

### For Tenants
1. Register or login with tenant account
2. View current bill in dashboard
3. Check billing history and payment status
4. Download receipts for paid bills

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Rooms
- `GET /api/rooms` - Get all rooms
- `POST /api/rooms` - Create room (admin)
- `PUT /api/rooms/:id` - Update room (admin)
- `DELETE /api/rooms/:id` - Delete room (admin)

### Tenants
- `GET /api/tenants` - Get all tenants (admin)
- `GET /api/tenants/:id` - Get tenant details
- `POST /api/tenants` - Create tenant (admin)
- `PUT /api/tenants/:id` - Update tenant (admin)

### Bills
- `GET /api/bills` - Get all bills (admin)
- `GET /api/bills/tenant/:id` - Get tenant bills
- `POST /api/bills/generate` - Generate bill (admin)
- `POST /api/bills/payment` - Record payment (admin)

### Announcements
- `GET /api/announcements` - Get all announcements
- `POST /api/announcements` - Create announcement (admin)
- `PUT /api/announcements/:id` - Update announcement (admin)
- `DELETE /api/announcements/:id` - Delete announcement (admin)

## Billing Logic

- **Water Fee:** Number of Occupants × ₱100
- **Electricity Bill:** (Current Reading - Previous Reading) × Rate per kWh
- **Total Bill:** Room Fee + Internet Fee + Water Fee + Electricity Fee

## Future Enhancements

- GCash payment integration
- SMS reminders for due bills
- Email notifications
- Utility usage graphs
- Online maintenance request form

## Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control
- Tenant data isolation
- Secure session management

## License

MIT License

## Support

For issues or questions, please contact the system administrator.
