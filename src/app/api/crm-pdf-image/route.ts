import { NextRequest, NextResponse } from 'next/server';

function isAllowedHost(hostname: string): boolean {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (raw) {
    try {
      if (new URL(raw).hostname === hostname) return true;
    } catch {
      /* ignore */
    }
  }
  if (hostname.endsWith('.supabase.co')) return true;
  if (hostname === 'images.unsplash.com' || hostname.endsWith('.unsplash.com')) return true;
  if (hostname === 'images.pexels.com' || hostname.endsWith('.pexels.com')) return true;
  return false;
}

/**
 * Same-origin proxy for itinerary images so html2canvas can rasterize without CORS taint.
 * Only fetches URLs on configured Supabase or trusted image hosts (SSRF-safe).
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

  if (!isAllowedHost(target.hostname)) {
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
