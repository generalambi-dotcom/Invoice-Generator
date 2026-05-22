import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { getAuthenticatedUser } from '../../../../lib/api-auth';

// GET /api/blog/posts - List all published posts (public)
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const publishedOnly = searchParams.get('published') !== 'false'; // Default to true

        const where: any = {};
        if (publishedOnly) {
            where.published = true;
        }

        const posts = await prisma.blogPost.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: { name: true },
                },
            },
        });

        return NextResponse.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}

// POST /api/blog/posts - Create a new post (Admin only)
export async function POST(req: NextRequest) {
    try {
        const user = getAuthenticatedUser(req);

        // Check if user is admin
        if (!user || !user.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { title, slug, content, excerpt, coverImage, published } = body;

        // Validate required fields
        if (!title || !slug || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if slug is unique
        const existingPost = await prisma.blogPost.findUnique({
            where: { slug },
        });

        if (existingPost) {
            return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
        }

        const post = await prisma.blogPost.create({
            data: {
                title,
                slug,
                content,
                excerpt,
                coverImage,
                published: published || false,
                authorId: user.userId,
            },
        });

        return NextResponse.json(post);
    } catch (error) {
        console.error('Error creating post:', error);
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}
