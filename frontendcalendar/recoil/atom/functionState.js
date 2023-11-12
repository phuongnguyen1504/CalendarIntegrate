import { atom } from "recoil";

export const functionState = atom({
  key: "functionGlb",
  default: {
    myFunction: () => {},
  },
});
