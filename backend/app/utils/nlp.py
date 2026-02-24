"""
Lightweight NLP utilities for sentiment analysis and keyword extraction.
No external NLP libraries required – uses a built-in lexicon approach.
"""

import re
import math
from collections import Counter
from typing import List, Dict, Tuple, Optional

# ────────────────────────────────────────────────────────────
# AFINN-style sentiment lexicon (word → score from -5 to +5)
# ────────────────────────────────────────────────────────────
_SENTIMENT_LEXICON: Dict[str, int] = {
    # Strong positive
    "outstanding": 5, "excellent": 5, "superb": 5, "amazing": 5, "fantastic": 5,
    "incredible": 5, "exceptional": 5, "brilliant": 5, "perfect": 5, "phenomenal": 5,
    # Positive
    "great": 4, "awesome": 4, "wonderful": 4, "love": 4, "loved": 4,
    "best": 4, "beautiful": 4, "impressive": 4, "magnificent": 4, "thrilled": 4,
    "delighted": 4, "remarkable": 4, "fabulous": 4, "terrific": 4,
    # Moderately positive
    "good": 3, "nice": 3, "enjoy": 3, "enjoyed": 3, "happy": 3,
    "pleased": 3, "glad": 3, "valuable": 3, "useful": 3, "helpful": 3,
    "beneficial": 3, "effective": 3, "efficient": 3, "recommend": 3,
    "recommended": 3, "engaging": 3, "informative": 3, "inspiring": 3,
    "insightful": 3, "productive": 3, "satisfied": 3, "exciting": 3,
    # Slightly positive
    "like": 2, "liked": 2, "fine": 2, "well": 2, "positive": 2,
    "decent": 2, "fair": 2, "interesting": 2, "appreciate": 2, "appreciated": 2,
    "comfortable": 2, "convenient": 2, "clear": 2, "smooth": 2,
    "easy": 2, "fun": 2, "friendly": 2, "supportive": 2, "organized": 2,
    "better": 2, "improve": 2, "improved": 2, "practical": 2,
    # Mildly positive
    "ok": 1, "okay": 1, "adequate": 1, "acceptable": 1, "reasonable": 1,
    "alright": 1, "sufficient": 1, "functional": 1, "standard": 1,
    "agree": 1, "works": 1, "working": 1, "thanks": 1, "thank": 1,
    # Mildly negative
    "boring": -1, "slow": -1, "dull": -1, "mediocre": -1, "average": -1,
    "meh": -1, "bland": -1, "ordinary": -1, "repetitive": -1, "long": -1,
    "basic": -1, "limited": -1,
    # Slightly negative
    "bad": -2, "poor": -2, "disappointing": -2, "disappointed": -2,
    "difficult": -2, "confusing": -2, "confused": -2, "complicated": -2,
    "frustrating": -2, "frustrated": -2, "annoying": -2, "annoyed": -2,
    "unhappy": -2, "dissatisfied": -2, "lacking": -2, "weak": -2,
    "unclear": -2, "disorganized": -2, "uncomfortable": -2, "unpleasant": -2,
    "problem": -2, "problems": -2, "issue": -2, "issues": -2,
    # Moderately negative
    "terrible": -3, "horrible": -3, "awful": -3, "hate": -3, "hated": -3,
    "worst": -3, "useless": -3, "waste": -3, "wasted": -3, "broken": -3,
    "fail": -3, "failed": -3, "failure": -3, "unacceptable": -3,
    "dreadful": -3, "miserable": -3, "pathetic": -3, "rude": -3,
    "unprofessional": -3, "incompetent": -3,
    # Strong negative
    "disgusting": -4, "atrocious": -4, "abysmal": -4, "appalling": -4,
    "catastrophic": -4, "disastrous": -4, "outrageous": -4,
    # Extreme negative
    "toxic": -5, "scam": -5, "fraud": -5, "nightmare": -5,
}

# Negation words that flip sentiment
_NEGATORS = {"not", "no", "never", "neither", "nobody", "nothing",
             "nowhere", "nor", "cannot", "can't", "don't", "doesn't",
             "didn't", "won't", "wouldn't", "shouldn't", "couldn't",
             "isn't", "aren't", "wasn't", "weren't", "hardly", "barely"}

