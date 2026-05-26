import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.warn("SLACK_WEBHOOK_URL is not configured.");
      return NextResponse.json({ success: false, error: "Not configured" }, { status: 500 });
    }

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: message,
        channel: "#policat"
      })
    });

    if (!res.ok) {
      throw new Error(`Slack API error: ${res.statusText}`);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Failed to send message" }, { status: 500 });
  }
}
