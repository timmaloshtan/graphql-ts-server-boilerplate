import { Connection } from "typeorm";
import axios from "axios";
import { createTypeormConnection } from "../../utils/createTypeormConnection";
import { User } from "../../entity/User";

const LOGIN = "login";
const EMAIL = "maloshtan.tymofii@pdffiller.team";
const PASSWORD = "bobbobbob";

const mutation = (mutationName: string, email: string, password: string): string => `
  mutation {
    ${mutationName}(email: "${email}", password: "${password}") {
      path
      message
    }
  }
`;

const meQuery = `
  {
    me {
      id
      email
    }
  }
`;

let dbConnection: Connection;

describe("Me resolver", () => {
  beforeAll(async () => {
    dbConnection = await createTypeormConnection("test-client");
    await User.create({
      email: EMAIL,
      password: PASSWORD,
      confirmed: true,
    }).save();
  });

  afterAll(async () => {
    await dbConnection.close();
  });
  it("should throw an error if user is not logged in", async () => {});

  it("should get current user", async () => {
    await axios.post(
      process.env.TEST_HOST as string,
      {
        query: mutation(LOGIN, EMAIL, PASSWORD),
      },
      {
        withCredentials: true,
      },
    );

    const result = await axios.post(
      process.env.TEST_HOST as string,
      {
        query: meQuery,
      },
      {
        withCredentials: true,
      },
    );

    console.log("me.test.ts me result: ", result.data);
  });
});
