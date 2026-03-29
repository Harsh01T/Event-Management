// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// export async function GET(req: Request, { params }: { params: { id: string } }) {
//   try {
//     const bookings = await prisma.booking.findMany({
//       where: { userId: params.id },
//       include: { event: true },
//     });
//     return NextResponse.json({ success: true, data: bookings });
//   } catch (error) {
//     return NextResponse.json({ success: false, error: "Failed to fetch bookings" }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const userId = resolvedParams.id;

    const bookings = await prisma.booking.findMany({
      where: { userId: userId },
      include: { event: true },
    });

    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch bookings" }, { status: 500 });
  }
}