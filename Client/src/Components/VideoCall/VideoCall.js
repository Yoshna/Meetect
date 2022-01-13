import classes from "./VideoCall.module.css";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Peer from "peerjs";
import io from "socket.io-client";

const socket = io(`${process.env.REACT_APP_SERVER_URL}`);
const peers = {};

const VideoCall = (props) => {
  const [peerId, setPeerId] = useState("");
  const [remotePeerIdValue, setRemotePeerIdValue] = useState("");
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);
  const peerInstance = useRef(null);

  let { roomId } = useParams();

  const myVideo = document.createElement("video");
  myVideo.muted = true;
  // console.log(roomId);
  // console.log("okkkkkk");

  useEffect(() => {
    const peer = new Peer();

    peer.on("open", (id) => {
      setPeerId(id);
      console.log(roomId, id);
      // console.log(peerId);
      socket.emit("joinRoom", roomId, id);
    });

    // peer.on("call", (call) => {
    //   let getUserMedia =
    //     navigator.getUserMedia ||
    //     navigator.webkitGetUserMedia ||
    //     navigator.mozGetUserMedia;
    //   getUserMedia({ video: true, audio: true }, (stream) => {
    //     localVideoRef.current.srcObject = stream;
    //     localVideoRef.current.play();

    //     call.answer(stream);

    //     call.on("stream", (remoteStream) => {
    //       remoteVideoRef.current.srcObject = remoteStream;
    //       remoteVideoRef.current.play();
    //     });
    //   });
    // });
    let getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;
    getUserMedia(
      { video: true, audio: true },
      (stream) => {
        addVideoStream(myVideo, stream);

        peer.on("call", (call) => {
          call.answer(stream);
          // console.log(call.peer, "calllll");
          peers[call.peer] = call;
          console.log(peers);
          const videoElement = document.createElement("video");
          call.on("stream", (remoteStream) => {
            addVideoStream(videoElement, remoteStream);
          });

          call.on("close", () => {
            videoElement.remove();
          });
        });

        socket.on("user-connected", (userId) => {
          connectToNewUser(userId, stream);
        });
        // localVideoRef.current.srcObject = stream;
        // localVideoRef.current.play();
      },
      (err) => {
        console.log("Failed to get local stream", err);
      }
    );
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

  const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
    const divElement = document.getElementById("video-element-wrapper");
    if (divElement) divElement.appendChild(video);
  };

  const connectToNewUser = (userId, stream) => {
    const call = peerInstance.current.call(userId, stream);
    const videoElement = document.createElement("video");
    call.on("stream", (remoteStream) => {
      addVideoStream(videoElement, remoteStream);
    });

    call.on("close", () => {
      videoElement.remove();
    });

    peers[userId] = call;
    console.log(peers);
  };

  // const call = (remotePeerId) => {
  //   let getUserMedia =
  //     navigator.getUserMedia ||
  //     navigator.webkitGetUserMedia ||
  //     navigator.mozGetUserMedia;
  //   getUserMedia(
  //     { video: true, audio: true },
  //     (stream) => {
  //       localVideoRef.current.srcObject = stream;
  //       localVideoRef.current.play();

  //       const call = peerInstance.current.call(remotePeerId, stream);

  //       call.on("stream", (remoteStream) => {
  //         remoteVideoRef.current.srcObject = remoteStream;
  //         remoteVideoRef.current.play();
  //       });
  //     },
  //     (err) => {
  //       console.log("Failed to get local stream", err);
  //     }
  //   );
  // };

  // console.log(peerId);

  return (
    <div className={classes.Header}>
      {/* <input
        type="text"
        value={remotePeerIdValue}
        onChange={(e) => setRemotePeerIdValue(e.target.value)}
      />
      <button onClick={() => call(remotePeerIdValue)}>Call</button> */}
      <div id="video-element-wrapper"></div>
    </div>
  );
};

export default VideoCall;
