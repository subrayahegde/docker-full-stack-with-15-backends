from advanced_alchemy.extensions.litestar import (
    AsyncSessionConfig,
    SQLAlchemyAsyncConfig,
    SQLAlchemyPlugin,
)
from app.config import settings

session_config = AsyncSessionConfig(expire_on_commit=False)

sqlalchemy_config = SQLAlchemyAsyncConfig(
    connection_string=settings.database_url,
    session_config=session_config,
    before_send_handler="autocommit",
)

sqlalchemy_plugin = SQLAlchemyPlugin(config=sqlalchemy_config)

