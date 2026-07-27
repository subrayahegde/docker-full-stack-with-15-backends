from pydantic import BaseModel, Field, ConfigDict
from decimal import Decimal
from datetime import datetime
from typing import Optional

# Common fields shared across schemas
class ProductBase(BaseModel):
    name: str = Field(..., max_length=100, description="The name of the product")
    description: Optional[str] = Field(None, description="Detailed product description")
    price: Decimal = Field(..., max_digits=10, decimal_places=2, gt=0, description="Product price")

    model_config = ConfigDict(coerce_numbers_to_str=False)

# Schema for creating a product (Request Body)
class ProductCreate(ProductBase):
    pass

# Schema for updating a product (Request Body - makes fields optional)
class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    price: Optional[Decimal] = Field(None, max_digits=10, decimal_places=2, gt=0)

# Schema returned to the frontend (Response Body)
class ProductResponse(ProductBase):
    id: int
    created_at: datetime

    # Enables automatic parsing of SQLAlchemy objects
    model_config = ConfigDict(from_attributes=True)

