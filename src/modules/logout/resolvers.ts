import { ResolverMap } from "../../types/graphql-utils";
import { REDIS_SESSION_PREFIX, USER_SESSION_IDS_PREFIX } from "../../constants";

export const resolvers: ResolverMap = {
  Query: {
    logoutQuery: () => "Bye-bye!",
  },
  Mutation: {
    logout: async (_, __, { session, redis }) => {
      const { userId } = session;

      if (userId) {
        const sessionIds = await redis.lrange(`${USER_SESSION_IDS_PREFIX}${userId}`, 0, -1);

        const deletions = sessionIds.map((sessionId) =>
          redis.del(`${REDIS_SESSION_PREFIX}${sessionId}`),
        );

        await Promise.all(deletions);

        return true;
      }

      return false;
    },
  },
};
