import { NextResponse } from 'next/server';
import Retell from 'retell-sdk';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const callId = searchParams.get('callId');
    if (!callId) {
      return NextResponse.json({ error: 'missing callId' }, { status: 400 });
    }

    const retell = new Retell({ apiKey: process.env.RETELL_API_KEY! });
    const callResponse = await retell.call.retrieve(callId);

    return NextResponse.json({ call_status: callResponse.call_status });
  } catch (err: any) {
    console.error('retell status error', err);
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
