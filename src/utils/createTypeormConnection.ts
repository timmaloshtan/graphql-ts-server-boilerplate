import { getConnectionOptions, createConnection } from "typeorm";

export const createTypeormConnection = async (connectionName?: string) => {
  const connectionOptions = await getConnectionOptions(connectionName || process.env.NODE_ENV);
  return createConnection({ ...connectionOptions, name: "default" });
};
