module.exports = async () => {
  const globalAny: any = global;
  await globalAny.__TEST_SERVER__.close();
  await globalAny.__TEST_DB_CONNECTION__.close();
};
