from flask import Blueprint, jsonify, request
from pydantic import ValidationError
from app.extensions import db
from app.models import Product
from app.schemas import ProductCreate, ProductUpdate

products_bp = Blueprint("products", __name__, url_prefix="/api/products")


@products_bp.get("")
def list_products():
    products = db.session.execute(
        db.select(Product).order_by(Product.id.asc())
    ).scalars().all()
    return jsonify([p.to_dict() for p in products]), 200


@products_bp.get("/<int:product_id>")
def get_product(product_id: int):
    product = db.session.get(Product, product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    return jsonify(product.to_dict()), 200


@products_bp.post("")
def create_product():
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({"error": "Invalid JSON body"}), 400

    try:
        data = ProductCreate.model_validate(payload)
    except ValidationError as exc:
        return jsonify({"error": "Validation failed", "details": exc.errors()}), 400

    product = Product(
        name=data.name,
        description=data.description,
        price=data.price,
    )
    db.session.add(product)
    db.session.commit()
    return jsonify(product.to_dict()), 201


@products_bp.put("/<int:product_id>")
def update_product(product_id: int):
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({"error": "Invalid JSON body"}), 400

    try:
        data = ProductUpdate.model_validate(payload)
    except ValidationError as exc:
        return jsonify({"error": "Validation failed", "details": exc.errors()}), 400

    updates = data.model_dump(exclude_unset=True)
    if not updates:
        return jsonify({"error": "No fields provided for update"}), 400

    product = db.session.get(Product, product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    for field, value in updates.items():
        setattr(product, field, value)

    db.session.commit()
    return jsonify(product.to_dict()), 200


@products_bp.delete("/<int:product_id>")
def delete_product(product_id: int):
    product = db.session.get(Product, product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    db.session.delete(product)
    db.session.commit()
    return jsonify({"message": "Product deleted successfully"}), 200

