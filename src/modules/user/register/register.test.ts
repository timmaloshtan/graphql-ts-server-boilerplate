import { createTypeormConnection } from "../../../utils/createTypeormConnection";
import { Connection } from "typeorm";
import { User } from "../../../entity/User";
import {
  DUPLICATE_EMAIL,
  INVALID_EMAIL,
  PASSWORD_TOO_SHORT,
  PASSWORD_TOO_LONG,
} from "./errorMessages";
import { TestClient } from "../../../utils/TestClient";

const EMAIL = "tim917@gmail.com";
const PASSWORD = "bobbobbob";

const BAD_EMAIL = "bob@43";
const SHORT_PASSWORD = "oi";
const LONG_PASSWORD = "q".repeat(256);

const testClient = new TestClient(process.env.TEST_HOST as string);

let dbConnection: Connection;

describe("Register resolver", () => {
  beforeAll(async () => {
    dbConnection = await createTypeormConnection("test-client");
  });

  afterAll(async () => {
    await dbConnection.close();
  });

  it("should register a user", async () => {
    const response = await testClient.register(EMAIL, PASSWORD);
    expect(response.data).toEqual({ register: null });
    const users = await User.find({ where: { email: EMAIL } });
    expect(users).toHaveLength(1);
    const [user] = users;
    expect(user.email).toEqual(EMAIL);
    expect(user.password).not.toEqual(PASSWORD);
  });

  it("should return an Error array if user with this email already exists", async () => {
    const response = await testClient.register(EMAIL, PASSWORD);
    expect(response.data.register).toHaveLength(1);
    expect(response.data.register[0]).toEqual({
      path: "email",
      message: DUPLICATE_EMAIL,
    });
  });

  it("should catch a bad email", async () => {
    const response = await testClient.register(BAD_EMAIL, PASSWORD);
    expect(response.data.register).toHaveLength(1);
    expect(response.data.register[0]).toEqual({
      path: "email",
      message: INVALID_EMAIL,
    });
  });

  it("should catch a short password", async () => {
    const response = await testClient.register(EMAIL, SHORT_PASSWORD);
    expect(response.data.register).toHaveLength(1);
    expect(response.data.register[0]).toEqual({
      path: "password",
      message: PASSWORD_TOO_SHORT,
    });
  });

  it("should catch a long password", async () => {
    const response = await testClient.register(EMAIL, LONG_PASSWORD);
    expect(response.data.register).toHaveLength(1);
    expect(response.data.register[0]).toEqual({
      path: "password",
      message: PASSWORD_TOO_LONG,
    });
  });

  it("should catch both invalid inputs", async () => {
    const response = await testClient.register(BAD_EMAIL, SHORT_PASSWORD);
    expect(response.data.register).toHaveLength(2);
    expect(response.data.register[0]).toEqual({
      path: "email",
      message: INVALID_EMAIL,
    });
    expect(response.data.register[1]).toEqual({
      path: "password",
      message: PASSWORD_TOO_SHORT,
    });
  });
});
