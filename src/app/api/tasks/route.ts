import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Parse JSON strings back to arrays
    const parsedTasks = tasks.map(task => ({
      ...task,
      departments: JSON.parse(task.departments)
    }));
    
    return NextResponse.json(parsedTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAuthenticated = request.cookies.get('isAuthenticated')?.value === 'true';
    const isGuest = request.cookies.get('isGuest')?.value === 'true';

    if (!isAuthenticated || isGuest) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await request.json();
    const task = await prisma.task.create({
      data: {
        description: data.description,
        departments: JSON.stringify(data.departments),
        status: data.status || 'TODO',
        dueDate: new Date(data.dueDate),
      },
    });
    
    return NextResponse.json({
      ...task,
      departments: JSON.parse(task.departments)
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const isAuthenticated = request.cookies.get('isAuthenticated')?.value === 'true';
    const isGuest = request.cookies.get('isGuest')?.value === 'true';

    if (!isAuthenticated || isGuest) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await request.json();
    const { id, departments, ...updateData } = data;
    
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...updateData,
        ...(departments && { departments: JSON.stringify(departments) }),
      },
    });
    
    return NextResponse.json({
      ...task,
      departments: JSON.parse(task.departments)
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const isAuthenticated = request.cookies.get('isAuthenticated')?.value === 'true';
    const isGuest = request.cookies.get('isGuest')?.value === 'true';

    if (!isAuthenticated || isGuest) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    await prisma.task.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
