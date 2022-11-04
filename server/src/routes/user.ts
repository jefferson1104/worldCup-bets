import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';

export function userRoutes(fastify: FastifyInstance) {
  fastify.get('/users/count', async () => {
    const count = await prisma.user.count()
  })
}
