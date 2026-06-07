# Assessment API Payload Fix Summary

## 🔴 Critical Issues Found

The frontend was sending **completely wrong property names and types** to the backend, causing **400 Validation Errors**.

### Exact Error: `Questions[0].Text`

Backend validation failed because the property name was wrong: frontend sent `"title"` but backend expected `"text"`.

---

## 📊 BEFORE vs AFTER Comparison

### Issue 1: Question Property Names

**BEFORE (WRONG):**

```json
{
  "id": 1,
  "title": "What is JavaScript?", // ❌ WRONG - backend expects "text"
  "description": "Learn JS basics", // ❌ NOT IN BACKEND DTO
  "type": "Text Answer", // ❌ WRONG - should be numeric 2
  "points": 10,
  "timeLimitMinutes": 5, // ❌ NOT IN BACKEND DTO
  "required": true, // ❌ NOT IN BACKEND DTO
  "options": ["opt1", "opt2"], // ❌ WRONG - should be JSON string
  "rubric": "...", // ❌ NOT IN BACKEND DTO
  "starterCode": "..." // ❌ NOT IN BACKEND DTO
}
```

**AFTER (CORRECT):**

```json
{
  "text": "What is JavaScript?", // ✅ Correct property name
  "type": 2, // ✅ Numeric enum (OpenEnded)
  "options": "[\"opt1\", \"opt2\"]", // ✅ JSON string, not array
  "correctAnswer": "...", // ✅ NEW - answer key
  "points": 10,
  "orderIndex": 0 // ✅ REQUIRED - question position
}
```

### Issue 2: Assessment Top-Level Properties

**BEFORE (WRONG):**

```json
{
  "jobPostingId": 123,                      // ❌ WRONG - backend expects "jobPostId"
  "title": "Assessment Title",
  "description": "...",
  "status": "Published",                    // ❌ WRONG - backend expects "type" (0-2)
  "timeLimitMinutes": 60,
  "passingScore": 70,                       // ❌ NOT IN BACKEND DTO
  "questions": [...]
}
```

**AFTER (CORRECT):**

```json
{
  "jobPostId": 123,                         // ✅ Correct property name
  "title": "Assessment Title",
  "description": "...",
  "type": 0,                                // ✅ AssessmentType enum (0=Technical, 1=Personality, 2=Mixed)
  "timeLimitMinutes": 60,
  "isAiGenerated": true,                    // ✅ NEW - marks as AI generated
  "questions": [...]
}
```

### Issue 3: Question Type Enum Mapping

**BEFORE (WRONG):**

```typescript
export enum QuestionTypeEnum {
  CodingChallenge = 0, // ❌ Backend uses different names
  MultipleChoice = 1,
  Conceptual = 2,
  TextAnswer = 3,
}
```

**AFTER (CORRECT):**

```typescript
export enum QuestionTypeEnum {
  MCQ = 0, // ✅ Backend name: MCQ
  TrueFalse = 1, // ✅ Backend name: TrueFalse
  OpenEnded = 2, // ✅ Backend name: OpenEnded (Text Answer)
  Coding = 3, // ✅ Backend name: Coding
}
```

---

## 🔧 Files Modified

### 1. `assessment.models.ts`

#### Change 1: QuestionTypeEnum

```typescript
// BEFORE
export enum QuestionTypeEnum {
  CodingChallenge = 0,
  MultipleChoice = 1,
  Conceptual = 2,
  TextAnswer = 3,
}

// AFTER
export enum QuestionTypeEnum {
  MCQ = 0,
  TrueFalse = 1,
  OpenEnded = 2,
  Coding = 3,
}
```

#### Change 2: QuestionType Union Type

```typescript
// BEFORE
export type QuestionType =
  | "Coding Challenge"
  | "Multiple Choice"
  | "Conceptual"
  | "Text Answer";

// AFTER
export type QuestionType =
  | "Multiple Choice"
  | "True/False"
  | "Text Answer"
  | "Coding Challenge";
```

