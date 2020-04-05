import * as bcrypt from "bcryptjs";

import { ResolverMap } from "../../types/graphql-utils";
import { User } from "../../entity/User";
import { INVALID_LOGIN, UNCONFIRMED_EMAIL } from "./errorMessages";

const errorResponse = [
  {
    path: "email",
    message: INVALID_LOGIN,
  },
];

export const resolvers: ResolverMap = {
  Query: {
    loginQuery: () => "Bye-bye!",
  },
  Mutation: {
    login: async (_, { email, password }: GQL.ILoginOnMutationArguments, { session }) => {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return errorResponse;
      }

      const isValid = await bcrypt.compare(password, user.password);

      if (!user.confirmed) {
        return [
          {
            path: "email",
            message: UNCONFIRMED_EMAIL,
          },
        ];
      }

      if (!isValid) {
        return errorResponse;
      }

      session.userId = user.id;

      return null;
    },
  },
};
