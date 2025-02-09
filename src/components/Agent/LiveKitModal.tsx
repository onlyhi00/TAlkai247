import { useState, useCallback } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  StartAudio,
} from "@livekit/components-react";
import "@livekit/components-styles";
import VoiceAssistant from "./VoiceAssitant";

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
        <div className="flex flex-col h-full">
          <p>serverUrl: {serverUrl}</p>
          <p>token: {token}</p>
          <RoomAudioRenderer />
          <VoiceAssistant />
        </div>

      </LiveKitRoom>

    </>
  );
};

export default LiveKitModal;
