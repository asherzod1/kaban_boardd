import React from "react";
import { Row, Col, Card, CardBody } from "reactstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Board from "./dnd/board/Board";
import "./styles.css"
export default function App() {

  return (
    <>
      <Row className="justify-content-center text-center">
        <Col xs={12}>
          <Card>
            <CardBody>
              <h2>Abdumutalov Sherzod's Kaban board</h2>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Board
        withScrollableColumns
      />
    </>
  );
}
