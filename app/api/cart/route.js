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

    let cart = await prisma.cart.findUnique({
      where: { userId: decoded.userId },
      include: {
        items: {
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

    // Create cart if doesn't exist
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: decoded.userId },
        include: {
          items: {
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
    }

    return Response.json(cart);
  } catch (error) {
    console.error('Get cart error:', error);
    return Response.json({ error: 'Error fetching cart' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { productId, quantity, customization } = body;

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return Response.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId: decoded.userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: decoded.userId },
      });
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: parseInt(productId),
        customization: customization || null,
      },
    });

    if (existingItem) {
      // Update quantity
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + parseInt(quantity) },
        include: {
          product: true,
        },
      });
      return Response.json(updatedItem);
    }

    // Create new cart item
    const cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: parseInt(productId),
        quantity: parseInt(quantity),
        customization: customization || null,
      },
      include: {
        product: true,
      },
    });

    return Response.json(cartItem, { status: 201 });
  } catch (error) {
    console.error('Add to cart error:', error);
    return Response.json({ error: 'Error adding to cart' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return Response.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Delete all cart items for the user
    await prisma.cartItem.deleteMany({
      where: {
        cart: {
          userId: decoded.userId,
        },
      },
    });

    return Response.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    return Response.json({ error: 'Error clearing cart' }, { status: 500 });
  }
}
