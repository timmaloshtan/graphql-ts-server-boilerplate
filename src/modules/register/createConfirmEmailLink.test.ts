import * as Redis from "ioredis";
import fetch from "node-fetch";
import { createTypeormConnection } from "../../utils/createTypeormConnection";
import { User } from "../../entity/User";
import { createConfirmEmailLink } from "./createConfirmEmailLink";
import { Connection } from "typeorm";

let dbConnection: Connection;
let userId: string;
let redis: Redis.Redis;

describe("createConfrimEmailLink function", () => {
  beforeAll(async () => {
    dbConnection = await createTypeormConnection("test-client");
    const user = await User.create({
      email: "boris@britva.com",
      password: "11111111",
    }).save();

    userId = user.id;
    redis = new Redis();
  });

  afterAll(async () => {
    redis.disconnect();
    await dbConnection.close();
  });

  it("should return a link for confirmation endpoint", async () => {
    const url = await createConfirmEmailLink(process.env.TEST_HOST as string, userId, redis);
    const response = await fetch(url);
    const text = await response.text();

    expect(text).toEqual("ok");

    const user = await User.findOne({ where: { id: userId } });

    expect(user).not.toBeUndefined();
    expect((user as User).confirmed).toBeTruthy();

    const secondResponse = await fetch(url);
    const secondText = await secondResponse.text();

    expect(secondText).toEqual("fail");
  });
});
