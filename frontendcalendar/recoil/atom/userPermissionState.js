import { atom } from "recoil";

export const userPermissionState = atom({
  key: "permissionCDs",
  default: [],
});
