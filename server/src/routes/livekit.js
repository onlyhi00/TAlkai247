import { AccessToken } from "livekit-server-sdk";
import { Router } from "express";
import dotenv from "dotenv";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middleware/auth.js";
import initializeAgent from "../lib/agent.js";

dotenv.config();

const router = Router();

const LiveKit_API = process.env.LIVEKIT_API_KEY;
const LiveKit_SECRET = process.env.LIVEKIT_API_SECRET;
const LiveKit_wsUrl = process.env.LIVEKIT_SERVER_URL;

router.post("/getToken", authenticate, async (req, res) => {
  const { assistantName } = req.body;
  const participantName = req.user.name;
  const roomName = `room-${participantName}-${assistantName}`;

  try {
    const at = new AccessToken(LiveKit_API, LiveKit_SECRET, {
      identity: participantName,
      ttl: "10m",
    });
    at.addGrant({ roomJoin: true, room: roomName });

    const token = await at.toJwt();
    res.json({ success: true, data: token, roomName });
  } catch (error) {
    console.error("LiveKit Get Token: ", error);
    res.status(500).json({
      success: false,
      error: {
        code: "LIVEKIT_TOKEN",
        message: "Failed to get token for room",
      },
    });
  }
});

export default router;
