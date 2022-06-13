import "dotenv-safe/config"
import { ApolloServer } from "apollo-server-express"
import express, { Request, Response } from "express"
import session from "express-session"
import { buildSchema } from "type-graphql"
import { createClient } from "redis"
import cors from "cors"

import { __prod__ } from "./constants"
import { UserResolver } from "./resolvers/User"
import { AppDataSource } from "./utils/db"

export type IContext = {
  req: Request<any> & { session: any }
  res: Response
}

const main = async () => {
  // EXPRESS
  const app = express()
  const whitelist = [
    "http://localhost:3000",
    "https://studio.apollographql.com",
  ]
  const corsOptions = {
    origin: function (origin: any, callback: any) {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback()
      }
    },
    credentials: true,
  }
  app.use(cors(corsOptions))

  // REDIS
  let RedisStore = require("connect-redis")(session)
  const redisClient = createClient({ legacyMode: true })
  redisClient.connect().catch(console.error)

  app.use(
    session({
      name: "qid",
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 Years
        httpOnly: true,
        sameSite: "lax", // csrf
        secure: !__prod__, // cookie only works in http
      },
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET ? process.env.SESSION_SECRET : "",
      resave: false,
    })
  )

  // APOLLO
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver],
      validate: false,
    }),
    csrfPrevention: false,
    context: async ({ req, res }: IContext) => {
      try {
        await AppDataSource.initialize()
      } catch (_) {}

      return {
        req,
        res,
      }
    },
  })
  await apolloServer.start()

  apolloServer.applyMiddleware({ app, cors: false })

  app.listen(8000, () => {
    console.log("server started at localhost:8000")
  })
}

main().catch((err) => {
  console.log(err)
})
