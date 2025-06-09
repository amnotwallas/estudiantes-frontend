import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";

function Layout() {
  return (
    <div className="container">
      <Navbar />
      <div className="container-content">
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
