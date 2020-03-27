import * as Redis from "ioredis";

export const redis = new Redis({ lazyConnect: true });
