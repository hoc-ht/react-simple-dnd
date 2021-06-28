export const ON_DRAG_START = 'ON_DRAG_START';
export const ON_DRAG_END = 'ON_DRAG_END';
export const ON_MOVING = 'ON_MOVING';
export const ON_REVALIDATED = 'ON_REVALIDATED';
export const UPDATE_DROPPABLE_POSITION = 'UPDATE_DROPPABLE_POSITION';
export const REGISTER_DROPPABLE_ITEM = 'REGISTER_DROPPABLE_ITEM';
export const UNREGISTER_DROPPABLE_ITEM = 'UNREGISTER_DROPPABLE_ITEM';

export const onDragStartAC = (payload) => ({
  type: ON_DRAG_START,
  payload,
});

export const onDragEndAC = (payload) => ({
  type: ON_DRAG_END,
  payload,
});

export const onMovingAC = (payload) => ({
  type: ON_MOVING,
  payload,
});

export const onRevalidatedAC = (payload) => ({
  type: ON_REVALIDATED,
  payload,
});

export const updateDroppablePositionAC = (payload) => ({
  type: UPDATE_DROPPABLE_POSITION,
  payload,
});

export const registerDroppableItemAC = payload => ({
  type: REGISTER_DROPPABLE_ITEM,
  payload,
});

export const unregisterDroppableItemAC = payload => ({
  type: UNREGISTER_DROPPABLE_ITEM,
  payload,
});
