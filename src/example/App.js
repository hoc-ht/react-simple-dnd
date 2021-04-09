import React from 'react';
import './App.css';
import {SimpleDragDrop} from '../lib';
import ImageList from './ImageList';
import {getRealId} from './utils';
import DraggingItem from '../lib/components/DraggingItem';

class App extends React.PureComponent {
  state = {
    list1: [
      {id: 11, src: 'http://via.placeholder.com/150/330000/FFFFFF?text=11'},
      {id: 12, src: 'http://via.placeholder.com/150x100/003300/FFFFFF?text=12'},
      {id: 13, src: 'http://via.placeholder.com/150/000033/FFFFFF?text=13'},
    ],
    list2: [
      {id: 21, src: 'http://via.placeholder.com/150/330033/FFFFFF?text=21'},
      {id: 22, src: 'http://via.placeholder.com/150/333300/FFFFFF?text=22'},
      {id: 23, src: 'http://via.placeholder.com/150/003333/FFFFFF?text=23'},
      {id: 24, src: 'http://via.placeholder.com/150/003333/FFFFFF?text=24'},
      {id: 25, src: 'http://via.placeholder.com/150/003333/FFFFFF?text=25'},
    ],
    list3: [
      {id: 31, src: 'http://via.placeholder.com/150/330033/FFFFFF?text=31'},
      {id: 32, src: 'http://via.placeholder.com/150/333300/FFFFFF?text=32'},
      {id: 33, src: 'http://via.placeholder.com/150/003333/FFFFFF?text=33'},
    ],
  };

  dndRef = React.createRef();

  componentDidMount() {
    document.addEventListener('keydown', this.doRevalidate);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.doRevalidate);
  }

  doRevalidate = (event) => {
    if (this.dndRef.current) {
      this.dndRef.current.revalidate(event);
    }
  };

  onDragStart = () => {
    console.log('Drag start');
  };

  onDragEnd = (event) => {
    const {source, destination, draggableId} = event;
    if (destination?.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }
    if (!destination || !destination.canDropped) {
      return;
    }
    this.setState(prevState => {
      if (source.droppableId !== destination.droppableId) {
        let srcItems = [...prevState[source.droppableId]];
        let dstItems = [...prevState[destination.droppableId]];
        const id = getRealId(draggableId);
        const existedItem = dstItems.find(item => item.id === id);
        if (existedItem) {
          return null;
        }
        const draggableItem = srcItems[source.index];
        if (source.config.copyMode) {
          srcItems = prevState[source.droppableId];
        } else {
          srcItems.splice(source.index, 1);
        }
        dstItems.splice(destination.index, 0, draggableItem);
        return {
          [source.droppableId]: srcItems,
          [destination.droppableId]: dstItems,
        };
      } else {
        const items = [...prevState[source.droppableId]];
        const draggableItem = items[source.index];
        items.splice(source.index, 1);
        items.splice(destination.index, 0, draggableItem);
        return {
          [source.droppableId]: items,
        };
      }
    });
  };

  render() {
    const {list1, list2, list3} = this.state;
    return (
      <SimpleDragDrop ref={this.dndRef} fixedItemHeight={66} onDragStart={this.onDragStart} onDragEnd={this.onDragEnd}>
        <div className="App">
          <ImageList images={list1} droppableId="list1" className="image-list" isDropDisabled={true} copyMode={true}/>
          <div className="image-list-container">
            <ImageList images={list2} droppableId="list2" className="image-list image-list-small image-list-fixed-width" fixedGap={8}/>
            <ImageList images={list3} droppableId="list3" className="image-list image-list-small image-list-fixed-width" fixedGap={8} copyMode={true}/>
          </div>
        </div>
        <DraggingItem>
          {
            ({droppableItem, source}) => (
              <div
                className="dragging-item"
                style={droppableItem?.style}
              >
                {
                  droppableItem && source?.droppableId === 'list3' && <span>An other way to display dragging item: {droppableItem.draggableId}</span>
                }
              </div>
            )
          }
        </DraggingItem>
      </SimpleDragDrop>
    );
  }
}

export default App;
