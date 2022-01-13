import React from "react";
import Toolbar from "../Toolbar/Toolbar";
const Layout = (props) => {
  return (
    <React.Fragment>
      <Toolbar></Toolbar>
      <main>{props.children}</main>
    </React.Fragment>
  );
};

export default Layout;
