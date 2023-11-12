import { atom } from "recoil";

export const fetchingUserState = atom({
  key: "fetchingUser",
  default: false,
});
