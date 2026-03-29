import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request, { params }: { params: Promise<{id: string }>}){
  try {
    const resolvedParams = await params;
    const bookingId = resolvedParams.id;

    await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: {id: bookingId},
      });

      if (!booking) throw new Error("Booking not found");

      await tx.event.update({
        where: { id: booking.eventId },
        data: { remainingTickets: { increment: booking.ticketCount }},
      });

      await tx.attendance.deleteMany({
        where: {bookingId: bookingId},
      });

      await tx.booking.delete({
        where: {id: bookingId},
      });
    });

    return NextResponse.json({success: true, message: "Ticket cancelled successfully"});
  } catch (error: any) {
    return NextResponse.json({success: false, error: error.message}, {status: 400});
  }
}
