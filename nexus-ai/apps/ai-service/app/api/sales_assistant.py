from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List, Optional

router = APIRouter(prefix="/api/v1/ai", tags=["AI Sales Assistant"])

class GenerateEmailPayload(BaseModel):
    leadName: str
    companyName: Optional[str] = "your team"
    emailPurpose: str = "FOLLOW_UP"
    tone: str = "PROFESSIONAL"
    specificGoal: str
    contextNotes: Optional[str] = None

class GenerateEmailResponse(BaseModel):
    subject: str
    body: str
    keyPointsCovered: List[str]

@router.post("/generate-email", response_model=GenerateEmailResponse)
async def generate_email(payload: GenerateEmailPayload):
    tone_greeting = "Dear" if payload.tone == "PROFESSIONAL" else "Hi"
    
    if payload.emailPurpose == "FIRST_OUTREACH":
        subject = f"Unlocking AI operational efficiency for {payload.companyName}"
        opening = f"{tone_greeting} {payload.leadName},\n\nI noticed {payload.companyName}'s recent initiatives and wanted to introduce NexusAI."
    elif payload.emailPurpose == "PROPOSAL_SUBMISSION":
        subject = f"NexusAI Proposal & Solution Overview for {payload.companyName}"
        opening = f"{tone_greeting} {payload.leadName},\n\nThank you for taking the time to discuss your operational requirements."
    else:
        subject = f"Following up regarding NexusAI implementation for {payload.companyName}"
        opening = f"{tone_greeting} {payload.leadName},\n\nI am following up on our recent conversation."

    body = f"""{opening}

Our AI Business Operations platform unifies intelligent CRM workflows, document knowledge search, and automated customer follow-ups.

Goal: {payload.specificGoal}
{f"Context: {payload.contextNotes}" if payload.contextNotes else ""}

Would you have 15 minutes available this week for a brief walkthrough?

Best regards,
The NexusAI Solutions Team"""

    return GenerateEmailResponse(
        subject=subject,
        body=body,
        keyPointsCovered=[payload.emailPurpose, payload.tone, "Call to action included"]
    )
