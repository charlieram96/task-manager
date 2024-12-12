import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';

const UPLOAD_DIR = '';

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    // Removed mkdir call as it's not needed with Vercel Blob Storage
  } catch (error) {
    console.error('Error creating upload directory:', error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const departmentId = params.id;

    // Verify department exists
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const file = formData.get('file') as File;

    if (!name || !file) {
      return NextResponse.json(
        { error: 'Name and file are required' },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob Storage
    const blob = await put(name, file, {
      access: 'public',
    });

    // Save document metadata to database
    const document = await prisma.document.create({
      data: {
        name,
        fileName: blob.url,
        contentType: file.type,
        size: file.size,
        departmentId,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const departmentId = params.id;

    const documents = await prisma.document.findMany({
      where: { departmentId },
      orderBy: { uploadedAt: 'desc' },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}
