import React from 'react';

export const SimpleDragDropContext = React.createContext(null);

export function useSimpleDragDropContext() {
  const context = React.useContext(SimpleDragDropContext);
  if (!context) {
    console.error('SimpleDragDropContext is undefined, please verify you are calling useDragDropContext() as child of a SimpleDragDrop component.');
  }
  return context;
}

export const DroppableContext = React.createContext(null);

export function useDroppableContext() {
  const context = React.useContext(DroppableContext);
  if (!context) {
    console.error('DroppableContext is undefined, please verify you are calling useDroppableContext() as child of a DroppableContext component.');
  }
  return context;
}
