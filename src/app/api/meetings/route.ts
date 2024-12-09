import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const meetings = await prisma.meeting.findMany({
      include: {
        actionItems: {
          include: {
            departments: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });
    
    return NextResponse.json(meetings);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meetings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const meeting = await prisma.meeting.create({
      data: {
        title: data.title,
        date: new Date(data.date),
        notes: data.notes,
        actionItems: {
          create: data.actionItems.map((item: any) => ({
            description: item.description,
            dueDate: new Date(item.dueDate),
            departments: {
              connect: item.departmentIds.map((id: string) => ({ id }))
            }
          }))
        }
      },
      include: {
        actionItems: {
          include: {
            departments: true
          }
        }
      }
    });
    
    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error('Error creating meeting:', error);
    return NextResponse.json(
      { error: 'Failed to create meeting' },
      { status: 500 }
    );
  }
}
