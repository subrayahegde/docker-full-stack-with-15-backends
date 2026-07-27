import { json } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { prisma } from "~/db.server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "http://localhost:3000",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

function withCorsHeaders(headers: HeadersInit = {}) {
  const result = new Headers(headers);
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    result.set(key, value);
  });
  return result;
}

// 1. READ ALL (GET /api/products)
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const products = await prisma.products.findMany({
      orderBy: { created_at: "desc" },
    });

    return json(products, {
      headers: withCorsHeaders(),
    });
  } catch (error) {
    return json({ error: "Failed to fetch products" }, { status: 500, headers: withCorsHeaders() });
  }
}

// 2. MUTATIONS (POST, PUT, DELETE /api/products)
export async function action({ request }: ActionFunctionArgs) {
  const method = request.method.toUpperCase();

  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: withCorsHeaders(),
    });
  }

  try {
    if (method === "POST") {
      const body = await request.json();
      const { name, description, price } = body;

      if (!name || price === undefined) {
        return json({ error: "Name and Price fields are required" }, { status: 400, headers: withCorsHeaders() });
      }

      const newProduct = await prisma.products.create({
        data: { name, description, price: parseFloat(price) },
      });
      return json(newProduct, { status: 201, headers: withCorsHeaders() });
    }

    if (method === "PUT") {
      const body = await request.json();
      const { id, name, description, price } = body;

      if (!id) {
        return json({ error: "Product ID is required for updates" }, { status: 400, headers: withCorsHeaders() });
      }

      const updatedProduct = await prisma.products.update({
        where: { id: Number(id) },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(price !== undefined && { price: parseFloat(price) }),
        },
      });
      return json(updatedProduct, { status: 200, headers: withCorsHeaders() });
    }

    if (method === "DELETE") {
      const url = new URL(request.url);
      let id = url.searchParams.get("id");

      if (!id) {
        const pathParts = url.pathname.split("/").filter(Boolean);
        const pathId = pathParts[pathParts.length - 1];
        if (pathId && /^\d+$/.test(pathId)) {
          id = pathId;
        }
      }

      if (!id) {
        const body = await request.json().catch(() => ({}));
        id = body.id;
      }

      if (!id) {
        return json({ error: "Product ID required via query param or body JSON" }, { status: 400, headers: withCorsHeaders() });
      }

      await prisma.products.delete({
        where: { id: Number(id) },
      });
      return json({ success: true, message: `Product ${id} deleted` }, { status: 200, headers: withCorsHeaders() });
    }

    return json({ error: "Method not allowed" }, { status: 405, headers: withCorsHeaders() });
  } catch (error: any) {
    if (error.code === "P2025") {
      return json({ error: "Record to update or delete not found" }, { status: 404, headers: withCorsHeaders() });
    }
    return json({ error: error.message || "Internal Server Error" }, { status: 500, headers: withCorsHeaders() });
  }
}

