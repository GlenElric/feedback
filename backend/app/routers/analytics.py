"""
Advanced analytics router.
Provides: Sentiment Analysis, Keyword Extraction, Performance Scoring, Trend Analysis.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import Any, Dict, List
from collections import Counter, defaultdict
from datetime import datetime, timedelta

from ..database import get_db
from ..models import User, Form, Question, Response as ResponseModel, Answer
from ..utils.security import get_current_active_user
from ..utils.nlp import analyze_sentiment_batch, extract_keywords, extract_phrases

router = APIRouter()


def _collect_text_responses(answers: List[Answer], text_question_ids: set) -> List[str]:
    """Gather all text answer values for text/textarea questions."""
    texts = []
    for ans in answers:
        if ans.question_id in text_question_ids:
            val = ans.answer_value
            if isinstance(val, str) and val.strip():
                texts.append(val.strip())
    return texts


def _compute_performance_score(
    form: Form,
    responses: List[ResponseModel],
    answers: List[Answer],
    sentiment_score: float,
) -> Dict[str, Any]:
    """
    Compute an overall performance score (0–100) from multiple signals.

    Dimensions:
      1. Response Volume   – how many responses relative to what we'd expect
      2. Completion Quality – % of questions answered per response
      3. Rating Score       – average rating normalized to 0-100
      4. Sentiment Score    – sentiment normalized to 0-100
      5. Engagement         – based on completion time (not too fast, not too slow)
    """
    total_responses = len(responses)
    total_questions = len(form.questions)

    # 1. Response volume score (0-100)
    #    10+ responses = full score, scales linearly
    volume_score = min(100, total_responses * 10)

    # 2. Completion quality (0-100)
    #    Average fraction of questions answered per response
    if total_responses > 0 and total_questions > 0:
        answer_counts = Counter(ans.response_id for ans in answers)
        avg_answered = sum(answer_counts.values()) / total_responses
        completion_score = min(100, round(avg_answered / total_questions * 100))
    else:
        completion_score = 0

    # 3. Rating score (0-100)
    rating_qids = {q.question_id for q in form.questions if q.question_type == "rating"}
    if rating_qids:
        rating_vals = []
        for ans in answers:
            if ans.question_id in rating_qids:
                try:
                    v = float(ans.answer_value)
                    rating_vals.append(v)
                except (TypeError, ValueError):
                    pass
        rating_score = round((sum(rating_vals) / len(rating_vals) / 5) * 100) if rating_vals else 50
    else:
        rating_score = 50  # neutral if no rating questions

    # 4. Sentiment score (0-100)
    #    Map -1..+1 to 0..100
    sentiment_normalized = round((sentiment_score + 1) / 2 * 100)

    # 5. Engagement score (0-100)
    #    Ideal completion time: 30-300 seconds. Too fast = low effort, too slow = struggle
    completion_times = [r.completion_time for r in responses if r.completion_time is not None]
    if completion_times:
        avg_time = sum(completion_times) / len(completion_times)
        if 30 <= avg_time <= 300:
            engagement_score = 100
        elif avg_time < 30:
            engagement_score = max(20, round(avg_time / 30 * 100))
        else:
            engagement_score = max(30, round(300 / avg_time * 100))
    else:
        engagement_score = 50  # neutral if unknown

    # Weighted average
    weights = {
        "volume": 0.15,
        "completion": 0.25,
        "rating": 0.25,
        "sentiment": 0.20,
        "engagement": 0.15,
    }

    overall = round(
        volume_score * weights["volume"]
        + completion_score * weights["completion"]
        + rating_score * weights["rating"]
        + sentiment_normalized * weights["sentiment"]
        + engagement_score * weights["engagement"]
    )

    return {
        "overall": min(100, max(0, overall)),
        "dimensions": {
            "volume": {"score": volume_score, "label": "Response Volume", "weight": weights["volume"]},
            "completion": {"score": completion_score, "label": "Completion Quality", "weight": weights["completion"]},
            "rating": {"score": rating_score, "label": "Average Rating", "weight": weights["rating"]},
            "sentiment": {"score": sentiment_normalized, "label": "Sentiment", "weight": weights["sentiment"]},
            "engagement": {"score": engagement_score, "label": "Engagement", "weight": weights["engagement"]},
        },
        "grade": _score_to_grade(overall),
    }


def _score_to_grade(score: int) -> str:
    if score >= 90:
        return "A+"
    elif score >= 80:
        return "A"
    elif score >= 70:
        return "B"
    elif score >= 60:
        return "C"
    elif score >= 50:
        return "D"
    else:
        return "F"


def _compute_trends(responses: List[ResponseModel], answers: List[Answer], form: Form) -> Dict:
    """
    Compute trend data: daily response counts, rolling averages,
    and rating trends over time.
    """
    if not responses:
        return {"daily": [], "rating_trend": [], "sentiment_trend": []}

    # Sort responses by time
    sorted_responses = sorted(responses, key=lambda r: r.submitted_at)
    first_date = sorted_responses[0].submitted_at.date()
    last_date = sorted_responses[-1].submitted_at.date()

    # Build a day-by-day picture
    daily_counts = defaultdict(int)
    daily_ratings = defaultdict(list)
    daily_texts = defaultdict(list)

    rating_qids = {q.question_id for q in form.questions if q.question_type == "rating"}
    text_qids = {q.question_id for q in form.questions if q.question_type in ("text", "textarea")}

    # Map answer → response for date lookup
    response_map = {r.response_id: r for r in responses}
    for ans in answers:
        resp = response_map.get(ans.response_id)
        if not resp:
            continue
        day = resp.submitted_at.date().isoformat()

        if ans.question_id in rating_qids:
            try:
                daily_ratings[day].append(float(ans.answer_value))
            except (TypeError, ValueError):
                pass

        if ans.question_id in text_qids and isinstance(ans.answer_value, str):
            daily_texts[day].append(ans.answer_value)

    for resp in responses:
        day = resp.submitted_at.date().isoformat()
        daily_counts[day] += 1

    # Fill in gaps (days with 0 responses)
    current = first_date
    all_days = []
    while current <= last_date:
        day_str = current.isoformat()
        all_days.append(day_str)
        current += timedelta(days=1)

    daily_data = []
    cumulative = 0
    for day in all_days:
        count = daily_counts.get(day, 0)
        cumulative += count
        daily_data.append({
            "date": day,
            "responses": count,
            "cumulative": cumulative,
        })

    # Rating trend
    rating_trend = []
    for day in all_days:
        vals = daily_ratings.get(day, [])
        if vals:
            rating_trend.append({
                "date": day,
                "average": round(sum(vals) / len(vals), 2),
                "count": len(vals),
            })

    # Sentiment trend (only for days with text responses)
    sentiment_trend = []
    for day in all_days:
        texts = daily_texts.get(day, [])
        if texts:
            from ..utils.nlp import analyze_sentiment
            scores = [analyze_sentiment(t).score for t in texts]
            sentiment_trend.append({
                "date": day,
                "score": round(sum(scores) / len(scores), 3),
                "count": len(texts),
            })

    return {
        "daily": daily_data,
        "rating_trend": rating_trend,
        "sentiment_trend": sentiment_trend,
    }


@router.get("/{form_id}/insights")
async def get_form_insights(
    form_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Comprehensive analytics insights for a form.
    Returns: sentiment analysis, keyword extraction, performance scoring, trend analysis.
    """
    # Verify ownership + load questions
    form = (
        db.query(Form)
        .options(joinedload(Form.questions))
        .filter(Form.form_id == form_id, Form.user_id == current_user.user_id)
        .first()
    )
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    # Load all responses + answers
    responses = (
        db.query(ResponseModel)
        .filter(ResponseModel.form_id == form_id)
        .order_by(ResponseModel.submitted_at.asc())
        .all()
    )

    answers = (
        db.query(Answer)
        .join(ResponseModel)
        .filter(ResponseModel.form_id == form_id)
        .all()
    )

    total_responses = len(responses)

    # ── Identify text questions ──
    text_qids = {
        q.question_id for q in form.questions
        if q.question_type in ("text", "textarea")
    }
    text_responses = _collect_text_responses(answers, text_qids)

    # ── 1. Sentiment Analysis ──
    sentiment = analyze_sentiment_batch(text_responses)

    # Per-question sentiment
    question_sentiments = []
    for q in sorted(form.questions, key=lambda x: x.order_index):
        if q.question_type in ("text", "textarea"):
            q_texts = [
                ans.answer_value for ans in answers
                if ans.question_id == q.question_id
                and isinstance(ans.answer_value, str) and ans.answer_value.strip()
            ]
            q_sentiment = analyze_sentiment_batch(q_texts)
            question_sentiments.append({
                "question_id": q.question_id,
                "question_text": q.question_text,
                "sentiment": q_sentiment,
            })

    # ── 2. Keyword Extraction ──
    keywords = extract_keywords(text_responses, top_n=20)
    phrases = extract_phrases(text_responses, top_n=10)

    # ── 3. Performance Scoring ──
    performance = _compute_performance_score(
        form, responses, answers, sentiment["overall_score"]
    )

    # ── 4. Trend Analysis ──
    trends = _compute_trends(responses, answers, form)

    return {
        "form_id": form_id,
        "form_title": form.title,
        "total_responses": total_responses,
        "total_text_responses": len(text_responses),

        "sentiment": sentiment,
        "question_sentiments": question_sentiments,

        "keywords": keywords,
        "phrases": phrases,

        "performance": performance,

        "trends": trends,
    }
