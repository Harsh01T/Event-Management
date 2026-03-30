import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const eventSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  date: z.preprocess((arg) => typeof arg === "string" ? new Date(arg) : arg, z.date()),
  totalCapacity: z.number().positive(),
});

export async function GET() {
  try {
    const events = await prisma.event.findMany({
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
    return NextResponse.json({ success: false, error: "Invalid input data" }, { status: 400 });
  }
}
