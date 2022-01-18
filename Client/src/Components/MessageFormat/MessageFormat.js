import classes from "./MessageFormat.module.css";
const MessageFormat = ({ name, message, time }) => {
  return (
    <div className={classes.MessageBox}>
      {/* <div className={classes.otherMessageWrapper}> */}
      <p>
        {name}: <span>{time}</span>
      </p>
      <div className={classes.MessageLabel}>
        <p>{message}</p>
      </div>
      {/* </div> */}
    </div>
  );
};

export default MessageFormat;
