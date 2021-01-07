import React from 'react';
import PropTypes from 'prop-types';
import {DroppableContext, useSimpleDragDropContext} from '../context';

const Droppable = React.memo(function Droppable({children, droppableId, ...rest}) {
  const {
    registerDroppableItem,
    unregisterDroppableItem,
    droppableItems,
    source,
    metadata,
    isDragging,
  } = useSimpleDragDropContext();
  const innerRef = React.useRef();
  const configRef = React.useRef({});
  configRef.current = rest;
  const droppableItem = droppableItems[droppableId];

  React.useEffect(() => {
    registerDroppableItem(droppableId, innerRef, configRef.current);
    return function () {
      unregisterDroppableItem(droppableId);
    };
  }, [registerDroppableItem, unregisterDroppableItem, droppableId]);

  if (typeof children !== 'function') {
    throw new Error('Droppable children must be a function!');
  }

  return React.useMemo(function () {
    const provided = {
      innerRef,
      droppableProps: {
        'data-sdd-droppable-id': droppableId,
      },
    };
    const snapshot = {
      isDraggingOver: !!droppableItem?.isDraggingOver,
      source,
      metadata,
    };
    if (isDragging) {
      snapshot.validationResult = droppableItem?.validationResult;
      snapshot.canDropped = droppableItem?.canDropped;
    }
    return (
      <DroppableContext.Provider value={{droppableId}}>
        {children(provided, snapshot)}
      </DroppableContext.Provider>
    );
  }, [droppableId, droppableItem, isDragging, source, metadata, children]);
});

Droppable.propTypes = {
  droppableId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  isDropDisabled: PropTypes.bool,
  fixedGap: PropTypes.number,
  validation: PropTypes.func, // validation function, must return false or throw an error to disable drop
};

Droppable.defaultProps = {
  isDropDisabled: false,
};

export default Droppable;
