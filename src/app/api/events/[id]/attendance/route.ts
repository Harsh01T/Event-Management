import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const body = await req.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ success: false, error: "Booking ID is required" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking || booking.eventId !== eventId) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid ticket for this specific event" 
      }, { status: 404 });
    }

    const existingAttendance = await prisma.attendance.findFirst({
      where: { bookingId: bookingId }
    });

    if (existingAttendance) {
      return NextResponse.json({ 
        success: true, 
        message: "Ticket already scanned. Access granted!" 
      });
    }

    const newAttendance = await prisma.attendance.create({
      data: { bookingId: bookingId }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Attendance logged successfully", 
      data: newAttendance 
    });
  } catch (error) {
    console.error("Attendance Error:", error);
    return NextResponse.json({ success: false, error: "Failed to log attendance" }, { status: 500 });
  }
}