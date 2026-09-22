import { randomInt } from "node:crypto";

export const generateTempPassword = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$";
  let password = "";
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(randomInt(chars.length));
  }
  return password;
};
