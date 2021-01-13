import {ON_DRAG_END, ON_DRAG_START, ON_MOVING, ON_REVALIDATED} from './actions';
import {handleMove, handleRevalidated} from './utils';

export const initialState = {
  isDragging: false,
  draggingItem: null,
  source: null,
  droppableItems: {},
  draggableItems: {},
  metadata: undefined,
  mousePosition: undefined,
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
          isDragging: false,
          metadata: undefined,
        };
      })();
    case ON_MOVING:
      return (() => {
        return handleMove(action.payload, state);
      })();
    case ON_REVALIDATED:
      return (() => {
        return handleRevalidated(action.payload, state);
      })();
    default:
      return state;
  }
};

export default reducer;
