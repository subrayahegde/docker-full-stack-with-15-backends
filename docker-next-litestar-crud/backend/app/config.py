from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://postgres:Pass123@database:5432/clidb?ssl=disable"
    port: int = 5000
    cors_origin: str = "http://localhost:3000"


settings = Settings()

