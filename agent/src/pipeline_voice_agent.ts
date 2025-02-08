// SPDX-FileCopyrightText: 2024 LiveKit, Inc.
//
// SPDX-License-Identifier: Apache-2.0
import type { JobProcess } from "@livekit/agents";
import {
  AutoSubscribe,
  type JobContext,
  WorkerOptions,
  cli,
  defineAgent,
  llm,
  pipeline,
} from "@livekit/agents";
import * as deepgram from "@livekit/agents-plugin-deepgram";
import * as openai from "@livekit/agents-plugin-openai";
import * as silero from "@livekit/agents-plugin-silero";
import * as cartesia from "@livekit/agents-plugin-cartesia";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

export default defineAgent({
  prewarm: async (proc: JobProcess) => {
    proc.userData.vad = await silero.VAD.load();
  },
  entry: async (ctx: JobContext) => {
    const vad = ctx.proc.userData.vad! as silero.VAD;
    const initialContext = new llm.ChatContext().append({
      role: llm.ChatRole.SYSTEM,
      text:
        "You are a voice assistant created by LiveKit. Your interface with users will be voice. " +
        "You should use short and concise responses, and avoiding usage of unpronounceable " +
        "punctuation.",
    });

    await ctx.connect(undefined, AutoSubscribe.SUBSCRIBE_ALL);
    console.log("waiting for participant", ctx.room);
    const participant = await ctx.waitForParticipant();
    console.log(`starting assistant example agent for ${participant.identity}`);

    const fncCtx: llm.FunctionContext = {
      weather: {
        description: "Get the weather in a location",
        parameters: z.object({
          location: z.string().describe("The location to get the weather for"),
        }),
        execute: async ({ location }) => {
          console.debug(`executing weather function for ${location}`);
          const response = await fetch(
            `https://wttr.in/${location}?format=%C+%t`
          );
          if (!response.ok) {
            throw new Error(`Weather API returned status: ${response.status}`);
          }
          const weather = await response.text();
          return `The weather in ${location} right now is ${weather}.`;
        },
      },
    };

    const truncateContext = async (
      agent: pipeline.VoicePipelineAgent,
      chatCtx: llm.ChatContext
    ) => {
      if (chatCtx.messages.length > 15) {
        chatCtx.messages = chatCtx.messages.slice(-15);
      }
    };

    const agent = new pipeline.VoicePipelineAgent(
      vad,
      new deepgram.STT(),
      new openai.LLM(),
      new cartesia.TTS(),
      {
        chatCtx: initialContext,
        fncCtx,
        allowInterruptions: true,
        interruptSpeechDuration: 500,
        interruptMinWords: 0,
        minEndpointingDelay: 500,
        beforeLLMCallback: truncateContext,
        // beforeTTSCallback: undefined,
      }
    );

    agent.start(ctx.room, participant);

    agent.on(
      pipeline.VPAEvent.USER_SPEECH_COMMITTED,
      (msg: llm.ChatMessage) => {
        // convert string lists to string, drop images
        if (Array.isArray(msg.content)) {
          msg.content = msg.content.map((x) =>
            typeof x === "string" ? x : "[image]"
          );
        }
        console.log(`[${Date.now()}] USER: \n${msg.content}\n\n`);
      }
    );

    agent.on(
      pipeline.VPAEvent.AGENT_SPEECH_COMMITTED,
      (msg: llm.ChatMessage) => {
        console.log(`[${Date.now()}] AGENT: \n${msg.content}\n\n`);
      }
    );

    // Add connection error handling
    ctx.room.on("disconnected", () => {
      console.log("Room disconnected, attempting to reconnect...");
      ctx
        .connect(undefined, AutoSubscribe.SUBSCRIBE_ALL)
        .catch((err) => console.error("Reconnection failed:", err));
    });

    ctx.room.on("connectionQualityChanged", () => {
      console.log("Connection quality changed");
    });

    await agent.say("Hey, how can I help you today", true);
  },
});

cli.runApp(new WorkerOptions({ agent: fileURLToPath(import.meta.url) }));
