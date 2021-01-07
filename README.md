# React Simple DnD

[![npm](https://img.shields.io/npm/v/@hoc-ht/react-simple-dnd)](https://www.npmjs.com/package/@hoc-ht/react-simple-dnd)
[![npm](https://img.shields.io/npm/dependency-version/@hoc-ht/react-simple-dnd/peer/react)](https://www.npmjs.com/package/@hoc-ht/react-simple-dnd)
[![npm](https://img.shields.io/npm/l/@hoc-ht/react-simple-dnd)](https://www.npmjs.com/package/@hoc-ht/react-simple-dnd)

A simple ReactJS drag & drop library.

## Installation

Run the following command:

`npm install @hoc-ht/react-simple-dnd`

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
| validation                      | function |                 | Callback triggered when a drag has started, should return **false** or **throw** an error to disable drop on this area                     |

All other props will be passed as droppable config and can be access in the result of **onDragEnd** method.

### `<Draggable />`
_What can be dragged around_

| Props                           |  Type    |  Default value  | Description                                                                                                                                                   |
| :------------------------------ | :------: | :-------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| draggableId    _(required)_     | string   |                 |                                                                                                                                         |
| index                           | number   |                 | Current item index                      |

**Important note**: All `draggableId` in a `<SimpleDragDrop />` should be unique.

## Authors

- Hoang Thai Hoc [@hoc-ht](https://github.com/hoc-ht)

## License

MIT
