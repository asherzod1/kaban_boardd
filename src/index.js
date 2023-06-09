import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Toaster } from 'react-hot-toast';

const rootElement = document.getElementById("root");
ReactDOM.render(
  <React.StrictMode>
    <App />
    <Toaster/>
  </React.StrictMode>,
  rootElement
);
