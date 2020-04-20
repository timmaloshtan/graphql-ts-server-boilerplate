import { INVALID_LOGIN, UNCONFIRMED_EMAIL, LOCKED_ACCOUNT } from "./errorMessages";
import { Connection } from "typeorm";
import { createTypeormConnection } from "../../utils/createTypeormConnection";
import { TestClient } from "../../utils/TestClient";
import { User } from "../../entity/User";

const EMAIL = "tim.maloshtan@gmail.com";
const PASSWORD = "bobbobbob";

const RANDOM_EMAIL = "random@email.domain";
const BAD_PASSWORD = "randompas";

const testClient = new TestClient(process.env.TEST_HOST as string);

let dbConnection: Connection;

describe("Login resolver", () => {
  beforeAll(async () => {
    dbConnection = await createTypeormConnection("test-client");
    await User.create({
      email: EMAIL,
      password: PASSWORD,
    }).save();
  });

  afterAll(async () => {
    await dbConnection.close();
  });

  it("should return an error if the user does not exist", async () => {
    const response = await testClient.login(RANDOM_EMAIL, BAD_PASSWORD);

    expect(response.data).toEqual({
      login: [
        {
          path: "email",
          message: INVALID_LOGIN,
        },
      ],
    });
  });

  describe("for an active user", () => {
    it("should return an error if the email is not confirmed", async () => {
      const response = await testClient.login(EMAIL, PASSWORD);

      expect(response.data).toEqual({
        login: [
          {
            path: "email",
            message: UNCONFIRMED_EMAIL,
          },
        ],
      });
    });

    it("should return null once user is confirmed", async () => {
      await User.update({ email: EMAIL }, { confirmed: true });

      const response = await testClient.login(EMAIL, PASSWORD);

      expect(response.data.login).toBeNull();
    });

    it("should return an error if the password is wrong", async () => {
      const response = await testClient.login(EMAIL, BAD_PASSWORD);

      expect(response.data).toEqual({
        login: [
          {
            path: "email",
            message: INVALID_LOGIN,
          },
        ],
      });
    });
  });

  describe("for a locked user", () => {
    beforeAll(async () => {
      await User.update({ email: EMAIL }, { forgotPasswordLocked: true });
    });

    it("should return an error even with valid credentials", async () => {
      const response = await testClient.login(EMAIL, PASSWORD);

      expect(response.data).toEqual({
        login: [
          {
            path: "email",
            message: LOCKED_ACCOUNT,
          },
        ],
      });
    });
  });
});
