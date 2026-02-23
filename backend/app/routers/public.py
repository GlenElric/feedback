from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import Form, Question, Response, Answer
from ..schemas.form_schemas import FormResponse as FormDetailResponse
from ..schemas.response_schemas import ResponseCreate, SubmissionSuccess

router = APIRouter()


@router.get("/forms/{form_id}", response_model=FormDetailResponse)
async def get_public_form(form_id: int, db: Session = Depends(get_db)):
    """
    Public endpoint – anyone with the link can view the form.
    Only returns active forms.
    """
    form = (
        db.query(Form)
        .options(joinedload(Form.questions))
        .filter(Form.form_id == form_id, Form.is_active == True)
        .first()
    )
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form not found or is no longer accepting responses.",
        )
    return form


@router.post(
    "/forms/{form_id}/responses",
    response_model=SubmissionSuccess,
    status_code=status.HTTP_201_CREATED,
)
async def submit_response(
    form_id: int,
    payload: ResponseCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Public endpoint – submit a response to a form.
    No authentication required when the form allows anonymous submissions.
    """
    # Verify form exists and is active
    form = (
        db.query(Form)
        .options(joinedload(Form.questions))
        .filter(Form.form_id == form_id, Form.is_active == True)
        .first()
    )
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form not found or is no longer accepting responses.",
        )

    # Validate that required questions are answered
    question_map = {q.question_id: q for q in form.questions}
    answered_ids = {a.question_id for a in payload.answers}

    for q in form.questions:
        if q.is_required and q.question_id not in answered_ids:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Required question not answered: '{q.question_text}'",
            )

    # Validate that all answered question_ids belong to this form
    for ans in payload.answers:
        if ans.question_id not in question_map:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Question ID {ans.question_id} does not belong to this form.",
            )

    # Get client IP (best-effort)
    client_ip = request.client.host if request.client else None

    # Create the response record
    new_response = Response(
        form_id=form_id,
        user_id=None,
        is_anonymous=payload.is_anonymous,
        ip_address=client_ip,
        completion_time=payload.completion_time,
    )
    db.add(new_response)
    db.flush()

    # Create answer records
    for ans in payload.answers:
        answer = Answer(
            response_id=new_response.response_id,
            question_id=ans.question_id,
            answer_value=ans.answer_value,
        )
        db.add(answer)

    db.commit()

    return SubmissionSuccess(
        message="Response submitted successfully",
        response_id=new_response.response_id,
    )
