import os


class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://postgres:Pass123@database:5432/clidb?sslmode=disable",
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_ORIGIN = os.getenv("CORS_ORIGIN", "http://localhost:3000")

