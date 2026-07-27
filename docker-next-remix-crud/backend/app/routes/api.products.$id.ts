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

export async function loader({ request }: LoaderFunctionArgs) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: withCorsHeaders(),
    });
  }

  return json({ message: "Product route" }, { status: 200, headers: withCorsHeaders() });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const method = request.method.toUpperCase();

  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: withCorsHeaders(),
    });
  }

  if (method !== "DELETE") {
    return json({ error: "Method not allowed" }, { status: 405, headers: withCorsHeaders() });
  }

  const id = params.id ?? new URL(request.url).searchParams.get("id");

  if (!id) {
    return json({ error: "Product ID is required" }, { status: 400, headers: withCorsHeaders() });
  }

  try {
    await prisma.products.delete({
      where: { id: Number(id) },
    });

    return json({ success: true, message: `Product ${id} deleted` }, {
      status: 200,
      headers: withCorsHeaders(),
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return json({ error: "Record not found" }, { status: 404, headers: withCorsHeaders() });
    }

    return json({ error: error.message || "Internal Server Error" }, {
      status: 500,
      headers: withCorsHeaders(),
    });
  }
}
