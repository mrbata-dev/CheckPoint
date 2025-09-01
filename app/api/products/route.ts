import { NextResponse } from "next/server";
import { createProduct } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const product_name = formData.get("product_name") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price") as string;
    const discount = formData.get("discount") as string;
    const stock = formData.get("stock") as string;
    const userid = formData.get("userid") as string;

    if (!product_name || !price || !stock || !userid) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Handle multiple images
    const images: { url: string }[] = [];
    const files = formData.getAll("images") as File[];
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = path.join(process.cwd(), "public/uploads", fileName);

      fs.writeFileSync(filePath, buffer);
      images.push({ url: `/uploads/${fileName}` });
    }

    const product = await createProduct({
      p_name: product_name,
      description,
      price: parseFloat(price),
      discount: parseFloat(discount),
      stock: parseInt(stock),
      userid: parseInt(userid),
      image: { create: images }, 
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
