# Frontend - Room Rental Management System

Next.js frontend for room rental management system with separate admin and tenant interfaces.

## Features

- Responsive design for mobile and desktop
- Admin dashboard with analytics
- Room and tenant management
- Bill generation and tracking
- Tenant portal for viewing bills
- Downloadable receipts
- Announcements system
- JWT-based authentication

## Tech Stack

- Next.js 14 (App Router)
- React 18
- Tailwind CSS for styling
- Axios for API calls
- jsPDF for PDF generation

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

3. Configure API base URL in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

```bash
npm run build
npm start
```

## Login Credentials

### Admin Account
- Email: admin@room4rent.com
- Password: admin123

## Directory Structure

```
frontend/
├── app/
│   ├── admin/
│   │   ├── page.jsx - Dashboard
│   │   ├── rooms/
│   │   ├── tenants/
│   │   ├── meter-readings/
│   │   ├── bills/
│   │   ├── reports/
│   │   └── payments/
│   ├── tenant/
│   │   ├── page.jsx - Tenant dashboard
│   │   ├── bills/
│   │   ├── history/
│   │   └── receipts/
│   ├── auth/
│   │   └── login/
│   ├── announcements/
│   ├── layout.jsx - Root layout
│   ├── page.jsx - Home redirects to dashboard
│   └── globals.css - Global styles
├── components/
│   ├── AdminLayout.jsx - Admin navigation
│   └── TenantLayout.jsx - Tenant navigation
├── lib/
│   ├── api.js - Axios configuration
│   ├── services.js - API endpoint functions
│   └── auth.js - Authentication utilities
├── public/ - Static assets
├── package.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

## Pages

### Admin Pages
- `/admin` - Admin dashboard with statistics
- `/admin/rooms` - Room management
- `/admin/tenants` - Tenant management
- `/admin/meter-readings` - Electricity meter input
- `/admin/bills` - Bill generation and tracking
- `/admin/reports` - Financial reports

### Tenant Pages
- `/tenant` - Tenant dashboard
- `/tenant/bills` - Current bill breakdown
- `/tenant/history` - Billing history
- `/tenant/receipts` - Download receipts

### Public Pages
- `/auth/login` - Login page
- `/announcements` - View announcements

## Component Architecture

### AdminLayout
- Sidebar navigation for admin users
- Quick access to all management features
- Dashboard statistics display

### TenantLayout
- Top navigation bar
- Tenant-specific menu items
- Footer with copyright

## API Integration

All API calls are made through the `lib/services.js` module which exports grouped functions:

- `authAPI` - Login, register, get current user
- `roomAPI` - Room CRUD operations
- `tenantAPI` - Tenant management
- `bilAPI` - Billing operations
- `announcementAPI` - Announcements
- `dashboardAPI` - Reports and statistics

### Example Usage
```javascript
import { roomAPI } from '@/lib/services';

const rooms = await roomAPI.getRooms();
```

## Authentication

- Credentials stored in localStorage
- JWT token included in API request headers
- Automatic redirect to login on 401 response
- Role-based page access (admin vs tenant)

## Styling

Uses Tailwind CSS with custom configuration:
- Primary color: Blue (#3B82F6)
- Secondary color: Green (#10B981)
- Responsive grid system
- Mobile-first design

### Custom CSS Classes
- `.btn-primary` - Primary action button
- `.btn-secondary` - Secondary action button
- `.card` - Content card component
- `.input-field` - Form input field

## Mobile Responsiveness

All pages are fully responsive:
- Mobile navigation with hamburger menu
- Responsive tables with scroll
- Touch-friendly button sizes
- Flexible grid layouts

## Features

### Admin Features
- Dashboard with key metrics
- Add/edit/delete rooms
- Manage tenant assignments
- Input electricity meter readings
- Generate monthly bills
- Record payments with partial payment support
- View financial reports

### Tenant Features
- View personal room information
- See current month bill
- Understand bill breakdown
- Access payment history
- Download receipts
- View announcements

## State Management

- Uses React hooks (useState, useEffect)
- Client-side storage with localStorage
- No additional state management library

## Form Handling

Forms are handled with:
- React hooks for state
- Basic validation before submission
- Error display on failure
- Success feedback on completion

## Error Handling

- Try-catch blocks for API calls
- User-friendly error messages
- Automatic redirect on auth failure
- Network error handling

## Performance Optimization

- Next.js automatic code splitting
- Image optimization with Next.js
- CSS-in-JS with Tailwind
- Lazy loading where applicable

## Development Guidelines

1. **Component naming**: Use PascalCase for components
2. **File organization**: Group related components in folders
3. **API calls**: Use services from lib/services.js
4. **Authentication**: Check auth status before rendering
5. **Styling**: Use Tailwind utility classes
6. **Forms**: Handle with useState and form events

## Building & Deployment

### Build
```bash
npm run build
```

### Lint
```bash
npm run lint
```

### Production Start
```bash
npm start
```

## Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API base URL

## Troubleshooting

**Cannot connect to API:**
- Verify NEXT_PUBLIC_API_URL is correct
- Ensure backend server is running on port 5000
- Check CORS configuration in backend

**Login not working:**
- Clear browser localStorage
- Verify credentials match backend user
- Check backend JWT_SECRET

**Pages not loading:**
- Check browser console for errors
- Verify authentication token is valid
- Ensure user role matches page requirements

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
