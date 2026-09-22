from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.scoring import router as scoring_router
from app.api.sales_assistant import router as sales_router
from app.api.rag import router as rag_router
from app.core.config import settings

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="NexusAI Python Intelligence Microservice (Lead Scoring, RAG, Copilot, Workflows)"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scoring_router)
app.include_router(sales_router)
app.include_router(rag_router)

@app.get("/health")
async def health_check():
    return {
        "status": "UP",
        "service": settings.app_name,
        "environment": settings.environment,
        "capabilities": ["lead_scoring", "sales_assistant", "rag_retrieval", "email_generator"]
    }
