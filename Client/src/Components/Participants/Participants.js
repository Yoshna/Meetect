import classes from "./Participants.module.css";
const Participants = ({ participantsList }) => {
  console.log(participantsList);
  let participants = null;
  if (participantsList.length > 0) {
    participants = participantsList.map((participant, i) => {
      return <li key={i}>{participant}</li>;
    });
  }
  return (
    <div className={classes.chatSidebar}>
      <h2>Participants</h2>
      {participants}
    </div>
  );
};

export default Participants;
