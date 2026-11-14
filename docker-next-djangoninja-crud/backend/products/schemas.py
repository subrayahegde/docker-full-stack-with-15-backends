from datetime import datetime
from decimal import Decimal
from typing import Optional
from ninja import Schema
from pydantic import Field


class ProductIn(Schema):
    name: str = Field(..., max_length=100)
    description: Optional[str] = None
    price: Decimal = Field(..., max_digits=10, decimal_places=2)


class ProductPatch(Schema):
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    price: Optional[Decimal] = Field(None, max_digits=10, decimal_places=2)


class ProductOut(Schema):
    id: int
    name: str
    description: Optional[str]
    price: Decimal
    created_at: datetime

