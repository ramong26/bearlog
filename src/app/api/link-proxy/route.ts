import { NextRequest, NextResponse } from 'next/server';
import { promises as dns } from 'dns';

const SSRF_BLOCK = new NextResponse('허용되지 않는 URL입니다', { status: 403 });

const PRIVATE_IP_RANGES = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,  // link-local (AWS 메타데이터 등)
  /^::1$/,        // IPv6 loopback
  /^fc00:/i,      // IPv6 ULA
  /^fe80:/i,      // IPv6 link-local
];

function isPrivateIp(ip: string): boolean {
  return PRIVATE_IP_RANGES.some((re) => re.test(ip));
}

async function isSsrfUrl(targetUrl: URL): Promise<boolean> {
  // http/https 외 프로토콜 차단 (file://, ftp:// 등)
  if (!['http:', 'https:'].includes(targetUrl.protocol)) return true;

  // 호스트명이 직접 IP인 경우 바로 검사
  const hostname = targetUrl.hostname;
  if (/^[\d.]+$/.test(hostname) || hostname.includes(':')) {
    return isPrivateIp(hostname);
  }

  // 도메인 → IP 조회 후 검사 (DNS rebinding 방어)
  try {
    const addresses = await dns.resolve(hostname);
    return addresses.some(isPrivateIp);
  } catch {
    return true; // 해석 실패 시 차단
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return new NextResponse('url 파라미터가 필요합니다', { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(url);
  } catch {
    return new NextResponse('유효하지 않은 URL입니다', { status: 400 });
  }

  if (await isSsrfUrl(targetUrl)) {
    return SSRF_BLOCK;
  }

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8',
    },
    signal: AbortSignal.timeout(8000),
  });

  const contentType = response.headers.get('content-type') ?? 'text/html';

  // HTML이 아닌 경우(이미지, PDF 등) 그대로 스트리밍
  if (!contentType.includes('text/html')) {
    const headers = new Headers({ 'content-type': contentType });
    return new NextResponse(response.body, { status: response.status, headers });
  }

  const html = await response.text();
  const origin = targetUrl.origin;

  // <base href> 주입으로 상대경로 리소스 해결
  const baseTag = `<base href="${origin}/">`;
  let patched: string;
  if (/<head[\s>]/i.test(html)) {
    patched = html.replace(/(<head[^>]*>)/i, `$1${baseTag}`);
  } else if (/<body[\s>]/i.test(html)) {
    patched = html.replace(/(<body[^>]*>)/i, `${baseTag}$1`);
  } else {
    patched = baseTag + html;
  }

  const headers = new Headers({
    'content-type': 'text/html; charset=utf-8',
    // 프레임 차단 헤더 제거 (설정하지 않음)
    'cache-control': 'no-store',
  });

  return new NextResponse(patched, { status: 200, headers });
}
