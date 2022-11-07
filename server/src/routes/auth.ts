import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate } from '../plugins/authenticate';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.get('/me', { onRequest: [authenticate] }, async (request) => {
    return { user: request.user }
  });

  fastify.post('/users', async (request) => {
    const creteUserBody = z.object({
      access_token: z.string(),
    });

    // access token received via payload
    const { access_token } = creteUserBody.parse(request.body);

    // fetch data from google apis
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    // user data that came from google api request
    const userData = await userResponse.json();

    // schema to validate userData
    const userInfoSchema = z.object({
      id: z.string(),
      email: z.string().email(),
      name: z.string(),
      picture: z.string().url(),
    });

    // data validated
    const userInfo = userInfoSchema.parse(userData);

    // find user where googleId is equal id
    let user = await prisma.user.findUnique({
      where: {
        googleId: userInfo.id
      }
    });

    // create user if you can't find a user with googleId
    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          avatarUrl: userInfo.picture
        }
      });
    }

    // create JWT token
    const token = fastify.jwt.sign({
      name: user.name,
      avatarUrl: user.avatarUrl,
    }, {
      sub: user.id,
      expiresIn: '7 days',
    });

    return { token }
  });
}
