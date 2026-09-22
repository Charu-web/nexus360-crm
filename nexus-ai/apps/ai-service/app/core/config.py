import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "NexusAI Engine"
    port: int = 8000
    host: str = "0.0.0.0"
    environment: str = os.getenv("ENVIRONMENT", "development")
    
    # LLM Provider keys
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")
    default_model: str = os.getenv("AI_MODEL", "gpt-4o-mini")
    embedding_model: str = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
    
    class Config:
        env_file = ".env"

settings = Settings()
