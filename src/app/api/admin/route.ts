import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { Volunteer } from "@/lib/types";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Admin password not configured" },
        { status: 500 },
      );
    }

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Fetch all volunteers grouped by date
    const [volunteers] = (await db.query(`
      SELECT * FROM volunteers
      ORDER BY date, created_at
    `)) as any[];

    // Group by date
    const groupedByDate = volunteers.reduce(
      (acc: Record<string, Volunteer[]>, volunteer: Volunteer) => {
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
