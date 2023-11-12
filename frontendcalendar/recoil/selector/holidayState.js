import { selector } from "recoil";
import { objectSelected } from "../atom/objectSelected";
import { holidayState } from "../atom/holidayState";

export const holidaysData = selector({
  key: "holidaysData", // unique ID (with respect to other atoms/selectors)
  get: ({ get }) => {
    const { groupSelected } = get(objectSelected);
    const holidays = get(holidayState);
    let holidaysData = [];
    if (holidays && holidays.length > 0) {
      holidaysData = holidays.filter(
        (item) => item.groupId == groupSelected?.value
      );
    }
    return holidaysData;
  },
});
