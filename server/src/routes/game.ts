import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate } from "../plugins/authenticate";

export async function gameRoutes(fastify: FastifyInstance) {
  // lista os jogos de um bolão
  fastify.get('/polls/:pollId/games', {
    onRequest: [authenticate]
  }, async (request) => {
    const getPollsParams = z.object({
      pollId: z.string(),
    })

    const { pollId } = getPollsParams.parse(request.params)

    const games = await prisma.game.findMany({
      orderBy: {
        date: 'desc'
      },
      include: {
        guesses: {
          where: {
            participant:{
              userId: request.user.sub,
              pollId,
            }
          }
        }
      }
    })

    return {
      games: games.map(game => {
        return {
          ...game,
          guess: game.guesses.length > 0 ? game.guesses[0] : null,
          guesses: undefined,
        }
      })
    }
  })

}