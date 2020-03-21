import { startServer } from "../startServer";
import { createTypeormConnection } from "../utils/createTypeormConnection";
import { request } from "graphql-request";
import { host } from "./constants";
import { User } from "../entity/User";

const EMAIL = "bob@bob.com";
const PASSWORD = "bob";

const mutation = `
  mutation {
    register(email: "${EMAIL}", password: "${PASSWORD}")
  }
`;

let httpServer: any;
let dbConnection: any;

describe("GQL server", () => {
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
    expect(response).toEqual({ register: true });
    const users = await User.find({ where: { email: EMAIL } });
    expect(users).toHaveLength(1);
    const [user] = users;
    expect(user.email).toEqual(EMAIL);
    expect(user.password).not.toEqual(PASSWORD);
  });
});
