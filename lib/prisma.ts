// lib/prisma.ts - Updated with stock notification logic
import { Prisma, PrismaClient, Product } from "@prisma/client";
import { NextResponse } from "next/server";

// Global type declaration for development
declare global {
  var prisma: PrismaClient | undefined;
}

// Create singleton instance
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }
  return globalForPrisma.prisma;
}

// Only assign to global in development to prevent hot reload issues
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = getPrisma();
}

// Graceful shutdown handlers - only in production
if (process.env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    await getPrisma().$disconnect();
    console.log('Prisma disconnected on beforeExit');
  });

  process.on('SIGINT', async () => {
    await getPrisma().$disconnect();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await getPrisma().$disconnect();
    process.exit(0);
  });
}

// Check and create low stock notification
export async function checkAndCreateLowStockNotification(productId: number, currentStock: number): Promise<void> {
  const prisma = getPrisma();
  
  if (currentStock < 5) {
    try {
      // Check if a similar notification already exists and is unread
      const existingNotification = await prisma.notification.findFirst({
        where: {
          productId: productId,
          message: {
            contains: "Low stock alert"
          },
          read: false
        }
      });

      // Only create notification if one doesn't already exist
      if (!existingNotification) {
        const product = await prisma.product.findUnique({
          where: { id: productId },
          select: { p_name: true }
        });

        if (product) {
          await prisma.notification.create({
            data: {
              productId: productId,
              message: `Low stock alert: ${product.p_name} has only ${currentStock} items remaining`,
              read: false,
            },
          });
          console.log(`Low stock notification created for product: ${product.p_name}`);
        }
      }
    } catch (error) {
      console.error('Error creating low stock notification:', error);
    }
  }
}

// Product functions
export async function createProduct(data: Prisma.ProductCreateInput): Promise<Product> {
  const prisma = getPrisma();
  try {
    const product = await prisma.product.create({
      data,
    });

    // Check for low stock after creation
    await checkAndCreateLowStockNotification(product.id, product.stock);
    
    return product;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

// Update product with stock notification check
export async function updateProduct(
  id: number, 
  data: Prisma.ProductUpdateInput
): Promise<Product> {
  const prisma = getPrisma();
  try {
    const product = await prisma.product.update({
      where: { id },
      data,
    });

    // Check for low stock after update
    await checkAndCreateLowStockNotification(product.id, product.stock);
    
    return product;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

export async function fetchProducts(page = 1, limit = 12) {
  const prisma = getPrisma();
  const skip = (page - 1) * limit;

  try {
    // Use a transaction for consistency
    const [totalCount, products] = await Promise.all([
      prisma.product.count(),
      prisma.product.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        // Include related data efficiently
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          image: {
            select: {
              id: true,
              url: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
      },
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

export async function createNotification(
  productId: number,
  message: string
): Promise<void> {
  const prisma = getPrisma();
  try {
    await prisma.notification.create({
      data: {
        productId,
        message,
        read: false,
      },
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

// Check all products for low stock (can be run periodically)
export async function checkAllProductsForLowStock(): Promise<void> {
  const prisma = getPrisma();
  try {
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: {
          lt: 5
        }
      }
    });

    for (const product of lowStockProducts) {
      await checkAndCreateLowStockNotification(product.id, product.stock);
    }
  } catch (error) {
    console.error('Error checking products for low stock:', error);
  }
}

// API route handler
export async function POST(request: Request) {
  try {
    const { productId, message } = await request.json();

    if (!productId || !message) {
      return NextResponse.json(
        { error: "Product ID and message are required" },
        { status: 400 }
      );
    }

    await createNotification(productId, message);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}