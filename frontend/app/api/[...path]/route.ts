import { NextRequest, NextResponse } from 'next/server';

const BACKEND_CANDIDATES = [
  'http://127.0.0.1:8000',
  'http://localhost:8000',
  'http://127.0.0.1:8001',
  'http://localhost:8001',
];

const buildTargetUrl = (base: string, req: NextRequest, path: string[]): string => {
  const joinedPath = path.join('/');
  const search = req.nextUrl.search;
  return `${base}/${joinedPath}${search}`;
};

const proxyRequest = async (
  req: NextRequest,
  path: string[],
): Promise<NextResponse> => {
  const method = req.method.toUpperCase();
  const rawBody = method === 'GET' || method === 'HEAD' ? null : await req.text();

  let lastError: unknown;

  for (const base of BACKEND_CANDIDATES) {
    const target = buildTargetUrl(base, req, path);

    try {
      const response = await fetch(target, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: rawBody,
        cache: 'no-store',
      });

      const text = await response.text();
      return new NextResponse(text, {
        status: response.status,
        headers: {
          'Content-Type': response.headers.get('content-type') ?? 'application/json',
        },
      });
    } catch (error) {
      lastError = error;
    }
  }

  return NextResponse.json(
    {
      error: 'Backend is unavailable',
      detail: lastError instanceof Error ? lastError.message : 'Unknown error',
    },
    { status: 503 },
  );
};

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  return proxyRequest(req, params.path);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  return proxyRequest(req, params.path);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
