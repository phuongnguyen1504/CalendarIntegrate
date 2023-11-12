import { atom } from "recoil";

export const objectSelected = atom({
  key: "selected",
  default: {
    groupSelected: {},
    groupByUserId: [],
    // groupByUserIdLoadingCompleted: false,
  },
});
