import { NextResponse } from 'next/server';
import { listLiveKitRooms } from "@/lib/livekit";
const MAX_CONCURRENCY = 5;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const callId = searchParams.get('callId');

    // SCENARIO A: Specific Call Status
    if (callId) {
      const rooms = await listLiveKitRooms();
      const roomExists = rooms.some((room) => room.name === callId);
      return NextResponse.json({ call_status: roomExists ? "ongoing" : "ended" });
    }

    // SCENARIO B: Concurrency Check
    console.log("--- 🎙️ LIVEKIT CONCURRENCY CHECK START ---");
    
    const rooms = await listLiveKitRooms();
    const ongoingCount = rooms.length;

    // LOGS FOR TERMINAL
    console.log(`Active Agents: ${ongoingCount}`);
    console.log(`System Status: ${ongoingCount < MAX_CONCURRENCY ? "✅ AVAILABLE" : "❌ BUSY"}`);
    console.log("--- 🎙️ LIVEKIT CONCURRENCY CHECK END ---");

    return NextResponse.json({ 
      canStart: ongoingCount < MAX_CONCURRENCY,
      ongoingCount: ongoingCount,
      limit: MAX_CONCURRENCY
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error('❌ LiveKit API Error:', message);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
