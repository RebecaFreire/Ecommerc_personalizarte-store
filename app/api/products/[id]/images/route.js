import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET /api/products/[id]/images - List product images
export async function GET(request, context) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);
    if (!numericId || isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }
    const images = await prisma.productImage.findMany({
      where: { productId: numericId },
      orderBy: { position: 'asc' },
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching product images:', error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}

// POST /api/products/[id]/images - Add product image (admin only)
export async function POST(request, context) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);
    if (!numericId || isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { url, isMain, position } = await request.json();

    // Se isMain for true, remover isMain de outras imagens
    if (isMain) {
      await prisma.productImage.updateMany({
        where: { productId: numericId },
        data: { isMain: false },
      });
    }

    const image = await prisma.productImage.create({
      data: {
        productId: numericId,
        url,
        isMain: isMain || false,
        position: position || 0,
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error('Error creating product image:', error);
    return NextResponse.json({ error: 'Failed to create image' }, { status: 500 });
  }
}
