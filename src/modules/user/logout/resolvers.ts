import { ResolverMap } from "../../../types/graphql-utils";
import { removeAllUserSessions } from "../../../utils/removeUserSessions";

export const resolvers: ResolverMap = {
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
