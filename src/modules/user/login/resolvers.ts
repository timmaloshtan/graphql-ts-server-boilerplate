import * as bcrypt from "bcryptjs";

import { ResolverMap } from "../../../types/graphql-utils";
import { User } from "../../../entity/User";
import { INVALID_LOGIN, UNCONFIRMED_EMAIL, LOCKED_ACCOUNT } from "./errorMessages";
import { USER_SESSION_IDS_PREFIX } from "../../../constants";

const errorResponse = [
  {
    path: "email",
    message: INVALID_LOGIN,
  },
];

export const resolvers: ResolverMap = {
  Mutation: {
    login: async (
      _,
      { email, password }: GQL.ILoginOnMutationArguments,
      { session, redis, req },
    ) => {
      req;
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return errorResponse;
      }

      const isValid = await bcrypt.compare(password, user.password as string);

      if (!user.confirmed) {
        return [
          {
            path: "email",
            message: UNCONFIRMED_EMAIL,
          },
        ];
      }

      if (user.forgotPasswordLocked) {
        return [
          {
            path: "email",
            message: LOCKED_ACCOUNT,
          },
        ];
      }

      if (!isValid) {
        return errorResponse;
      }

      session.userId = user.id;

      if (req.sessionID) {
        await redis.lpush(`${USER_SESSION_IDS_PREFIX}${user.id}`, req.sessionID);
      }

      return null;
    },
  },
};
