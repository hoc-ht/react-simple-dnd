import React from 'react';
import PropTypes from 'prop-types';
import reducer, {initialState} from '../reducer/reducer';
import {SimpleDragDropContext} from '../context';
import {onDragEndAC, onDragStartAC, onMovingAC} from '../reducer/actions';
import {throttle} from '../utils';
import {getDragStartData, handleDragEnd} from '../reducer/utils';

const useSimpleDragDrop = ({fixedItemHeight, onDragEnd, onDragStart, getDragMetadata}) => {
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
  }, []);

  const registerDraggableItem = React.useCallback(function (droppableId, draggableId, index, innerRef) {
    draggableRefs.current[draggableId] = {
      droppableId,
      draggableId,
      index,
      innerRef,
    };
  }, []);

  const unregisterDroppableItem = React.useCallback(function (droppableId) {
    delete droppableRefs.current[droppableId];
  }, []);

  const unregisterDraggableItem = React.useCallback(function (draggableId) {
    delete draggableRefs.current[draggableId];
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
      metadata = getDragMetadata(draggableId, source);
    }

    const data = getDragStartData(draggingItem, source, metadata, event, {fixedItemHeight, droppableRefs, draggableRefs});
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
  }, [fixedItemHeight, onDragStart, getDragMetadata]);

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

  return {
    ...state,
    handleDragStart,
    handleMouseMove,
    handleMouseUp,
    registerDroppableItem,
    registerDraggableItem,
    unregisterDroppableItem,
    unregisterDraggableItem,
  };
};

const SimpleDragDrop = React.memo(function SimpleDragDrop(props) {
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
  }, [handleMouseMove]);

  return (
    <SimpleDragDropContext.Provider value={simpleDragDrop}>
      {children}
    </SimpleDragDropContext.Provider>
  );
});

SimpleDragDrop.propTypes = {
  fixedItemHeight: PropTypes.number,
  onDragStart: PropTypes.func,
  onDragEnd: PropTypes.func,
  getDragMetadata: PropTypes.func,
};

SimpleDragDrop.defaultProps = {
  fixedItemHeight: 0,
};

export default SimpleDragDrop;
