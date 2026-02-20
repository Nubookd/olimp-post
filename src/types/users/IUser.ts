export interface IUser {
  id: number;
  login: string;
  email: string;
  hash: string;
  createdAt: Date;
  updatedAt: Date;
  role: "customer" | "admin" | "moderator";
}
