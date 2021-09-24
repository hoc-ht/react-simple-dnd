import {getBox} from 'css-box-model';

export function handleMove(mousePosition, state) {
  const {draggableItems, droppableItems, draggingItem} = state;
  if (!draggingItem || !draggableItems[draggingItem?.draggableId]) {
    return state;
  }
  const newDroppableItems = calculateDroppableData(droppableItems, mousePosition);
  const droppingItem = Object.values(newDroppableItems).find(item => item.isDraggingOver);
  const newDraggableItems = calculateDraggableItemsData(draggableItems, draggingItem, droppingItem, mousePosition);
  return {
    ...state,
    draggableItems: newDraggableItems,
    droppableItems: newDroppableItems,
    mousePosition,
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

function calculateDraggableItemsData(draggableItems, draggingItem, droppingItem, mousePosition) {
  const newItems = {...draggableItems};
  const {draggableId: draggingId} = draggingItem;
  let isChanged = false;
  Object.values(newItems).forEach(draggableItem => {
    // If this item is not dragging item
    // AND (this item is not in list which is dropping over or cannot be dropped)
    if (draggableItem.draggableId !== draggingId && (draggableItem.droppableId !== droppingItem?.droppableId || !droppingItem?.canDropped)) {
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
    // If this item is in list which is dropping over and can be dropped => calculate position
    if (draggableItem.droppableId === droppingItem?.droppableId) {
      newItems[draggableItem.draggableId] = {
        ...newItems[draggableItem.draggableId],
        style: calculateDraggableItemStyle(newItems[draggableItem.draggableId], mousePosition, newItems[draggingId], droppingItem?.config?.fixedGap, true),
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
      transition: 'transform 0.35s cubic-bezier(.2,1,.1,1)',
      pointerEvents: 'none',
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
          transition: 'transform 0.35s cubic-bezier(.2,1,.1,1)',
          pointerEvents: 'none',
        };
      }
    }
  }
}

export function getDragStartData(draggingItem, source, metadata, event, {getDraggingItemSize, droppableRefs, draggableRefs}) {
  const droppableItems = {}, draggableItems = {};
  const {draggableId} = draggingItem;
  const droppableId = draggingItem.droppableId;
  Object.keys(droppableRefs.current).forEach(id => {
    let validationResult;
    const droppable = droppableRefs.current[id];
    const innerRef = droppable?.innerRef?.current;
    if (!innerRef) {
      throw new Error(`Droppable ref with id ${id} not found.`);
    }
    const box = getBox(innerRef);
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
    droppableItems[id] = {
      droppableId: droppableRefs.current[id].droppableId,
      borderBox: box.borderBox,
      config: droppableRefs.current[id].config,
      validationResult: validationResult,
      canDropped: validationResult !== false && !droppable.config?.isDropDisabled,
    };
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
  const box = getBox(draggingItem.innerRef.current);
  let width = box.borderBox.width;
  let height = box.borderBox.height;
  let offsetLeft = event.clientX - box.borderBox.left;
  let offsetTop = event.clientY - box.borderBox.top;

  if (getDraggingItemSize && typeof getDraggingItemSize === 'function') {
    const size = getDraggingItemSize(box.borderBox);
    if (size) {
      width = size.width;
      height = size.height;
    }
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

  const droppableItem = droppableItems[droppableId];
  if (droppableItem.canDropped) {
    Object.values(draggableItems).forEach(item => {
      if (item.droppableId === draggingItem.droppableId
        && item.draggableId !== draggingItem.draggableId) {
        const style = calculateDraggableItemStyle(draggableItems[item.draggableId], {x: event.clientX}, draggableItems[draggingItem.draggableId], droppableItem.config.fixedGap, false);
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
      droppableId: draggingItem.droppableId,
      index: draggingItem.index,
    },
    source,
    droppableItems,
    draggableItems,
  };
}

export function getElementPosition(refs) {
  const items = {};
  Object.keys(refs).forEach(id => {
    const el = refs[id];
    const innerRef = el?.innerRef?.current;
    if (!innerRef) {
      return;
    }
    const box = getBox(innerRef);
    items[id] = {
      borderBox: box.borderBox,
    };
  });
  return items;
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
    source: null,
    isDragging: false,
    mousePosition: null,
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
    config: droppableItem.config,
    index: left.length,
    validationResult: droppableItem.validationResult,
    canDropped: droppableItem.canDropped,
  };
}

export function handleRevalidated({droppableItems}, state) {
  const {draggableItems, draggingItem, mousePosition} = state;
  if (!draggingItem || !draggableItems[draggingItem?.draggableId]) {
    return state;
  }
  const newDroppableItems = {...state.droppableItems};
  Object.keys(droppableItems).forEach(droppableId => {
    newDroppableItems[droppableId] = {
      ...newDroppableItems[droppableId],
      validationResult: droppableItems[droppableId].validationResult,
      canDropped: droppableItems[droppableId].validationResult !== false && !newDroppableItems[droppableId].config?.isDropDisabled,
    };
  });
  if (mousePosition) {
    const droppingItem = Object.values(newDroppableItems).find(item => item.isDraggingOver);
    const newDraggableItems = calculateDraggableItemsData(draggableItems, draggingItem, droppingItem, mousePosition);
    return {
      ...state,
      draggableItems: newDraggableItems,
      droppableItems: newDroppableItems,
    };
  } else {
    return {
      ...state,
      droppableItems: newDroppableItems,
    };
  }
}
