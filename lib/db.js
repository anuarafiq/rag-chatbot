const { PrismaClient } = require('@prisma/client');

// Reuse the client across hot reloads in dev — otherwise every file save
// spins up a new PrismaClient/connection pool and exhausts Postgres.
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

module.exports = prisma;
