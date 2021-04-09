import React from 'react';
import {useSimpleDragDropContext} from '../context';

function DraggingItem({children}) {
  const {
    draggingItem,
    draggableItems,
    isDragging,
    source,
    metadata,
  } = useSimpleDragDropContext();
  if (typeof children !== 'function') {
    throw new Error('GhostRenderer children must be a function!');
  }

  const droppableItem = isDragging ? draggableItems[draggingItem?.draggableId] : undefined;

  return React.useMemo(function () {
    return children({
      droppableItem,
      source,
      metadata,
    });
  }, [droppableItem, source, metadata, children]);
}

export default React.memo(DraggingItem);
