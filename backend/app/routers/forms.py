from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Any, Dict
from collections import Counter

from ..database import get_db
from ..models import User, Form, Question, Response as ResponseModel, Answer
from ..schemas.form_schemas import (
    FormCreate, FormUpdate, FormResponse, FormListResponse, QuestionResponse
)
from ..schemas.response_schemas import ResponseOut
from ..utils.security import get_current_active_user

router = APIRouter()


@router.post("/", response_model=FormResponse, status_code=status.HTTP_201_CREATED)
async def create_form(
    form_data: FormCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a new feedback form with questions"""
    # Create the form
    new_form = Form(
        user_id=current_user.user_id,
        title=form_data.title,
        description=form_data.description,
        is_active=form_data.is_active,
        allow_anonymous=form_data.allow_anonymous,
        allow_multiple_submissions=form_data.allow_multiple_submissions,
        submission_deadline=form_data.submission_deadline,
    )
    db.add(new_form)
    db.flush()  # get the form_id before adding questions

    # Create the questions
    for idx, q_data in enumerate(form_data.questions):
        question = Question(
            form_id=new_form.form_id,
            question_text=q_data.question_text,
            question_type=q_data.question_type,
            is_required=q_data.is_required,
            options=q_data.options,
            order_index=q_data.order_index if q_data.order_index else idx,
        )
        db.add(question)

    db.commit()
    db.refresh(new_form)

    # Reload with questions eagerly loaded
    form = (
        db.query(Form)
        .options(joinedload(Form.questions))
        .filter(Form.form_id == new_form.form_id)
        .first()
    )

    return form


@router.get("/", response_model=List[FormListResponse])
async def list_forms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List all forms created by the current user"""
    forms = (
        db.query(Form)
        .filter(Form.user_id == current_user.user_id)
        .order_by(Form.created_at.desc())
        .all()
    )

    result = []
    for form in forms:
        question_count = db.query(Question).filter(Question.form_id == form.form_id).count()
        response_count = db.query(ResponseModel).filter(ResponseModel.form_id == form.form_id).count()
        result.append(
            FormListResponse(
                form_id=form.form_id,
                user_id=form.user_id,
                title=form.title,
                description=form.description,
                is_active=form.is_active,
                allow_anonymous=form.allow_anonymous,
                created_at=form.created_at,
                updated_at=form.updated_at,
                question_count=question_count,
                response_count=response_count,
            )
        )
    return result


@router.get("/{form_id}", response_model=FormResponse)
async def get_form(
    form_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a specific form with its questions"""
    form = (
        db.query(Form)
        .options(joinedload(Form.questions))
        .filter(Form.form_id == form_id, Form.user_id == current_user.user_id)
        .first()
    )
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form not found",
        )
    return form


@router.put("/{form_id}", response_model=FormResponse)
async def update_form(
    form_id: int,
    form_data: FormUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update a form"""
    form = db.query(Form).filter(
        Form.form_id == form_id, Form.user_id == current_user.user_id
    ).first()

    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form not found",
        )

    update_data = form_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(form, key, value)

    db.commit()
    db.refresh(form)

    # Reload with questions
    form = (
        db.query(Form)
        .options(joinedload(Form.questions))
        .filter(Form.form_id == form_id)
        .first()
    )
    return form


@router.delete("/{form_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_form(
    form_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete a form and all its associated data"""
    form = db.query(Form).filter(
        Form.form_id == form_id, Form.user_id == current_user.user_id
    ).first()

    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form not found",
        )

    db.delete(form)
    db.commit()
    return None


@router.get("/{form_id}/responses", response_model=List[ResponseOut])
async def get_form_responses(
    form_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get all responses for a form (owner only)"""
    # Verify ownership
    form = db.query(Form).filter(
        Form.form_id == form_id, Form.user_id == current_user.user_id
    ).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    responses = (
        db.query(ResponseModel)
        .options(joinedload(ResponseModel.answers))
        .filter(ResponseModel.form_id == form_id)
        .order_by(ResponseModel.submitted_at.desc())
        .all()
    )
    return responses


@router.get("/{form_id}/analytics")
async def get_form_analytics(
    form_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Compute analytics for each question in a form.
    Returns a list of question analytics objects.
    """
    # Verify ownership
    form = (
        db.query(Form)
        .options(joinedload(Form.questions))
        .filter(Form.form_id == form_id, Form.user_id == current_user.user_id)
        .first()
    )
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    response_count = db.query(ResponseModel).filter(
        ResponseModel.form_id == form_id
    ).count()

    # Gather all answers grouped by question
    answers = db.query(Answer).join(ResponseModel).filter(
        ResponseModel.form_id == form_id
    ).all()

    answer_map: Dict[int, list] = {}
    for ans in answers:
        answer_map.setdefault(ans.question_id, []).append(ans.answer_value)

    # Compute completion times
    completion_times = [
        r.completion_time
        for r in db.query(ResponseModel).filter(ResponseModel.form_id == form_id).all()
        if r.completion_time is not None
    ]
    avg_completion = (
        round(sum(completion_times) / len(completion_times))
        if completion_times else None
    )

    question_analytics = []
    for q in sorted(form.questions, key=lambda x: x.order_index):
        vals = answer_map.get(q.question_id, [])
        qa: Dict[str, Any] = {
            "question_id": q.question_id,
            "question_text": q.question_text,
            "question_type": q.question_type,
            "total_answers": len(vals),
        }

        if q.question_type == "rating":
            numeric = [v for v in vals if isinstance(v, (int, float))]
            qa["average"] = round(sum(numeric) / len(numeric), 2) if numeric else 0
            qa["distribution"] = dict(Counter(numeric))

        elif q.question_type in ("multiple_choice", "yes_no", "dropdown"):
            qa["distribution"] = dict(Counter(vals))

        elif q.question_type in ("text", "textarea"):
            qa["responses"] = vals[:100]  # cap to last 100 for performance

        question_analytics.append(qa)

    return {
        "form_id": form_id,
        "form_title": form.title,
        "total_responses": response_count,
        "avg_completion_time": avg_completion,
        "questions": question_analytics,
    }

