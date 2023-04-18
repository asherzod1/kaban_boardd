import React from "react";
import styled from "@xstyled/styled-components";
import { grid, borderRadius } from "../styles/constants";
import { Draggable } from "react-beautiful-dnd";
import QuoteList from "../styles/list";
import Title from "../styles/title";
import axios from 'axios';
import toast from 'react-hot-toast';

const Container = styled.div`
  margin: ${grid}px;
  display: flex;
  flex-direction: column;
  //border: 1px solid black;
  border-radius: 10px;
`;

const Header = styled.div`
  border-bottom: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top-left-radius: ${borderRadius}px;
  border-top-right-radius: ${borderRadius}px;
  background-color: ${({ isDragging }) =>
    isDragging ? "#E3FCEF" : "#EBECF0"};
  transition: background-color 0.2s ease;
  &:hover {
    background-color: #E3FCEF;
  }
`;

const Column = (props) => {
  const title = props.title;
  const quotes = props.quotes;
  const index = props.index;
  const id = props.id;
  const onDragStart = (e)=>{
    console.log("onDragStart", e);
  }

  const deleteColumn = ()=>{
    axios.delete(`http://localhost:3000/boards1/${id}/`).then(()=>{
      props.setNeedReload(true);
      toast.success('Column deleted successfully');
    })
  }

  return (
    <Draggable draggableId={title} index={index} onDragStart={(e)=>onDragStart(e)}>
      {(provided, snapshot) => (
        <Container ref={provided.innerRef} {...provided.draggableProps}>
          <Header isDragging={snapshot.isDragging}>
            <Title
              isDragging={snapshot.isDragging}
              {...provided.dragHandleProps}
              aria-label={`${title} quote list`}
            >
              {title}
            </Title>
            <button onClick={()=>deleteColumn()} style={{width:'20px', color:'red', outline:'none', border:'none', marginRight:'5px'}}>x</button>
          </Header>
          <QuoteList
            columnId={id}
            listId={title}
            needReload={props.needReload}
            setNeedReload={props.setNeedReload}
            listType="QUOTE"
            style={{
              backgroundColor: snapshot.isDragging ? "#E3FCEF" : null
            }}
            quotes={quotes}
            internalScroll={props.isScrollable}
            isCombineEnabled={Boolean(props.isCombineEnabled)}
            useClone={Boolean(props.useClone)}
          />
        </Container>
      )}
    </Draggable>
  );
};

export default Column;
