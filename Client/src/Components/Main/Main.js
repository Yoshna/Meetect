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
  const [name, setName] = useState("");

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
      navigate(`/video/${roomCode}/${name}`);
    }
    if (roomId) {
      navigate(`/video/${roomId}/${name}`);
    }
  };

  const nameHandler = (e) => {
    setName(e.target.value);
  };

  let modal = null;
  if (modalShow) {
    if (createRoom) {
      const para = (
        <>
          <p>Room code: {roomId}</p>
          <input
            type="text"
            value={name}
            placeholder="Enter your name"
            onChange={nameHandler}
          />
          <div>
            <button onClick={sendCodeHandler}>Done</button>
          </div>
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
          <input
            type="text"
            value={name}
            placeholder="Enter your name"
            onChange={nameHandler}
          />
          <div>
            <button onClick={sendCodeHandler}>Done</button>
          </div>
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
