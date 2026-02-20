import { UserRole } from "../users/UserRole";

export interface ICreateUserData {
  login: string;
  email: string;
  password: string;
  role: UserRole;
}
