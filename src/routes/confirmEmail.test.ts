import fetch from "node-fetch";

it("should fail back when random id is sent", async () => {
  const response = await fetch(`${process.env.TEST_HOST}/confirm/12345`);
  const text = await response.text();

  expect(text).toEqual("fail");
});
