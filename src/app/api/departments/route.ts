import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        documents: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    // Parse JSON strings back to arrays and format the response
    const parsedDepartments = departments.map(dept => {
      try {
        return {
          id: dept.id,
          name: dept.name,
          fullName: dept.fullName,
          overseers: JSON.parse(dept.overseers),
          documents: dept.documents,
          createdAt: dept.createdAt,
          updatedAt: dept.updatedAt
        };
      } catch (e) {
        console.error('Error parsing department overseers:', e);
        return {
          id: dept.id,
          name: dept.name,
          fullName: dept.fullName,
          overseers: [],
          documents: dept.documents,
          createdAt: dept.createdAt,
          updatedAt: dept.updatedAt
        };
      }
    });
    
    return NextResponse.json(parsedDepartments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
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
    return NextResponse.json(
      { error: 'Failed to create department' },
      { status: 500 }
    );
  }
}
