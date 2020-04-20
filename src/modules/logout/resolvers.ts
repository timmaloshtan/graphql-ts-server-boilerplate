import { ResolverMap } from "../../types/graphql-utils";
import { removeAllUserSessions } from "../../utils/removeUserSessions";

export const resolvers: ResolverMap = {
  Query: {
    logoutQuery: () => "Bye-bye!",
  },
  Mutation: {
    logout: async (_, __, { session, redis }) => {
      const { userId } = session;

      if (userId) {
        await removeAllUserSessions(userId, redis);

        return true;
      }

      return false;
    },
  },
};
