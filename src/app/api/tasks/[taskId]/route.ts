import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: params.taskId },
    });

    if (!task) {
      return new NextResponse('Task not found', { status: 404 });
    }

    return NextResponse.json({
      ...task,
      departments: JSON.parse(task.departments)
    });
  } catch (error) {
    console.error('Error getting task:', error);
    return new NextResponse('Error getting task', { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const isAuthenticated = req.cookies.get('isAuthenticated')?.value === 'true';
    const isGuest = req.cookies.get('isGuest')?.value === 'true';

    if (!isAuthenticated || isGuest) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const updates = await req.json();
    const task = await prisma.task.update({
      where: { id: params.taskId },
      data: {
        description: updates.description,
        departments: Array.isArray(updates.departments) 
          ? JSON.stringify(updates.departments)
          : updates.departments,
        status: updates.status,
        dueDate: updates.dueDate ? new Date(updates.dueDate) : undefined,
        notes: updates.notes || null, // Handle null/undefined notes
      },
    });

    return NextResponse.json({
      ...task,
      departments: JSON.parse(task.departments)
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return new NextResponse('Error updating task', { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const isAuthenticated = req.cookies.get('isAuthenticated')?.value === 'true';
    const isGuest = req.cookies.get('isGuest')?.value === 'true';

    if (!isAuthenticated || isGuest) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const task = await prisma.task.findUnique({
      where: { id: params.taskId },
    });

    if (!task) {
      return new NextResponse('Task not found', { status: 404 });
    }

    await prisma.task.delete({
      where: { id: params.taskId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting task:', error);
    return new NextResponse('Error deleting task', { status: 500 });
  }
}
