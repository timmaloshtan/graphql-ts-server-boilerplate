import "reflect-metadata";
import { GraphQLServer } from "graphql-yoga";
import { redis } from "./redis";
import { confirmEmail } from "./routes/confirmEmail";
import { generateSchema } from "./utils/generateSchema";

export const startServer = async () => {
  const server = new GraphQLServer({
    schema: generateSchema(),
    context: ({ request }) => ({
      redis,
      url: `${request.protocol}://${request.get("host")}`,
    }),
  });

  server.express.get("/confirm/:id", confirmEmail);
  const httpServer = await server.start();
  httpServer.on("close", () => {
    redis.disconnect();
  });
  console.log("Server is running on localhost:4000");
  return httpServer;
};
