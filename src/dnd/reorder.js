import axios from 'axios';

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export default reorder;

export const reorderQuoteMap = ({ quoteMap, source, destination, dataFromJson }) => {
  const current = [...quoteMap[source.droppableId]];
  const next = [...quoteMap[destination.droppableId]];
  const target = current[source.index];

  // moving to same list
  if (source.droppableId === destination.droppableId) {
    let sourceData = dataFromJson.find((card)=>card.name===source.droppableId)
    const reordered = reorder(current, source.index, destination.index);
    axios.put(`http://localhost:3000/boards1/${dataFromJson.find((card)=>card.name===source.droppableId).id}/`, {
      ...sourceData,
      data: reordered
    })
    const result = {
      ...quoteMap,
      [source.droppableId]: reordered
    };
    return {
      quoteMap: result
    };
  }

  // moving to different list

  // remove from original
  let sourceData = dataFromJson.find((card)=>card.name===source.droppableId)
  current.splice(source.index, 1)
  axios.put(`http://localhost:3000/boards1/${dataFromJson.find((card)=>card.name===source.droppableId).id}/`, {
  ...sourceData,
    data: current
  })

  // insert into next
  let nextData = dataFromJson.find((card)=>card.name===destination.droppableId)
  next.splice(destination.index, 0, target);
  axios.put(`http://localhost:3000/boards1/${dataFromJson.find((card)=>card.name===destination.droppableId).id}/`, {
    ...nextData,
    data: next
  })

  const result = {
    ...quoteMap,
    [source.droppableId]: current,
    [destination.droppableId]: next
  };

  return {
    quoteMap: result
  };
};

export function moveBetween({ list1, list2, source, destination }) {
  const newFirst = Array.from(list1.values);
  const newSecond = Array.from(list2.values);

  const moveFrom = source.droppableId === list1.id ? newFirst : newSecond;
  const moveTo = moveFrom === newFirst ? newSecond : newFirst;

  const [moved] = moveFrom.splice(source.index, 1);
  moveTo.splice(destination.index, 0, moved);

  return {
    list1: {
      ...list1,
      values: newFirst
    },
    list2: {
      ...list2,
      values: newSecond
    }
  };
}