#### Change 3: QuestionTypeHelper Mappings

```typescript
// BEFORE
static readonly typeMap: Record<QuestionType, QuestionTypeEnum> = {
  'Coding Challenge': QuestionTypeEnum.CodingChallenge,
  'Multiple Choice': QuestionTypeEnum.MultipleChoice,
  Conceptual: QuestionTypeEnum.Conceptual,
  'Text Answer': QuestionTypeEnum.TextAnswer,
};

// AFTER
static readonly typeMap: Record<QuestionType, QuestionTypeEnum> = {
  'Multiple Choice': QuestionTypeEnum.MCQ,
  'True/False': QuestionTypeEnum.TrueFalse,
  'Text Answer': QuestionTypeEnum.OpenEnded,
  'Coding Challenge': QuestionTypeEnum.Coding,
};
```

#### Change 4: QuestionPayload Interface

```typescript
// BEFORE
export interface QuestionPayload {
  id?: number;
  title: string; // ❌ Wrong property name
  description?: string;
  type: QuestionType;
  difficulty?: DifficultyLevel;
  points: number;
  timeLimitMinutes?: number;
  required: boolean;
  options?: string[]; // ❌ Array instead of JSON string
  rubric?: string;
  starterCode?: string;
}

// AFTER
export interface QuestionPayload {
  id?: number;
  text: string; // ✅ Correct: "text" not "title"
  type: QuestionType;
  options?: string; // ✅ Correct: JSON string not array
  correctAnswer?: string; // ✅ NEW: answer key field
  points: number;
  orderIndex: number; // ✅ NEW: REQUIRED field for question position

  // Legacy properties for UI compatibility
  title?: string;
  description?: string;
  difficulty?: DifficultyLevel;
  timeLimitMinutes?: number;
  required?: boolean;
  rubric?: string;
  starterCode?: string;
}
```

#### Change 5: AssessmentBuilderPayload Interface

```typescript
// BEFORE
export interface AssessmentBuilderPayload {
  id?: number;
  jobPostingId: number; // ❌ Wrong property name
  title: string;
  description?: string;
  timeLimitMinutes: number;
  passingScore?: number;
  status: AssessmentStatus; // ❌ Wrong: should be "type"
  questions: QuestionPayload[];
}

// AFTER
export interface AssessmentBuilderPayload {
  id?: number;
  jobPostId: number; // ✅ Correct: "jobPostId"
  title: string;
  description?: string;
  type: AssessmentType; // ✅ Correct: "type" with numeric enum
  timeLimitMinutes: number;
  isAiGenerated?: boolean; // ✅ NEW: marks as AI generated
  questions: QuestionPayload[];

  // Legacy properties for backward compatibility
  jobPostingId?: number;
  status?: AssessmentStatus;
  passingScore?: number;
}
```

#### Change 6: AssessmentSerializer.serializeAssessmentPayload()

```typescript
// BEFORE
static serializeAssessmentPayload(payload: AssessmentBuilderPayload): any {
  return {
    ...payload,
    questions: payload.questions.map((q) => ({
      ...q,
      type: QuestionTypeHelper.toEnumValue(q.type),
    })),
  };
}

// AFTER
static serializeAssessmentPayload(payload: AssessmentBuilderPayload): any {
  const assessmentType = this.getAssessmentType(payload);

  return {
    jobPostId: payload.jobPostId ?? payload.jobPostingId,
    title: payload.title,
    description: payload.description,
    type: assessmentType,  // Use 'type' not 'status'
    timeLimitMinutes: payload.timeLimitMinutes,
    isAiGenerated: payload.isAiGenerated || false,
    questions: payload.questions.map((q, index) => ({
      text: q.text || q.title || '',                      // Map 'title' → 'text'
      type: QuestionTypeHelper.toEnumValue(q.type),       // Convert to numeric
      options: q.options,                                 // Already JSON string
      correctAnswer: q.correctAnswer,
      points: q.points,
      orderIndex: q.orderIndex ?? index,                  // Use provided index or calc
    })),
  };
}
```

