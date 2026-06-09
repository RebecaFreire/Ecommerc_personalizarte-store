import prisma from '@/lib/prisma';

export async function GET(request, context) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);
    if (!numericId || isNaN(numericId)) {
      return Response.json({ error: 'Invalid product ID' }, { status: 400 });
    }
    
    const product = await prisma.product.findUnique({
      where: { id: numericId },
      include: {
        category: true,
      },
    });

    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    return Response.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    return Response.json({ error: 'Error fetching product' }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);
    if (!numericId || isNaN(numericId)) {
      return Response.json({ error: 'Invalid product ID' }, { status: 400 });
    }
    const body = await request.json();
    const { name, description, price, image, categoryId, stock, isActive } = body;

    const product = await prisma.product.update({
      where: { id: numericId },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(image && { image }),
        ...(categoryId && { categoryId: parseInt(categoryId) }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        category: true,
      },
    });

    return Response.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    return Response.json({ error: 'Error updating product' }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);
    if (!numericId || isNaN(numericId)) {
      return Response.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id: numericId },
    });

    return Response.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    return Response.json({ error: 'Error deleting product' }, { status: 500 });
  }
}
