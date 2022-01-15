import { useState } from "react";
import {
  MdCallEnd,
  MdMic,
  MdMicOff,
  MdVideocam,
  MdVideocamOff,
  MdScreenShare,
  MdStopScreenShare,
  MdVideoLabel,
  MdCamera,
} from "react-icons/md";
import ConversationButton from "./ConversationButton/ConversationButton";

const styles = {
  buttonContainer: {
    display: "flex",
    position: "absolute",
    bottom: "22%",
    left: "35%",
  },
  icon: {
    width: "25px",
    height: "25px",
    fill: "#e6e5e8",
  },
};

const ConversationButtons = (props) => {
  //   const [localMicrophoneEnabled, setLocalMicrophoneEnabled] = useState(false);
  //   const [localCameraEnabled, setLocalCameraEnabled] = useState(true);

  //   const handleMicButtonPressed = () => {
  //     const micEnabled = localMicrophoneEnabled;
  //     // localStream.getAudioTracks()[0].enabled = !micEnabled;
  //     setLocalMicrophoneEnabled(!micEnabled);
  //   };

  //   const handleCameraButtonPressed = () => {
  //     const cameraEnabled = localCameraEnabled;
  //     // localStream.getVideoTracks()[0].enabled = !cameraEnabled;
  //     setLocalCameraEnabled(!cameraEnabled);
  //   };

  //   const handleScreenSharingButtonPressed = () => {
  //     switchForScreenSharingStream();
  //   };

  //   const handleHangUpButtonPressed = () => {
  //     hangUp();
  //   };

  return (
    <div style={styles.buttonContainer}>
      <ConversationButton onClickHandler={props.micStateChange}>
        {props.localMicrophoneEnabled ? (
          <MdMic style={styles.icon} />
        ) : (
          <MdMicOff style={styles.icon} />
        )}
      </ConversationButton>
      {/* {!groupCall && (
        <ConversationButton onClickHandler={handleHangUpButtonPressed}>
          <MdCallEnd style={styles.icon} />
        </ConversationButton>
      )} */}
      <ConversationButton onClickHandler={props.videoStateChange}>
        {props.localCameraEnabled ? (
          <MdVideocam style={styles.icon} />
        ) : (
          <MdVideocamOff style={styles.icon} />
        )}
      </ConversationButton>
      <ConversationButton onClickHandler={props.ScreenShareStateChange}>
        {props.screenSharingActive ? (
          <MdScreenShare style={styles.icon} />
        ) : (
          <MdStopScreenShare style={styles.icon} />
        )}
      </ConversationButton>
    </div>
  );
};

export default ConversationButtons;
