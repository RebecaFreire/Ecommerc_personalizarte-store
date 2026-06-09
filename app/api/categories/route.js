import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return Response.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    return Response.json({ error: 'Error fetching categories' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return Response.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, slug } = body;

    const category = await prisma.category.create({
      data: {
        name,
        description,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      },
    });

    return Response.json(category, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return Response.json({ error: 'Error creating category' }, { status: 500 });
  }
}
