import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params:Promise<{ id: string }>}){
  const resolvedParams = await params;
  const eventId = resolvedParams.id;

  try {
    const { uniqueCode } = await req.json();

    const booking = await prisma.booking.findUnique({
      where: { uniqueCode },
      include: { event: true },
    });

    if (!booking) return NextResponse.json({ error: "Invalid booking code" }, { status: 404 });
    if (booking.eventId !== eventId) return NextResponse.json({ error: "Code not valid for this event" }, { status: 400 });

    const attendance = await prisma.attendance.create({
      data: { bookingId: booking.id },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Attendance logged successfully",
      ticketsBooked: booking.ticketCount 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to log attendance" }, { status: 500 });
  }
}
