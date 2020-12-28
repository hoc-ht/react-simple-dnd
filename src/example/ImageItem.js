import React, {Fragment} from 'react';
import {Draggable} from '../lib';

class ImageItem extends React.PureComponent {
  render() {
    const {item, itemIndex, droppableId, copyMode} = this.props;
    return (
      <Draggable
        draggableId={`${item.id}.${droppableId}`}
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
              >
                <img src={item.src}/>
              </div>
              {
                snapshot.isDragging && copyMode &&
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
