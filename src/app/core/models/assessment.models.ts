/**
 * QuestionType Enum - Maps to backend Domain.Enums.QuestionType
 * BACKEND CONTRACT (from API docs):
 * - MCQ = 0
 * - TrueFalse = 1
 * - OpenEnded = 2 (Text Answer)
 * - Coding = 3
 */
export enum QuestionTypeEnum {
  MCQ = 0,
  TrueFalse = 1,
  OpenEnded = 2,
  Coding = 3,
}

/**
 * String representation of QuestionType for UI and form handling
 * Frontend uses friendly names, backend expects numeric enum values
 */
export type QuestionType = 'Multiple Choice' | 'True/False' | 'Text Answer' | 'Coding Challenge';

/**
 * Utility class for QuestionType conversions between string and enum values
 */
export class QuestionTypeHelper {
  /**
   * Maps frontend display names to backend numeric enum values
   * Backend Contract: MCQ=0, TrueFalse=1, OpenEnded=2, Coding=3
   */
  static readonly typeMap: Record<QuestionType, QuestionTypeEnum> = {
    'Multiple Choice': QuestionTypeEnum.MCQ,
    'True/False': QuestionTypeEnum.TrueFalse,
    'Text Answer': QuestionTypeEnum.OpenEnded,
    'Coding Challenge': QuestionTypeEnum.Coding,
  };

  /**
   * Maps backend numeric enum values to frontend display names
   */
  static readonly reverseMap: Record<QuestionTypeEnum, QuestionType> = {
    [QuestionTypeEnum.MCQ]: 'Multiple Choice',
    [QuestionTypeEnum.TrueFalse]: 'True/False',
    [QuestionTypeEnum.OpenEnded]: 'Text Answer',
    [QuestionTypeEnum.Coding]: 'Coding Challenge',
  };

  /**
   * Convert string representation to backend enum value
   */
  static toEnumValue(type: QuestionType): QuestionTypeEnum {
    return this.typeMap[type];
  }

  /**
   * Convert backend enum value to string representation
   */
  static toDisplayValue(enumValue: QuestionTypeEnum): QuestionType {
    return this.reverseMap[enumValue];
  }

  /**
   * Validate that a value is a valid QuestionType
   */
  static isValidType(value: any): value is QuestionType {
    return Object.keys(this.typeMap).includes(value);
  }

  /**
   * Get all valid question types
   */
  static getAllTypes(): QuestionType[] {
    return Object.keys(this.typeMap) as QuestionType[];
  }
}

// ============ Assessment Status Types ============
export type AssessmentStatus = 'Draft' | 'Published' | 'Archived';
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';
export type AssignmentStatus = 'Assigned' | 'InProgress' | 'Submitted';

// ============ Data Transfer Objects (DTOs) ============

export interface QuestionDto {
  id: number;
  title: string;
  description?: string;
  type: QuestionType;
  difficulty?: DifficultyLevel;
  points: number;
  timeLimitMinutes?: number;
  required: boolean;
  options?: string[];
  rubric?: string;
  starterCode?: string;
}

export interface AssessmentDetailDto {
  id: number;
  jobPostingId: number;
  title: string;
  description?: string;
  timeLimitMinutes?: number;
  passingScore?: number;
  questions: QuestionDto[];
  status?: AssessmentStatus;
  assignedCandidates?: string[];
}

export interface AssessmentListItemDto {
  id: number;
  title: string;
  description?: string;
  status: AssessmentStatus;
  questionCount: number;
  timeLimitMinutes?: number;
  createdAt?: string;
  dueAt?: string;
}

export interface AssignedAssessmentDto {
  assignmentId: number;
  assessmentId: number;
  title: string;
  companyName?: string;
  dueAt?: string;
  status: AssignmentStatus;
  timeLimitMinutes: number;
  questionCount: number;
}

// ============ Request/Payload Types ============

/**
 * Question payload for creating/updating assessments
 * BACKEND CONTRACT:
 * - text (not title) for question content
 * - type as numeric enum (0-3)
 * - orderIndex is REQUIRED
 * - options as JSON string for MCQ
 * - correctAnswer for answer key
 */
