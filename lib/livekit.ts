import crypto from "node:crypto";

type LiveKitVideoGrant = {
  room?: string;
  roomJoin?: boolean;
  roomCreate?: boolean;
  roomAdmin?: boolean;
  roomList?: boolean;
  canPublish?: boolean;
  canSubscribe?: boolean;
  canPublishData?: boolean;
};

function base64UrlEncode(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function signHs256(payload: Record<string, unknown>, secret: string) {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac("sha256", secret)
    .update(signingInput)
    .digest();

  return `${signingInput}.${base64UrlEncode(signature)}`;
}

export function createLiveKitParticipantToken(params: {
  identity: string;
  name: string;
  room: string;
  metadata?: string;
  ttlSeconds?: number;
}) {
  const { identity, name, room, metadata = "", ttlSeconds = 60 * 60 * 2 } = params;
  const now = Math.floor(Date.now() / 1000);
  const apiKey = process.env.LIVEKIT_API_KEY!;
  const apiSecret = process.env.LIVEKIT_API_SECRET!;

  const payload = {
    iss: apiKey,
    sub: identity,
    iat: now,
    nbf: now - 10,
    exp: now + ttlSeconds,
    name,
    metadata,
    video: {
      room,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    } as LiveKitVideoGrant,
  };

  return signHs256(payload, apiSecret);
}

function createLiveKitServerToken() {
  const now = Math.floor(Date.now() / 1000);
  const apiKey = process.env.LIVEKIT_API_KEY!;
  const apiSecret = process.env.LIVEKIT_API_SECRET!;
  const payload = {
    iss: apiKey,
    sub: "server-backend",
    iat: now,
    nbf: now - 10,
    exp: now + 60 * 5,
    video: {
      roomCreate: true,
      roomAdmin: true,
      roomList: true,
    } as LiveKitVideoGrant,
  };

  return signHs256(payload, apiSecret);
}

function getApiBase() {
  const host = process.env.LIVEKIT_URL || "";
  return host.replace(/^wss:\/\//, "https://").replace(/^ws:\/\//, "http://");
}

async function livekitPost<T>(path: string, body: Record<string, unknown>) {
  const token = createLiveKitServerToken();
  const res = await fetch(`${getApiBase()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LiveKit API ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

export async function createLiveKitRoom(name: string) {
  return livekitPost("/twirp/livekit.RoomService/CreateRoom", {
    name,
    empty_timeout: 60 * 15,
  });
}

export async function listLiveKitRooms() {
  const data = await livekitPost<{ rooms?: Array<{ name: string }> }>(
    "/twirp/livekit.RoomService/ListRooms",
    {}
  );
  return data.rooms || [];
}
