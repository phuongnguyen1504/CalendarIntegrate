import { atom } from "recoil";

export const createUserState = atom({
  key: "isCreateUser",
  default: false,
});
