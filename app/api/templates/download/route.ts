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

  // Find where public folder is in current environment
  const publicDir = path.join(process.cwd(), 'public', 'templates');

  // Look up by slug first (e.g. plumbing-invoice-template.pdf), fall back to master
  const slugPath = path.join(publicDir, `${slug}.${type}`);
  const masterPath = path.join(publicDir, `master-template.${type}`);
  const filePath = existsSync(slugPath) ? slugPath : masterPath;

  // If neither the slug-specific file nor the master fallback exists, 404
  if (!existsSync(filePath)) {
    return NextResponse.json({
        error: 'Template file not found on server.',
        details: `Missing: public/templates/${slug}.${type} (and fallback master-template.${type})`
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
