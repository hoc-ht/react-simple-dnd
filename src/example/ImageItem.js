import React, {Fragment} from 'react';
import {Draggable} from '../lib';

class ImageItem extends React.PureComponent {
  render() {
    const {item, itemIndex, draggableId, isDropDisabled, customDraggingItem} = this.props;
    return (
      <Draggable
        draggableId={draggableId}
        index={itemIndex}
      >
        {
          (provided, snapshot) => (
            <Fragment>
              <div
                className="image-item"
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                style={customDraggingItem ? {} : provided.draggableProps.style}
              >
                <img src={item.src}/>
              </div>
              {
                snapshot.isDragging && isDropDisabled &&
                <div
                  className="image-item"
                >
                  <img src={item.src}/>
                </div>
              }
            </Fragment>
          )
        }
      </Draggable>
    );
  }
}

export default ImageItem;
