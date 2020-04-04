import * as bcrypt from "bcryptjs";

import { ResolverMap } from "../../types/graphql-utils";
import { User } from "../../entity/User";
import { INVALID_LOGIN } from "./errorMessages";

export const resolvers: ResolverMap = {
  Query: {
    loginQuery: () => "Bye-bye!",
  },
  Mutation: {
    login: async (_, { email, password }: GQL.ILoginOnMutationArguments) => {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return [
          {
            path: "email",
            message: INVALID_LOGIN,
          },
        ];
      }

      const comparisonResult = await bcrypt.compare(password, user.password);
      console.log(comparisonResult);

      return null;
    },
  },
};
