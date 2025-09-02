import { PrismaClient } from "@prisma/client";
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
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Product not found!" }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ error: "Internal server error!" }, { status: 500 });
  }
}