import { RoomAgentDispatch, RoomConfiguration } from "@livekit/protocol";
import { AccessToken, RoomServiceClient, type VideoGrant } from "livekit-server-sdk";

function getApiBase() {
  const host = process.env.LIVEKIT_URL || "";
  return host.replace(/^wss:\/\//, "https://").replace(/^ws:\/\//, "http://");
}

function getRoomServiceClient() {
  const apiKey = process.env.LIVEKIT_API_KEY!;
  const apiSecret = process.env.LIVEKIT_API_SECRET!;
  return new RoomServiceClient(getApiBase(), apiKey, apiSecret);
}

export async function createLiveKitParticipantToken(params: {
  identity: string;
  name: string;
  room: string;
  metadata?: string;
  agentName?: string;
  ttlSeconds?: number;
}) {
  const { identity, name, room, metadata = "", agentName = "" } = params;
  const apiKey = process.env.LIVEKIT_API_KEY!;
  const apiSecret = process.env.LIVEKIT_API_SECRET!;

  const at = new AccessToken(apiKey, apiSecret, {
    identity,
    name,
    metadata,
  });

  const videoGrant: VideoGrant = {
    room,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  };

  at.addGrant(videoGrant);

  if (agentName.trim()) {
    at.roomConfig = new RoomConfiguration({
      agents: [
        new RoomAgentDispatch({
          agentName,
          metadata,
        }),
      ],
    });
  }

  return at.toJwt();
}

export async function createLiveKitRoom(name: string) {
  const roomService = getRoomServiceClient();
  return roomService.createRoom({
    name,
    emptyTimeout: 60 * 15,
  });
}

export async function listLiveKitRooms() {
  const roomService = getRoomServiceClient();
  const data = await roomService.listRooms([]);
  return data;
}
