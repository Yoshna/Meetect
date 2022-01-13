import classes from "./Main.module.css";
import Modal from "../Modal/Modal";
import { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";

const Main = (props) => {
  const [modalShow, setModalShow] = useState(false);
  const [createRoom, setCreateRoom] = useState(false);
  const [joinRoom, setJoinRoom] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const navigate = useNavigate();

  const createRoomHandler = async () => {
    const res = await axios.get("/api/roomid");
    // console.log(res);
    setRoomId(res.data);
    setModalShow(true);
    setCreateRoom(true);
  };

  const joinRoomHandler = () => {
    setModalShow(true);
    setJoinRoom(true);
  };

  const sendCodeHandler = async () => {
    if (roomCode) {
      //await axios.post("/api/roomid", roomCode);
      navigate(`/video/${roomCode}`);
    }
    if (roomId) {
      navigate(`/video/${roomId}`);
    }
  };

  let modal = null;
  if (modalShow) {
    if (createRoom) {
      const para = (
        <>
          <p>Room code: {roomId}</p>
          <button onClick={sendCodeHandler}>Done</button>
        </>
      );
      modal = <Modal show>{para}</Modal>;
    }
    if (joinRoom) {
      const input = (
        <>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            placeholder="Enter Room Code"
          />
          <button onClick={sendCodeHandler}>Done</button>
        </>
      );
      modal = <Modal show>{input}</Modal>;
    }
  }

  return (
    <div className={classes.Header}>
      {modal}
      <button onClick={createRoomHandler}>Create a Room</button>
      <button onClick={joinRoomHandler}>Join a Room</button>
    </div>
  );
};

export default Main;
