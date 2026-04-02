import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const eventSchema = z.object({
  title: z.string().min(3, "Title is too short"),
  description: z.string().optional(),
  date: z.string().refine((dateString) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    return eventDate >= today;
  }, { message: "Event date cannot be in the past" }),
  totalCapacity: z.number().int().positive(),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");

    let whereClause = {};
    
    if (dateParam) {
      const startOfDay = new Date(dateParam);
      startOfDay.setUTCHours(0, 0, 0, 0);
      
      const endOfDay = new Date(dateParam);
      endOfDay.setUTCHours(23, 59, 59, 999);

      whereClause = {
        date: { gte: startOfDay, lte: endOfDay }
      };
    }

    const events = await prisma.event.findMany({ 
      where: whereClause, 
      orderBy: { date: 'asc' } 
    });

    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const validation = eventSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ 
        success: false, 
        errors: validation.error.format() 
      }, { status: 400 });
    }

    const newEvent = await prisma.event.create({
      data: {
        title: validation.data.title,
        description: validation.data.description || "",
        date: new Date(validation.data.date),
        totalCapacity: validation.data.totalCapacity,
        remainingTickets: validation.data.totalCapacity,
      }
    });

    return NextResponse.json({ success: true, data: newEvent });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create event" }, { status: 500 });
  }
}
