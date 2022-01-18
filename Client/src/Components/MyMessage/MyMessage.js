import React from "react";
import classes from "./MyMessage.module.css";
const MyMessage = ({ name, message }) => {
  return (
    <div id="my">
      <div className={classes.my - message - wrapper}>
        <p className={classes.format - name}>
          {name} : <span>9:20pm</span>
        </p>
        <div className={classes.my - message}>
          <p className="format">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default MyMessage;
