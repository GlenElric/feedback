from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


# ──── Question Schemas ────

class QuestionCreate(BaseModel):
    question_text: str
    question_type: str  # text, multiple_choice, rating, yes_no, dropdown
    is_required: bool = False
    options: Optional[Any] = None  # For multiple_choice / rating / dropdown
    order_index: int = 0


class QuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    question_type: Optional[str] = None
    is_required: Optional[bool] = None
    options: Optional[Any] = None
    order_index: Optional[int] = None


class QuestionResponse(BaseModel):
    question_id: int
    form_id: int
    question_text: str
    question_type: str
    is_required: bool
    options: Optional[Any] = None
    order_index: int
    created_at: datetime

    class Config:
        from_attributes = True


# ──── Form Schemas ────

class FormCreate(BaseModel):
    title: str
    description: Optional[str] = None
    is_active: bool = True
    allow_anonymous: bool = True
    allow_multiple_submissions: bool = False
    submission_deadline: Optional[datetime] = None
    questions: List[QuestionCreate] = []


class FormUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    allow_anonymous: Optional[bool] = None
    allow_multiple_submissions: Optional[bool] = None
    submission_deadline: Optional[datetime] = None


class FormResponse(BaseModel):
    form_id: int
    user_id: int
    title: str
    description: Optional[str] = None
    is_active: bool
    allow_anonymous: bool
    allow_multiple_submissions: bool
    submission_deadline: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    questions: List[QuestionResponse] = []

    class Config:
        from_attributes = True


class FormListResponse(BaseModel):
    form_id: int
    user_id: int
    title: str
    description: Optional[str] = None
    is_active: bool
    allow_anonymous: bool
    created_at: datetime
    updated_at: datetime
    question_count: int = 0
    response_count: int = 0

    class Config:
        from_attributes = True
