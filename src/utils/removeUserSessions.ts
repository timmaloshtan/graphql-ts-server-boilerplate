import * as Redis from "ioredis";
import { USER_SESSION_IDS_PREFIX, REDIS_SESSION_PREFIX } from "../constants";

export const removeAllUserSessions = async (userId: string, redis: Redis.Redis) => {
  const sessionIds = await redis.lrange(`${USER_SESSION_IDS_PREFIX}${userId}`, 0, -1);

  const deletions = sessionIds.map((sessionId) => redis.del(`${REDIS_SESSION_PREFIX}${sessionId}`));

  await Promise.all(deletions);
};
