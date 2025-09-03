import { NextRequest, NextResponse } from "next/server";
import { createProduct, fetchProducts } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const product_name = formData.get("product_name") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price") as string;
    const discount = formData.get("discount") as string;
    const stock = formData.get("stock") as string;
    const userid = formData.get("userid") as string;

    if (!product_name || !price  || !userid) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Handle multiple images
     const images: { url: string }[] = [];
    const files = formData.getAll("images") as File[];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to Cloudinary
      const uploadResult = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "products" }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          })
          .end(buffer);
      });

      images.push({ url: uploadResult.secure_url });
    }

    const product = await createProduct({
      p_name: product_name,
      description,
      price: parseFloat(price),
      discount: parseFloat(discount),
      stock: parseInt(stock),
      user: { connect: { id: parseInt(userid) } },
      image: { create: images }, 
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}







export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');

  try {
    const { products, pagination } = await fetchProducts(page, limit);
    
    return NextResponse.json({
      products,
      pagination
    });
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

