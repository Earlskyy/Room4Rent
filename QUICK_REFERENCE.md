# Quick Reference Guide

## 🚀 Getting Started (First Time)

### Windows
```bash
cd c:\Users\EarlyWindows\Desktop\Room4Rent
setup.bat
```

### Mac/Linux
```bash
cd ~/Desktop/Room4Rent
chmod +x setup.sh
./setup.sh
```

### Manual Setup
```bash
# Backend
cd backend
npm install
cp .env.example .env  # Edit with your database URL
npm run migrate
npm run dev

# Frontend (in new terminal)
cd frontend
npm install
npm run dev
```

---

## 📍 Important URLs

| Service | URL | Notes |
|---------|-----|-------|
| Frontend | http://localhost:3000 | Next.js app |
| Backend API | http://localhost:5000/api | Express server |
| Health Check | http://localhost:5000/api/health | Verify backend |

---

## 👤 Default Credentials

```
Email:    admin@room4rent.com
Password: admin123
Role:     admin
```

---

## 🔧 Common Commands

### Backend

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run migrate` | Initialize database |
| `npm run dev` | Start dev server (auto-reload) |
| `npm start` | Start production server |
| `npm install <package>` | Add new package |

### Frontend

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run linter |

---

## 📝 Database Operations

### Initialize Database
```bash
cd backend
npm run migrate
```

### Reset Database (Warning: Deletes all data!)
```sql
-- Connect to PostgreSQL and run:
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

Then run migration again:
```bash
npm run migrate
```

---

## 👨‍💼 Admin Workflow

### 1. Create a Room
```
Navigate: Admin → Rooms → Add Room
Fill in:
- Room Name: "Aircon Room"
- Base Rent: 5000
- Internet Fee: 500
```

### 2. Create a Tenant User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Dela Cruz",
    "email": "juan@example.com",
    "password": "password123",
    "role": "tenant"
  }'
```

### 3. Assign Tenant to Room
```
Navigate: Admin → Tenants → Add Tenant
Select the user and room created above
```

### 4. Input Meter Reading
```
Navigate: Admin → Meter Readings → Input Reading
Room: Aircon Room
Previous: 1000
Current: 1150
Rate: 12.5
Month: Current month
```

### 5. Generate Bill
```
Navigate: Admin → Bills → Generate Bill
Tenant: Juan Dela Cruz
Month/Year: Current
Due Date: 15th of next month
System calculates: Room fee + Internet + Water + Electricity
```

### 6. Record Payment
```
Navigate: Admin → Bills → (select bill) → Record Payment
Amount: 6000.00
Date: Today
Method: Cash
```

---

## 👥 Tenant Workflow

### 1. Login
```
Go to http://localhost:3000
Email: juan@example.com
Password: password123
```

### 2. View Dashboard
```
See current bill, room info, and quick links
```

### 3. View Bill Breakdown
```
Click "View Breakdown" or navigate to /tenant/bills
See: Room fee, internet, water (calculation), electricity
```

### 4. Check History
```
Navigate to /tenant/history
See all past bills and payment status
```

### 5. Download Receipt
```
Navigate to /tenant/receipts
Click "Download Receipt" for any paid bill
```

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to database"
```
Solution:
1. Verify DATABASE_URL in backend/.env
2. Check PostgreSQL is running
3. Test: psql "your_connection_string"
```

### Issue: "Port 5000 in use"
```
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### Issue: "Port 3000 in use"
```
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

### Issue: "Module not found"
```
Solution:
cd backend (or frontend)
npm install
```

### Issue: "JWT token expired"
```
Solution:
- Clear browser localStorage
- Login again to get new token
```

### Issue: Blank page in browser
```
Solution:
- Check browser console for errors (F12)
- Verify API_URL in .env.local
- Verify backend is running
```

---

## 🚀 Development Tips

### Add a New Admin Feature
1. Create controller method in `/backend/controllers/`
2. Add route in `/backend/routes/`
3. Test API with curl or Postman
4. Create page in `/frontend/app/admin/`
5. Add API call in `/frontend/lib/services.js`

### Add a New Page
```
Frontend:
1. Create file: /app/[path]/page.jsx
2. Add route navigation
3. Import API services as needed
4. Use Tailwind for styling

Backend:
1. Create controller function if needed
2. Add route endpoint if needed
3. Test endpoint
```

### Style a Component
```
Use Tailwind CSS classes:
- Colors: bg-blue-500, text-gray-700
- Spacing: p-4, m-2, gap-4
- Layout: flex, grid, container
- Responsive: md:grid-cols-2, lg:w-1/3
```

---

## 📊 File Locations Quick Map

| What | Location |
|------|----------|
| Admin Pages | `/frontend/app/admin/` |
| Tenant Pages | `/frontend/app/tenant/` |
| API Controllers | `/backend/controllers/` |
| API Routes | `/backend/routes/` |
| Database Schema | `/backend/db/init.js` |
| API Services | `/frontend/lib/services.js` |
| Auth Utils | `/frontend/lib/auth.js` |
| Styling | `/frontend/app/globals.css` |

---

## 🔐 Security Reminders

⚠️ **Never commit these files:**
- `.env` (backend)
- `.env.local` (frontend)
- `node_modules/`

✅ **Before Production:**
- Change admin password
- Set strong JWT_SECRET
- Use HTTPS
- Setup CORS properly
- Enable database backups
- Setup error logging
- Configure rate limiting

---

## 📞 Support Resources

| Document | Content |
|----------|---------|
| README.md | Project overview |
| SETUP.md | Detailed setup instructions |
| backend/README.md | Backend API docs |
| frontend/README.md | Frontend docs |
| PROJECT_SUMMARY.md | Complete feature list |
| .github/copilot-instructions.md | Dev guidelines |

---

## 🎓 Code Examples

### Login API Call
```javascript
import { authAPI } from '@/lib/services';

const response = await authAPI.login({
  email: 'admin@room4rent.com',
  password: 'admin123'
});

const { token, user } = response.data;
```

### Get All Rooms
```javascript
import { roomAPI } from '@/lib/services';

const rooms = await roomAPI.getRooms();
console.log(rooms.data);
```

### Create Room
```javascript
import { roomAPI } from '@/lib/services';

await roomAPI.createRoom({
  room_name: 'Room 1',
  base_rent: 5000,
  internet_fee: 500
});
```

### Generate Bill
```javascript
import { billAPI } from '@/lib/services';

await billAPI.generateBill({
  tenant_id: 1,
  month: 2,
  year: 2026,
  due_date: '2026-02-15'
});
```

---

## 📈 Growth Path

**Phase 1 (Now):** Basic room rental and billing  
**Phase 2:** Payment gateway integration (GCash, PayPal)  
**Phase 3:** Email and SMS notifications  
**Phase 4:** Advanced analytics and graphing  
**Phase 5:** Maintenance request system  
**Phase 6:** Mobile app (React Native)  

---

## ✅ Pre-Launch Checklist

- [ ] Database is setup and tested
- [ ] Environment variables configured
- [ ] Both servers start without errors
- [ ] Login works with admin credentials
- [ ] Can create a room
- [ ] Can create and assign a tenant
- [ ] Can input meter readings
- [ ] Can generate a bill
- [ ] Can record payment
- [ ] Tenant can see their bill
- [ ] All pages load properly
- [ ] Mobile responsive works
- [ ] No console errors

---

## 🎉 You're Ready!

The system is fully functional and ready for:
- ✅ Testing
- ✅ Customization
- ✅ Deployment
- ✅ Going live

**Good luck! 🚀**

---

*Remember: Start with the SETUP.md if you're new to the project!*
