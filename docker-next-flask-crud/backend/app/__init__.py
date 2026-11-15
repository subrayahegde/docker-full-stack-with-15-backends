from flask import Flask, jsonify
from app.config import Config
from app.extensions import cors, db
from app.routes.products import products_bp


def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGIN"]}})

    app.register_blueprint(products_bp)

    @app.get("/health")
    def health_check():
        return jsonify({"status": "ok"}), 200

    @app.errorhandler(404)
    def not_found(_err):
        return jsonify({"error": "Not found"}), 404

    @app.errorhandler(500)
    def internal_error(_err):
        db.session.rollback()
        return jsonify({"error": "Internal Server Error"}), 500

    return app

