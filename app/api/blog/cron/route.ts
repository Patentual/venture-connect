import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const origin = new URL(request.url).origin;

  const res = await fetch(`${origin}/api/blog/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-secret': process.env.BLOG_GENERATE_SECRET || '',
    },
    body: JSON.stringify({ topicCount: 3 }),
  });

  const data = await res.json();
  return NextResponse.json(data);
}
