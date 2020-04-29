import { Connection } from "typeorm";
import { createTypeormConnection } from "../../../utils/createTypeormConnection";
import { TestClient } from "../../../utils/TestClient";
import { User } from "../../../entity/User";

let userId: string;
const EMAIL = "maloshtan.tymofii@pdffiller.team";
const PASSWORD = "bobbobbob";

const testClient = new TestClient(process.env.TEST_HOST as string);

let dbConnection: Connection;

describe("Me resolver", () => {
  beforeAll(async () => {
    dbConnection = await createTypeormConnection("test-client");
    const user = await User.create({
      email: EMAIL,
      password: PASSWORD,
      confirmed: true,
    }).save();
    userId = user.id;
  });

  afterAll(async () => {
    await dbConnection.close();
  });

  it("should return nothing if there is no cookie", async () => {
    const response = await testClient.me();

    expect(response.data.me).toBeNull();
  });

  it("should get current user if the cookies are set", async () => {
    await testClient.login(EMAIL, PASSWORD);

    const response = await testClient.me();

    expect(response.data.me).toEqual({
      id: userId,
      email: EMAIL,
    });
  });
});
