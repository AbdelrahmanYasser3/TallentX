export interface CompanyDetailDto {
  id: number;
  name: string;
  description?: string;
  industry?: string;
  website?: string;
  logoPath?: string;
  size?: string;
}

export interface InviteCodeDto {
  id: number;
  code: string;
  currentUses: number;
  maxUses: number;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
}

export interface GenerateInviteCodeRequest {
  maxUses: number;
  validDaysFromNow: number;
}

export interface GenerateInviteCodeResponse {
  code: string;
}
