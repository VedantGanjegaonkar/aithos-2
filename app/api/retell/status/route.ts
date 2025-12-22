import { NextResponse } from 'next/server';
import Retell from 'retell-sdk';

const retell = new Retell({ 
  apiKey: process.env.RETELL_API_KEY || '' 
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const callId = searchParams.get('callId');

    // SCENARIO A: Specific Call Status
    if (callId) {
      const callResponse = await retell.call.retrieve(callId);
      console.log(`[RETELL LOG] Status for ${callId}: ${callResponse.call_status}`);
      return NextResponse.json({ call_status: callResponse.call_status });
    }

    // SCENARIO B: Concurrency Check
    console.log("--- 🎙️ RETELL CONCURRENCY CHECK START ---");
    
    const allCalls = await retell.call.list({ limit: 50 });
    const ongoingCalls = allCalls.filter(call => call.call_status === "ongoing");
    
    const ongoingCount = ongoingCalls.length;
    const MAX_CONCURRENCY = 10; // Change this to 0 if you want to test the "Busy" error!

    // LOGS FOR TERMINAL
    console.log(`Active Agents: ${ongoingCount}`);
    console.log(`System Status: ${ongoingCount < MAX_CONCURRENCY ? "✅ AVAILABLE" : "❌ BUSY"}`);
    console.log("--- 🎙️ RETELL CONCURRENCY CHECK END ---");

    return NextResponse.json({ 
      canStart: ongoingCount < MAX_CONCURRENCY,
      ongoingCount: ongoingCount,
      limit: MAX_CONCURRENCY
    });

  } catch (err: any) {
    console.error('❌ Retell API Error:', err.message);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}