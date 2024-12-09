import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id: params.id },
      include: {
        actionItems: {
          include: {
            departments: true
          }
        }
      }
    });

    if (!meeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(meeting);
  } catch (error) {
    console.error('Error fetching meeting:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meeting' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();

    // Delete existing action items
    await prisma.actionItem.deleteMany({
      where: { meetingId: params.id }
    });

    // Update meeting with new data
    const meeting = await prisma.meeting.update({
      where: { id: params.id },
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

    return NextResponse.json(meeting);
  } catch (error) {
    console.error('Error updating meeting:', error);
    return NextResponse.json(
      { error: 'Failed to update meeting' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.meeting.delete({
      where: { id: params.id }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    return NextResponse.json(
      { error: 'Failed to delete meeting' },
      { status: 500 }
    );
  }
}
