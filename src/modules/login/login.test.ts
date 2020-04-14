import { request } from "graphql-request";
import { INVALID_LOGIN, UNCONFIRMED_EMAIL } from "./errorMessages";
import { Connection } from "typeorm";
import { createTypeormConnection } from "../../utils/createTypeormConnection";
import { User } from "../../entity/User";

const LOGIN = "login";

const EMAIL = "tim.maloshtan@gmail.com";
const PASSWORD = "bobbobbob";

const RANDOM_EMAIL = "random@email.domain";
const BAD_PASSWORD = "randompas";

const mutation = (mutationName: string, email: string, password: string): string => `
  mutation {
    ${mutationName}(email: "${email}", password: "${password}") {
      path
      message
    }
  }
`;

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
    const response = await request(
      process.env.TEST_HOST as string,
      mutation(LOGIN, RANDOM_EMAIL, BAD_PASSWORD),
    );

    expect(response).toEqual({
      login: [
        {
          path: "email",
          message: INVALID_LOGIN,
        },
      ],
    });
  });

  it("should return an error if the email is not confirmed", async () => {
    const loginResponse = await request(
      process.env.TEST_HOST as string,
      mutation(LOGIN, EMAIL, PASSWORD),
    );

    expect(loginResponse).toEqual({
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

    const loginResponse = await request(
      process.env.TEST_HOST as string,
      mutation(LOGIN, EMAIL, PASSWORD),
    );

    expect(loginResponse.login).toBeNull();
  });

  it("should return an error if the password is wrong", async () => {
    const response = await request(
      process.env.TEST_HOST as string,
      mutation(LOGIN, EMAIL, BAD_PASSWORD),
    );

    expect(response).toEqual({
      login: [
        {
          path: "email",
          message: INVALID_LOGIN,
        },
      ],
    });
  });
});
