import "reflect-metadata";
import { importSchema } from "graphql-import";
import { GraphQLServer } from "graphql-yoga";
import * as path from "path";
import * as fs from "fs";
import { mergeSchemas, makeExecutableSchema } from "graphql-tools";
import { GraphQLSchema } from "graphql";

export const startServer = async () => {
  const schemas: GraphQLSchema[] = fs
    .readdirSync(path.join(__dirname, "./modules"))
    .map(folder => {
      const { resolvers } = require(`./modules/${folder}/resolvers`);
      const typeDefs = importSchema(
        path.join(__dirname, `./modules/${folder}/schema.graphql`),
        {}
      );

      return makeExecutableSchema({ resolvers, typeDefs });
    });

  const server = new GraphQLServer({ schema: mergeSchemas({ schemas }) });
  const httpServer = await server.start();
  console.log("Server is running on localhost:4000");
  return httpServer;
};
