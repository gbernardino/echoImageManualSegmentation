import React from "react";
import * as ReactDOMClient from 'react-dom/client';
import "./styles.css";


import App from "./components/App";

//const rootElement = document.getElementById("root");
//ReactDOM.render(<App />, rootElement);

const container = document.getElementById('root');

// Create a root.
const root = ReactDOMClient.createRoot(container);
// Initial render: Render an element to the root.
root.render(<App />);