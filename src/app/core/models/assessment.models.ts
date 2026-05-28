export interface AssessmentDetailDto {
  id: number;
  jobPostingId: number;
  title: string;
  description?: string;
  timeLimitMinutes?: number;
  passingScore?: number;
  questions: QuestionDto[];
  status?: 'Draft' | 'Published' | 'Archived';
  assignedCandidates?: string[];
}

export interface QuestionDto {
  id: number;
  title: string;
  description?: string;
  type: QuestionType;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  points: number;
  timeLimitMinutes?: number;
  required: boolean;
  options?: string[];
  rubric?: string;
  starterCode?: string;
}

export type QuestionType =
  | 'Coding Challenge'
  | 'Multiple Choice'
  | 'Conceptual'
  | 'Text Answer';

export interface AssessmentListItemDto {
  id: number;
  title: string;
  description?: string;
  status: 'Draft' | 'Published' | 'Archived';
  questionCount: number;
  timeLimitMinutes?: number;
  createdAt?: string;
  dueAt?: string;
}

export interface AssessmentBuilderPayload {
  id?: number;
  jobPostingId: number;
  title: string;
  description?: string;
  timeLimitMinutes: number;
  passingScore?: number;
  status: 'Draft' | 'Published';
  questions: QuestionDto[];
}

export interface AssignedAssessmentDto {
  assignmentId: number;
  assessmentId: number;
  title: string;
  companyName?: string;
  dueAt?: string;
  status: 'Assigned' | 'InProgress' | 'Submitted';
  timeLimitMinutes: number;
  questionCount: number;
}

export interface SubmitAssessmentPayload {
  answers: Array<{
    questionId: number;
    answer: string;
  }>;
  startedAt?: string;
  submittedAt?: string;
}
