import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { Volunteer } from "@/lib/types";

const ADMIN_PASSWORD = "ramadan2026"; // Change this to a secure password

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Fetch all volunteers grouped by date
    const stmt = db.prepare(`
      SELECT * FROM volunteers
      ORDER BY date, created_at
    `);

    const volunteers = stmt.all() as Volunteer[];

    // Group by date
    const groupedByDate = volunteers.reduce(
      (acc, volunteer) => {
        if (!acc[volunteer.date]) {
          acc[volunteer.date] = [];
        }
        acc[volunteer.date].push(volunteer);
        return acc;
      },
      {} as Record<string, Volunteer[]>,
    );

    return NextResponse.json({
      success: true,
      data: groupedByDate,
      total: volunteers.length,
    });
  } catch (error) {
    console.error("Error fetching admin data:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin data" },
      { status: 500 },
    );
  }
}
