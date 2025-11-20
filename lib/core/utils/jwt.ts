import { type JWTPayload, jwtVerify, SignJWT } from 'jose';
import { ACCESS_TTL_SECONDS, REFRESH_TTL_SECONDS } from './cookie';

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;
if (!JWT_SECRET || !REFRESH_SECRET) {
  throw new Error('Defina JWT_SECRET e REFRESH_SECRET no .env');
}

const encoder = new TextEncoder();
const accessKey = encoder.encode(JWT_SECRET);
const refreshKey = encoder.encode(REFRESH_SECRET);

const JWT_ISSUER = process.env.JWT_ISSUER || 'mg-app';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'mg-web';

export type TokenPayload = {
  subjectId: string;
  email: string;
  role?: string;
};

function baseJwt(payload: TokenPayload) {
  return new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setSubject(payload.subjectId);
}

export async function signAccessToken(payload: TokenPayload) {
  return await baseJwt(payload)
    .setExpirationTime(`${ACCESS_TTL_SECONDS}s`)
    .sign(accessKey);
}

export async function signRefreshToken(payload: TokenPayload) {
  return await baseJwt(payload)
    .setExpirationTime(`${REFRESH_TTL_SECONDS}s`)
    .sign(refreshKey);
}

export async function verifyAccessToken(
  token: string,
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, accessKey, {
      audience: JWT_AUDIENCE,
      issuer: JWT_ISSUER,
    });
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(
  token: string,
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, refreshKey, {
      audience: JWT_AUDIENCE,
      issuer: JWT_ISSUER,
    });
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

export async function createTokens(payload: TokenPayload) {
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(payload),
    signRefreshToken(payload),
  ]);
  return { accessToken, refreshToken };
}
