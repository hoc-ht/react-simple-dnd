import React from 'react';
import {Droppable} from '../lib';
import ImageItem from './ImageItem';
import {getRealId} from './utils';

class ImageList extends React.PureComponent {
  validation = ({draggableId, source}, event) => {
    if (event?.keyCode === 68) { // User press "D" key
      return false;
    }
    const {droppableId, images} = this.props;
    if (source.droppableId === droppableId) {
      return true;
    }
    const id = getRealId(draggableId);
    const isExisted = images.find(item => item.id === id);
    if (isExisted) {
      return false;
    }
  };

  render() {
    const {images, droppableId, className, isDropDisabled, fixedGap, copyMode} = this.props;
    return (
      <Droppable
        droppableId={droppableId}
        isDropDisabled={isDropDisabled}
        fixedGap={fixedGap}
        copyMode={copyMode}
        validation={this.validation}
      >
        {
          (provided, snapshot) => {
            return (
              <div
                className={`${className} ${snapshot.isDraggingOver ? 'dragging-over' : ''} ${snapshot?.canDropped === false ? 'cant-drop' : ''}`}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {
                  images.map((item, index) => (
                    <ImageItem
                      item={item}
                      itemIndex={index}
                      draggableId={`${item.id}.${droppableId}`}
                      key={`${droppableId}.${item.id}`}
                      isDropDisabled={isDropDisabled}
                    />
                  ))
                }
              </div>
            );
          }
        }
      </Droppable>
    );
  }
}

export default ImageList;
