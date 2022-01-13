import classes from "./Toolbar.module.css";
const Toolbar = (props) => {
  return (
    <div>
      <header className={classes.Toolbar}>
        <div className={classes.Logo}>
          <span>Meetect</span>
        </div>
      </header>
    </div>
  );
};
export default Toolbar;
