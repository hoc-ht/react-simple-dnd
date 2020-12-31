import React from 'react';
import PropTypes from 'prop-types';
import {DroppableContext, useSimpleDragDropContext} from '../context';

const Droppable = React.memo(function Droppable({children, droppableId, ...rest}) {
  const {registerDroppableItem, unregisterDroppableItem, droppableItems} = useSimpleDragDropContext();
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
  isDropDisabled: PropTypes.bool,
  copyMode: PropTypes.bool,
  fixedGap: PropTypes.number,
};

Droppable.defaultProps = {
  isDropDisabled: false,
};

export default Droppable;
