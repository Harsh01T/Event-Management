import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const countToCancel = parseInt(searchParams.get("count") || "1");
    const bookingId = params.id;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { event: true }
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    const newTicketCount = booking.ticketCount - countToCancel;

    await prisma.$transaction(async (tx) => {
      await tx.event.update({
        where: { id: booking.eventId },
        data: { remainingTickets: { increment: countToCancel } }
      });

      if (newTicketCount <= 0) {
        await tx.booking.delete({
          where: { id: bookingId }
        });
      } else {
        await tx.booking.update({
          where: { id: bookingId },
          data: { ticketCount: newTicketCount }
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