export interface QuestionPayload {
  id?: number;
  text: string;              // ← Changed from 'title' to 'text' (backend requirement)
  type: QuestionType;        // Will be converted to numeric enum
  options?: string;          // JSON array string for MCQ (not array)
  correctAnswer?: string;    // Answer key
  points: number;            // Must be > 0
  orderIndex: number;        // ← REQUIRED field

  // Legacy properties (for UI form compatibility)
  title?: string;            // Alias for 'text'
  description?: string;
  difficulty?: DifficultyLevel;
  timeLimitMinutes?: number;
  required?: boolean;
  rubric?: string;
  starterCode?: string;
}

/**
 * Assessment builder payload for creating/updating assessments
 * BACKEND CONTRACT:
 * - jobPostId (not jobPostingId)
 * - type (AssessmentType enum: 0=Technical, 1=Personality, 2=Mixed)
 * - isAiGenerated boolean
 */
export interface AssessmentBuilderPayload {
  id?: number;
  jobPostId: number;         // ← Changed from 'jobPostingId'
  title: string;             // Max 200 chars
  description?: string;      // Max 2000 chars
  type: AssessmentType;      // ← Changed from 'status' (0=Technical, 1=Personality, 2=Mixed)
  timeLimitMinutes: number;  // Must be > 0
  isAiGenerated?: boolean;   // ← New field
  questions: QuestionPayload[];

  // Legacy properties (for backward compatibility with UI)
  jobPostingId?: number;     // Alias for 'jobPostId'
  status?: AssessmentStatus; // Alias for 'type'
  passingScore?: number;     // Legacy field
}

/**
 * Answer submission for assessment
 */
export interface AnswerSubmission {
  questionId: number;
  answer: string;
}

/**
 * Submit assessment payload - includes 'request' field required by backend
 */
export interface SubmitAssessmentPayload {
  request?: string; // Required by backend validation
  answers: AnswerSubmission[];
  startedAt?: string;
  submittedAt?: string;
}

/**
 * Start assessment request payload
 */
export interface StartAssessmentPayload {
  request?: string; // Optional but following backend pattern
}

/**
 * Assign assessment to candidates payload
 */
export interface AssignAssessmentPayload {
  candidateIds: string[];
}

// ============ Response Types ============

export interface ApiErrorResponse {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
  timestamp?: string;
  path?: string;
}

export interface AssessmentSubmissionResult {
  id: number;
  assessmentId: number;
  submittedAt: string;
  score?: number;
  feedback?: string;
  status: 'Submitted' | 'Grading' | 'Graded';
}

// ============ Validation Utilities ============

export class AssessmentValidation {
  /**
   * Validate question payload
   */
  static validateQuestion(question: QuestionPayload): string[] {
    const errors: string[] = [];

    if (!question.title?.trim()) {
      errors.push('Question title is required');
    } else if (question.title.trim().length < 3) {
      errors.push('Question title must be at least 3 characters');
    }

    if (!QuestionTypeHelper.isValidType(question.type)) {
      errors.push(`Invalid question type: ${question.type}`);
    }

    if (!Number.isInteger(question.points) || question.points < 1) {
      errors.push('Question points must be a positive integer');
    }

    if (!Number.isInteger(question.timeLimitMinutes) || question.timeLimitMinutes! < 1) {
      errors.push('Time limit must be a positive integer');
    }

    if (question.type === 'Multiple Choice' && (!question.options || question.options.length < 2)) {
      errors.push('Multiple choice question must have at least 2 options');
    }

    return errors;
  }

  /**
   * Validate assessment builder payload
   */
  static validateAssessmentPayload(payload: AssessmentBuilderPayload): string[] {
    const errors: string[] = [];

    if (!payload.title?.trim()) {
      errors.push('Assessment title is required');
    } else if (payload.title.trim().length < 5) {
      errors.push('Assessment title must be at least 5 characters');
    }

    if (!Number.isInteger(payload.jobPostingId) || payload.jobPostingId < 1) {
      errors.push('Valid job posting ID is required');
    }

    if (!Number.isInteger(payload.timeLimitMinutes) || payload.timeLimitMinutes < 15) {
      errors.push('Time limit must be at least 15 minutes');
    }

    if (!payload.questions || payload.questions.length === 0) {
      errors.push('Assessment must have at least one question');
    } else {
      payload.questions.forEach((q, idx) => {
        const qErrors = this.validateQuestion(q);
        qErrors.forEach((e) => errors.push(`Question ${idx + 1}: ${e}`));
      });
    }

    return errors;
  }

