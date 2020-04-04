import * as bcrypt from "bcryptjs";
import * as yup from "yup";

import { ResolverMap } from "../../types/graphql-utils";
import { User } from "../../entity/User";
import { formatYupError } from "../../utils/formatYupError";
import {
  DUPLICATE_EMAIL,
  INVALID_EMAIL,
  PASSWORD_TOO_SHORT,
  PASSWORD_TOO_LONG,
} from "./errorMessages";
import { createConfirmEmailLink } from "../../utils/createConfirmEmailLink";
import { sendEmail } from "../../utils/sendEmail";

const schema = yup.object().shape({
  email: yup.string().min(3).max(255).email(INVALID_EMAIL),
  password: yup.string().min(8, PASSWORD_TOO_SHORT).max(255, PASSWORD_TOO_LONG),
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

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = User.create({
        email,
        password: hashedPassword,
      });
      await user.save();

      const link = await createConfirmEmailLink(url, user.id, redis);
      console.log("link", link);

      const emailQueueingResult = await sendEmail(email, link);
      console.log("emailQueueingResult", emailQueueingResult);

      return null;
    },
  },
};
