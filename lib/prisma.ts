import { Prisma, PrismaClient, Product } from "@prisma/client";

let prisma: PrismaClient;

export function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient({
      log: ["query"], 
    });
  }
  return prisma;
}

export async function createProduct(
  data: Prisma.ProductCreateInput
): Promise<Product> {
  const prismaClient = getPrisma(); 

  const product = await prismaClient.product.create({
    data,
  });

  return product;
}