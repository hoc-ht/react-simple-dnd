import {ON_DRAG_END, ON_DRAG_START, ON_MOVING, ON_REVALIDATED, UPDATE_DROPPABLE_POSITION} from './actions';
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
    case UPDATE_DROPPABLE_POSITION:
      return (() => {
        const {droppableItems} = action.payload;
        const newState = {
          ...state,
          droppableItems: {
            ...state.droppableItems,
          },
        };
        Object.keys(droppableItems).forEach(droppableId => {
          if (newState.droppableItems[droppableId]) {
            newState.droppableItems[droppableId] = {
              ...newState.droppableItems[droppableId],
              ...droppableItems[droppableId],
            };
          }
        });
        return newState;
      })();
    default:
      return state;
  }
};

export default reducer;
