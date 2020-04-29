import { Redis } from "ioredis";
import { v4 } from "uuid";

export const createConfirmEmailLink = async (url: string, userId: string, redis: Redis) => {
  const confirmationId = v4();
  await redis.set(confirmationId, userId, "ex", 3600 * 24);
  return `${url}/confirm/${confirmationId}`;
};
