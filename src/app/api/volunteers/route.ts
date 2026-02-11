import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import {
  generateRamadanDates,
  getEidEntry,
  isEidDay,
  REGULAR_DAY_CAPACITY,
} from "@/lib/dates";
import { DayInfo } from "@/lib/types";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Cache for 30 seconds to reduce database load
export const revalidate = 30;

export async function GET() {
  try {
    const allDates = generateRamadanDates();

    // Get volunteer counts for all dates
    const [counts] = (await db.query(`
      SELECT date, COUNT(*) as count, 
             GROUP_CONCAT(first_name SEPARATOR '|||') as first_names,
             GROUP_CONCAT(last_name SEPARATOR '|||') as last_names
      FROM volunteers
      GROUP BY date
    `)) as any[];

    const countsMap = new Map<
      string,
      { count: number; first_names: string; last_names: string }
    >(
      counts.map((c: any) => [
        c.date,
        {
          count: c.count,
          first_names: c.first_names,
          last_names: c.last_names,
        },
      ]),
    );

    // Regular Ramadan days
    const daysInfo: DayInfo[] = allDates.map((date) => {
      const info = countsMap.get(date);
      const count = info?.count || 0;
      const isFull = count >= REGULAR_DAY_CAPACITY;

      const volunteers =
        info?.first_names && info?.last_names
          ? info.first_names.split("|||").map((firstName, idx) => ({
              first_name: firstName,
              last_name: info.last_names!.split("|||")[idx] || "",
            }))
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
    const eidVolunteers =
      eidInfo?.first_names && eidInfo?.last_names
        ? eidInfo.first_names.split("|||").map((firstName, idx) => ({
            first_name: firstName,
            last_name: eidInfo.last_names!.split("|||")[idx] || "",
          }))
        : [];

    const eidDayInfo: DayInfo = {
      date: eidEntry,
      count: eidCount,
      isFull: false,
      isEid: true,
      volunteers: eidVolunteers,
    };

    const response = NextResponse.json({ days: daysInfo, eid: eidDayInfo });

    // Add caching headers
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=30, stale-while-revalidate=59",
    );

    return response;
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
    const { date, first_name, last_name, phone_number } = body;

    // Validation
    if (!date || !first_name || !last_name || !phone_number) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Capitalize first character of first name and last name
    const capitalizeFirstLetter = (str: string) => {
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    const formattedFirstName = capitalizeFirstLetter(first_name.trim());
    const formattedLastName = capitalizeFirstLetter(last_name.trim());

    // Check if date is valid (either Ramadan date or Eid)
    const allDates = generateRamadanDates();
    const eidEntry = getEidEntry();
    if (!allDates.includes(date) && date !== eidEntry) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    // Check capacity for non-Eid days only
    if (date !== eidEntry) {
      const [rows] = (await db.query(
        "SELECT COUNT(*) as count FROM volunteers WHERE date = ?",
        [date],
      )) as any[];
      const result = rows[0] as { count: number };

      if (result.count >= REGULAR_DAY_CAPACITY) {
        return NextResponse.json(
          { error: "This day is already full" },
          { status: 400 },
        );
      }
    }

    // Check if volunteer already registered for this day (by phone number)
    const [existingRows] = (await db.query(
      "SELECT id FROM volunteers WHERE date = ? AND phone_number = ?",
      [date, phone_number],
    )) as any[];

    if (existingRows.length > 0) {
      return NextResponse.json(
        { error: "Already registered for this day" },
        { status: 400 },
      );
    }

    // Insert volunteer
    const [result] = (await db.execute(
      `INSERT INTO volunteers (date, first_name, last_name, phone_number)
       VALUES (?, ?, ?, ?)`,
      [date, formattedFirstName, formattedLastName, phone_number],
    )) as any[];

    return NextResponse.json(
      {
        success: true,
        id: result.insertId,
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

    if (!ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Admin password not configured" },
        { status: 500 },
      );
    }

    // Verify admin password
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Delete the volunteer
    const [result] = (await db.execute("DELETE FROM volunteers WHERE id = ?", [
      id,
    ])) as any[];

    if (result.affectedRows === 0) {
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
