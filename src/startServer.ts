import "reflect-metadata";
import "dotenv/config";
import { GraphQLServer } from "graphql-yoga";
import * as session from "express-session";
import * as connectRedis from "connect-redis";
import { redis } from "./redis";
import { confirmEmail } from "./routes/confirmEmail";
import { generateSchema } from "./utils/generateSchema";
import { REDIS_SESSION_PREFIX } from "./constants";

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