---

### 2. `create-ai-interview.ts`

#### Change 1: Question Types Array

```typescript
// BEFORE
readonly questionTypes: QuestionType[] = [
  'Coding Challenge',
  'Multiple Choice',
  'Conceptual',     // ❌ Not in new enum
  'Text Answer',
];

// AFTER
readonly questionTypes: QuestionType[] = [
  'Multiple Choice',
  'True/False',
  'Text Answer',
  'Coding Challenge',
];
```

#### Change 2: toPayload() Method

```typescript
// BEFORE
private toPayload(status: 'Draft' | 'Published'): AssessmentBuilderPayload {
  const v = this.builderForm.getRawValue();
  return {
    id: this.assessmentId() ?? undefined,
    jobPostingId: Number(v.jobPostingId),           // ❌ Wrong property name
    title: v.title.trim(),
    description: v.description.trim(),
    timeLimitMinutes: Number(v.timeLimitMinutes),
    passingScore: Number(v.passingScore || 0),
    status,                                          // ❌ Wrong: should use 'type'
    questions: v.questions.map((q: any): QuestionPayload => ({
      id: Number(q.id),
      type: q.type,
      title: String(q.title || '').trim(),          // ❌ Wrong: should be 'text'
      description: String(q.description || '').trim(),
      points: Number(q.points),
      timeLimitMinutes: Number(q.timeLimitMinutes),
      required: Boolean(q.required),
      options: q.type === 'Multiple Choice'
        ? String(q.options || '')
          .split('\n')
          .map((x: string) => x.trim())
          .filter(Boolean)                           // ❌ Returns array, not JSON string
        : undefined,
      starterCode: q.type === 'Coding Challenge' ? q.starterCode : undefined,
      rubric: q.rubric ? String(q.rubric) : undefined,
    })),
  };
}

// AFTER
private toPayload(status: 'Draft' | 'Published'): AssessmentBuilderPayload {
  const v = this.builderForm.getRawValue();

  // Map backend AssessmentType: 0=Technical, 1=Personality, 2=Mixed
  const assessmentType = 0; // AssessmentType.Technical

  return {
    id: this.assessmentId() ?? undefined,
    jobPostId: Number(v.jobPostingId),              // ✅ Correct property name
    title: v.title.trim(),
    description: v.description.trim(),
    type: assessmentType,                           // ✅ Use numeric 'type' not 'status'
    timeLimitMinutes: Number(v.timeLimitMinutes),
    isAiGenerated: true,                            // ✅ NEW: mark as AI generated
    questions: v.questions.map((q: any, index: number): QuestionPayload => {
      // Convert options array to JSON string for MCQ
      let optionsStr: string | undefined;
      if (q.type === 'Multiple Choice' && q.options) {
        const optionsList = typeof q.options === 'string'
          ? String(q.options || '')
            .split('\n')
            .map((x: string) => x.trim())
            .filter(Boolean)
          : Array.isArray(q.options) ? q.options : [];
        optionsStr = JSON.stringify(optionsList);   // ✅ Convert to JSON string
      }

      return {
        id: Number(q.id),
        text: String(q.title || '').trim(),         // ✅ Correct: use 'text'
        type: q.type as QuestionType,
        options: optionsStr,                        // ✅ JSON string format
        correctAnswer: q.correctAnswer,             // ✅ NEW: include answer key
        points: Number(q.points),
        orderIndex: index,                          // ✅ REQUIRED: question position

        // Legacy properties
        title: String(q.title || '').trim(),
        description: String(q.description || '').trim(),
        timeLimitMinutes: Number(q.timeLimitMinutes),
        required: Boolean(q.required),
        rubric: q.rubric ? String(q.rubric) : undefined,
        starterCode: q.type === 'Coding Challenge' ? q.starterCode : undefined,
      };
    }),

    // Legacy properties for backward compatibility
    jobPostingId: Number(v.jobPostingId),
    status,
    passingScore: Number(v.passingScore || 0),
  };
}
```

