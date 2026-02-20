import {
  IAccessTokenPayload,
  IRefreshTokenPayload,
  IUserPublicData,
} from "@/types";
import { prisma } from "../../../prisma/prisma";
import { jwtVerify, SignJWT } from "jose";

export default class AuthService {
  private static readonly ACCESS_SECRET = new TextEncoder().encode(
    process.env.ACCESS_SECRET!,
  );
  private static readonly REFRESH_SECRET = new TextEncoder().encode(
    process.env.REFRESH_SECRET!,
  );
  private static readonly ACCESS_EXPIRES_IN = "15m";
  private static readonly REFRESH_EXPIRES_IN = "7d";

  static async generateAccessToken(user: IUserPublicData): Promise<string> {
    return await new SignJWT({
      id: user.id,
      login: user.login,
      email: user.email,
      role: user.role,
      type: "access",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(this.ACCESS_EXPIRES_IN)
      .sign(this.ACCESS_SECRET);
  }
  static async generateRefreshToken(userId: number): Promise<string> {
    const array = new Uint8Array(40);
    crypto.getRandomValues(array);
    const token = Array.from(array, (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: { token, userId: userId, expiresAt, isValid: true },
    });
    return await new SignJWT({
      userId,
      token,
      type: "refresh",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(this.REFRESH_EXPIRES_IN)
      .sign(this.REFRESH_SECRET);
  }

  static async verifyAccessToken(
    token: string,
  ): Promise<IUserPublicData | null> {
    try {
      const { payload } = await jwtVerify(token, this.ACCESS_SECRET);
      const typePayload = payload as IAccessTokenPayload;
      if (typePayload.type !== "access") {
        return null;
      }
      return {
        id: Number(typePayload.id),
        login: String(typePayload.login),
        email: String(typePayload.email),
        role: String(typePayload.role) || "USER",
      };
    } catch (error) {
      return null;
    }
  }

  static async verifyRefreshToken(
    token: string,
  ): Promise<{ userId: number; token: string } | null> {
    try {
      const { payload } = await jwtVerify(token, this.REFRESH_SECRET);
      const typePayload = payload as IRefreshTokenPayload;

      if (typePayload.type !== "refresh") {
        return null;
      }

      const refreshToken = await prisma.refreshToken.findFirst({
        where: {
          token: String(typePayload.token),
          isValid: true,
          expiresAt: { gt: new Date(Date.now()) },
        },
      });
      if (!refreshToken) return null;
      return {
        userId: Number(typePayload.userId),
        token: String(typePayload.token),
      };
    } catch (error) {
      return null;
    }
  }

  static async refreshTokens(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  } | null> {
    const payload = await this.verifyRefreshToken(refreshToken);
    if (!payload) return null;
    const user = await prisma.user.findFirst({
      where: { id: payload.userId },
    });
    if (!user) return null;

    const userPayload: IUserPublicData = {
      id: user.id,
      login: user.login,
      email: user.email,
      role: user.role,
    };

    await this.invalidateRefreshToken(payload.token);
    const newAccessToken = await this.generateAccessToken(userPayload);
    const newRefreshToken = await this.generateRefreshToken(user.id);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async invalidateRefreshToken(token: string): Promise<void> {
    try {
      await prisma.refreshToken.updateMany({
        where: { token },
        data: { isValid: false },
      });
    } catch (error) {}
  }

  static async invalidateAllUserToken(userId: number): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId: userId },
      data: { isValid: false },
    });
  }
}
