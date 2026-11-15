from litestar import Controller, delete, get, post, put
from litestar.exceptions import HTTPException, NotFoundException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Product
from app.schemas import ProductCreate, ProductRead, ProductUpdate


class ProductController(Controller):
    path = "/api/products"

    @get("/")
    async def list_products(self, db_session: AsyncSession) -> list[ProductRead]:
        result = await db_session.execute(select(Product).order_by(Product.id.asc()))
        products = result.scalars().all()
        return [ProductRead.model_validate(p) for p in products]

    @get("/{product_id:int}")
    async def get_product(
        self, product_id: int, db_session: AsyncSession
    ) -> ProductRead:
        product = await db_session.get(Product, product_id)
        if not product:
            raise NotFoundException(detail="Product not found")
        return ProductRead.model_validate(product)

    @post("/")
    async def create_product(
        self, data: ProductCreate, db_session: AsyncSession
    ) -> ProductRead:
        product = Product(
            name=data.name,
            description=data.description,
            price=data.price,
        )
        db_session.add(product)
        await db_session.flush()
        await db_session.refresh(product)
        return ProductRead.model_validate(product)

    @put("/{product_id:int}")
    async def update_product(
        self, product_id: int, data: ProductUpdate, db_session: AsyncSession
    ) -> ProductRead:
        updates = data.model_dump(exclude_unset=True)
        if not updates:
            raise HTTPException(status_code=400, detail="No fields provided for update")

        product = await db_session.get(Product, product_id)
        if not product:
            raise NotFoundException(detail="Product not found")

        for field, value in updates.items():
            setattr(product, field, value)

        await db_session.flush()
        await db_session.refresh(product)
        return ProductRead.model_validate(product)

    @delete("/{product_id:int}", status_code=200)
    async def delete_product(
        self, product_id: int, db_session: AsyncSession
    ) -> dict[str, str]:
        product = await db_session.get(Product, product_id)
        if not product:
            raise NotFoundException(detail="Product not found")

        await db_session.delete(product)
        return {"message": "Product deleted successfully"}

