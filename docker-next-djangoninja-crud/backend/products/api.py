from typing import List
from django.shortcuts import get_object_or_404
from ninja import Router
from .models import Product
from .schemas import ProductIn, ProductOut, ProductPatch

router = Router(tags=["Products"])


@router.get("", response=List[ProductOut])
def list_products(request):
    return Product.objects.all()


@router.get("/{product_id}", response=ProductOut)
def get_product(request, product_id: int):
    return get_object_or_404(Product, id=product_id)


@router.post("", response={201: ProductOut})
def create_product(request, payload: ProductIn):
    product = Product.objects.create(**payload.dict())
    return 201, product


@router.put("/{product_id}", response=ProductOut)
def update_product(request, product_id: int, payload: ProductIn):
    product = get_object_or_404(Product, id=product_id)
    for attr, value in payload.dict().items():
        setattr(product, attr, value)
    product.save()
    return product


@router.patch("/{product_id}", response=ProductOut)
def partial_update_product(request, product_id: int, payload: ProductPatch):
    product = get_object_or_404(Product, id=product_id)
    for attr, value in payload.dict(exclude_unset=True).items():
        setattr(product, attr, value)
    product.save()
    return product


@router.delete("/{product_id}", response={204: None})
def delete_product(request, product_id: int):
    product = get_object_or_404(Product, id=product_id)
    product.delete()
    return 204, None

