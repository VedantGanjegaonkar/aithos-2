import { AccessToken, RoomServiceClient, type VideoGrant } from "livekit-server-sdk";
import { RoomAgentDispatch, RoomConfiguration } from "@livekit/protocol";

type ParticipantTokenParams = {
  identity: string;
  name: string;
  room: string;
  metadata?: string;
  agentName?: string;
  ttl?: string;
};

const livekitHost = process.env.LIVEKIT_URL!;
const livekitApiKey = process.env.LIVEKIT_API_KEY!;
const livekitApiSecret = process.env.LIVEKIT_API_SECRET!;

const roomService = new RoomServiceClient(livekitHost, livekitApiKey, livekitApiSecret);

export async function createLiveKitParticipantToken({
  identity,
  name,
  room,
  metadata = "",
  agentName = process.env.LIVEKIT_AGENT_NAME || "Finley-1b19",
  ttl = "2h",
}: ParticipantTokenParams) {
  const accessToken = new AccessToken(livekitApiKey, livekitApiSecret, {
    identity,
    name,
    metadata,
    ttl,
  });

  const videoGrant: VideoGrant = {
    room,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  };
  accessToken.addGrant(videoGrant);

  accessToken.roomConfig = new RoomConfiguration({
    agents: [
      new RoomAgentDispatch({
        agentName,
        metadata,
      }),
    ],
  });

  return accessToken.toJwt();
}

export async function createLiveKitRoom(name: string) {
  return roomService.createRoom({
    name,
    emptyTimeout: 60 * 15,
  });
}

export async function listLiveKitRooms() {
  return roomService.listRooms();
}
