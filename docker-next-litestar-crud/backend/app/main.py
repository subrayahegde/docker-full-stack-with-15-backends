from litestar import Litestar, get
from litestar.config.cors import CORSConfig

from app.config import settings
from app.controllers.products import ProductController
from app.db import sqlalchemy_plugin


@get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}


cors_config = CORSConfig(allow_origins=[settings.cors_origin])

app = Litestar(
    route_handlers=[health_check, ProductController],
    plugins=[sqlalchemy_plugin],
    cors_config=cors_config,
)

