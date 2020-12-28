import React from 'react';
import PropTypes from 'prop-types';
import {DroppableContext, useSimpleDragDropContext} from '../context';

const Droppable = React.memo(function Droppable({children, droppableId, copyMode, isDropDisabled}) {
  const {registerDroppableItem, unregisterDroppableItem, droppableItems} = useSimpleDragDropContext();
  const innerRef = React.useRef();
  const droppableItem = droppableItems[droppableId];

  React.useEffect(() => {
    registerDroppableItem(droppableId, innerRef, {
      copyMode,
      isDropDisabled,
    });
    return function () {
      unregisterDroppableItem(droppableId);
    };
  }, [registerDroppableItem, unregisterDroppableItem, droppableId, copyMode, isDropDisabled]);

  if (typeof children !== 'function') {
    console.error(new Error('Droppable children must be a function!'));
    return children;
  }
  const provided = {
    innerRef,
    droppableProps: {
      'data-sdd-droppable-id': droppableId,
    },
  };
  const snapshot = {
    isDraggingOver: !!droppableItem?.isDraggingOver,
  };
  return (
    <DroppableContext.Provider value={{droppableId}}>
      {children(provided, snapshot)}
    </DroppableContext.Provider>
  );
});

Droppable.propTypes = {
  droppableId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  copyMode: PropTypes.bool,
  isDropDisabled: PropTypes.bool,
};

Droppable.defaultProps = {
  copyMode: false,
  isDropDisabled: false,
};

export default Droppable;
