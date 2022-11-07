import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import ShortUniqueId from 'short-unique-id';
import { authenticate } from '../plugins/authenticate';

export async function pollRoutes(fastify: FastifyInstance) {
  fastify.get('/polls/count', async () => {
    const count = await prisma.poll.count();
    return { count }
  });

  fastify.post('/polls', async (request, response) => {
    const createPollBody = z.object({
      title: z.string(),
    })

    const { title } = createPollBody.parse(request.body);

    const generate = new ShortUniqueId({ length: 6 });
    const code = String(generate()).toUpperCase();

    // checks to create authenticated poll or not
    try {
      await request.jwtVerify();
      await prisma.poll.create({
        data: {
          title,
          code,
          ownerId: request.user.sub,

          // create participant
          participants: {
            create: {
              userId: request.user.sub,
            }
          }
        }
      });
    } catch {
      await prisma.poll.create({
        data: {
          title,
          code
        }
      });
    }

    return response.status(201).send({ code });
  });

  fastify.post('/polls/:id/join', {
    onRequest: [authenticate]
  },  async (request, response) => {
    const joinPollBody = z.object({
      code: z.string(),
    });

    const { code } = joinPollBody.parse(request.body);

    // through the code search for the bet and also if you are the participant
    const poll = await prisma.poll.findUnique({
      where: {
        code,
      },
      include: {
        participants: {
          where: {
            userId: request.user.sub
          }
        }
      }
    });

    // verify and returns that the poll does not exist
    if (!poll) {
      return response.status(400).send({
        message: 'Poll not found.'
      });
    }

    // verify and returns that the user is already in the poll
    if (poll.participants.length > 0) {
      return response.status(400).send({
        message: 'You already joined this poll.'
      });
    }

    // if the poll has no owner, the first to participate becomes the owner
    if(!poll.ownerId) {
      await prisma.poll.update({
        where: {
          id: poll.id,
        },
        data: {
          ownerId: request.user.sub,
        }
      });
    }

    // enter the poll as a participant
    await prisma.participant.create({
      data: {
        pollId: poll.id,
        userId: request.user.sub,
      }
    });
  });

  fastify.get('/polls', { onRequest: [authenticate] }, async (request) => {
    // Returns all polls in which the authenticated user participates
    const polls = await prisma.poll.findMany({
      where: {
        participants: {
          some: {
            userId: request.user.sub,
          }
        }
      },
      include: {
        _count: {
          select: {
            participants: true
          }
        },
        participants: {
          select: {
            id: true,
            user: {
              select: {
                avatarUrl: true,
              }
            }
          },
          take: 4,
        },
        owner: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    return { polls }
  });
}
