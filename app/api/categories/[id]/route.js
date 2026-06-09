import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function PUT(request, { params }) {
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
    const { id } = params;

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      },
    });

    return Response.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    return Response.json({ error: 'Error updating category' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
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

    const { id } = params;

    // Check if category has products
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return Response.json({ error: 'Category not found' }, { status: 404 });
    }

    if (category._count.products > 0) {
      return Response.json({ error: 'Cannot delete category with products' }, { status: 400 });
    }

    await prisma.category.delete({
      where: { id: parseInt(id) },
    });

    return Response.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    return Response.json({ error: 'Error deleting category' }, { status: 500 });
  }
}
