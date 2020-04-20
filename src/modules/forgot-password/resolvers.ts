import { ResolverMap } from "../../types/graphql-utils";

export const resolvers: ResolverMap = {
  Query: {
    forgotPasswordQuery: () => "Bye-bye!",
  },
  Mutation: {
    sendForgotPasswordEmail: async (
      _,
      { email }: GQL.ISendForgotPasswordEmailOnMutationArguments,
    ) => {
      console.log("email", email);
      return true;
    },
    forgotPasswordReset: async (
      _,
      { newPassword, key }: GQL.IForgotPasswordResetOnMutationArguments,
    ) => {
      console.log("newPassword", newPassword);
      console.log("key", key);

      return null;
    },
  },
};
