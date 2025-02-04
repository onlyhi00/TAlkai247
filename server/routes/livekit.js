import { AccessToken } from "livekit-server-sdk";
import { Router } from "express";
import dotenv from "dotenv";
import { prisma } from "../src/lib/prisma.js";

dotenv.config();

const router = Router();

const LiveKit_API = process.env.LIVEKIT_API_KEY;
const LiveKit_SECRET = process.env.LIVEKIT_API_SECRET;
const LiveKit_wsUrl = process.env.LIVEKIT_SERVER_URL;

router.get("/token", async (req, res) => {
  const user = await prisma.user.findFirst();
  if (!user) {
    return res.status(400).json({
      success: false,
      error: {
        code: "NO_USER_FOUND",
        message: "No user found in the database. Please create a user first.",
      },
    });
  }
  const userId = user.id;

  const assistant = await prisma.assistant.findFirst({
    where: {
      userId: userId,
    },
  });
  if (!assistant) {
    return res.status(400).json({
      success: false,
      error: {
        code: "NO_ASSISTANT_FOUND",
        message:
          "No assistant found in the database. Please create an assistant first.",
      },
    });
  }
  const room = assistant.id;

  try {
    const token = new AccessToken(LiveKit_API, LiveKit_SECRET, {
      identity: userId,
      ttl: "10m",
    });
    token.addGrant({
      room: room,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    res.status(200).json({ success: true, data: await token.toJwt() });
  } catch (error) {
    console.error("Error generating token:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
