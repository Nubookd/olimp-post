import { NextResponse } from "next/server";
import { IUserPublicData } from "./users/IUserPublicData";

export interface IApiResponse extends NextResponse {
  success: boolean;
  message: string;
  status: number;
  user?: IUserPublicData;
}
