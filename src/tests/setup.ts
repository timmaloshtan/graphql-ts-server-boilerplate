import { startServer } from "../startServer";
import { createTypeormConnection } from "../utils/createTypeormConnection";

module.exports = async () => {
  const globalAny: any = global;

  const app = await startServer();
  const { port } = globalAny.__TEST_SERVER__.address();
  process.env.TEST_HOST = `http://127.0.0.1:${port}`;

  globalAny.__TEST_SERVER__ = app;
  globalAny.__TEST_DB_CONNECTION__ = await createTypeormConnection();
};
