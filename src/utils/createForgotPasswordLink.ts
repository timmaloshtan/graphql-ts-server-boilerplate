import { Redis } from "ioredis";
import { v4 } from "uuid";
import { FORGOT_PASSWORD_PREFIX } from "../constants";

export const createForgotPasswordLink = async (url: string, userId: string, redis: Redis) => {
  const passwordResetKey = v4();
  await redis.set(`${FORGOT_PASSWORD_PREFIX}${passwordResetKey}`, userId, "ex", 60 * 20);
  return `${url}/confirm/${passwordResetKey}`;
};
