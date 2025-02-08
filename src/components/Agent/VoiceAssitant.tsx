import {
  useVoiceAssistant,
  BarVisualizer,
  VoiceAssistantControlBar,
  useTrackTranscription,
  useLocalParticipant,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { useEffect, useState } from "react";

const VoiceAssistant = () => {
  return (
    <div className="hidden">
      <VoiceAssistantControlBar />
    </div>
  );

};

export default VoiceAssistant;