---

## ✅ Verification Checklist

- [x] **QuestionType Enum**: Changed from `CodingChallenge` to `MCQ`, `MultipleChoice` to `MCQ`, etc.
- [x] **Question Property "text"**: Changed from `title` to `text` (line mapping in toPayload)
- [x] **Question Type Conversion**: Using `QuestionTypeHelper.toEnumValue()` to convert string → numeric
- [x] **orderIndex Field**: Added to all questions with position in array
- [x] **correctAnswer Field**: Added as optional field
- [x] **options Format**: Changed from string[] to JSON string
- [x] **jobPostId Field**: Changed from `jobPostingId` to `jobPostId`
- [x] **type Field**: Changed from `status` to `type` with numeric value
- [x] **isAiGenerated Field**: Added to assessment payload
- [x] **Backward Compatibility**: Legacy fields preserved in interfaces
- [x] **TypeScript Errors**: 0 errors after fixes
- [x] **Console.log Debugging**: Already in place in AssessmentService

---

## 🚀 Testing Instructions

1. **Create a new assessment** with at least 2 questions
2. **Open browser DevTools** (F12) → Console tab
3. **Watch for the "Assessment Payload" log** when you click Save
4. **Verify the payload structure**:
   ```json
   {
     "jobPostId": 123,
     "title": "Assessment Title",
     "type": 0,
     "timeLimitMinutes": 60,
     "isAiGenerated": true,
     "questions": [
       {
         "text": "Question text here",
         "type": 0, // or 1, 2, 3
         "options": "[\"option1\",\"option2\"]", // JSON string for MCQ
         "points": 10,
         "orderIndex": 0
       }
     ]
   }
   ```
5. **Check Network tab** for the POST request to `/api/assessments/create`
6. **Expected Result**: HTTP 200 OK (not 400 Validation Error)

---

## 📋 Backend Contract Reference

From `/stitch_ies/frontend_integration_guide.md` (lines 766-850):

```typescript
interface CreateAssessmentRequest {
  jobPostId: number;
  title: string;
  description?: string;
  type: AssessmentType;
  timeLimitMinutes: number;
  isAiGenerated?: boolean;
  questions: CreateQuestionRequest[];
}

interface CreateQuestionRequest {
  text: string;
  type: QuestionType; // 0=MCQ, 1=TrueFalse, 2=OpenEnded, 3=Coding
  options?: string; // JSON array string
  correctAnswer?: string;
  points: number;
  orderIndex: number;
}

export enum QuestionType {
  MCQ = 0,
  TrueFalse = 1,
  OpenEnded = 2,
  Coding = 3,
}

export enum AssessmentType {
  Technical = 0,
  Personality = 1,
  Mixed = 2,
}
```

---

## ⚠️ Known Limitations

- **Assessment Type**: Currently hardcoded to `Technical (0)` - UI doesn't let users choose Personality or Mixed
- **Answer Key**: `correctAnswer` field is included but UI doesn't provide input for it yet
- **Legacy Properties**: Kept for backward compatibility but not sent to backend

---

## 📝 Summary

The frontend was sending payloads with completely wrong property names, causing the backend to reject the request with validation errors on `Questions[0].Text`. All issues have been fixed:

✅ Property names now match backend contract
✅ Question types use correct numeric enum values
✅ Options are properly serialized as JSON strings
✅ Missing fields (orderIndex, correctAnswer, isAiGenerated) are now included
✅ Assessment type property renamed from `status` to `type`
✅ Assessment jobPostingId property renamed to `jobPostId`
✅ 0 TypeScript compilation errors
✅ Ready for testing
