import { ResolverMap } from "../../types/graphql-utils";

export const resolvers: ResolverMap = {
  Query: {
    logoutQuery: () => "Bye-bye!",
  },
  Mutation: {
    logout: (_, __, { session }) =>
      new Promise((resolve) =>
        session.destroy((err) => {
          if (err) {
            console.error("Logout error: ", err);
          }

          resolve(true);
        }),
      ),
  },
};
