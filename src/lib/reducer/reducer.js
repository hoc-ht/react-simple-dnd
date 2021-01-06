import {ON_DRAG_END, ON_DRAG_START, ON_MOVING} from './actions';
import {handleMove} from './utils';

export const initialState = {
  isDragging: false,
  draggingItem: null,
  source: null,
  droppableItems: {},
  draggableItems: {},
};

const reducer = (state, action) => {
  switch (action.type) {
    case ON_DRAG_START:
      return (() => {
        return {
          ...state,
          ...action.payload,
          isDragging: true,
        };
      })();
    case ON_DRAG_END:
      return (() => {
        return {
          ...state,
          ...action.payload,
        };
      })();
    case ON_MOVING:
      return (() => {
        return handleMove(action.payload, state);
      })();
    default:
      return state;
  }
};

export default reducer;
