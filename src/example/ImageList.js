import React from 'react';
import {Droppable} from '../lib';
import ImageItem from './ImageItem';

class ImageList extends React.PureComponent {
  render() {
    const {images, droppableId, className, isDropDisabled, fixedGap} = this.props;
    return (
      <Droppable droppableId={droppableId} isDropDisabled={isDropDisabled} fixedGap={fixedGap}>
        {
          (provided, snapshot) => {
            return (
              <div
                className={`${className} ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {
                  images.map((item, index) => (
                    <ImageItem
                      item={item}
                      itemIndex={index}
                      droppableId={droppableId}
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
