import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

export function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient({
      log: ["query"], 
    });
  }
  return prisma;
}