from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List, Optional

router = APIRouter(prefix="/api/v1/leads", tags=["AI Lead Intelligence"])

class LeadScorePayload(BaseModel):
    leadId: str
    name: str
    companyName: Optional[str] = None
    industry: Optional[str] = None
    estimatedValue: float = 0.0
    source: Optional[str] = "DIRECT"
    activityCount: int = 0
    notes: List[str] = Field(default_factory=list)

class Factor(BaseModel):
    factor: str
    impact: str
    description: str

class LeadScoreResponse(BaseModel):
    score: int
    confidence: float
    factors: List[Factor]
    reasoning: str
    recommendedAction: str
    suggestedUrgency: str

@router.post("/score", response_model=LeadScoreResponse)
async def score_lead(payload: LeadScorePayload):
    score = 50
    factors: List[Factor] = []

    # 1. Deal Value Factor
    if payload.estimatedValue >= 100000:
        score += 25
        factors.append(Factor(factor="Enterprise Deal Size", impact="POSITIVE", description=f"Opportunity value (${payload.estimatedValue:,.0f}) is in top tier."))
    elif payload.estimatedValue >= 25000:
        score += 15
        factors.append(Factor(factor="Mid-Market Deal Size", impact="POSITIVE", description=f"Opportunity value (${payload.estimatedValue:,.0f}) meets mid-market targets."))

    # 2. Source Factor
    if payload.source in ["REFERRAL", "INBOUND_WEB", "PARTNER"]:
        score += 15
        factors.append(Factor(factor="High-Intent Inbound Channel", impact="POSITIVE", description=f"Sourced via {payload.source}."))
    elif payload.source == "COLD_OUTREACH":
        score -= 10
        factors.append(Factor(factor="Cold Prospect", impact="NEGATIVE", description="Requires discovery qualification."))

    # 3. Activity History
    if payload.activityCount >= 3:
        score += 10
        factors.append(Factor(factor="Active Engagement", impact="POSITIVE", description=f"{payload.activityCount} recorded interactions."))

    score = max(5, min(99, score))

    if score >= 80:
        reasoning = "High propensity to close due to significant deal value and strong inbound intent."
        recommendedAction = "Schedule technical architecture & pricing proposal review."
        urgency = "HIGH"
    elif score >= 50:
        reasoning = "Steady opportunity velocity with standard qualification milestones."
        recommendedAction = "Share tailored case study and schedule follow-up discovery."
        urgency = "MEDIUM"
    else:
        reasoning = "Early-stage lead with low current engagement."
        recommendedAction = "Enroll in educational nurture email sequence."
        urgency = "LOW"

    return LeadScoreResponse(
        score=score,
        confidence=0.94,
        factors=factors,
        reasoning=reasoning,
        recommendedAction=recommendedAction,
        suggestedUrgency=urgency
    )
