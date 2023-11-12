import { selector } from "recoil";
import { objectSelected } from "../atom/objectSelected";
import { scheduleState } from "../atom/scheduleState";

export const schedulesData = selector({
  key: "schedulesData", // unique ID (with respect to other atoms/selectors)
  get: ({ get }) => {
    const { groupSelected } = get(objectSelected);
    const schedules = get(scheduleState);
    let schedulesData = [];
    if (schedules && schedules.length > 0) {
      schedulesData = schedules.filter(
        (item) => item.groupId == groupSelected?.value
      );
    }
    return schedulesData;
  },
});
