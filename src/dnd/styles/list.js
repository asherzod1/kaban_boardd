/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import styled from '@xstyled/styled-components';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import QuoteItem from './item';
import { grid } from './constants';
import Title from './title';
import axios from 'axios';
import toast from 'react-hot-toast';

export const getBackgroundColor = (isDraggingOver, isDraggingFrom) => {
  if (isDraggingOver) {
    return '#FFEBE6';
  }
  if (isDraggingFrom) {
    return '#E6FCFF';
  }
  return '#f6f6f6';
};

const Wrapper = styled.div`
  background-color: ${(props) => getBackgroundColor(props.isDraggingOver, props.isDraggingFrom)};
  display: flex;
  flex-direction: column;
  opacity: ${({ isDropDisabled }) => (isDropDisabled ? 0.5 : 'inherit')};
  padding: ${grid}px;
  border: ${grid}px;
  padding-bottom: 0;
  transition: background-color 0.2s ease, opacity 0.1s ease;
  user-select: none;
  width: 300px;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
`;

const scrollContainerHeight = 500;

const DropZone = styled.div`
  /* stop the list collapsing when empty */
  min-height: ${scrollContainerHeight}px;
  /*
    not relying on the items for a margin-bottom
    as it will collapse when the list is empty
  */
  padding-bottom: ${grid}px;
`;

const ScrollContainer = styled.div`
  overflow-x: hidden;
  overflow-y: auto;
  max-height: ${scrollContainerHeight}px;
`;

/* stylelint-disable block-no-empty */
const Container = styled.div``;
/* stylelint-enable */

const InnerQuoteList = React.memo(function InnerQuoteList(props) {
  return props?.quotes?.map((quote, index) => (
    <Draggable key={quote.id} draggableId={quote.id} index={index}>
      {(dragProvided, dragSnapshot) => (
        <QuoteItem
          columnData={props.columnData}
          setNeedReload={props.setNeedReload}
          key={quote.id}
          quote={quote}
          isDragging={dragSnapshot.isDragging}
          isGroupedOver={Boolean(dragSnapshot.combineTargetFor)}
          provided={dragProvided}
        />
      )}
    </Draggable>
  ));
});

function InnerList(props) {
  const { quotes, dropProvided } = props;
  const title = props.title ? <Title>{props.title}</Title> : null;

  return (
    <Container>
      {title}
      <DropZone ref={dropProvided.innerRef}>
        <InnerQuoteList
          quotes={quotes}
          columnData={props.columnData}
          setNeedReload={props.setNeedReload}
        />
        {dropProvided.placeholder}
      </DropZone>
    </Container>
  );
}

export default function QuoteList(props) {
  const {
    ignoreContainerClipping,
    internalScroll,
    scrollContainerStyle,
    isDropDisabled,
    isCombineEnabled,
    listId = 'LIST',
    listType,
    style,
    quotes,
    title,
    useClone,
    columnId
  } = props;

  const [isAdd, setIsAdd] = useState(false);
  const [addTitle, setAddTitle] = useState('');
  const [addDescription, setAddDescription] = useState('');
  const columnDataForItem = {
    "id": columnId,
    "name": listId,
    data: quotes
  }
  const addCardFunc =() => {
    if(addTitle !== ''){
      let postData = {
        "id": columnId,
        "name": listId,
        data: [
          ...quotes,
          {
            "id": String(Number(localStorage.getItem('idForNew'))+1),
            "title": addTitle,
            "content": addDescription,
            "author": {
              "colors": {
                "soft": "#E3FCEF",
                "hard": "rgba(9, 30, 66, 0.71)"
              }
            },
          }
        ]
      }
      axios.put(`http://localhost:3000/boards1/${columnId}/`, postData).then(res =>{
        console.log(res);
        localStorage.setItem('idForNew', postData.data[postData.data.length-1].id);
        props.setNeedReload(true)
        setIsAdd(false)
        setAddTitle('')
        setAddDescription('')
        toast.success('Card added successfully')
      })
    }
    else {
      toast.error('Please enter title')
    }
  }
  const cancelAddCard = () => {
    setIsAdd(false)
    setAddTitle('')
    setAddDescription('')
  }
  return (
    <Droppable
      droppableId={listId}
      type={listType}
      ignoreContainerClipping={ignoreContainerClipping}
      isDropDisabled={isDropDisabled}
      isCombineEnabled={isCombineEnabled}
      renderClone={
        useClone
          ? (provided, snapshot, descriptor) => (
              <QuoteItem
                columnData={columnDataForItem}
                setNeedReload={props.setNeedReload}
                quote={quotes[descriptor.source.index]}
                provided={provided}
                isDragging={snapshot.isDragging}
                isClone
              />
            )
          : null
      }
    >
      {(dropProvided, dropSnapshot) => (
        <Wrapper
          style={style}
          isDraggingOver={dropSnapshot.isDraggingOver}
          isDropDisabled={isDropDisabled}
          isDraggingFrom={Boolean(dropSnapshot.draggingFromThisWith)}
          {...dropProvided.droppableProps}
        >
          {internalScroll ? (
            <ScrollContainer style={scrollContainerStyle}>
              <InnerList
                quotes={quotes} title={title}
                dropProvided={dropProvided}
                columnData={columnDataForItem}
                setNeedReload={props.setNeedReload}
              />
            </ScrollContainer>
          ) : (
            <InnerList quotes={quotes} title={title} dropProvided={dropProvided} />
          )}
          {
            isAdd ?
              <div style={{padding:'10px', border:'1px solid #aaa', background:'#fff', borderRadius:'8px'}}>
                <label htmlFor=''>Title</label>
                <input
                  onChange={(e)=>{setAddTitle(e.target.value)}}
                  name={'title'}
                  style={{width:'100%', borderRadius:'4px', padding:'4px 12px'}}
                  type='text' />
                <label htmlFor=''>Description</label>
                <input
                  onChange={(e)=>{setAddDescription(e.target.value)}}
                  name={'content'}
                  style={{width:'100%', borderRadius:'4px', padding:'4px 12px'}}
                  type='text' />
                <div style={{marginTop:'8px', display:'flex', justifyContent:'space-between'}}>
                  <button onClick={(e)=>addCardFunc(e)} type={'submit'} disabled={addTitle.length < 1} className={addTitle.length < 1 ? "disabled-button":''} style={{border:'none', background:'#00A000', color:'#fff', padding:'4px 20px', display:'inline-block', borderRadius:'4px'}}>add</button>
                  <button onClick={()=>cancelAddCard()} style={{border:'none', background:'red', color:'#fff', padding:'4px 20px', display:'inline-block', borderRadius:'4px'}}>cancel</button>
                </div>
              </div>
              :
              <button onClick={()=>setIsAdd(true)} style={{margin:'20px 0', background:'white', borderRadius:'8px', border:'1px solid #aaa', color:'#00A000'}}>Add card</button>

          }
        </Wrapper>

      )}
    </Droppable>
  );
}
