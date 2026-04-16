import { UserRole } from 'src/database/entities';

export interface AuthUser {
  sub: string;
  email: string;
  role: UserRole;
  fullName: string;
}
