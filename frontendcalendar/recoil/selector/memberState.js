import { selector } from "recoil";
import { generalState } from "../atom/generalState";
import { memberState } from "../atom/memberState";

export const memberByGroupState = selector({
  key: "memberByGroupState", // unique ID (with respect to other atoms/selectors)
  get: ({ get }) => {
    const { groupSelected } = get(generalState);
    const members = get(memberState);
    // console.log("//////////////////////////memberByGroupState");
    let memberByGroup = [];
    if (members && members.length > 0) {
      memberByGroup = members.filter(
        (item) => item.groupId == groupSelected.value
      );
    }
    return memberByGroup;
  },
});
