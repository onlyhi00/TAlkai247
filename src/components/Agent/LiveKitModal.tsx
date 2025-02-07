import { useState, useCallback } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  StartAudio,
} from "@livekit/components-react";
import "@livekit/components-styles";

const LiveKitModal = (serverUrl: string, token: string) => {
  console.log("serverUrl", serverUrl);
  console.log("token", token);
  return (
    <>
      <LiveKitRoom
        serverUrl={serverUrl}
        token={token}
        connect={true}
        audio={true}
        video={false}
      >
        <RoomAudioRenderer />
      </LiveKitRoom>
    </>
  );
};

export default LiveKitModal;
