import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const eventId = resolvedParams.id;

  try {
    const { uniqueCode } = await req.json();

    const booking = await prisma.booking.findUnique({
      where: { uniqueCode },
      include: { 
        event: true,
        attendance: true 
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Invalid booking code" }, { status: 404 });
    }

    if (booking.eventId !== eventId) {
      return NextResponse.json({ error: "Code not valid for this event" }, { status: 400 });
    }

    if (booking.attendance) {
      return NextResponse.json({ 
        success: false, 
        error: "This ticket has already been used. Duplicate entry denied." 
      }, { status: 409 }); 
    }

    await prisma.attendance.create({
      data: { bookingId: booking.id },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Attendance logged successfully",
      ticketsBooked: booking.ticketCount 
    });

  } catch (error) {
    console.error("Attendance Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
