import { startServer } from "../server";
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

describe("GQL server", () => {
  beforeAll(async () => {
    httpServer = await startServer();
  });

  afterAll(async () => {
    await httpServer.close();
  });

  it("should register a user", async () => {
    const response = await request(host, mutation);
    expect(response).toEqual({ register: true });
    const users = await User.find({ where: { email: EMAIL } });
    // expect(users).toHaveLength(1);
    const [user] = users;
    expect(user.email).toEqual(EMAIL);
    expect(user.password).not.toEqual(PASSWORD);
  });
});

// use a test database
// drop all data once tests are over
//
