import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();

    // Validate the department exists first
    const existingDepartment = await prisma.department.findUnique({
      where: { id: params.id },
    });

    if (!existingDepartment) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    // Validate overseer data
    if (!Array.isArray(data.overseers)) {
      return NextResponse.json(
        { error: 'Overseers must be an array' },
        { status: 400 }
      );
    }

    const department = await prisma.department.update({
      where: {
        id: params.id,
      },
      data: {
        name: data.name,
        fullName: data.fullName,
        overseers: JSON.stringify(data.overseers),
      },
    });

    return NextResponse.json({
      ...department,
      overseers: JSON.parse(department.overseers)
    });
  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json(
      { error: 'Failed to update department' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    await prisma.department.delete({
      where: { id },
    });
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json(
      { error: 'Failed to delete department' },
      { status: 500 }
    );
  }
}
