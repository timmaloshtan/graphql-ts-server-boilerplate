import { startServer } from "./startServer";
import { createTypeormConnection } from "./utils/createTypeormConnection";

const startApp = async () => {
  await createTypeormConnection();
  await startServer();
};

startApp();
