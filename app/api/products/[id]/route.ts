import { Prisma, PrismaClient } from "@prisma/client";

import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// DELETE /api/products/:id
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Await params to safely access the id
    const { id } = await params;
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
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const url = new URL(req.url);
    const idFromPath = params.id;
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
