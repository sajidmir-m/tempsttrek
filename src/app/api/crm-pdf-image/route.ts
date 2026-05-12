import { NextRequest, NextResponse } from 'next/server';

function allowedSupabaseHost(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return null;
  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
}

/**
 * Same-origin proxy for itinerary images so html2canvas can rasterize without CORS taint.
 * Only fetches URLs on the configured Supabase project host (SSRF-safe).
 */
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('url');
  if (!raw || raw.length > 8000) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 });
  }

  if (target.protocol !== 'https:' && target.protocol !== 'http:') {
    return NextResponse.json({ error: 'Invalid protocol' }, { status: 400 });
  }

  const allowed = allowedSupabaseHost();
  if (!allowed || target.hostname !== allowed) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const upstream = await fetch(target.toString(), {
      redirect: 'follow',
      headers: { Accept: 'image/*,*/*' },
      next: { revalidate: 3600 },
    });
    if (!upstream.ok) {
      return NextResponse.json({ error: 'Upstream failed' }, { status: 502 });
    }
    const buf = await upstream.arrayBuffer();
    const ct = upstream.headers.get('content-type') || 'application/octet-stream';
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': ct.startsWith('image/') ? ct : 'application/octet-stream',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Fetch failed' }, { status: 502 });
  }
}
