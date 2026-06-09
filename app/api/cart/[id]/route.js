import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function PATCH(request, context) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);
    if (!numericId || isNaN(numericId)) {
      return Response.json({ error: 'Invalid cart item ID' }, { status: 400 });
    }
    const body = await request.json();
    const { quantity } = body;

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return Response.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    const cartItem = await prisma.cartItem.update({
      where: { id: numericId },
      data: { quantity: parseInt(quantity) },
      include: {
        product: true,
      },
    });

    return Response.json(cartItem);
  } catch (error) {
    console.error('Update cart item error:', error);
    return Response.json({ error: 'Error updating cart item' }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);
    if (!numericId || isNaN(numericId)) {
      return Response.json({ error: 'Invalid cart item ID' }, { status: 400 });
    }

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return Response.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    await prisma.cartItem.delete({
      where: { id: numericId },
    });

    return Response.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Delete cart item error:', error);
    return Response.json({ error: 'Error removing item from cart' }, { status: 500 });
  }
}
