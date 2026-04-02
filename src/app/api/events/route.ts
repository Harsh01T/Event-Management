import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  date: z.preprocess(
    (arg) => (typeof arg === "string" ? new Date(arg) : arg),
    z.date().refine((d) => d > new Date(), { message: "Event date must be in the future" })
  ),
  totalCapacity: z.number().int().positive("Capacity must be a positive whole number"),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateQuery = searchParams.get("date");

    let whereClause = {};

    if (dateQuery) {
      const startOfDay = new Date(dateQuery);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(dateQuery);
      endOfDay.setHours(23, 59, 59, 999);

      whereClause = {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      };
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      orderBy: { date: 'asc' },
    });

    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = eventSchema.parse(body);

    const event = await prisma.event.create({
      data: {
        ...parsed,
        remainingTickets: parsed.totalCapacity,
      },
    });
    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        success: false, 
        error: error.issues[0].message 
      }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Invalid input data" }, { status: 400 });
  }
}
