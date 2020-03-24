import { Request, Response } from "express";
import { User } from "../entity/User";
import { redis } from "../redis";

export const confirmEmail = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = await redis.get(id);
  if (userId === null) {
    return res.send("fail");
  }
  await User.update({ id: userId }, { confirmed: true });
  await redis.del(id);
  return res.send("ok");
};
