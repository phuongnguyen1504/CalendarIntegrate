import { atom } from "recoil";

export const userState = atom({
  key: "users",
  default: []
});
