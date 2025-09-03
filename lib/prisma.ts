import { Prisma, PrismaClient, Product } from "@prisma/client";

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
      // Add connection pooling
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

// Product functions
export async function createProduct(
  data: Prisma.ProductCreateInput
): Promise<Product> {
  const prisma = getPrisma();
  try {
    const product = await prisma.product.create({
      data,
    });
    return product;
  } catch (error) {
    console.error('Error creating product:', error);
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