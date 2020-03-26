import * as path from "path";
import * as fs from "fs";
import { mergeSchemas, makeExecutableSchema } from "graphql-tools";
import { importSchema } from "graphql-import";
import { GraphQLSchema } from "graphql";

export const generateSchema = () => {
  const schemas: GraphQLSchema[] = fs
    .readdirSync(path.join(__dirname, "../modules"))
    .map(folder => {
      const { resolvers } = require(`../modules/${folder}/resolvers`);
      const typeDefs = importSchema(
        path.join(__dirname, `../modules/${folder}/schema.graphql`),
        {},
      );

      return makeExecutableSchema({ resolvers, typeDefs });
    });

  return mergeSchemas({ schemas });
};
