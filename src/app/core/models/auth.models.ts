export interface RegisterCandidateRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth?: string;     // ISO 8601
}

export interface RegisterCompanyRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth?: string;
  companyName: string;       // Max 200
  taxNumber: string;         // Unique, max 50
  industry?: string;
  website?: string;
}

export interface RegisterRecruiterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth?: string;
  inviteCode: string;        // 6 chars alphanumeric
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  userId: string;
  email: string;
  role: 'Candidate' | 'Recruiter' | 'Admin';
  companyId?: number;
  recruiterRole?: 'Admin' | 'Standard';
}
