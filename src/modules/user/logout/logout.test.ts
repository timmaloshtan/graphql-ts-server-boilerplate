import { Connection } from "typeorm";
import { createTypeormConnection } from "../../../utils/createTypeormConnection";
import { TestClient } from "../../../utils/TestClient";
import { User } from "../../../entity/User";

let userId: string;
const EMAIL = "badmilk@ya.ru";
const PASSWORD = "bobbobbob";

const testClientOne = new TestClient(process.env.TEST_HOST as string);
const testClientTwo = new TestClient(process.env.TEST_HOST as string);

let dbConnection: Connection;

describe("Logout resolver", () => {
  beforeAll(async () => {
    dbConnection = await createTypeormConnection("test-client");
    const user = await User.create({
      email: EMAIL,
      password: PASSWORD,
      confirmed: true,
    }).save();
    userId = user.id;
  });

  beforeEach(async () => {
    const noCookieResponse = await testClientOne.me();

    expect(noCookieResponse.data.me).toBeNull();

    await testClientOne.login(EMAIL, PASSWORD);
  });

  afterAll(async () => {
    await dbConnection.close();
  });

  it("should logout a user from a single session", async () => {
    const cookieResponse = await testClientOne.me();

    expect(cookieResponse.data.me).toEqual({
      id: userId,
      email: EMAIL,
    });

    await testClientOne.logout();

    const meResponse = await testClientOne.me();

    expect(meResponse.data.me).toBeNull();
  });

  describe("in multiple sessions", () => {
    beforeEach(async () => {
      const noCookieResponse = await testClientTwo.me();

      expect(noCookieResponse.data.me).toBeNull();

      await testClientTwo.login(EMAIL, PASSWORD);
    });

    it("should logout a user from multiple sessions", async () => {
      expect(await testClientOne.me()).toEqual(await testClientTwo.me());

      await testClientOne.logout();

      expect(await testClientOne.me()).toEqual(await testClientTwo.me());
    });
  });
});
