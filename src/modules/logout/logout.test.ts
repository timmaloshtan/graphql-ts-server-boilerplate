import { Connection } from "typeorm";
import axios from "axios";
import { createTypeormConnection } from "../../utils/createTypeormConnection";
import { User } from "../../entity/User";

let userId: string;
const LOGIN = "login";
const EMAIL = "badmilk@ya.ru";
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

const logoutMutation = `
  mutation {
    logout
  }
`;

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

    const noCookieResponse = await axios.post(process.env.TEST_HOST as string, {
      query: meQuery,
    });

    expect(noCookieResponse.data.data.me).toBeNull();

    await axios.post(
      process.env.TEST_HOST as string,
      {
        query: mutation(LOGIN, EMAIL, PASSWORD),
      },
      {
        withCredentials: true,
      },
    );

    const cookieResponse = await axios.post(
      process.env.TEST_HOST as string,
      {
        query: meQuery,
      },
      {
        withCredentials: true,
      },
    );

    expect(cookieResponse.data.data.me).toEqual({
      id: userId,
      email: EMAIL,
    });
  });

  afterAll(async () => {
    await dbConnection.close();
  });

  it("should logout a user who is currently logged in", async () => {
    await axios.post(
      process.env.TEST_HOST as string,
      {
        query: logoutMutation,
      },
      {
        withCredentials: true,
      },
    );

    const meResponse = await axios.post(
      process.env.TEST_HOST as string,
      {
        query: meQuery,
      },
      { withCredentials: true },
    );

    expect(meResponse.data.data.me).toBeNull();
  });
});
