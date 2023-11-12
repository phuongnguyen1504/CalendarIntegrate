import { atom } from "recoil";

export const generalState = atom({
  key: "general",
  default: {
    memberSelected: {
        value: "All",
        label: "全て"
    },
    dateSelected: new Date(),
    profile: {},
    isLogged: false,
  },
});
