import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { getCurrentUser } from '../../../lib/auth';

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user || !user.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `blog-covers/${fileName}`;

        const { data, error } = await supabase.storage
            .from('blog-assets')
            .upload(filePath, file);

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
