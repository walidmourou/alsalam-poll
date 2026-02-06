# Ramadan 2026 Volunteer Reservation System

A responsive Next.js application for managing volunteer registrations during Ramadan 2026 for Al-Salam Mosque in Lörrach.

## Features

✨ **Bilingual Support** - Available in German and Arabic with full RTL support
📅 **Date Management** - Covers Ramadan 2026 (Feb 19 - Mar 20/21) plus Eid al-Fitr
👥 **Capacity Control** - 3 volunteers per regular day, unlimited for Eid
📱 **Responsive Design** - Works on all devices
🔒 **Admin Dashboard** - Password-protected admin view with export functionality
📊 **CSV Export** - Download volunteer data for record-keeping

## Ramadan 2026 Details

- **Start Date**: February 19, 2026
- **End Date**: March 20, 2026 (30 days) or March 19, 2026 (29 days)
- **Eid al-Fitr**: March 21, 2026 or March 20, 2026
- **Time Commitment**: 2 hours per day
  - 30 minutes before Isha prayer (Organization & Reception)
  - 30 minutes after Tarawih prayer (Cleaning & Organization)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite (better-sqlite3)
- **Fonts**: Noto Kufi Arabic for Arabic text

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Admin Access

To access the admin dashboard:

1. Navigate to `/admin`
2. Default password: `ramadan2026` (⚠️ Change this in production!)
3. View all volunteers grouped by date
4. Export data to CSV format

**To change the admin password**: Edit the `ADMIN_PASSWORD` constant in `src/app/api/admin/route.ts`

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── volunteers/
│   │   │   └── route.ts          # Volunteer CRUD operations
│   │   └── admin/
│   │       └── route.ts          # Admin authentication & data
│   ├── admin/
│   │   └── page.tsx              # Admin dashboard
│   ├── layout.tsx                # Root layout with metadata
│   ├── page.tsx                  # Main volunteer registration page
│   └── globals.css               # Global styles with RTL support
├── lib/
│   ├── db.ts                     # SQLite database setup
│   ├── types.ts                  # TypeScript interfaces
│   ├── dates.ts                  # Date utilities & Ramadan dates
│   └── translations.ts           # German & Arabic translations
└── volunteers.db                 # SQLite database (auto-created)
```

## Database Schema

```sql
CREATE TABLE volunteers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### `GET /api/volunteers`

Returns all dates with volunteer counts and availability status.

### `POST /api/volunteers`

Register a new volunteer.

**Body**:

```json
{
  "date": "2026-02-19",
  "full_name": "John Doe",
  "phone_number": "+49123456789"
}
```

### `POST /api/admin`

Authenticate and retrieve all volunteer data.

**Body**:

```json
{
  "password": "ramadan2026"
}
```

## Customization

### Change Capacity Limits

Edit `REGULAR_DAY_CAPACITY` in `src/lib/dates.ts`

### Modify Translations

Update text in `src/lib/translations.ts`

### Adjust Ramadan Dates

Change date constants in `src/lib/dates.ts`

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Deploy (SQLite database will persist on filesystem)

### Other Platforms

Ensure the platform supports:

- Node.js runtime
- File system access for SQLite
- Persistent storage

## Important Notes

⚠️ **Security**: Change the admin password before deploying to production
📱 **Mobile**: The app is fully responsive and touch-friendly
🌍 **RTL**: Arabic text automatically displays right-to-left
📊 **Data**: SQLite database is stored in the project root as `volunteers.db`

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

**May Allah accept your efforts and bless your service to His house. 🤲**

**Möge Allah Ihre Bemühungen annehmen und Ihren Dienst in Seinem Haus segnen. 🤲**
