import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        documents: true,
        actionItems: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    // Parse JSON strings back to arrays and format the response
    const parsedDepartments = departments.map(dept => {
      try {
        const overseers = dept.overseers ? JSON.parse(dept.overseers) : [];
        return {
          id: dept.id,
          name: dept.name,
          fullName: dept.fullName,
          overseers,
          documents: dept.documents || [],
          actionItems: dept.actionItems || [],
        };
      } catch (e) {
        console.error(`Error parsing department ${dept.id}:`, e);
        return {
          id: dept.id,
          name: dept.name,
          fullName: dept.fullName,
          overseers: [],
          documents: dept.documents || [],
          actionItems: dept.actionItems || [],
        };
      }
    });
    
    return NextResponse.json(parsedDepartments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to fetch departments: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch departments: Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate overseer data
    if (!Array.isArray(data.overseers)) {
      return NextResponse.json(
        { error: 'Overseers must be an array' },
        { status: 400 }
      );
    }

    const department = await prisma.department.create({
      data: {
        name: data.name,
        fullName: data.fullName,
        overseers: JSON.stringify(data.overseers),
      },
    });
    
    return NextResponse.json({
      ...department,
      overseers: JSON.parse(department.overseers)
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating department:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to create department: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create department: Unknown error' },
      { status: 500 }
    );
  }
}
