import React from 'react';
import PropTypes from 'prop-types';
import {useDroppableContext, useSimpleDragDropContext} from '../context';
import {uniqueID} from '../utils';

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
    const registerId = uniqueID();
    registerDraggableItem(droppableId, draggableId, index, innerRef, registerId);
    return function () {
      unregisterDraggableItem(draggableId, registerId);
    };
  }, [registerDraggableItem, unregisterDraggableItem, draggableId, droppableId, index]);

  const onDragStart = React.useCallback(function (event) {
    handleDragStart(draggableId, event);
  }, [handleDragStart, draggableId]);

  if (typeof children !== 'function') {
    throw new Error('Draggable children must be a function!');
  }

  const style = draggableItems[draggableId]?.style;
  const isThisDragging = draggableId === draggingItem?.draggableId;

  return React.useMemo(function () {
    const provided = {
      innerRef,
      draggableProps: {
        'data-sdd-draggable-id': draggableId,
        style,
      },
      dragHandleProps: {
        draggable: false,
        onDragStart,
      },
    };

    const snapshot = {
      isDragging: isThisDragging,
      draggingOver: null,
      isDropAnimating: false,
      source,
      metadata,
    };

    return children(provided, snapshot);
  }, [draggableId, style, isThisDragging, source, metadata, children, onDragStart]);
});

Draggable.propTypes = {
  index: PropTypes.number,
  draggableId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default Draggable;
