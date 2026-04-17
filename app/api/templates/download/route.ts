import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { readFileSync, existsSync } from 'fs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const slug = searchParams.get('slug');

  if (!type || !slug || !['pdf', 'docx', 'xlsx'].includes(type)) {
    return NextResponse.json({ error: 'Invalid download parameters' }, { status: 400 });
  }

  // Define the path to our master generic templates
  const masterFileMap: Record<string, string> = {
    pdf: 'master-template.pdf',
    docx: 'master-template.docx',
    xlsx: 'master-template.xlsx',
  };

  // Find where public folder is in current environment
  const publicDir = path.join(process.cwd(), 'public', 'templates');
  const filePath = path.join(publicDir, masterFileMap[type]);

  // Make sure the master file exists, otherwise return 404
  if (!existsSync(filePath)) {
    return NextResponse.json({ 
        error: 'Master template file not found on server.', 
        details: `Missing: public/templates/${masterFileMap[type]}`
    }, { status: 404 });
  }

  try {
    const fileBuffer = readFileSync(filePath);

    // Mime types
    const mimeTypes: Record<string, string> = {
        pdf: 'application/pdf',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };

    // Rename the downloaded file to closely match what they clicked (e.g. plumbing-invoice-template.docx)
    const downloadFilename = `${slug}.${type}`;

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeTypes[type],
        'Content-Disposition': `attachment; filename="${downloadFilename}"`,
        // Set aggressive cache control assuming templates don't change often
        'Cache-Control': 'public, max-age=86400, s-maxage=86400', 
      },
    });
  } catch (err: any) {
    console.error('Error serving template download:', err);
    return NextResponse.json({ error: 'Internal server error while serving file' }, { status: 500 });
  }
}
