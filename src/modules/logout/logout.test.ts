import { Connection } from "typeorm";
import { createTypeormConnection } from "../../utils/createTypeormConnection";
import { TestClient } from "../../utils/TestClient";
import { User } from "../../entity/User";

let userId: string;
const EMAIL = "badmilk@ya.ru";
const PASSWORD = "bobbobbob";

const testClient = new TestClient(process.env.TEST_HOST as string);

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

    const noCookieResponse = await testClient.me();

    expect(noCookieResponse.data.me).toBeNull();

    await testClient.login(EMAIL, PASSWORD);
  });

  afterAll(async () => {
    await dbConnection.close();
  });

  it("should logout a user who is currently logged in", async () => {
    const cookieResponse = await testClient.me();

    expect(cookieResponse.data.me).toEqual({
      id: userId,
      email: EMAIL,
    });

    await testClient.logout();

    const meResponse = await testClient.me();

    expect(meResponse.data.me).toBeNull();
  });
});
