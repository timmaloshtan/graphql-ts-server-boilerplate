export const createConfirmEmailLink = async (url: string, confirmationId: string) =>
  `${url}/confirm/${confirmationId}`;
