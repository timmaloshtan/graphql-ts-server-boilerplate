import * as yup from "yup";
import * as bcrypt from "bcryptjs";

import { ResolverMap } from "../../types/graphql-utils";
import { forgotPasswordLockAccount } from "../../utils/forgotPasswordLockAccount";
import { createForgotPasswordLink } from "../../utils/createForgotPasswordLink";
import { sendEmail } from "../../utils/sendEmail";
import { User } from "../../entity/User";
import { USER_NOT_FOUND, EXPIRED_LINK } from "./errorMessages";
import { FORGOT_PASSWORD_PREFIX } from "../../constants";
import { passwordValidation } from "../../yupSchema";
import { formatYupError } from "../../utils/formatYupError";

const schema = yup.object().shape({
  newPassword: passwordValidation,
});

export const resolvers: ResolverMap = {
  Query: {
    forgotPasswordQuery: () => "Bye-bye!",
  },
  Mutation: {
    sendForgotPasswordEmail: async (
      _,
      { email }: GQL.ISendForgotPasswordEmailOnMutationArguments,
      { redis },
    ) => {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return [
          {
            path: "email",
            message: USER_NOT_FOUND,
          },
        ];
      }

      await forgotPasswordLockAccount(user.id, redis);

      // @TODO: add front end URL
      const link = await createForgotPasswordLink("", user.id, redis);

      await sendEmail(email, link);
      return null;
    },
    forgotPasswordReset: async (
      _,
      { newPassword, key }: GQL.IForgotPasswordResetOnMutationArguments,
      { redis },
    ) => {
      const passwordResetKey = `${FORGOT_PASSWORD_PREFIX}${key}`;
      const userId = await redis.get(passwordResetKey);

      if (!userId) {
        return [
          {
            path: "link",
            message: EXPIRED_LINK,
          },
        ];
      }

      try {
        await schema.validate({ newPassword }, { abortEarly: false });
      } catch (error) {
        return formatYupError(error);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const updateOperation = User.update(
        { id: userId },
        {
          forgotPasswordLocked: false,
          password: hashedPassword,
        },
      );

      const deletionOperation = redis.del(passwordResetKey);

      await Promise.all([updateOperation, deletionOperation]);

      return null;
    },
  },
};