# Intensifiers that amplify sentiment
_INTENSIFIERS = {"very": 1.5, "really": 1.5, "extremely": 2.0, "absolutely": 2.0,
                 "incredibly": 2.0, "highly": 1.5, "totally": 1.5, "completely": 1.5,
                 "so": 1.3, "quite": 1.2, "pretty": 1.2, "super": 1.5}

# ────────────────────────────────────────────────────────────
# Stop words for keyword extraction
# ────────────────────────────────────────────────────────────
_STOP_WORDS = frozenset({
    "a", "about", "above", "after", "again", "against", "all", "am", "an",
    "and", "any", "are", "aren't", "as", "at", "be", "because", "been",
    "before", "being", "below", "between", "both", "but", "by", "can",
    "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does",
    "doesn't", "doing", "don't", "down", "during", "each", "few", "for",
    "from", "further", "get", "got", "had", "hadn't", "has", "hasn't",
    "have", "haven't", "having", "he", "her", "here", "hers", "herself",
    "him", "himself", "his", "how", "i", "if", "in", "into", "is", "isn't",
    "it", "it's", "its", "itself", "just", "let", "let's", "may", "me",
    "might", "more", "most", "mustn't", "my", "myself", "no", "nor", "not",
    "of", "off", "on", "once", "only", "or", "other", "ought", "our",
    "ours", "ourselves", "out", "over", "own", "same", "shan't", "she",
    "should", "shouldn't", "so", "some", "such", "than", "that", "the",
    "their", "theirs", "them", "themselves", "then", "there", "these",
    "they", "this", "those", "through", "to", "too", "under", "until",
    "up", "us", "very", "was", "wasn't", "we", "were", "weren't", "what",
    "when", "where", "which", "while", "who", "whom", "why", "will",
    "with", "won't", "would", "wouldn't", "you", "your", "yours",
    "yourself", "yourselves", "also", "still", "like", "really", "much",
    "well", "even", "back", "going", "make", "made", "way", "thing",
    "things", "know", "think", "yes", "no", "one", "two", "go", "went",
    "come", "came", "take", "took", "give", "gave", "see", "saw", "say",
    "said", "use", "used", "find", "found", "tell", "told", "ask", "asked",
    "work", "seem", "feel", "try", "leave", "call",
})


def _tokenize(text: str) -> List[str]:
    """Lowercase and split text into word tokens."""
    text = text.lower()
    text = re.sub(r"[^a-z'\-\s]", " ", text)
    return [w.strip("'-") for w in text.split() if len(w.strip("'-")) > 1]


# ────────────────────────────────────────────────────────────
# Sentiment Analysis
# ────────────────────────────────────────────────────────────

class SentimentResult:
    def __init__(self, score: float, label: str, magnitude: float):
        self.score = score          # -1.0 to +1.0
        self.label = label          # "positive", "negative", "neutral"
        self.magnitude = magnitude  # 0.0 to 1.0 (confidence)

    def to_dict(self):
        return {"score": self.score, "label": self.label, "magnitude": self.magnitude}


def analyze_sentiment(text: str) -> SentimentResult:
    """
    Analyze sentiment of a text string.
    Returns a SentimentResult with score (-1 to +1), label, and magnitude.
    """
    if not text or not text.strip():
        return SentimentResult(0.0, "neutral", 0.0)

    tokens = _tokenize(text)
    if not tokens:
        return SentimentResult(0.0, "neutral", 0.0)

    total_score = 0.0
    scored_count = 0

    for i, word in enumerate(tokens):
        if word not in _SENTIMENT_LEXICON:
            continue

        word_score = float(_SENTIMENT_LEXICON[word])

        # Check for negation in preceding 3 words
        negated = False
        for j in range(max(0, i - 3), i):
            if tokens[j] in _NEGATORS:
                negated = True
                break

        if negated:
            word_score *= -0.75  # Flip and slightly reduce

        # Check for intensifier in preceding word
        if i > 0 and tokens[i - 1] in _INTENSIFIERS:
            multiplier = _INTENSIFIERS[tokens[i - 1]]
            word_score *= multiplier

        total_score += word_score
        scored_count += 1

    if scored_count == 0:
        return SentimentResult(0.0, "neutral", 0.0)

    # Normalize: average score, then map to -1..+1
    avg = total_score / scored_count
    normalized = max(-1.0, min(1.0, avg / 5.0))  # lexicon range is -5..+5

    # Magnitude = how confident we are (based on coverage)
    coverage = scored_count / len(tokens)
    magnitude = min(1.0, coverage * 2)

    if normalized > 0.05:
        label = "positive"
    elif normalized < -0.05:
        label = "negative"
    else:
        label = "neutral"

    return SentimentResult(round(normalized, 3), label, round(magnitude, 3))


