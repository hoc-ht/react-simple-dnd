import {getBox} from 'css-box-model';

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
        style: calculateDraggableItemStyle(newItems[draggableItem.draggableId], mousePosition, newItems[draggingId], droppableItem?.config?.fixedGap, true),
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
  const {borderBox, width, height, offsetLeft, offsetTop} = draggableItem;
  const translateX = x - borderBox.left - offsetLeft;
  const translateY = y - borderBox.top - offsetTop;
  return {
    width,
    height,
    position: 'fixed',
    left: borderBox.left,
    top: borderBox.top,
    zIndex: 1500,
    pointerEvents: 'none',
    transform: `translate(${translateX}px, ${translateY}px)`,
    transition: 'transform 0.3s cubic-bezier(.2,1,.1,1), opacity 0.3s cubic-bezier(.2,1,.1,1)',
  };
}

function calculateDraggableItemStyle(draggableItem, mousePosition, draggingItem, gap = 0, animate = true) {
  const {x} = mousePosition;
  const {width: draggingItemWidth} = draggingItem;
  const borderBox = draggableItem.borderBox;
  const translateX = (gap || 0) + draggingItemWidth;
  if (x < (borderBox.left + borderBox.width / 2)) {
    const style = {
      transform: `translate(${translateX}px, 0)`,
      transition: 'transform 0.3s cubic-bezier(.2,1,.1,1), opacity 0.3s cubic-bezier(.2,1,.1,1)',
    };
    if (!animate) {
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

export function getDragStartData(draggableId, event, {fixedItemHeight, droppableRefs, draggableRefs}) {
  const droppableItems = {}, draggableItems = {};
  const draggableItem = draggableRefs.current[draggableId];
  const droppableItem = droppableRefs.current[draggableRefs.current[draggableId].droppableId];
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
  const box = getBox(draggableItem?.innerRef?.current);
  let width = box.borderBox.width;
  let height = box.borderBox.height;
  let offsetLeft = event.clientX - box.borderBox.left;
  let offsetTop = event.clientY - box.borderBox.top;

  if (fixedItemHeight) {
    height = fixedItemHeight;
    width = box.borderBox.width * height / box.borderBox.height;
    offsetLeft = width * offsetLeft / box.borderBox.width;
    offsetTop = height * offsetTop / box.borderBox.height;
  }

  const translateX = event.clientX - box.borderBox.left - offsetLeft;
  const translateY = event.clientY - box.borderBox.top - offsetTop;

  draggableItems[draggableId] = {
    ...draggableItems[draggableId],
    width,
    height,
    offsetLeft,
    offsetTop,
    style: {
      width,
      height,
      position: 'fixed',
      left: box.borderBox.left,
      top: box.borderBox.top,
      zIndex: 1500,
      pointerEvents: 'none',
      transform: `translate(${translateX}px, ${translateY}px)`,
    },
  };

  if (!droppableItem?.config?.isDropDisabled) {
    Object.values(draggableItems).forEach(item => {
      if (item.droppableId === draggableItem.droppableId
        && item.draggableId !== draggableItem.draggableId) {
        const style = calculateDraggableItemStyle(draggableItems[item.draggableId], {x: event.clientX}, draggableItems[draggableItem.draggableId], droppableItem?.config?.fixedGap, false);
        draggableItems[item.draggableId] = {
          ...draggableItems[item.draggableId],
          style,
        };
      }
    });
  }

  return {
    draggingItem: {
      draggableId,
      droppableId: draggableItem?.droppableId,
      index: draggableItem?.index,
    },
    droppableItems,
    draggableItems,
  };
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
