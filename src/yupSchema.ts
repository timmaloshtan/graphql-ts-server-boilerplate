import * as yup from "yup";
import { PASSWORD_TOO_SHORT, PASSWORD_TOO_LONG } from "./modules/user/register/errorMessages";

export const passwordValidation = yup
  .string()
  .min(8, PASSWORD_TOO_SHORT)
  .max(255, PASSWORD_TOO_LONG);
