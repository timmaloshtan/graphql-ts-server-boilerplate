import * as yup from "yup";

import { ResolverMap } from "../../types/graphql-utils";
import { User } from "../../entity/User";
import { formatYupError } from "../../utils/formatYupError";
import { DUPLICATE_EMAIL, INVALID_EMAIL } from "./errorMessages";
import { createConfirmEmailLink } from "./createConfirmEmailLink";
import { sendEmail } from "../../utils/sendEmail";
import { passwordValidation } from "../../yupSchema";

const schema = yup.object().shape({
  email: yup.string().min(3).max(255).email(INVALID_EMAIL),
  password: passwordValidation,
});

export const resolvers: ResolverMap = {
  Query: {
    bye: () => "Bye-bye!",
  },
  Mutation: {
    register: async (_, args: GQL.IRegisterOnMutationArguments, { redis, url }) => {
      try {
        await schema.validate(args, { abortEarly: false });
      } catch (error) {
        return formatYupError(error);
      }

      const { email, password } = args;

      const userAlreadyExists = await User.findOne({
        where: { email },
        select: ["id"],
      });

      if (userAlreadyExists) {
        return [
          {
            path: "email",
            message: DUPLICATE_EMAIL,
          },
        ];
      }

      const user = User.create({
        email,
        password,
      });
      await user.save();

      const link = await createConfirmEmailLink(url, user.id, redis);

      await sendEmail(email, link);

      return null;
    },
  },
};
