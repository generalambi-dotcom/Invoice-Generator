import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { getAuthenticatedUser } from '../../../lib/api-auth';

// Only image uploads are allowed (blog cover images).
const ALLOWED_TYPES: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
};
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
    try {
        // Use the JWT/cookie-based auth. The previous getCurrentUser() read from
        // localStorage and always returned null on the server, so this route was
        // effectively always 401 (broken).
        const user = getAuthenticatedUser(req);

        if (!user || !user.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Validate MIME type and size before touching storage.
        if (!ALLOWED_TYPES[file.type]) {
            return NextResponse.json(
                { error: 'Unsupported file type. Allowed: JPEG, PNG, WebP, GIF, SVG.' },
                { status: 400 }
            );
        }
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 5 MB.' },
                { status: 400 }
            );
        }

        // Derive the extension from the validated MIME type, not the client-supplied name.
        const fileExt = ALLOWED_TYPES[file.type];
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `blog-covers/${fileName}`;

        const { data, error } = await supabase.storage
            .from('blog-assets')
            .upload(filePath, file, { contentType: file.type });

        if (error) {
            console.error('Supabase upload error:', error);
            return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
        }

        const { data: { publicUrl } } = supabase.storage
            .from('blog-assets')
            .getPublicUrl(filePath);

        return NextResponse.json({ url: publicUrl });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
