// aiAgent.js
import {
  llm,
  pipeline,
} from '@livekit/agents';
import * as deepgram from '@livekit/agents-plugin-deepgram';
import * as openai from '@livekit/agents-plugin-openai';
import * as silero from '@livekit/agents-plugin-silero';

// Function to initialize the AI agent
async function initializeAgent(ctx, participant) {
  const initialContext = new llm.ChatContext().append({
    role: llm.ChatRole.SYSTEM,
    text: 'You are a helpful voice assistant. How can I assist you today?'
  });

  const agent = new pipeline.VoicePipelineAgent(
    await silero.VAD.load(),
    new deepgram.STT({ model: 'nova-2-general' }),
    new openai.LLM({ model: 'gpt-4o' }), // Specify your OpenAI model here
    new openai.TTS(), // Use OpenAI for Text-to-Speech
    {
      chatCtx: initialContext,
      allowInterruptions: true,
      interruptSpeechDuration: 500,
      interruptMinWords: 0,
      minEndpointingDelay: 500,
      beforeLLMCallback: async (transcript) => {
        console.log('Transcribed Text:', transcript);
      },
      beforeTTSCallback: undefined,
    },
  );

  // Start the agent for a particular room
  agent.start(ctx.room, participant);
}

// Export the function to use in your application
export default initializeAgent;
