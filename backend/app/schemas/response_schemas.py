from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


# ──── Answer Schemas ────

class AnswerCreate(BaseModel):
    question_id: int
    answer_value: Any  # string, list, number – depends on question type


class AnswerResponse(BaseModel):
    answer_id: int
    question_id: int
    answer_value: Any
    created_at: datetime

    class Config:
        from_attributes = True


# ──── Response Schemas ────

class ResponseCreate(BaseModel):
    """Payload sent by a respondent filling out a form"""
    is_anonymous: bool = True
    answers: List[AnswerCreate] = []
    completion_time: Optional[int] = None  # seconds


class ResponseOut(BaseModel):
    response_id: int
    form_id: int
    user_id: Optional[int] = None
    is_anonymous: bool
    submitted_at: datetime
    completion_time: Optional[int] = None
    answers: List[AnswerResponse] = []

    class Config:
        from_attributes = True


class SubmissionSuccess(BaseModel):
    message: str = "Response submitted successfully"
    response_id: int
