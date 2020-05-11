import "reflect-metadata";
import "dotenv/config";
import { GraphQLServer } from "graphql-yoga";
import * as session from "express-session";
import * as connectRedis from "connect-redis";
import * as rateLimit from "express-rate-limit";
import * as RedisLimitStore from "rate-limit-redis";
import * as passport from "passport";
import { Strategy } from "passport-twitter";
import { getRepository } from "typeorm";

import { redis } from "./redis";
import { confirmEmail } from "./routes/confirmEmail";
import { generateSchema } from "./utils/generateSchema";
import { REDIS_SESSION_PREFIX, RATE_LIMIT_PREFIX } from "./constants";
import { User } from "./entity/User";
import { Request, Response } from "express";

const RedisStore = connectRedis(session);

export const startServer = async () => {
  const server = new GraphQLServer({
    schema: generateSchema(),
    context: ({ request }) => ({
      redis,
      url: `${request.protocol}://${request.get("host")}`,
      session: request.session,
      req: request,
    }),
  });

  server.express.use(
    rateLimit({
      store: new RedisLimitStore({
        client: redis,
        prefix: RATE_LIMIT_PREFIX,
      }),
      windowMs: 15 * 60 * 1000,
      max: 100,
    }),
  );

  server.express.use(
    session({
      store: new RedisStore({ client: redis, prefix: REDIS_SESSION_PREFIX }),
      name: "qid",
      secret: process.env.SESSION_SECRET as string,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    }),
  );

  const cors = {
    credentials: true,
    origin: process.env.NODE_ENV === "test" ? "*" : (process.env.FRONTEND_HOST as string),
  };

  server.express.get("/confirm/:id", confirmEmail);

  await redis.connect();

  passport.use(
    new Strategy(
      {
        consumerKey: process.env.TWITTER_CONSUMER_KEY as string,
        consumerSecret: process.env.TWITTER_CONSUMER_SECRET as string,
        callbackURL: "http://localhost:4000/auth/twitter/callback",
        includeEmail: true,
      },
      async (_, __, profile, cb) => {
        const { id, emails } = profile;

        let query = getRepository(User)
          .createQueryBuilder("user")
          .where('"user"."twitterId" = :id', { id });

        let email: string | null = null;

        if (emails?.length) {
          email = emails[0].value;
          query = query.orWhere("user.email = :email", { email });
        }

        let user = await query.getOne();

        if (!user) {
          user = await User.create({
            twitterId: id,
            email,
          }).save();
        } else if (!user.twitterId) {
          user.twitterId = id;
          await user.save();
        }

        return cb(null, { id: user.id });
      },
    ),
  );

  server.express.use(passport.initialize());

  server.express.get("/auth/twitter", passport.authenticate("twitter"));

  server.express.get(
    "/auth/twitter/callback",
    passport.authenticate("twitter", { session: false }),
    function (req: Request, res: Response) {
      // Successful authentication, redirect home.
      if (req.session && req.user) {
        req.session.userId = (req.user as any).id;
      }
      // @TODO redirect to frontend
      res.redirect("/");
    },
  );

  const httpServer = await server.start({
    cors,
    port: process.env.NODE_ENV === "test" ? 0 : 4000,
  });
  httpServer.on("close", () => {
    redis.disconnect();
  });

  console.log("Server is running on localhost:4000");

  return httpServer;
};
