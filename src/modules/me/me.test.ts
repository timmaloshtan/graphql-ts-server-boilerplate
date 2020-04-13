import { Connection } from "typeorm";
import axios from "axios";
import { createTypeormConnection } from "../../utils/createTypeormConnection";
import { User } from "../../entity/User";

let userId: string;
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
    const response = await axios.post(process.env.TEST_HOST as string, {
      query: meQuery,
    });

    expect(response.data.data.me).toBeNull();
  });

  it("should get current user if the cookies are set", async () => {
    await axios.post(
      process.env.TEST_HOST as string,
      {
        query: mutation(LOGIN, EMAIL, PASSWORD),
      },
      {
        withCredentials: true,
      },
    );

    const response = await axios.post(
      process.env.TEST_HOST as string,
      {
        query: meQuery,
      },
      {
        withCredentials: true,
      },
    );

    expect(response.data.data.me).toEqual({
      id: userId,
      email: EMAIL,
    });
  });
});
