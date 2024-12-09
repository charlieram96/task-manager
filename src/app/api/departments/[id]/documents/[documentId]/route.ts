import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { join } from 'path';
import { readFile } from 'fs/promises';
import { headers } from 'next/headers';

const UPLOAD_DIR = join(process.cwd(), 'uploads');

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; documentId: string } }
) {
  try {
    const document = await prisma.document.findUnique({
      where: { id: params.documentId },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const filePath = join(UPLOAD_DIR, document.fileName);
    const fileBuffer = await readFile(filePath);

    // Create response with appropriate headers
    const response = new NextResponse(fileBuffer);
    
    // Set content type and disposition headers
    response.headers.set('Content-Type', document.contentType);
    response.headers.set(
      'Content-Disposition',
      `inline; filename="${document.name}${getFileExtension(document.fileName)}"`
    );

    return response;
  } catch (error) {
    console.error('Error downloading document:', error);
    return NextResponse.json(
      { error: 'Failed to download document' },
      { status: 500 }
    );
  }
}

function getFileExtension(fileName: string): string {
  const match = fileName.match(/\.[^.]*$/);
  return match ? match[0] : '';
}
