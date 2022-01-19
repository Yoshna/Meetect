import classes from "./VideoCall.module.css";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import ConversationButtons from "../ConversationButtons/ConversationButtons";
import Peer from "peerjs";
import io from "socket.io-client";
import { MdStopScreenShare } from "react-icons/md";
// import GroupChat from "../GroupChat/GroupChat";
import MessageFormat from "../MessageFormat/MessageFormat";
import Participants from "../Participants/Participants";
import moment from "moment";

const socket = io(`${process.env.REACT_APP_SERVER_URL}`);
const peers = {};
let currPeer;

const VideoCall = (props) => {
  const [peerId, setPeerId] = useState("");
  const [ssPeerId, setssPeerId] = useState("");
  const [localCameraEnabled, setLocalCameraEnabled] = useState(true);
  const [localMicrophoneEnabled, setLocalMicrophoneEnabled] = useState(true);
  const [screenSharingActive, setScreenSharingActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [ssStream, setSsStream] = useState(null);
  const [chat, setChat] = useState({ name: "", message: "" });
  const [chatLog, setChatLog] = useState([]);
  let { name } = useParams();
  const [peerNames, setPeerNames] = useState([]);
  const peerInstance = useRef(null);
  // const chatBox = document.getElementById("chat-box");

  let { roomId } = useParams();
  // console.log(name);

  const myVideo = document.createElement("video");
  myVideo.muted = true;

  useEffect(() => {
    const peer = new Peer();

    peer.on("open", (id) => {
      setPeerId(id);
      console.log(roomId, id);
      // console.log(peerId);
      socket.emit("joinRoom", roomId, id, name);
    });

    let getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;
    getUserMedia(
      { video: true, audio: true },
      (stream) => {
        addVideoStream(myVideo, stream);

        setCameraStream(stream);
        const track = stream.getVideoTracks()[0];
        const isActive = stream.active;
        console.log(track, isActive);

        peer.on("call", (call) => {
          console.log(call);
          call.answer(stream, {
            sdpTransform: () => {
              console.log(1);
            },
          });
          // console.log(call.peer, "calllll");
          console.log("call incoming");
          if (peers[call.peer]) {
            peers["screenshare"] = call;
          } else {
            peers[call.peer] = call;
          }
          // setPeerNames((peerNames) => {
          //   let newPeerNames = [...peerNames];
          //   newPeerNames.push(name);
          //   return newPeerNames;
          // });
          console.log(peers);
          const videoElement = document.createElement("video");
          call.on("stream", (remoteStream) => {
            console.log(remoteStream);
            if (remoteStream.kind !== "video") {
              videoElement.setAttribute("id", "ssclose");
            }
            // remoteStream.getVideoTracks()[0].enabled = false;
            addVideoStream(videoElement, remoteStream);
            currPeer = call.peerConnection;
            console.log(currPeer);
          });
          socket.on("remoteSsClose", () => {
            // if (remoteStream.kind === "video") return;
            // const divElement = document.getElementById("video-element-wrapper");
            // const ssElement = document.getElementById("ssclose");
            // divElement.removeChild(ssElement);
            peers["screenshare"].close();

            //videoElement.remove();
          });

          call.on("close", () => {
            console.log("close call");
            videoElement.remove();
          });
        });

        socket.on("user-connected", (userId, name) => {
          connectToNewUser(userId, stream, name);
        });
      },
      (err) => {
        console.log("Failed to get local stream", err);
      }
    );

    socket.on("message", (name, msg) => {
      console.log("chatttt");
      console.log(chatLog);
      // let newChatLog = [...chatLog];
      // console.log(newChatLog);
      // newChatLog = newChatLog.concat([{ name: name, message: msg }]);
      // console.log(newChatLog);
      // chatBox.scrollTop = chatBox.scrollHeight;
      setChatLog((chatLog) => {
        let newChatLog = [...chatLog];
        newChatLog.push({ name: name, message: msg });
        return newChatLog;
      });
      const div_element = document.getElementById("chat-box");
      div_element.scrollTop = div_element.scrollHeight;
    });

    socket.on("roomUsers", (users) => {
      console.log(users);
      let newPeerNames = users.users.map((user) => user.name);
      console.log(newPeerNames);
      setPeerNames(newPeerNames);
    });

    socket.on("user-disconnected", (userId) => {
      console.log(userId, "okayyyyyy");

      if (peers[userId]) {
        console.log(peers, "peersbefore");
        peers[userId].close();
        // delete peers.userId;
        delete peers[userId];
        console.log(peers, "peersafter");
      }
      // console.log(peers);
    });
    peerInstance.current = peer;
  }, []);

  // console.log(peerNames);

  const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
    const divElement = document.getElementById("video-element-wrapper");
    if (divElement) divElement.appendChild(video);
  };

  const connectToNewUser = (userId, stream, name) => {
    const call = peerInstance.current.call(userId, stream);
    const videoElement = document.createElement("video");
    call.on("stream", (remoteStream) => {
      addVideoStream(videoElement, remoteStream);
      currPeer = call.peerConnection;
      console.log(currPeer);
    });

    call.on("close", () => {
      videoElement.remove();
    });

    peers[userId] = call;
    // setPeerNames((peerNames) => {
    //   let newPeerNames = [...peerNames];
    //   newPeerNames.push(name);
    //   return newPeerNames;
    // });

    console.log(peers);
  };

  const handleCameraButtonPressed = () => {
    // console.log("gdujgvgdb");
    const cameraEnabled = localCameraEnabled;
    cameraStream.getVideoTracks()[0].enabled = !cameraEnabled;
    setLocalCameraEnabled(!cameraEnabled);
  };

  const handleMicButtonPressed = () => {
    const micEnabled = localMicrophoneEnabled;
    cameraStream.getAudioTracks()[0].enabled = !micEnabled;
    setLocalMicrophoneEnabled(!micEnabled);
  };

  const handleScreenSharingButtonPressed = () => {
    const ssEnabled = screenSharingActive;
    console.log(ssEnabled);
    screenShare(ssEnabled);
    setScreenSharingActive(!ssEnabled);
  };

  const screenShare = async (ssEnabled) => {
    const videoElement = document.createElement("video");
    videoElement.setAttribute("id", "ss");
    if (ssEnabled) {
      console.log("ugghhhhhh");
      socket.emit("ssClose");

      // socket.emit("leaveRoom", ssPeerId);
      // console.log(ssEnabled);
      // setScreenSharingActive(!ssEnabled);
      videoElement.remove();
      const divElement = document.getElementById("video-element-wrapper");
      const ssElement = document.getElementById("ss");
      divElement.removeChild(ssElement);
    } else {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: "always",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      console.log(stream);
      const vidTrack = stream.getVideoTracks()[0];
      vidTrack.enabled = !ssEnabled;
      console.log(ssEnabled);
      // setScreenSharingActive(!ssEnabled);
      const participants = Object.keys(peers);
      participants.forEach((userid) => {
        const call = peerInstance.current.call(userid, stream);
        vidTrack.onended = () => {
          // peerInstance.current.call(userid, "screensharecancel");
          console.log("closeee");
          socket.emit("ssClose");
          stopScreenShare(videoElement);
          call.close();
        };
      });
      setSsStream(stream);
      addVideoStream(videoElement, stream);
    }
  };

  const stopScreenShare = (videoElement) => {
    videoElement.remove();
  };
  let renderChat = [];
  if (chatLog.length > 0) {
    console.log("renderchat");
    console.log(chatLog);
    renderChat = chatLog.map(({ name, message }, index) => {
      // console.log(time);
      const time = moment().format("h:mm a");
      return (
        <MessageFormat key={index} name={name} message={message} time={time} />
        // <div key={index}>
        //   <p>
        //     {name} <span>9:20pm</span>
        //   </p>
        //   <p>{message}</p>
        // </div>
      );
    });
    // console.log(renderChat);
  }

  const onMessageHandler = (e) => {
    setChat({ name: name, message: e.target.value });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    console.log(chat.name, chat.message);
    // const time = moment().format("h:mm a");
    // console.log(time);
    socket.emit("chatmessage", chat.name, chat.message);
    const inputfield = document.getElementById("message-input-field");
    inputfield.value = "";
  };

  return (
    <div className={classes.Header}>
      <div>
        <Participants participantsList={peerNames} />
      </div>
      <div>
        <div id="video-element-wrapper"></div>
        <ConversationButtons
          videoStateChange={handleCameraButtonPressed}
          localCameraEnabled={localCameraEnabled}
          micStateChange={handleMicButtonPressed}
          localMicrophoneEnabled={localMicrophoneEnabled}
          ScreenShareStateChange={handleScreenSharingButtonPressed}
          screenSharingActive={screenSharingActive}
        />
      </div>
      <div>
        <div className={classes.Box}>
          <h2>Meetect Chat</h2>
        </div>
        <div className={classes.Box} id="chat-box">
          {renderChat}
        </div>
        <div className={classes.Box}>
          <form onSubmit={submitHandler}>
            <input
              id="message-input-field"
              type="text"
              placeholder="Enter Message"
              // value={chat.message}
              onChange={onMessageHandler}
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
