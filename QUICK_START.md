# 🌙 Ramadan 2026 Volunteer System - Quick Start Guide

## ✅ Application is Ready!

Your Ramadan 2026 Volunteer Reservation System has been successfully built and is running at:

- **Local**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/polladmin

---

## 📋 What Has Been Built

### 1. **Main Features**

- ✅ Bilingual interface (German & Arabic with RTL support)
- ✅ All Ramadan 2026 dates (Feb 19 - Mar 20/21) + Eid al-Fitr
- ✅ Capacity management (3 volunteers per day, unlimited for Eid)
- ✅ Display volunteer names (phone numbers hidden on public view)
- ✅ Responsive design for all devices
- ✅ Password-protected admin dashboard
- ✅ CSV export functionality

### 2. **Key Information Displayed**

- 🕌 Call to action in both languages with full volunteer details
- ⏰ Time commitment: 30 mins before Isha + 30 mins after Tarawih
- 📅 Note about Ramadan possibly being 29 or 30 days
- 👥 Real-time availability for each day
- 📝 List of registered volunteers (names only)

### 3. **Database**

- SQLite database (`volunteers.db`) automatically created
- Stores: Date, Full Name, Phone Number, Registration Time

---

## 🚀 How to Use

### For Volunteers:

1. Visit http://localhost:3000
2. Click language toggle (Deutsch/عربي) to switch languages
3. View all available days with remaining slots
4. Click "Register for this day" on any available day
5. Fill in Name and Phone Number
6. Submit registration

### For Administrators:

1. Visit http://localhost:3000/polladmin
2. Enter the password from your `.env` file
3. View all volunteers grouped by date
4. Export data to CSV for records
5. Switch language view if needed

---

## 🔧 Configuration

### Set Admin Password

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Edit `.env` and set your admin password:

```
ADMIN_PASSWORD=your_secure_password_here
```

### Modify Capacity Limits

Edit `src/lib/dates.ts`:

```typescript
export const REGULAR_DAY_CAPACITY = 3; // Change to desired number
```

### Update Translations

Edit `src/lib/translations.ts` for German (`de`) and Arabic (`ar`) text.

---

## 📱 Features Breakdown

### Public View (/)

- **Header**: Title in current language + call to action
- **Information Box**:
  - Volunteer details (time commitment)
  - How to participate (3 steps)
  - Note about Ramadan duration
- **Days Grid**:
  - All 31-32 days displayed
  - Shows remaining slots (e.g., "2/3")
  - Lists registered volunteer names
  - "Full" status when capacity reached
  - Special indicator for Eid day (unlimited capacity)
- **Registration Form**: Appears when clicking "Register"

### Admin View (/polladmin)

- **Authentication**: Password protection with environment variable
- **Dashboard Stats**: Total volunteer count
- **Data by Date**: All volunteers grouped by day
- **Table View**: ID, Name, Phone, Registration timestamp
- **Export**: Download CSV with all data
- **Language Switch**: View names in different scripts

---

## 🗂️ Project Structure

```
poll/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── volunteers/route.ts    # Main API
│   │   │   └── admin/route.ts         # Admin API
│   │   ├── polladmin/page.tsx         # Admin dashboard
│   │   ├── page.tsx                   # Main page
│   │   ├── layout.tsx                 # Root layout
│   │   └── globals.css                # Styles with RTL
│   └── lib/
│       ├── db.ts                      # Database setup
│       ├── dates.ts                   # Date utilities
│       ├── types.ts                   # TypeScript types
│       └── translations.ts            # German & Arabic text
├── .env                               # Environment variables (not in git)
├── .env.example                       # Environment template
├── volunteers.db                      # SQLite database (auto-created)
├── package.json
└── README.md
```

---

## 🎨 Design Highlights

- **Colors**: Emerald green theme (Islamic aesthetic)
- **Typography**: Noto Kufi Arabic for Arabic text
- **Layout**: Responsive grid (1/2/3 columns based on screen size)
- **RTL Support**: Automatic right-to-left for Arabic
- **Accessibility**: Clear labels, focus states, disabled states

---

## 📊 API Endpoints

### GET `/api/volunteers`

Returns all dates with volunteer counts and names:

```json
[
  {
    "date": "2026-02-19",
    "count": 2,
    "isFull": false,
    "isEid": false,
    "volunteers": [
      { "full_name": "Ahmad Schmidt" },
      { "full_name": "Fatima Weber" }
    ]
  }
]
```

### POST `/api/volunteers`

Register a new volunteer:

```json
{
  "date": "2026-02-19",
  "full_name": "Hassan Müller",
  "phone_number": "+4917612345678"
}
```

### POST `/api/admin`

Authenticate and get all data:

```json
{
  "password": "your_password_from_env"
}
```

---

## 🚨 Important Notes

### Before Deployment:

1. ⚠️ **Set a secure admin password** in your `.env` file
2. ✅ Test on mobile devices (responsive design)
3. ✅ Verify both languages work correctly
4. ✅ Check database file is writable
5. ✅ Ensure date ranges are correct

### Security:

- Admin auth uses environment variable for password
- 🔒 Never commit your `.env` file to version control
- For production, consider:
  - Session management
  - Rate limiting on API routes
  - HTTPS enforcement

### Database:

- SQLite file is in project root
- Automatic backup recommended
- Can be replaced with PostgreSQL/MySQL if needed

---

## 🔄 Next Steps

1. **Set Admin Password**: Create `.env` file with `ADMIN_PASSWORD`
2. **Test the Application**: Visit http://localhost:3000
3. **Test Admin Panel**: Visit http://localhost:3000/polladmin
4. **Customize Text**: Update translations if needed
5. **Deploy**: Push to Vercel or similar platform

---

## 📞 Support & Troubleshooting

### Common Issues:

**Q: Database error on first launch?**
A: The `volunteers.db` file will be created automatically. Ensure write permissions.

**Q: Arabic text not displaying correctly?**
A: Google Fonts (Noto Kufi Arabic) should load automatically. Check internet connection.

**Q: Can't access admin panel?**
A: Check your `.env` file has `ADMIN_PASSWORD` set. Check console for errors.

**Q: Dates not showing?**
A: Dates are hardcoded for Ramadan 2026. Check `src/lib/dates.ts`.

---

## 🤲 Final Notes

**In German:**
Möge Allah Ihre Bemühungen annehmen und Ihren Dienst in Seinem Haus segnen.

**In Arabic:**
تقبل الله منكم ومنّا صالح الأعمال وجعل عملكم في خدمة بيته في ميزان حسناتكم.

**In English:**
May Allah accept your efforts and bless your service to His house.

---

## 📝 License

Open source for use by Al-Salam Mosque Lörrach and the Muslim community.

Built with ❤️ for Ramadan 2026
