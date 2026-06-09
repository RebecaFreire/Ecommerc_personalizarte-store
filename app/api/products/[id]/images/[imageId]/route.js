import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { deleteImage } from '@/lib/cloudinary';

// DELETE /api/products/[id]/images/[imageId] - Delete product image (admin only)
export async function DELETE(request, context) {
  try {
    const { id, imageId } = await context.params;
    const numericId = Number(id);
    const numericImageId = Number(imageId);
    if (!numericId || isNaN(numericId) || !numericImageId || isNaN(numericImageId)) {
      return NextResponse.json({ error: 'Invalid product ID or image ID' }, { status: 400 });
    }
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const image = await prisma.productImage.findUnique({
      where: { id: numericImageId },
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Deletar do Cloudinary (extrair publicId da URL)
    const publicId = image.url.split('/').pop().split('.')[0];
    await deleteImage(`personalizarte/${publicId}`);

    // Deletar do banco
    await prisma.productImage.delete({
      where: { id: numericImageId },
    });

    return NextResponse.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting product image:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}

// PUT /api/products/[id]/images/[imageId] - Update product image (admin only)
export async function PUT(request, context) {
  try {
    const { id, imageId } = await context.params;
    const numericId = Number(id);
    const numericImageId = Number(imageId);
    if (!numericId || isNaN(numericId) || !numericImageId || isNaN(numericImageId)) {
      return NextResponse.json({ error: 'Invalid product ID or image ID' }, { status: 400 });
    }
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { isMain, position } = await request.json();

    // Se isMain for true, remover isMain de outras imagens
    if (isMain) {
      await prisma.productImage.updateMany({
        where: { 
          productId: numericId,
          id: { not: numericImageId },
        },
        data: { isMain: false },
      });
    }

    const image = await prisma.productImage.update({
      where: { id: numericImageId },
      data: {
        ...(isMain !== undefined && { isMain }),
        ...(position !== undefined && { position }),
      },
    });

    return NextResponse.json(image);
  } catch (error) {
    console.error('Error updating product image:', error);
    return NextResponse.json({ error: 'Failed to update image' }, { status: 500 });
  }
}