def analyze_sentiment_batch(texts: List[str]) -> Dict:
    """
    Analyze sentiment for a batch of texts.
    Returns aggregate statistics.
    """
    if not texts:
        return {
            "overall_score": 0.0,
            "overall_label": "neutral",
            "positive_count": 0,
            "negative_count": 0,
            "neutral_count": 0,
            "total": 0,
            "positive_pct": 0,
            "negative_pct": 0,
            "neutral_pct": 0,
            "per_response": [],
        }

    results = [analyze_sentiment(t) for t in texts]
    scores = [r.score for r in results]

    pos = sum(1 for r in results if r.label == "positive")
    neg = sum(1 for r in results if r.label == "negative")
    neu = sum(1 for r in results if r.label == "neutral")
    total = len(results)

    avg_score = sum(scores) / total
    avg_score = max(-1.0, min(1.0, avg_score))

    if avg_score > 0.05:
        label = "positive"
    elif avg_score < -0.05:
        label = "negative"
    else:
        label = "neutral"

    return {
        "overall_score": round(avg_score, 3),
        "overall_label": label,
        "positive_count": pos,
        "negative_count": neg,
        "neutral_count": neu,
        "total": total,
        "positive_pct": round(pos / total * 100) if total else 0,
        "negative_pct": round(neg / total * 100) if total else 0,
        "neutral_pct": round(neu / total * 100) if total else 0,
        "per_response": [
            {"text": texts[i][:200], "score": r.score, "label": r.label}
            for i, r in enumerate(results)
        ],
    }


# ────────────────────────────────────────────────────────────
# Keyword Extraction
# ────────────────────────────────────────────────────────────

def extract_keywords(texts: List[str], top_n: int = 20) -> List[Dict]:
    """
    Extract top keywords from a list of text responses.
    Uses TF-IDF-like scoring: term frequency weighted by document frequency.
    Returns list of {word, count, score, sentiment}.
    """
    if not texts:
        return []

    # Count term frequency across all documents + document frequency
    tf = Counter()
    df = Counter()
    total_docs = len(texts)

    for text in texts:
        tokens = _tokenize(text)
        meaningful = [t for t in tokens if t not in _STOP_WORDS and len(t) > 2]
        tf.update(meaningful)
        df.update(set(meaningful))  # each word counts once per doc

    if not tf:
        return []

    # Score: TF * log(N / DF) — words appearing in every doc score lower
    scored = {}
    for word, count in tf.items():
        if count < 2 and total_docs > 5:
            continue  # skip very rare words when we have enough data
        idf = math.log((total_docs + 1) / (df[word] + 1)) + 1
        scored[word] = count * idf

    # Sort and take top N
    top_words = sorted(scored.items(), key=lambda x: x[1], reverse=True)[:top_n]

    result = []
    for word, score in top_words:
        # Attach sentiment for each keyword
        word_sentiment = _SENTIMENT_LEXICON.get(word, 0)
        if word_sentiment > 0:
            slabel = "positive"
        elif word_sentiment < 0:
            slabel = "negative"
        else:
            slabel = "neutral"

        result.append({
            "word": word,
            "count": tf[word],
            "score": round(score, 2),
            "sentiment": slabel,
        })

    return result


# ────────────────────────────────────────────────────────────
# Bigram extraction (two-word phrases)
# ────────────────────────────────────────────────────────────

def extract_phrases(texts: List[str], top_n: int = 10) -> List[Dict]:
    """Extract common two-word phrases from text responses."""
    if not texts:
        return []

    bigrams = Counter()
    for text in texts:
        tokens = _tokenize(text)
        meaningful = [t for t in tokens if t not in _STOP_WORDS and len(t) > 2]
        for i in range(len(meaningful) - 1):
            phrase = f"{meaningful[i]} {meaningful[i+1]}"
            bigrams[phrase] += 1

    # Only keep phrases that appear more than once
    common = [(p, c) for p, c in bigrams.most_common(top_n * 2) if c >= 2]
    return [{"phrase": p, "count": c} for p, c in common[:top_n]]
