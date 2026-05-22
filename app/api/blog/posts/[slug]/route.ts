import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';
import { getAuthenticatedUser } from '../../../../../lib/api-auth';

// GET /api/blog/posts/[slug] - Get single post (public)
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
    try {
        const post = await prisma.blogPost.findUnique({
            where: { slug: params.slug },
            include: {
                author: {
                    select: { name: true },
                },
            },
        });

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        return NextResponse.json(post);
    } catch (error) {
        console.error('Error fetching post:', error);
        return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
    }
}

// PUT /api/blog/posts/[slug] - Update post (Admin only)
export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
    try {
        const user = getAuthenticatedUser(req);

        if (!user || !user.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { title, content, excerpt, coverImage, published } = body;

        const post = await prisma.blogPost.update({
            where: { slug: params.slug },
            data: {
                title,
                content,
                excerpt,
                coverImage,
                published,
            },
        });

        return NextResponse.json(post);
    } catch (error) {
        console.error('Error updating post:', error);
        return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
    }
}

// DELETE /api/blog/posts/[slug] - Delete post (Admin only)
export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
    try {
        const user = getAuthenticatedUser(req);

        if (!user || !user.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await prisma.blogPost.delete({
            where: { slug: params.slug },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting post:', error);
        return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
    }
}
