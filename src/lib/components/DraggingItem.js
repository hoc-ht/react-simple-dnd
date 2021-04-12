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

  const draggableItem = isDragging ? draggableItems[draggingItem?.draggableId] : undefined;

  return React.useMemo(function () {
    return children({
      draggableItem,
      source,
      metadata,
    });
  }, [draggableItem, source, metadata, children]);
}

export default React.memo(DraggingItem);
