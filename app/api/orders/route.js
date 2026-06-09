import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
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

    const isAdmin = user?.role === 'admin';
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    const archivedFilter = searchParams.get('archived');

    const whereClause = isAdmin ? {} : { userId: decoded.userId, archived: false };
    if (statusFilter) {
      whereClause.status = statusFilter;
    }
    if (archivedFilter !== null && isAdmin) {
      whereClause.archived = archivedFilter === 'true';
    } else if (!isAdmin) {
      whereClause.archived = false;
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        address: true,
        orderItems: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
            customizations: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return Response.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    return Response.json({ error: 'Error fetching orders' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { items, shippingAddress, paymentMethod } = body;

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return Response.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Calculate total
    let total = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return Response.json({ error: `Product ${item.productId} not found` }, { status: 404 });
      }

      total += product.price * item.quantity;
      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        customization: item.customization || null,
      });
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: decoded.userId,
        total,
        paymentMethod,
        shippingAddress,
        status: 'pending',
        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    return Response.json(order, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return Response.json({ error: 'Error creating order' }, { status: 500 });
  }
}
