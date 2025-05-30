import React from "react";
import ReactDOM from "react-dom/client";
import CoffeeOrderSystem from "./components/CoffeeOrderSystem";
import "./index.css";

const isBarista = window.location.pathname === "/baristaview";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CoffeeOrderSystem role="barista" />
  </React.StrictMode>
);
