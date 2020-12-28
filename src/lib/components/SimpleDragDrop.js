import React from 'react';
import PropTypes from 'prop-types';
import {getBox} from 'css-box-model';
import reducer, {initialState} from '../reducer/reducer';
import {SimpleDragDropContext} from '../context';
import {onDragEndAC, onDragStartAC, onMovingAC} from '../reducer/actions';
import {throttle} from '../utils';
import {handleDragEnd} from '../reducer/utils';

const useSimpleDragDrop = ({fixedItemHeight, onDragEnd}) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const stateRef = React.useRef(state);
  stateRef.current = state;
  const droppableRefs = React.useRef({});
  const draggableRefs = React.useRef({});
  const mousePosRef = React.useRef({});
  const handleMouseUpRef = React.useRef(null);

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

  handleMouseUpRef.current = React.useCallback(function (event) {
    if (!stateRef.current.draggingItem) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const {draggingItem} = stateRef.current;
    const {destination, ...newState} = handleDragEnd(mousePosRef.current, stateRef.current);
    dispatch(onDragEndAC(newState));
    if (onDragEnd) {
      onDragEnd({
        source: {
          droppableId: draggingItem.droppableId,
          index: draggingItem.index,
        },
        draggableId: draggingItem.draggableId,
        destination,
      });
    }
  }, [onDragEnd]);

  const handleDragStart = React.useCallback((draggableId, event) => {
    event.preventDefault();
    if (stateRef.current.isDragging) {
      return;
    }
    const draggableRef = draggableRefs.current[draggableId]?.innerRef?.current;
    if (!draggableRef) {
      console.error(new Error('Draggable ref with id ' + draggableId + ' not found'));
      return;
    }
    const droppableItems = {}, draggableItems = {};
    Object.keys(droppableRefs.current).forEach(id => {
      const innerRef = droppableRefs.current[id]?.innerRef?.current;
      if (innerRef) {
        const box = getBox(innerRef);
        droppableItems[id] = {
          droppableId: droppableRefs.current[id].droppableId,
          borderBox: box.borderBox,
          config: droppableRefs.current[id].config,
        };
      }
    });
    Object.keys(draggableRefs.current).forEach(id => {
      const innerRef = draggableRefs.current[id]?.innerRef?.current;
      if (innerRef) {
        const box = getBox(innerRef);
        draggableItems[id] = {
          draggableId: id,
          droppableId: draggableRefs.current[id].droppableId,
          index: draggableRefs.current[id].index,
          borderBox: box.borderBox,
        };
      }
    });
    const box = getBox(draggableRef);
    draggableItems[draggableId] = {
      ...draggableItems[draggableId],
      style: {
        position: 'fixed',
        left: box.borderBox.left,
        top: box.borderBox.top,
        pointerEvents: 'none',
      },
    };
    if (fixedItemHeight) {
      const fixedItemWidth = box.borderBox.width * fixedItemHeight / box.borderBox.height;
      draggableItems[draggableId].fixedHeight = fixedItemHeight;
      draggableItems[draggableId].fixedWidth = fixedItemWidth;
      draggableItems[draggableId].style.height = fixedItemHeight;
      draggableItems[draggableId].style.width = fixedItemWidth;
    }
    dispatch(onDragStartAC({
      draggingItem: {
        draggableId,
        droppableId: draggableRefs.current[draggableId]?.droppableId,
        index: draggableRefs.current[draggableId]?.index,
      },
      droppableItems,
      draggableItems,
    }));

    // Listen mouse up event
    document.addEventListener('mouseup', handleMouseUpRef.current);
  }, [fixedItemHeight]);

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
  }, 30, {leading: true, trailing: true}), []);

  return {
    ...state,
    handleDragStart,
    handleMouseMove,
    registerDroppableItem,
    registerDraggableItem,
    unregisterDroppableItem,
    unregisterDraggableItem,
  };
};

const SimpleDragDrop = React.memo(function SimpleDragDrop(props) {
  const {children, ...rest} = props;
  const simpleDragDrop = useSimpleDragDrop(rest);
  const {handleMouseMove} = simpleDragDrop;

  React.useEffect(() => {
    console.log('Mount');
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      console.log('Unmount');
      window.removeEventListener('mousemove', handleMouseMove);
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
  onDragEnd: PropTypes.func,
};

SimpleDragDrop.defaultProps = {
  fixedItemHeight: 0,
};

export default SimpleDragDrop;
