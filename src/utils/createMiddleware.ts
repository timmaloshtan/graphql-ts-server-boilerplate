import { Resolver, GraphQLMiddleware } from "../types/graphql-utils";

export const createMiddleware = (
  middlewareFunction: GraphQLMiddleware,
  resolverFunction: Resolver,
): Resolver => (parent: any, args: any, context: any, info: any) =>
  middlewareFunction(resolverFunction, parent, args, context, info);
