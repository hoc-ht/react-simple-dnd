export const getRealId = (draggableId) => {
  return draggableId.split('.')[0] * 1;
};
