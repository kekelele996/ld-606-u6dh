import type { UserRole } from "../constants/UserRole";

export interface AuthenticatedUser {
  id: number;
  role: UserRole;
  name: string;
}
