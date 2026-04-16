export type User = {
  id: string;
  fullName: string;
  email: string;
  university: string;
  course: string;
  bio: string;
  skills: string[];
  interests: string[];
  goals: string[];
  role: string;
  avatarUrl?: string | null;
};

export type SessionPayload = {
  accessToken: string;
  user: User;
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
};
