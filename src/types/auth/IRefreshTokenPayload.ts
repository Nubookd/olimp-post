import { JWTPayload  } from "jose";

export interface IRefreshTokenPayload extends JWTPayload  {
  userId: number;
  token: string;
  type: "refresh";
  iat: number;
  exp: number;
}
