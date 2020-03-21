import { startServer } from "../../startServer";
import { createTypeormConnection } from "../../utils/createTypeormConnection";
import { request } from "graphql-request";
import { User } from "../../entity/User";

const host = "http://localhost:4000";

const EMAIL = "bob@bob.com";
const PASSWORD = "bob";

const mutation = `
  mutation {
    register(email: "${EMAIL}", password: "${PASSWORD}") {
      path
      message
    }
  }
`;

let httpServer: any;
let dbConnection: any;

describe("Register resolver", () => {
  beforeAll(async () => {
    dbConnection = await createTypeormConnection();
    httpServer = await startServer();
  });

  afterAll(async () => {
    await dbConnection.close();
    await httpServer.close();
  });

  it("should register a user", async () => {
    const response = await request(host, mutation);
    expect(response).toEqual({ register: null });
    const users = await User.find({ where: { email: EMAIL } });
    expect(users).toHaveLength(1);
    const [user] = users;
    expect(user.email).toEqual(EMAIL);
    expect(user.password).not.toEqual(PASSWORD);
  });

  it("should return an Error array if user with this email already exists", async () => {
    const response = await request(host, mutation);
    expect(response.register).toHaveLength(1);
    expect(response.register[0].path).toEqual("email");
  });
});
