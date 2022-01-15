import classes from "./VideoCall.module.css";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import ConversationButtons from "../ConversationButtons/ConversationButtons";
import Peer from "peerjs";
import io from "socket.io-client";
import { MdStopScreenShare } from "react-icons/md";

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
          peers[call.peer] = call;
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
            const divElement = document.getElementById("video-element-wrapper");
            const ssElement = document.getElementById("ssclose");
            divElement.removeChild(ssElement);

            //videoElement.remove();
          });

          call.on("close", () => {
            console.log("close call");
            videoElement.remove();
          });
        });

        socket.on("user-connected", (userId, isSs) => {
          // console.log("user-connected", userId);
          // console.log(isSs);
          // if (isSs) {
          //   console.log("user-connect", userId);
          //   screenShare(screenSharingActive);
          // } else {
          connectToNewUser(userId, stream);
          // }
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
      currPeer = call.peerConnection;
      console.log(currPeer);
    });

    call.on("close", () => {
      videoElement.remove();
    });

    peers[userId] = call;
    console.log(peers);
  };

  const handleCameraButtonPressed = () => {
    console.log("gdujgvgdb");
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
    // if (!ssEnabled) {
    //   const ssPeer = new Peer();
    //   ssPeer.on("open", (id) => {
    //     console.log(roomId, id);
    //     // console.log(peerId);
    //     setssPeerId(id);
    //     const isSs = true;
    //     socket.emit("joinRoom", roomId, id, isSs);
    //   });
    // } else {
    //   screenShare(ssEnabled);
    // }
    // screenShare(ssEnabled);
    // setScreenSharingActive(!ssEnabled);
  };

  const screenShare = async (ssEnabled) => {
    const videoElement = document.createElement("video");
    videoElement.setAttribute("id", "ss");
    if (ssEnabled) {
      ssStream.getVideoTracks()[0].enabled = !ssEnabled;
      // videoElement.pause();
      // videoElement.removeAttribute("src"); // empty source
      // videoElement.load();
      // const participants =  Object.values(peers)
      // participants.forEach(calls => {

      // })
      // if (peers[userId]) {
      //   peers[userId].close();
      //   // delete peers.userId;
      //   delete peers[userId];
      // }
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
          stopScreenShare(videoElement);
          //call.close();
        };
      });
      // console.log(currPeer);
      // let sender = currPeer.getSenders().find((s) => {
      //   return s.track.kind === vidTrack.kind;
      // });
      // sender.replaceTrack(vidTrack);
      // // sender[1].close();
      // console.log(sender);

      setSsStream(stream);
      addVideoStream(videoElement, stream);
    }
  };

  const stopScreenShare = (videoElement) => {
    videoElement.remove();
  };

  return (
    <div className={classes.Header}>
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
  );
};

export default VideoCall;
