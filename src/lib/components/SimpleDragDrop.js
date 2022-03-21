import React from 'react';
import PropTypes from 'prop-types';
import reducer, {initialState} from '../reducer/reducer';
import {SimpleDragDropContext} from '../context';
import {
  onDragEndAC,
  onDragStartAC,
  onMovingAC,
  onRevalidatedAC,
  registerDroppableItemAC,
  unregisterDroppableItemAC,
  updateElementPositionAC,
} from '../reducer/actions';
import {throttle} from '../utils';
import {getDragStartData, getElementPosition, handleDragEnd} from '../reducer/utils';
import {getBox} from 'css-box-model';

const useSimpleDragDrop = ({getDraggingItemSize, onDragEnd, onDragStart, getDragMetadata}) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const stateRef = React.useRef(state);
  stateRef.current = state;
  const droppableRefs = React.useRef({});
  const draggableRefs = React.useRef({});
  const mousePosRef = React.useRef({});

  const registerDroppableItem = React.useCallback(function (droppableId, innerRef, config) {
    droppableRefs.current[droppableId] = {
      droppableId,
      innerRef,
      config,
    };
    const box = getBox(innerRef.current);
    dispatch(registerDroppableItemAC({
      droppableId,
      config,
      borderBox: box.borderBox,
      validationResult: undefined,
      canDropped: !config?.isDropDisabled,
    }));
  }, []);

  const registerDraggableItem = React.useCallback(function (droppableId, draggableId, index, innerRef, registerId) {
    draggableRefs.current[draggableId] = {
      droppableId,
      draggableId,
      index,
      innerRef,
      registerId,
    };
  }, []);

  const unregisterDroppableItem = React.useCallback(function (droppableId) {
    delete droppableRefs.current[droppableId];
    dispatch(unregisterDroppableItemAC({
      droppableId,
    }));
  }, []);

  const unregisterDraggableItem = React.useCallback(function (draggableId, registerId) {
    if (draggableRefs.current[draggableId] && draggableRefs.current[draggableId].registerId === registerId) {
      delete draggableRefs.current[draggableId];
    }
  }, []);

  const handleDragStart = React.useCallback((draggableId, event) => {
    event.preventDefault();

    if (stateRef.current.isDragging) {
      return;
    }

    const draggingItem = draggableRefs.current[draggableId];
    const draggableRef = draggingItem?.innerRef?.current;
    if (!draggableRef) {
      throw new Error('Draggable ref with id ' + draggableId + ' not found');
    }

    const droppableItem = droppableRefs.current[draggingItem.droppableId];
    if (!droppableItem) {
      throw new Error('Droppable with id ' + draggingItem.droppableId + ' not found');
    }

    const source = {
      droppableId: draggingItem.droppableId,
      config: droppableRefs.current[draggingItem.droppableId]?.config,
      index: draggingItem.index,
    };

    let metadata = undefined;
    if (getDragMetadata) {
      metadata = getDragMetadata({draggableId, source}, event);
    }

    const data = getDragStartData(draggingItem, source, metadata, event, {
      getDraggingItemSize,
      droppableRefs,
      draggableRefs,
    });
    dispatch(onDragStartAC({
      ...data,
      metadata,
    }));

    if (onDragStart) {
      onDragStart({
        source,
        metadata,
        draggableId: draggingItem.draggableId,
      }, event);
    }
  }, [getDraggingItemSize, onDragStart, getDragMetadata]);

  const handleMouseMove = React.useCallback(throttle(function (event) {
    const {isDragging} = stateRef.current;
    if (!isDragging) {
      return;
    }
    const mousePos = {
      x: event.clientX,
      y: event.clientY,
    };
    mousePosRef.current = mousePos;
    dispatch(onMovingAC(mousePos));
  }, 10, {leading: true, trailing: true}), []);

  const handleMouseUp = React.useCallback(function (event) {
    if (!stateRef.current.isDragging) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const {draggingItem, source, metadata} = stateRef.current;
    const {destination, ...newState} = handleDragEnd(mousePosRef.current, stateRef.current);
    dispatch(onDragEndAC(newState));
    if (onDragEnd) {
      onDragEnd({
        draggableId: draggingItem.draggableId,
        source,
        destination,
        metadata,
      }, event);
    }
  }, [onDragEnd]);

  const revalidate = React.useCallback(function (event) {
    if (!stateRef.current.isDragging) {
      return;
    }
    const droppableItems = {};
    const {draggingItem: {draggableId}, source, metadata} = stateRef.current;
    Object.keys(droppableRefs.current).forEach(droppableId => {
      const droppable = droppableRefs.current[droppableId];
      let validationResult;
      if (droppable.config?.validation) {
        try {
          validationResult = droppable.config.validation({
            draggableId,
            source,
            metadata,
          }, event) !== false;
        } catch (error) {
          validationResult = false;
        }
      }
      droppableItems[droppableId] = {
        validationResult,
      };
    });
    dispatch(onRevalidatedAC({
      droppableItems,
    }));
  }, []);

  const updatePosition = React.useCallback(function (updateDroppable = true, updateDraggable = false) {
    const data = {};
    if (updateDroppable) {
      data.droppableItems = getElementPosition(droppableRefs.current);
    }
    if (updateDraggable) {
      data.draggableItems = getElementPosition(draggableRefs.current);
    }
    if (Object.keys(data).length) {
      dispatch(updateElementPositionAC(data));
    }
  }, []);

  return {
    ...state,
    handleDragStart,
    handleMouseMove,
    handleMouseUp,
    revalidate,
    updatePosition,
    registerDroppableItem,
    registerDraggableItem,
    unregisterDroppableItem,
    unregisterDraggableItem,
  };
};

const SimpleDragDrop = React.memo(React.forwardRef(function SimpleDragDrop(props, ref) {
  const {children, ...rest} = props;
  const simpleDragDrop = useSimpleDragDrop(rest);
  const {handleMouseMove, handleMouseUp} = simpleDragDrop;

  React.useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  if (ref && typeof ref === 'object') {
    ref.current = simpleDragDrop;
  }

  return (
    <SimpleDragDropContext.Provider value={simpleDragDrop}>
      {children}
    </SimpleDragDropContext.Provider>
  );
}));

SimpleDragDrop.propTypes = {
  onDragStart: PropTypes.func,
  onDragEnd: PropTypes.func,
  getDraggingItemSize: PropTypes.func,
  getDragMetadata: PropTypes.func,
};

SimpleDragDrop.defaultProps = {};

export default SimpleDragDrop;
