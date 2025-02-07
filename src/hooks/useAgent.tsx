import { createContext, useContext, ReactNode } from "react";
import { useVoiceAssistant } from "@livekit/components-react";
import { RemoteParticipant } from "livekit-client";

// Define the context type
interface AgentContextType {
  agent?: RemoteParticipant;
}

// Create the context
const AgentContext = createContext<AgentContextType | undefined>(undefined);

// Provider component
export const AgentProvider = ({ children }: { children: ReactNode }) => {
  const { agent } = useVoiceAssistant();

  return (
    <AgentContext.Provider value={{ agent }}>
      {children}
    </AgentContext.Provider>
  );
};

// Custom hook to use the AgentContext
export const useAgent = (): AgentContextType => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error("useAgent must be used within an AgentProvider");
  }
  return context;
};
