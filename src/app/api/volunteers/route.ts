import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import {
  generateRamadanDates,
  getEidEntry,
  isEidDay,
  REGULAR_DAY_CAPACITY,
} from "@/lib/dates";
import { DayInfo } from "@/lib/types";

const ADMIN_PASSWORD = "ramadan2026";

export async function GET() {
  try {
    const allDates = generateRamadanDates();

    // Get volunteer counts for all dates
    const countsStmt = db.prepare(`
      SELECT date, COUNT(*) as count, 
             GROUP_CONCAT(full_name, '|||') as names
      FROM volunteers
      GROUP BY date
    `);

    const counts = countsStmt.all() as Array<{
      date: string;
      count: number;
      names: string | null;
    }>;

    const countsMap = new Map(
      counts.map((c) => [c.date, { count: c.count, names: c.names }]),
    );

    // Regular Ramadan days
    const daysInfo: DayInfo[] = allDates.map((date) => {
      const info = countsMap.get(date);
      const count = info?.count || 0;
      const isFull = count >= REGULAR_DAY_CAPACITY;

      const volunteers = info?.names
        ? info.names.split("|||").map((name) => ({ full_name: name }))
        : [];

      return {
        date,
        count,
        isFull,
        isEid: false,
        volunteers,
      };
    });

    // Add Eid as separate entry
    const eidEntry = getEidEntry();
    const eidInfo = countsMap.get(eidEntry);
    const eidCount = eidInfo?.count || 0;
    const eidVolunteers = eidInfo?.names
      ? eidInfo.names.split("|||").map((name) => ({ full_name: name }))
      : [];

    const eidDayInfo: DayInfo = {
      date: eidEntry,
      count: eidCount,
      isFull: false,
      isEid: true,
      volunteers: eidVolunteers,
    };

    return NextResponse.json({ days: daysInfo, eid: eidDayInfo });
  } catch (error) {
    console.error("Error fetching volunteers:", error);
    return NextResponse.json(
      { error: "Failed to fetch volunteers" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, full_name, phone_number } = body;

    // Validation
    if (!date || !full_name || !phone_number) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if date is valid (either Ramadan date or Eid)
    const allDates = generateRamadanDates();
    const eidEntry = getEidEntry();
    if (!allDates.includes(date) && date !== eidEntry) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    // Check capacity for non-Eid days only
    if (date !== eidEntry) {
      const countStmt = db.prepare(
        "SELECT COUNT(*) as count FROM volunteers WHERE date = ?",
      );
      const result = countStmt.get(date) as { count: number };

      if (result.count >= REGULAR_DAY_CAPACITY) {
        return NextResponse.json(
          { error: "This day is already full" },
          { status: 400 },
        );
      }
    }

    // Insert volunteer
    const insertStmt = db.prepare(`
      INSERT INTO volunteers (date, full_name, phone_number)
      VALUES (?, ?, ?)
    `);

    const info = insertStmt.run(date, full_name, phone_number);

    return NextResponse.json(
      {
        success: true,
        id: info.lastInsertRowid,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating volunteer:", error);
    return NextResponse.json(
      { error: "Failed to create volunteer registration" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, password } = body;

    // Verify admin password
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Delete the volunteer
    const stmt = db.prepare("DELETE FROM volunteers WHERE id = ?");
    const result = stmt.run(id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: "Volunteer not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Volunteer deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting volunteer:", error);
    return NextResponse.json(
      { error: "Failed to delete volunteer" },
      { status: 500 },
    );
  }
}
