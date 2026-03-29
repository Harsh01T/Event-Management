import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const { userId, eventId, ticketCount = 1 } = await req.json();

    const booking = await prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({
        where: { id: eventId },
      });

      if (!event) throw new Error("Event not found");
      if (event.remainingTickets < ticketCount) throw new Error("Not enough tickets available");

      await tx.event.update({
        where: { id: eventId },
        data: { remainingTickets: { decrement: ticketCount } },
      });

      const uniqueCode = uuidv4().slice(0, 8).toUpperCase();
      return await tx.booking.create({
        data: {
          userId,
          eventId,
          ticketCount,
          uniqueCode,
        },
      });
    });

    return NextResponse.json({ success: true, data: booking, message: "Booking successful" }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
