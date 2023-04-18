import React, { useEffect, useState } from 'react';
import styled from "@xstyled/styled-components";
import PropTypes from "prop-types";
import Column from "./Column";
import reorder, { reorderQuoteMap } from "../reorder";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import axios from 'axios';
import toast from 'react-hot-toast';
import {FidgetSpinner} from 'react-loader-spinner'

const Container = styled.div`
  padding-top: 40px;
  background-color: #00ffee;
  min-height: 100vh;
  min-width: 100vw;
  display: inline-flex;
`;

const Board = ({
  isCombineEnabled,
  useClone,
  containerHeight,
  withScrollableColumns
}) => {
  const [columns, setColumns] = useState({});
  const [dataFromJson, setDataFromJson] = useState({})
  const [ordered, setOrdered] = useState([]);
  const [needReload, setNeedReload] = useState(false);
  const [isError, setIsError] = useState(false)
  axios.interceptors.response.use(function (response) {

    return response;
  }, function (error) {
    if(error.code === "ERR_NETWORK"){
      setIsError(true)
    }
    return Promise.reject(error);
  });

  useEffect(()=>{
    axios.get('http://localhost:3000/boards1/').then(res=>{
      setDataFromJson(res.data)
      res.data.map((card)=>{
        ordered.push(card.name)
        columns[card.name] = card.data
      })
      setOrdered([...ordered])
      setColumns({...columns})
      if(localStorage.getItem("idForNew") === null){
        localStorage.setItem("idForNew", 10002)
      }
      if(localStorage.getItem("idForNewColumn") === null){
        localStorage.setItem("idForNewColumn", 500)
      }
    })
  },[])

  useEffect(()=>{
    if(needReload){
      axios.get('http://localhost:3000/boards1/').then(res=>{
        let newOrder = []
        let newColumns = {}
        setDataFromJson(res.data)
        res.data.map((card)=>{
          newOrder.push(card.name)
          newColumns[card.name] = card.data ? card.data : []
        })
        setOrdered(newOrder)
        setColumns(newColumns)
        setNeedReload(false)
      })
    }
  },[needReload])
  const onDragEnd = (result) => {
    if (result.combine) {
      if (result.type === "COLUMN") {
        const shallow = [...ordered];
        shallow.splice(result.source.index, 1);
        setOrdered(shallow);
        return;
      }

      const column = columns[result.source.droppableId];
      const withQuoteRemoved = [...column];

      withQuoteRemoved.splice(result.source.index, 1);

      const orderedColumns = {
        ...columns,
        [result.source.droppableId]: withQuoteRemoved
      };
      setColumns(orderedColumns);
      return;
    }

    // dropped nowhere
    if (!result.destination) {
      return;
    }

    const source = result.source;
    const destination = result.destination;

    // did not move anywhere - can bail early
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // reordering column
    if (result.type === "COLUMN") {
      const reorderedorder = reorder(ordered, source.index, destination.index);
      setOrdered(reorderedorder);

      return;
    }

    const data = reorderQuoteMap({
      quoteMap: columns,
      source,
      destination,
      dataFromJson
    });
    console.log("RESULT", result);
    setColumns(data.quoteMap);
  };

  const [isAddColumn, setIsAddColumn] = useState(false)
  const [addTitle, setAddTitle] = useState('')
  const addColumn = () => {
    if(addTitle !== ''){
      let postData = {
        id: localStorage.getItem("idForNewColumn"),
        name: addTitle,
        data: []
      }
      axios.post('http://localhost:3000/boards1/', postData).then(()=>{
        setIsAddColumn(false)
        setAddTitle('')
        setNeedReload(true)
        localStorage.setItem("idForNewColumn", parseInt(localStorage.getItem("idForNewColumn"))+1)
        toast.success('Column added successfully')
      })
    }
    else {
      toast.error("Please enter column Title")
    }
  }
  const cancelAddColumn = ()=>{
    setIsAddColumn(false)
    setAddTitle('')
  }

  return (
    <>
      {
        isError ? <h4 style={{marginTop:'20px', textAlign:'center', color:'red'}}>JSON-server error, Please run json-server on localhost:3000 </h4> :
        (ordered.length > 0 && columns) ?
          <div>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable
                droppableId="board"
                type="COLUMN"
                direction="horizontal"
                ignoreContainerClipping={Boolean(containerHeight)}
                isCombineEnabled={isCombineEnabled}
              >
                  {(provided) => (
                    <Container ref={provided.innerRef} {...provided.droppableProps}>
                      {ordered.map((key, index) => (
                        <Column
                          id={dataFromJson?.find((card)=>card.name===key)?.id}
                          needReload={needReload}
                          setNeedReload={setNeedReload}
                          key={key}
                          index={index}
                          title={key}
                          quotes={columns[key]}
                          isScrollable={withScrollableColumns}
                          isCombineEnabled={isCombineEnabled}
                          useClone={useClone}
                        />
                      ))}
                      {
                        isAddColumn ?
                          <div style={{paddingTop:'200px', width:'250px'}}>
                            <div style={{padding:'10px', border:'1px solid #aaa', background:'#fff', borderRadius:'8px'}}>
                              <label htmlFor=''>Title</label>
                              <input
                                onChange={(e)=>{setAddTitle(e.target.value)}}
                                name={'title'}
                                style={{width:'100%', borderRadius:'4px', padding:'4px 12px'}}
                                type='text' />
                              <div style={{marginTop:'8px', display:'flex', justifyContent:'space-between'}}>
                                <button onClick={(e)=>addColumn(e)} type={'submit'} style={{border:'none', background:'#00A000', color:'#fff', padding:'4px 20px', display:'inline-block', borderRadius:'4px'}}>add</button>
                                <button onClick={()=>cancelAddColumn()} style={{border:'none', background:'red', color:'#fff', padding:'4px 20px', display:'inline-block', borderRadius:'4px'}}>cancel</button>
                              </div>
                            </div>
                          </div>
                          :
                          <div style={{paddingTop:'200px', }}>
                            <button
                              onClick={()=>{setIsAddColumn(true)}}
                              style={{width:'250px', border:'1px solid #ddd', outline:'none', borderRadius:'8px', background:"#fff", height:'40px', cursor:'pointer', marginRight:'20px'}}
                            >Add Column</button>
                          </div>
                      }
                    </Container>
                  )}
              </Droppable>
            </DragDropContext>
          </div>
          :<div style={{display:"flex", justifyContent:'center', marginTop:'30px'}}>
            <FidgetSpinner
              visible={true}
              height="80"
              width="80"
              ariaLabel="dna-loading"
              wrapperStyle={{}}
              wrapperClass="dna-wrapper"
              ballColors={['#ff0000', '#00ff00', '#0000ff']}
              backgroundColor="#dedede"
            />
          </div>
      }
    </>
  );
};

Board.defaultProps = {
  isCombineEnabled: false
};

Board.propTypes = {
  isCombineEnabled: PropTypes.bool
};

export default Board;