  /**
   * Validate submit assessment payload
   */
  static validateSubmitPayload(payload: SubmitAssessmentPayload): string[] {
    const errors: string[] = [];

    if (!payload.answers || !Array.isArray(payload.answers)) {
      errors.push('Answers array is required');
    } else if (payload.answers.length === 0) {
      errors.push('At least one answer must be provided');
    } else {
      payload.answers.forEach((a, idx) => {
        if (!Number.isInteger(a.questionId) || a.questionId < 1) {
          errors.push(`Answer ${idx + 1}: Invalid question ID`);
        }
        if (typeof a.answer !== 'string') {
          errors.push(`Answer ${idx + 1}: Answer must be a string`);
        }
      });
    }

    return errors;
  }
}

/**
 * Serialization utility to convert frontend types to backend format
 */
export class AssessmentSerializer {
  /**
   * Serialize assessment payload for backend
   * Maps frontend properties to backend contract:
   * - Converts QuestionType strings to numeric enum values
   * - Maps 'title' to 'text' for questions
   * - Handles jobPostingId → jobPostId
   * - Converts status/type as needed
   * - Adds missing fields like orderIndex
   *
   * BACKEND CONTRACT:
   * CreateAssessmentRequest {
   *   jobPostId: number;
   *   title: string;
   *   description?: string;
   *   type: AssessmentType;
   *   timeLimitMinutes: number;
   *   isAiGenerated?: boolean;
   *   questions: CreateQuestionRequest[];
   * }
   *
   * CreateQuestionRequest {
   *   text: string;               ← NOT "title"
   *   type: QuestionType;         ← Numeric: 0=MCQ, 1=TrueFalse, 2=OpenEnded, 3=Coding
   *   options?: string;           ← JSON string, NOT array
   *   correctAnswer?: string;
   *   points: number;
   *   orderIndex: number;         ← REQUIRED
   * }
   */
  static serializeAssessmentPayload(payload: AssessmentBuilderPayload): any {
    const assessmentType = this.getAssessmentType(payload);

    return {
      jobPostId: payload.jobPostId ?? payload.jobPostingId,  // Use backend property name
      title: payload.title,
      description: payload.description,
      type: assessmentType,  // Use 'type' not 'status'
      timeLimitMinutes: payload.timeLimitMinutes,
      isAiGenerated: payload.isAiGenerated || false,
      questions: payload.questions.map((q, index) => ({
        text: q.text || q.title || '',  // Map 'title' to 'text' if needed
        type: QuestionTypeHelper.toEnumValue(q.type),  // Convert string type to numeric
        options: q.options,  // Already JSON string or array
        correctAnswer: q.correctAnswer,
        points: q.points,
        orderIndex: q.orderIndex ?? index,  // Use provided index or calculate
      })),
    };
  }

  /**
   * Determine assessment type from payload
   * Backend expects: 0=Technical, 1=Personality, 2=Mixed
   */
  private static getAssessmentType(payload: AssessmentBuilderPayload): number {
    // If 'type' is already a number, use it
    if (typeof payload.type === 'number') {
      return payload.type;
    }

    // Default to Technical (0)
    return 0;
  }

  /**
   * Serialize submit payload for backend
   * Adds request field required by backend validation
   */
  static serializeSubmitPayload(payload: SubmitAssessmentPayload): any {
    return {
      request: payload.request || 'SubmitAssessment',
      answers: payload.answers,
      startedAt: payload.startedAt,
      submittedAt: payload.submittedAt,
    };
  }

  /**
   * Deserialize question from backend
   * Converts enum values back to display strings
   */
  static deserializeQuestion(data: any): QuestionDto {
    return {
      ...data,
      type: typeof data.type === 'number'
        ? QuestionTypeHelper.toDisplayValue(data.type)
        : data.type,
    };
  }

  /**
   * Deserialize assessment from backend
   */
  static deserializeAssessment(data: any): AssessmentDetailDto {
    return {
      ...data,
      questions: (data.questions || []).map((q: any) =>
        this.deserializeQuestion(q)
      ),
    };
  }
}
