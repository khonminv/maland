// src/types/party.ts
export interface PartyPost {
  _id: string;
  map: string;
  subMap: string;
  positions: string[];
  selectedPositions: string[];
  createdAt: string;
  isClosed: boolean;
  content: string;
  isApplied?: boolean;  // 이 부분 추가
  author: {
    discordId: string;
    username: string;
    avatar: string;
    job: string;
    level: string;
  };
  applicants: {
    discordId: string;
    username: string;
    avatar: string;
    job: string;
    level: string;
    message: string;
  }[];
}
