import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

// Prisma seed
async function main() {
  // create user register
  const user = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john.doe@email.com',
      avatarUrl: 'https://github.com/jefferson1104.png',
    }
  });

  // create poll register
  const poll = await prisma.poll.create({
    data: {
      title: 'Example Poll',
      code: 'POLL123',
      ownerId: user.id,

      // create participant register
      participants: {
        create: {
          userId: user.id
        }
      }
    }
  });

  // create game without guessing
  await prisma.game.create({
    data: {
      date: '2023-12-02T12:00:00.884Z',
      firstTeamCountryCode: 'DE',
      secondTeamCountryCode: 'BR',
    }
  });

  // create game with guessing
  await prisma.game.create({
    data: {
      date: '2023-12-03T12:00:00.884Z',
      firstTeamCountryCode: 'BR',
      secondTeamCountryCode: 'AR',

      // create guess register
      guesses: {
        create: {
          firstTeamPoints: 3,
          secondTeamPoints: 1,

          // create participant register associated with guess
          participant: {
            connect: {
              userId_pollId: {
                userId: user.id,
                pollId: poll.id
              }
            }
          }
        }
      }
    }
  });
}

main()
