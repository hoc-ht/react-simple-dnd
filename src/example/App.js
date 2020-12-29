import React from 'react';
import './App.css';
import {SimpleDragDrop} from '../lib';
import ImageList from './ImageList';

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

  onDragEnd = (event) => {
    const {source, destination} = event;
    if (destination?.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }
    if (!destination) {
      return;
    }
    this.setState(prevState => {
      let srcItems = [...prevState[source.droppableId]];
      let dstItems = [...prevState[destination.droppableId]];
      const draggableItem = srcItems[source.index];
      if (source.droppableId !== 'list1') {
        srcItems.splice(source.index, 1);
      } else {
        srcItems = prevState.list1;
      }
      dstItems.splice(destination.index, 0, draggableItem);
      return {
        [source.droppableId]: srcItems,
        [destination.droppableId]: dstItems,
      };
    });
  };

  render() {
    const {list1, list2, list3} = this.state;
    return (
      <SimpleDragDrop fixedItemHeight={66} onDragEnd={this.onDragEnd}>
        <div className="App">
          <ImageList images={list1} droppableId="list1" className="image-list" copyMode={true} isDropDisabled={true}/>
          <div className="image-list-container">
            <ImageList images={list2} droppableId="list2" className="image-list image-list-small image-list-fixed-width"/>
            <ImageList images={list3} droppableId="list3" className="image-list image-list-small"/>
          </div>
        </div>
      </SimpleDragDrop>
    );
  }
}

export default App;
