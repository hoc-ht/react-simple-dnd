import React from 'react';
import PropTypes from 'prop-types';
import {useDroppableContext, useSimpleDragDropContext} from '../context';

const Draggable = React.memo(function Draggable({children, draggableId, index}) {
  const {
    registerDraggableItem,
    unregisterDraggableItem,
    handleDragStart,
    draggingItem,
    draggableItems,
    source,
    metadata,
  } = useSimpleDragDropContext();
  const {droppableId} = useDroppableContext();
  const innerRef = React.useRef();

  React.useEffect(() => {
    registerDraggableItem(droppableId, draggableId, index, innerRef);
    return function () {
      unregisterDraggableItem(draggableId);
    };
  }, [registerDraggableItem, unregisterDraggableItem, draggableId, droppableId, index]);

  const onDragStart = React.useCallback(function (event) {
    handleDragStart(draggableId, event);
  }, [handleDragStart, draggableId]);

  if (typeof children !== 'function') {
    console.error(new Error('Draggable children must be a function!'));
    return children;
  }
  const provided = {
    innerRef,
    draggableProps: {
      'data-sdd-draggable-id': draggableId,
      style: draggableItems[draggableId]?.style,
    },
    dragHandleProps: {
      draggable: false,
      onDragStart,
    },
  };

  const snapshot = {
    isDragging: draggableId === draggingItem?.draggableId,
    draggingOver: null,
    isDropAnimating: false,
    source,
    metadata,
  };

  return children(provided, snapshot);
});

Draggable.propTypes = {
  index: PropTypes.number,
  draggableId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default Draggable;
