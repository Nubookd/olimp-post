import { JWTPayload } from "jose";

export interface IAccessTokenPayload extends JWTPayload {
  id: number;
  login: string;
  email: string;
  role: string;
  type: "access";
  iat: number;
  exp: number;
}
