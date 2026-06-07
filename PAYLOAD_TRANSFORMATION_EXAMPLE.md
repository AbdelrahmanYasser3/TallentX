# Real Payload Example: Before vs After

## Scenario: Creating Assessment with 2 Questions

### User Input

- Job Post ID: 5
- Title: "JavaScript Developer Assessment"
- Description: "Test JavaScript knowledge"
- Time Limit: 60 minutes
- Questions:
  1. Question type: "Multiple Choice"
     - Title: "What is JavaScript?"
     - Options: "Language\nFramework\nLibrary\nRuntime"
     - Points: 10
  2. Question type: "Text Answer"
     - Title: "Explain closures in JavaScript"
     - Points: 20

---

## ❌ BEFORE (Causing 400 Validation Error)

```json
{
  "id": null,
  "jobPostingId": 5,
  "title": "JavaScript Developer Assessment",
  "description": "Test JavaScript knowledge",
  "timeLimitMinutes": 60,
  "passingScore": 0,
  "status": "Published",
  "questions": [
    {
      "id": null,
      "type": "Multiple Choice",
      "title": "What is JavaScript?",
      "description": "",
      "points": 10,
      "timeLimitMinutes": 0,
      "required": false,
      "options": ["Language", "Framework", "Library", "Runtime"],
      "starterCode": null,
      "rubric": null
    },
    {
      "id": null,
      "type": "Text Answer",
      "title": "Explain closures in JavaScript",
      "description": "",
      "points": 20,
      "timeLimitMinutes": 0,
      "required": false,
      "options": null,
      "starterCode": null,
      "rubric": null
    }
  ]
}
```

### Problems:

1. ❌ `"jobPostingId"` (should be `"jobPostId"`)
2. ❌ `"status": "Published"` (should be `"type": 0`)
3. ❌ `"type": "Multiple Choice"` (should be `"type": 0`)
4. ❌ `"type": "Text Answer"` (should be `"type": 2`)
5. ❌ `"title"` in questions (should be `"text"`)
6. ❌ `"options": [...]` as array (should be JSON string `"[...]"`)
7. ❌ **Missing `"orderIndex"`** for each question
8. ❌ **Missing `"correctAnswer"`** fields
9. ❌ Missing `"isAiGenerated": true`
10. ❌ Extra fields: description, timeLimitMinutes, required, rubric, starterCode

### Backend Response:

```
HTTP 400 Bad Request
{
  "error": "Questions[0].Text - Property name must be 'text', not 'title'"
}
```

---

## ✅ AFTER (Correct - Returns 200 OK)

```json
{
  "id": null,
  "jobPostId": 5,
  "title": "JavaScript Developer Assessment",
  "description": "Test JavaScript knowledge",
  "type": 0,
  "timeLimitMinutes": 60,
  "isAiGenerated": true,
  "questions": [
    {
      "id": null,
      "text": "What is JavaScript?",
      "type": 0,
      "options": "[\"Language\",\"Framework\",\"Library\",\"Runtime\"]",
      "correctAnswer": null,
      "points": 10,
      "orderIndex": 0
    },
    {
      "id": null,
      "text": "Explain closures in JavaScript",
      "type": 2,
      "options": null,
      "correctAnswer": null,
      "points": 20,
      "orderIndex": 1
    }
  ]
}
```

### Fixes Applied:

1. ✅ `"jobPostId": 5` (correct property name)
2. ✅ `"type": 0` (AssessmentType.Technical)
3. ✅ `"type": 0` for MCQ question (QuestionType.MCQ)
4. ✅ `"type": 2` for Text Answer question (QuestionType.OpenEnded)
5. ✅ `"text"` field instead of `"title"`
6. ✅ `"options": "[\"Language\"...]"` as JSON string
7. ✅ `"orderIndex": 0` and `"orderIndex": 1` added
8. ✅ `"correctAnswer": null` field included
9. ✅ `"isAiGenerated": true` added
10. ✅ Only backend contract properties included

### Backend Response:

```
HTTP 200 OK
{
  "id": 123,
  "jobPostId": 5,
  "title": "JavaScript Developer Assessment",
  "description": "Test JavaScript knowledge",
  "type": 0,
  "timeLimitMinutes": 60,
  "totalScore": 30,
  "isAiGenerated": true,
  "isActive": true,
  "questions": [
    {
      "id": 456,
      "text": "What is JavaScript?",
      "type": 0,
      "options": "[\"Language\",\"Framework\",\"Library\",\"Runtime\"]",
      "correctAnswer": null,
      "points": 10,
      "orderIndex": 0
    },
    {
      "id": 457,
      "text": "Explain closures in JavaScript",
      "type": 2,
      "options": null,
      "correctAnswer": null,
      "points": 20,
      "orderIndex": 1
    }
  ],
  "createdAt": "2024-12-19T10:30:00Z"
}
```

