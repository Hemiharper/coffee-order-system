import CoffeeOrderSystem from "./components/CoffeeOrderSystem";

const isBarista = window.location.pathname === "/baristaview";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CoffeeOrderSystem role={isBarista ? "barista" : "customer"} />
  </React.StrictMode>
);
