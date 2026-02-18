import { NextRequest, NextResponse } from 'next/server';

function unauthorizedResponse(): NextResponse {
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
}

function missingCredentialsResponse(): NextResponse {
  return new NextResponse('Basic auth credentials are not configured', {
    status: 500,
  });
}

function isValidAuthorizationHeader(
  authorization: string,
  expectedUser: string,
  expectedPassword: string
): boolean {
  if (!authorization.startsWith('Basic ')) {
    return false;
  }

  const encoded = authorization.slice(6).trim();
  if (!encoded) {
    return false;
  }

  try {
    const decoded = atob(encoded);
    const separatorIndex = decoded.indexOf(':');
    if (separatorIndex === -1) {
      return false;
    }

    const user = decoded.slice(0, separatorIndex);
    const password = decoded.slice(separatorIndex + 1);
    return user === expectedUser && password === expectedPassword;
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest): NextResponse {
  const expectedUser = process.env.BASIC_AUTH_USER;
  const expectedPassword = process.env.BASIC_AUTH_PASSWORD;

  if (!expectedUser || !expectedPassword) {
    return missingCredentialsResponse();
  }

  const authorization = request.headers.get('authorization');
  if (!authorization) {
    return unauthorizedResponse();
  }

  if (
    !isValidAuthorizationHeader(authorization, expectedUser, expectedPassword)
  ) {
    return unauthorizedResponse();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
