import { startServer } from "./server";
import { createTypeormConnection } from "./utils/createTypeormConnection";

const startApp = async () => {
  await createTypeormConnection();
  await startServer();
};

startApp();
