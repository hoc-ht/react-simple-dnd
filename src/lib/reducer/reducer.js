import {
  ON_DRAG_END,
  ON_DRAG_START,
  ON_MOVING,
  ON_REVALIDATED,
  REGISTER_DROPPABLE_ITEM,
  UNREGISTER_DROPPABLE_ITEM,
  UPDATE_ELEMENT_POSITION,
} from './actions';
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
    case REGISTER_DROPPABLE_ITEM:
      return (() => {
        const {droppableId} = action.payload;
        return {
          ...state,
          droppableItems: {
            ...state.droppableItems,
            [droppableId]: action.payload,
          },
        };
      })();
    case UNREGISTER_DROPPABLE_ITEM:
      return (() => {
        const {droppableId} = action.payload;
        const droppableItems = {
          ...state.droppableItems,
        };
        delete droppableItems[droppableId];
        return {
          ...state,
          droppableItems,
        };
      })();
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
    case UPDATE_ELEMENT_POSITION:
      return (() => {
        const {droppableItems, draggableItems} = action.payload;
        const newState = {
          ...state,
        };
        if (droppableItems) {
          newState.droppableItems = {
            ...state.droppableItems,
          };
          Object.keys(droppableItems).forEach(droppableId => {
            if (newState.droppableItems[droppableId]) {
              newState.droppableItems[droppableId] = {
                ...newState.droppableItems[droppableId],
                ...droppableItems[droppableId],
              };
            }
          });
        }
        if (draggableItems) {
          newState.draggableItems = {
            ...state.draggableItems,
          };
          Object.keys(draggableItems).forEach(draggableId => {
            if (newState.draggableItems[draggableId]) {
              newState.draggableItems[draggableId] = {
                ...newState.draggableItems[draggableId],
                ...draggableItems[draggableId],
              };
            }
          });
        }
        return newState;
      })();
    default:
      return state;
  }
};

export default reducer;
