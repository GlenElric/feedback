from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255))
    role = Column(String(50), default="organizer")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    forms = relationship("Form", back_populates="user", cascade="all, delete-orphan")
    responses = relationship("Response", back_populates="user")


class Form(Base):
    __tablename__ = "forms"

    form_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    allow_anonymous = Column(Boolean, default=True)
    allow_multiple_submissions = Column(Boolean, default=False)
    submission_deadline = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="forms")
    questions = relationship("Question", back_populates="form", cascade="all, delete-orphan", order_by="Question.order_index")
    responses = relationship("Response", back_populates="form", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    question_id = Column(Integer, primary_key=True, index=True)
    form_id = Column(Integer, ForeignKey("forms.form_id", ondelete="CASCADE"), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String(50), nullable=False)  # text, multiple_choice, rating, yes_no, etc.
    is_required = Column(Boolean, default=False)
    options = Column(JSON, nullable=True)  # For multiple choice, rating scales
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    form = relationship("Form", back_populates="questions")
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")


class Response(Base):
    __tablename__ = "responses"

    response_id = Column(Integer, primary_key=True, index=True)
    form_id = Column(Integer, ForeignKey("forms.form_id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True)
    is_anonymous = Column(Boolean, default=False)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    ip_address = Column(String(45), nullable=True)
    completion_time = Column(Integer, nullable=True)  # in seconds

    # Relationships
    form = relationship("Form", back_populates="responses")
    user = relationship("User", back_populates="responses")
    answers = relationship("Answer", back_populates="response", cascade="all, delete-orphan")


class Answer(Base):
    __tablename__ = "answers"

    answer_id = Column(Integer, primary_key=True, index=True)
    response_id = Column(Integer, ForeignKey("responses.response_id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.question_id", ondelete="CASCADE"), nullable=False)
    answer_value = Column(JSON, nullable=False)  # Stores any type of answer
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    response = relationship("Response", back_populates="answers")
    question = relationship("Question", back_populates="answers")
