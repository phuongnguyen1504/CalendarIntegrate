export default function FindExistance(arr, value) {
  if(arr.includes('fullPermissions')) return true
  return arr.find((item) => item === value)
    ? true
    : false;
}
