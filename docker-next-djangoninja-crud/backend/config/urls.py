from django.urls import path
from ninja import NinjaAPI
from products.api import router as products_router

api = NinjaAPI(
    title="Products CRUD API",
    version="1.0.0",
    description="Django Ninja API for managing products",
)

api.add_router("/products", products_router)

urlpatterns = [
    path("api/", api.urls),
]

