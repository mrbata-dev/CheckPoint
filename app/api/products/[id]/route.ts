import { Prisma, PrismaClient } from "@prisma/client";

import { NextRequest, NextResponse } from "next/server";

import { writeFile } from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

// DELETE /api/products/:id
export async function DELETE(
  req: Request,
context: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to safely access the id
    const { id } = await context.params;
    const productId = parseInt(id);
    
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    // Delete associated images first
    await prisma.image.deleteMany({
      where: { productId: productId }
    });

    // Then delete the product
    await prisma.product.delete({
      where: { id: productId }
    });

    return NextResponse.json(
      { msg: "Product deleted successfully!" },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2025"
    ) {
      return NextResponse.json({ error: "Product not found!" }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ error: "Internal server error!" }, { status: 500 });
  }
}

// GET Product Details


export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; 
    const url = new URL(req.url);
    const idFromPath = id;
    const idFromQuery = url.searchParams.get('id');
    const nameFromQuery = url.searchParams.get('name');

    let whereClause: { id?: number; p_name?: string } = {};

    // Priority: Path ID > Query ID > Query Name
    if (idFromPath) {
      const id = parseInt(idFromPath);
      if (isNaN(id)) {
        return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
      }
      whereClause = { id };
    } else if (idFromQuery) {
      const id = parseInt(idFromQuery);
      if (isNaN(id)) {
        return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
      }
      whereClause = { id };
    } else if (nameFromQuery) {
      whereClause = { p_name: nameFromQuery };
    } else {
      return NextResponse.json({ error: "Missing identifier (ID or name)" }, { status: 400 });
    }

    // Ensure whereClause is never empty and matches ProductWhereUniqueInput
    if (Object.keys(whereClause).length === 0) {
      return NextResponse.json({ error: "Missing unique identifier for product" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: whereClause as Prisma.ProductWhereUniqueInput,
      include: {
        image: true // Include related images
      }
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}



// PUT - Update product
export async function PUT(
  req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const productId = parseInt(id);
    
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const formData = await req.formData();
    
    const p_name = formData.get('p_name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const discount = parseFloat(formData.get('discount') as string) || 0;
    const stock = parseInt(formData.get('stock') as string) || 0;
    const userid = parseInt(formData.get('userid') as string);
    const keepImageIds = JSON.parse(formData.get('keepImageIds') as string || '[]');

    // Verify product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      select: { userid: true }
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Optional: Check user ownership
    if (existingProduct.userid !== userid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Handle new image uploads
    const newImageUrls: string[] = [];
    const imageFiles = formData.getAll('images') as File[];
    
    for (const file of imageFiles) {
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Generate unique filename
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;
        const filepath = path.join(process.cwd(), 'public', 'uploads', filename);
        
        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        await import('fs').then(fs => {
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
        });
        
        await writeFile(filepath, buffer);
        newImageUrls.push(`/uploads/${filename}`);
      }
    }

    // Use transaction to update product and manage images
    const result = await prisma.$transaction(async (prisma) => {
      // Update product details
await prisma.product.update({
        where: { id: productId },
        data: {
          p_name,
          description,
          price,
          discount,
          stock,
        },
      });

      // Get all current images for this product
      const currentImages = await prisma.image.findMany({
        where: { productId: productId }
      });

      // Delete images that are not in the keepImageIds array
      const imagesToDelete = currentImages.filter(img => !keepImageIds.includes(img.id));
      
      if (imagesToDelete.length > 0) {
        await prisma.image.deleteMany({
          where: {
            id: {
              in: imagesToDelete.map(img => img.id)
            }
          }
        });
      }

      // Add new images
      if (newImageUrls.length > 0) {
        await prisma.image.createMany({
          data: newImageUrls.map(url => ({
            url: url,
            productId: productId,
          }))
        });
      }

      // Return updated product with images
      return await prisma.product.findUnique({
        where: { id: productId },
        include: {
          image: true
        }
      });
    });

    return NextResponse.json({
      message: 'Product updated successfully',
      product: result,
    });

  } catch (error: unknown) {
    console.error('Error updating product:', error);
    
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2025"
    ) {
      return NextResponse.json({ error: "Product not found!" }, { status: 404 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}