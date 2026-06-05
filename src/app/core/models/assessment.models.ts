export interface AssessmentDetailDto {
  id: number;
  jobPostingId: number;
  title: string;
  description?: string;
  timeLimitMinutes?: number;
  passingScore?: number;
  questions: QuestionDto[];
}

export interface QuestionDto {
  id: number;
  text: string;
  options: string[];
  correctOptionIndex: number;
}
