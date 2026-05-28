export interface CompanyDetailDto {
  id: number;
  name: string;
  description?: string;
  industry?: string;
  website?: string;
  logoPath?: string;
  size?: string;
  location?: string;
  bannerPath?: string;
  employeesCount?: number;
  openJobsCount?: number;
  linkedInUrl?: string;
  twitterUrl?: string;
  contactEmail?: string;
}

export interface PublicCompanyListItemDto {
  id: number;
  name: string;
  logoPath?: string;
  industry?: string;
  location?: string;
  description?: string;
  openJobsCount: number;
  size?: string;
  employeesCount?: number;
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