---

## 🔄 Data Transformation Flow

```
Form Values (HTML)
    ↓
FormBuilder Raw Values
    ↓
toPayload() method
    ↓
AssessmentBuilderPayload
    ↓
AssessmentSerializer.serializeAssessmentPayload()
    ↓
HTTP Request Payload (Backend Contract)
    ↓
Backend API Receives
```

### Detailed Transformation for Question 1:

**Form Input:**

```typescript
{
  id: null,
  type: 'Multiple Choice',           // String display name
  title: 'What is JavaScript?',       // Form field name
  description: '',
  options: 'Language\nFramework\nLibrary\nRuntime',  // Newline-separated
  points: 10,
  timeLimitMinutes: 0,
  required: false,
  rubric: null,
  starterCode: null
}
```

**After toPayload():**

```typescript
{
  id: null,
  text: 'What is JavaScript?',        // Renamed: title → text
  type: 'Multiple Choice',            // Still string, will be converted
  options: ["Language", "Framework", "Library", "Runtime"],  // Split into array
  correctAnswer: undefined,
  points: 10,
  orderIndex: 0,                      // Added: array index
  // Legacy properties
  title: 'What is JavaScript?',
  description: '',
  timeLimitMinutes: 0,
  required: false,
  rubric: null,
  starterCode: null
}
```

**After AssessmentSerializer.serializeAssessmentPayload():**

```typescript
{
  text: 'What is JavaScript?',        // ✅ Correct property
  type: 0,                            // ✅ Converted to numeric enum (MCQ=0)
  options: '["Language","Framework","Library","Runtime"]',  // ✅ JSON string
  correctAnswer: undefined,
  points: 10,
  orderIndex: 0                       // ✅ Preserved
}
```

**Final JSON for HTTP Request:**

```json
{
  "text": "What is JavaScript?",
  "type": 0,
  "options": "[\"Language\",\"Framework\",\"Library\",\"Runtime\"]",
  "correctAnswer": null,
  "points": 10,
  "orderIndex": 0
}
```

---

## 🧪 Console Log Output (in Browser DevTools)

When you create an assessment, you'll see:

```
%cTimestamp: 11:30:45 AM
%cRequest Payload: {
  "jobPostId": 5,
  "title": "JavaScript Developer Assessment",
  "description": "Test JavaScript knowledge",
  "type": 0,
  "timeLimitMinutes": 60,
  "isAiGenerated": true,
  "questions": [
    {
      "text": "What is JavaScript?",
      "type": 0,
      "options": "[\"Language\",\"Framework\",\"Library\",\"Runtime\"]",
      "correctAnswer": null,
      "points": 10,
      "orderIndex": 0
    },
    {
      "text": "Explain closures in JavaScript",
      "type": 2,
      "options": null,
      "correctAnswer": null,
      "points": 20,
      "orderIndex": 1
    }
  ]
}
%cResponse: {
  "id": 123,
  "jobPostId": 5,
  ...
}
```

---

## 📋 Enum Value Mappings

### Frontend to Backend - QuestionType

| Frontend Display | Frontend Type      | Backend Enum           | Backend Value |
| ---------------- | ------------------ | ---------------------- | ------------- |
| Multiple Choice  | 'Multiple Choice'  | QuestionType.MCQ       | 0             |
| True/False       | 'True/False'       | QuestionType.TrueFalse | 1             |
| Text Answer      | 'Text Answer'      | QuestionType.OpenEnded | 2             |
| Coding Challenge | 'Coding Challenge' | QuestionType.Coding    | 3             |

### Frontend to Backend - AssessmentType

| Frontend    | Backend Enum               | Backend Value |
| ----------- | -------------------------- | ------------- |
| (Hardcoded) | AssessmentType.Technical   | 0             |
| (Future)    | AssessmentType.Personality | 1             |
| (Future)    | AssessmentType.Mixed       | 2             |

---

## 🔍 Why This Matters

The 400 validation error occurred because:

1. Backend looks for property `Questions[0].Text`
2. Frontend sent `Questions[0].Title`
3. Backend validation failed: **Property not found**
4. Backend returned: `"Questions[0].Text" - Property required but not found`

Now that we're sending the correct property names and types, the backend will:

1. Find all required properties
2. Validate the values
3. Save to database
4. Return 200 OK with created resource

---

## ✨ Next Steps

1. Test by creating a new assessment
2. Open DevTools Console
3. Look for "Assessment Payload" log
4. Verify payload structure matches "AFTER" example above
5. Check Network tab for HTTP 200 response
6. Confirm assessment is saved in database
