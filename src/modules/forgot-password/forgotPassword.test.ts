import * as Redis from "ioredis";
import { Connection } from "typeorm";
import { createTypeormConnection } from "../../utils/createTypeormConnection";
import { TestClient } from "../../utils/TestClient";
import { User } from "../../entity/User";
import { createForgotPasswordLink } from "../../utils/createForgotPasswordLink";

let userId: string;
let dbConnection: Connection;
let redis: Redis.Redis;
const EMAIL = "bob@rob.mob";
const PASSWORD = "bobbobbob";
const NEW_PASSWORD = "asdfasdblfasd";

const testClientOne = new TestClient(process.env.TEST_HOST as string);

describe("Forgot password resolver", () => {
  beforeAll(async () => {
    dbConnection = await createTypeormConnection("test-client");
    redis = new Redis();
    const user = await User.create({
      email: EMAIL,
      password: PASSWORD,
      confirmed: true,
    }).save();
    userId = user.id;
  });

  afterAll(async () => {
    redis.disconnect();
    await dbConnection.close();
  });

  it("should create a key for password reset in Redis", async () => {
    const url = await createForgotPasswordLink("", userId, redis);
    const key = url.split("/").pop();

    const response = await testClientOne.forgotPasswordReset(NEW_PASSWORD, key as string);

    expect(response.data.forgotPasswordReset).toBeNull();

    const loginResponse = await testClientOne.login(EMAIL, NEW_PASSWORD);

    expect(loginResponse.data.login).toBeNull();
  });
});
