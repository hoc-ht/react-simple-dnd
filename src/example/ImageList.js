import React from 'react';
import {Droppable} from '../lib';
import ImageItem from './ImageItem';

class ImageList extends React.PureComponent {
  render() {
    const {images, droppableId, className, copyMode, isDropDisabled, fixedGap} = this.props;
    return (
      <Droppable droppableId={droppableId} isDropDisabled={isDropDisabled} copyMode={copyMode} fixedGap={fixedGap}>
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
                      copyMode={copyMode}
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
