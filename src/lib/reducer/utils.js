export function handleMove(mousePosition, state) {
  const {draggableItems, droppableItems, draggingItem} = state;
  if (!draggingItem || !draggableItems[draggingItem?.draggableId]) {
    return state;
  }
  const newDroppableItems = calculateDroppableData(droppableItems, mousePosition);
  const droppableItem = Object.values(newDroppableItems).find(item => item.isDraggingOver);
  const newDraggableItems = calculateDraggableItemsData(draggableItems, draggingItem, droppableItem, mousePosition);
  return {
    ...state,
    draggableItems: newDraggableItems,
    droppableItems: newDroppableItems,
  };
}

function calculateDroppableData(droppableItems, mousePosition) {
  const {x, y} = mousePosition;
  const newItems = {...droppableItems};
  let isChanged = false;
  Object.keys(newItems).forEach(droppableId => {
    const droppableItem = droppableItems[droppableId];
    const {borderBox} = droppableItem;
    const isDraggingOver = borderBox.top <= y && borderBox.bottom >= y && borderBox.left <= x && borderBox.right >= x;
    if (isDraggingOver !== droppableItem.isDraggingOver) {
      newItems[droppableId] = {
        ...newItems[droppableId],
        isDraggingOver,
      };
      isChanged = true;
    }
  });
  if (!isChanged) {
    return droppableItems;
  }
  return newItems;
}

function calculateDraggableItemsData(draggableItems, draggingItem, droppableItem, mousePosition) {
  const newItems = {...draggableItems};
  const {draggableId: draggingId} = draggingItem;
  let isChanged = false;
  Object.values(newItems).forEach(draggableItem => {
    // If this item is not dragging item
    // AND (this item is not in list which can be drop OR droppableItem is disabled)
    if (draggableItem.draggableId !== draggingId && (draggableItem.droppableId !== droppableItem?.droppableId || droppableItem?.config?.isDropDisabled)) {
      if (draggableItem.style) {
        newItems[draggableItem.draggableId] = {
          ...newItems[draggableItem.draggableId],
          style: undefined,
        };
        isChanged = true;
      }
      return;
    }
    // If this item is dragging item
    if (draggableItem.draggableId === draggingId) {
      newItems[draggableItem.draggableId] = {
        ...newItems[draggableItem.draggableId],
        style: calculateDraggingItemStyle(newItems[draggingId], mousePosition),
      };
      isChanged = true;
      return;
    }
    // If this item is in list which can be drop and droppableItem can be drop => calculate position
    if (draggableItem.droppableId === droppableItem?.droppableId) {
      newItems[draggableItem.draggableId] = {
        ...newItems[draggableItem.draggableId],
        style: calculateDraggableItemStyle(newItems[draggableItem.draggableId], mousePosition, newItems[draggingId]),
      };
      isChanged = true;
    }
  });
  if (!isChanged) {
    return draggableItems;
  }
  return newItems;
}

function calculateDraggingItemStyle(draggableItem, mousePosition) {
  const {x, y} = mousePosition;
  const {borderBox, fixedWidth, fixedHeight} = draggableItem;
  const width = fixedWidth ? fixedWidth : borderBox.width;
  const height = fixedHeight ? fixedHeight : borderBox.height;
  const offsetLeft = x - borderBox.left - Math.floor(width / 2);
  const offsetTop = y - borderBox.top - Math.floor(height / 5);
  const style = {
    position: 'fixed',
    left: borderBox.left,
    top: borderBox.top,
    zIndex: 1500,
    pointerEvents: 'none',
    transform: `translate(${offsetLeft}px, ${offsetTop}px)`,
    transition: 'transform 0.3s cubic-bezier(.2,1,.1,1), opacity 0.3s cubic-bezier(.2,1,.1,1)',
  };
  if (fixedWidth) {
    style.width = fixedWidth;
    style.height = fixedHeight;
  }
  return style;
}

function calculateDraggableItemStyle(draggableItem, mousePosition, draggingItem) {
  const {x} = mousePosition;
  const {fixedWidth} = draggingItem;
  const borderBox = draggableItem.borderBox;
  if (x < (borderBox.left + borderBox.width / 2)) {
    const offsetLeft = fixedWidth ? fixedWidth : draggingItem.borderBox.width;
    const style = {
      transform: `translate(${offsetLeft}px, 0)`,
      transition: 'transform 0.3s cubic-bezier(.2,1,.1,1), opacity 0.3s cubic-bezier(.2,1,.1,1)',
    };
    if (!draggingItem?.style) {
      delete style.transition;
    }
    return style;
  } else {
    if (draggableItem.style) {
      if (draggableItem.style.transform !== `translate(0, 0)`) {
        return {
          transform: `translate(0, 0)`,
          transition: 'transform 0.3s cubic-bezier(.2,1,.1,1), opacity 0.3s cubic-bezier(.2,1,.1,1)',
        };
      }
    }
  }
}

export function handleDragEnd(mousePosition, state) {
  const {draggableItems, droppableItems, draggingItem} = state;
  const newDraggableItems = {...draggableItems};
  const newDroppableItems = {...calculateDroppableData(droppableItems, mousePosition)};
  const droppableItem = Object.values(newDroppableItems).find(item => item.isDraggingOver);
  const destination = calculateDestination(droppableItem, newDraggableItems, draggingItem, mousePosition);
  Object.values(newDraggableItems).forEach(draggableItem => {
    if (draggableItem.style) {
      newDraggableItems[draggableItem.draggableId] = {
        ...newDraggableItems[draggableItem.draggableId],
        style: undefined,
      };
    }
  });
  Object.values(newDroppableItems).forEach(droppableItem => {
    if (droppableItem.isDraggingOver) {
      newDroppableItems[droppableItem.droppableId] = {
        ...newDroppableItems[droppableItem.droppableId],
        isDraggingOver: false,
      };
    }
  });
  return {
    ...state,
    destination,
    draggableItems: newDraggableItems,
    droppableItems: newDroppableItems,
    draggingItem: null,
    isDragging: false,
  };
}

function calculateDestination(droppableItem, draggableItems, draggingItem, mousePosition) {
  if (!droppableItem) {
    return null;
  }
  const {x} = mousePosition;
  const left = [];
  const items = Object.values(draggableItems).filter(item => item.droppableId === droppableItem.droppableId);
  items.sort((a, b) => a.borderBox.left - b.borderBox.left);
  items.forEach(item => {
    if (item.draggableId === draggingItem.draggableId) {
      return;
    }
    if (item.borderBox.left + Math.floor(item.borderBox.width / 2) < x) {
      left.push(item);
    }
  });
  return {
    droppableId: droppableItem.droppableId,
    index: left.length,
  };
}
