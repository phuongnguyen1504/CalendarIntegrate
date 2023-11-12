export const deleteState = (prevState, id) => {
  const newState = [...prevState];
  const foundIndex = prevState.findIndex((x) => x.id == id);

  // Increase quantity if existing
  if (foundIndex >= 0) {
    newState.splice(foundIndex, 1);
    return newState;
  }
};
export const deleteSeriesState = (prevState, recurringId) => {
  const tempState = [...prevState];
  const newState=tempState.filter((x)=>x.recurringId!=recurringId)
  return newState;
  // const foundIndex = prevState.findIndex((x) => x.recurringId == recurringId);
  // // Increase quantity if existing
  // if (foundIndex >= 0) {
  //   newState.splice(foundIndex, 1);
  //   return newState;
  // }
};

export const addState = (prevState, value) => {
  const newState = [...prevState, value];
  return newState;
};

export const updateState = (prevState, value) => {
  const newState = [...prevState];
  const foundIndex = prevState.findIndex((x) => x.id == value.id);

  if (foundIndex >= 0) {
    newState[foundIndex] = value;
    return newState;
  }
};
