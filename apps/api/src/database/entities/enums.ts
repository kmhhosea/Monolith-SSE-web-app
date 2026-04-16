export enum UserRole {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN'
}

export enum ConversationType {
  DIRECT = 'DIRECT',
  GROUP = 'GROUP'
}

export enum MembershipRole {
  MEMBER = 'MEMBER',
  FACILITATOR = 'FACILITATOR',
  OWNER = 'OWNER'
}

export enum GroupVisibility {
  OPEN = 'OPEN',
  PRIVATE = 'PRIVATE'
}

export enum ProjectStage {
  IDEA = 'IDEA',
  DISCOVERY = 'DISCOVERY',
  BUILDING = 'BUILDING',
  PILOT = 'PILOT',
  LAUNCHED = 'LAUNCHED'
}

export enum TaskStatus {
  BACKLOG = 'BACKLOG',
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE'
}

export enum NotificationType {
  MESSAGE = 'MESSAGE',
  PROJECT = 'PROJECT',
  GROUP = 'GROUP',
  RESOURCE = 'RESOURCE',
  MATCH = 'MATCH',
  OPPORTUNITY = 'OPPORTUNITY',
  SYSTEM = 'SYSTEM'
}

export enum OpportunityType {
  INTERNSHIP = 'INTERNSHIP',
  SCHOLARSHIP = 'SCHOLARSHIP',
  HACKATHON = 'HACKATHON',
  RESEARCH = 'RESEARCH',
  OTHER = 'OTHER'
}

export enum TutoringStatus {
  OPEN = 'OPEN',
  MATCHED = 'MATCHED',
  CLOSED = 'CLOSED'
}
