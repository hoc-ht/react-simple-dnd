# React Simple Drag & Drop

[![npm](https://img.shields.io/npm/v/react-simple-drag-drop)](https://www.npmjs.com/package/react-simple-drag-drop)
[![npm](https://img.shields.io/npm/dependency-version/react-simple-drag-drop/peer/react)](https://www.npmjs.com/package/react-simple-drag-drop)
[![npm](https://img.shields.io/npm/l/react-simple-drag-drop)](https://www.npmjs.com/package/react-simple-drag-drop)

A simple ReactJS drag & drop library.

Renamed from [@hoc-ht/react-simple-dnd](https://www.npmjs.com/package/@hoc-ht/react-simple-dnd).

## Installation

Run the following command:

`npm install react-simple-drag-drop`

## Usage

See the example in the `example` folder for detail.

## Props

### `<SimpleDragDrop />`
_Wraps the part of your application you want to have drag and drop enabled for_

| Props                           |  Type    |  Default value  | Description                                                                                                                                                   |
| :------------------------------ | :------: | :-------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| onDragStart                     | function |                 | Callback triggered when a drag has started                                                                                                                                        |
| onDragEnd                       | function |                 | Callback triggered when a drag has ended                   |
| getDragMetadata                 | function |                 | Use this callback when a drag has started to inject your custom drag data                      |
| fixedItemHeight                 | number   |        0        | Use this props if you want to resize the dragging item base on this value                      |

### `<Droppable />`
_An area that can be dropped into. Contains `<Draggable />`_

| Props                           |  Type    |  Default value  | Description                                                                                                                                                   |
| :------------------------------ | :------: | :-------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| droppableId    _(required)_     | string   |                 |                                                                                                                                         |
| isDropDisabled                  | bool     |      false      |                       |
| fixedGap                        | number   |                 | Define the gap between two `<Draggable />` items                      |
| validation                      | function |                 | `function({draggableId, source, metadata}, event) {}`<br/> triggered when a drag has started or manually call `revalidate` method, should return **false** or **throw** an error to disable drop on this area                     |

All other props will be passed as droppable config and can be access in the result of **onDragEnd** method.

### `<Draggable />`
_What can be dragged around_

| Props                           |  Type    |  Default value  | Description                                                                                                                                                   |
| :------------------------------ | :------: | :-------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| draggableId    _(required)_     | string   |                 |                                                                                                                                         |
| index                           | number   |                 | Current item index                      |

**Important note**: All `draggableId` in a `<SimpleDragDrop />` should be unique.

## Methods

### revalidate(event)

Trigger validation for all `<Droppable />` item.

- `event`: event which will be passed to validation method

Return: `none`

## Authors

- Hoang Thai Hoc [@hoc-ht](https://github.com/hoc-ht)

## License

MIT
