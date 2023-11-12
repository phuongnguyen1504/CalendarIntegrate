import { atom } from "recoil";

export const weekState = atom({
  key: "currentweek",
  default: {
    weekSelected: new Date(),
  },
});
