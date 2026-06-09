import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request, context) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);
    if (!numericId || isNaN(numericId)) {
      return Response.json({ error: 'Invalid order ID' }, { status: 400 });
    }
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return Response.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: numericId,
        userId: decoded.userId,
      },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    return Response.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    return Response.json({ error: 'Error fetching order' }, { status: 500 });
  }
}

export async function PATCH(request, context) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);
    if (!numericId || isNaN(numericId)) {
      return Response.json({ error: 'Invalid order ID' }, { status: 400 });
    }
    const body = await request.json();
    const { status, archived } = body;

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return Response.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (typeof archived === 'boolean') updateData.archived = archived;

    const order = await prisma.order.update({
      where: { id: numericId },
      data: updateData,
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    return Response.json(order);
  } catch (error) {
    console.error('Update order error:', error);
    return Response.json({ error: 'Error updating order' }, { status: 500 });
  }
}
