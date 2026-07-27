var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: !0 });
};

// app/entry.server.tsx
var entry_server_exports = {};
__export(entry_server_exports, {
  default: () => handleRequest
});
import { RemixServer } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { jsxDEV } from "react/jsx-dev-runtime";
var ALLOWED_ORIGINS = ["http://localhost:3000"];
function handleRequest(request, responseStatusCode, responseHeaders, remixContext) {
  let origin = request.headers.get("Origin");
  if (origin && ALLOWED_ORIGINS.includes(origin) && (responseHeaders.set("Access-Control-Allow-Origin", origin), responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"), responseHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization"), responseHeaders.set("Access-Control-Allow-Credentials", "true"), responseHeaders.set("Vary", "Origin")), request.method === "OPTIONS")
    return new Response(null, {
      status: 204,
      headers: responseHeaders
    });
  let callbackName = isbot(request.headers.get("user-agent")) ? "onAllReady" : "onShellReady";
  return new Promise((resolve, reject) => {
    let { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsxDEV(RemixServer, { context: remixContext, url: request.url }, void 0, !1, {
        fileName: "app/entry.server.tsx",
        lineNumber: 39,
        columnNumber: 7
      }, this),
      {
        [callbackName]() {
          responseHeaders.set("Content-Type", "text/html"), resolve(
            new Response(pipe, {
              status: responseStatusCode,
              headers: responseHeaders
            })
          );
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          console.error(error);
        }
      }
    );
    setTimeout(abort, 1e4);
  });
}

// app/root.tsx
var root_exports = {};
__export(root_exports, {
  Layout: () => Layout,
  default: () => App
});
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from "@remix-run/react";
import { jsxDEV as jsxDEV2 } from "react/jsx-dev-runtime";
function Layout({ children }) {
  return /* @__PURE__ */ jsxDEV2("html", { lang: "en", children: [
    /* @__PURE__ */ jsxDEV2("head", { children: [
      /* @__PURE__ */ jsxDEV2("meta", { charSet: "utf-8" }, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 13,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV2("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 14,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV2(Meta, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 15,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV2(Links, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 16,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/root.tsx",
      lineNumber: 12,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV2("body", { children: [
      children,
      /* @__PURE__ */ jsxDEV2(ScrollRestoration, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 20,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV2(Scripts, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 21,
        columnNumber: 9
      }, this)
    ] }, void 0, !0, {
      fileName: "app/root.tsx",
      lineNumber: 18,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "app/root.tsx",
    lineNumber: 11,
    columnNumber: 5
  }, this);
}
function App() {
  return /* @__PURE__ */ jsxDEV2(Outlet, {}, void 0, !1, {
    fileName: "app/root.tsx",
    lineNumber: 28,
    columnNumber: 10
  }, this);
}

// app/routes/api.products.$id.ts
var api_products_id_exports = {};
__export(api_products_id_exports, {
  action: () => action,
  loader: () => loader
});
import { json } from "@remix-run/node";

// app/db.server.ts
import { PrismaClient } from "@prisma/client";
var prisma;
global.__db__ || (global.__db__ = new PrismaClient()), prisma = global.__db__, prisma.$connect();

// app/routes/api.products.$id.ts
var CORS_HEADERS = {
  "Access-Control-Allow-Origin": "http://localhost:3000",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true"
};
function withCorsHeaders(headers = {}) {
  let result = new Headers(headers);
  return Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    result.set(key, value);
  }), result;
}
async function loader({ request }) {
  return request.method === "OPTIONS" ? new Response(null, {
    status: 204,
    headers: withCorsHeaders()
  }) : json({ message: "Product route" }, { status: 200, headers: withCorsHeaders() });
}
async function action({ request, params }) {
  let method = request.method.toUpperCase();
  if (method === "OPTIONS")
    return new Response(null, {
      status: 204,
      headers: withCorsHeaders()
    });
  if (method !== "DELETE")
    return json({ error: "Method not allowed" }, { status: 405, headers: withCorsHeaders() });
  let id = params.id ?? new URL(request.url).searchParams.get("id");
  if (!id)
    return json({ error: "Product ID is required" }, { status: 400, headers: withCorsHeaders() });
  try {
    return await prisma.products.delete({
      where: { id: Number(id) }
    }), json({ success: !0, message: `Product ${id} deleted` }, {
      status: 200,
      headers: withCorsHeaders()
    });
  } catch (error) {
    return error.code === "P2025" ? json({ error: "Record not found" }, { status: 404, headers: withCorsHeaders() }) : json({ error: error.message || "Internal Server Error" }, {
      status: 500,
      headers: withCorsHeaders()
    });
  }
}

// app/routes/api.products.ts
var api_products_exports = {};
__export(api_products_exports, {
  action: () => action2,
  loader: () => loader2
});
import { json as json2 } from "@remix-run/node";
var CORS_HEADERS2 = {
  "Access-Control-Allow-Origin": "http://localhost:3000",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true"
};
function withCorsHeaders2(headers = {}) {
  let result = new Headers(headers);
  return Object.entries(CORS_HEADERS2).forEach(([key, value]) => {
    result.set(key, value);
  }), result;
}
async function loader2({ request }) {
  try {
    let products = await prisma.products.findMany({
      orderBy: { created_at: "desc" }
    });
    return json2(products, {
      headers: withCorsHeaders2()
    });
  } catch {
    return json2({ error: "Failed to fetch products" }, { status: 500, headers: withCorsHeaders2() });
  }
}
async function action2({ request }) {
  let method = request.method.toUpperCase();
  if (method === "OPTIONS")
    return new Response(null, {
      status: 204,
      headers: withCorsHeaders2()
    });
  try {
    if (method === "POST") {
      let body = await request.json(), { name, description, price } = body;
      if (!name || price === void 0)
        return json2({ error: "Name and Price fields are required" }, { status: 400, headers: withCorsHeaders2() });
      let newProduct = await prisma.products.create({
        data: { name, description, price: parseFloat(price) }
      });
      return json2(newProduct, { status: 201, headers: withCorsHeaders2() });
    }
    if (method === "PUT") {
      let body = await request.json(), { id, name, description, price } = body;
      if (!id)
        return json2({ error: "Product ID is required for updates" }, { status: 400, headers: withCorsHeaders2() });
      let updatedProduct = await prisma.products.update({
        where: { id: Number(id) },
        data: {
          ...name && { name },
          ...description !== void 0 && { description },
          ...price !== void 0 && { price: parseFloat(price) }
        }
      });
      return json2(updatedProduct, { status: 200, headers: withCorsHeaders2() });
    }
    if (method === "DELETE") {
      let url = new URL(request.url), id = url.searchParams.get("id");
      if (!id) {
        let pathParts = url.pathname.split("/").filter(Boolean), pathId = pathParts[pathParts.length - 1];
        pathId && /^\d+$/.test(pathId) && (id = pathId);
      }
      return id || (id = (await request.json().catch(() => ({}))).id), id ? (await prisma.products.delete({
        where: { id: Number(id) }
      }), json2({ success: !0, message: `Product ${id} deleted` }, { status: 200, headers: withCorsHeaders2() })) : json2({ error: "Product ID required via query param or body JSON" }, { status: 400, headers: withCorsHeaders2() });
    }
    return json2({ error: "Method not allowed" }, { status: 405, headers: withCorsHeaders2() });
  } catch (error) {
    return error.code === "P2025" ? json2({ error: "Record to update or delete not found" }, { status: 404, headers: withCorsHeaders2() }) : json2({ error: error.message || "Internal Server Error" }, { status: 500, headers: withCorsHeaders2() });
  }
}

// app/routes/api._index.tsx
var api_index_exports = {};
__export(api_index_exports, {
  loader: () => loader3
});
import { json as json3 } from "@remix-run/node";
async function loader3() {
  return json3({
    message: "Welcome to the API. Available endpoints: /api/products"
  }, { status: 200 });
}

// server-assets-manifest:@remix-run/dev/assets-manifest
var assets_manifest_default = { entry: { module: "/build/entry.client-BKQEHH2D.js", imports: ["/build/_shared/chunk-O4BRYNJ4.js", "/build/_shared/chunk-RUVIMSLZ.js", "/build/_shared/chunk-MCH5QMAS.js", "/build/_shared/chunk-UWV35TSL.js", "/build/_shared/chunk-XGOTYLZ5.js", "/build/_shared/chunk-U4FRFQSK.js", "/build/_shared/chunk-7M6SC7J5.js", "/build/_shared/chunk-PNG5AS42.js"] }, routes: { root: { id: "root", parentId: void 0, path: "", index: void 0, caseSensitive: void 0, module: "/build/root-E3L5OCY7.js", imports: void 0, hasAction: !1, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/api._index": { id: "routes/api._index", parentId: "root", path: "api", index: !0, caseSensitive: void 0, module: "/build/routes/api._index-4LBVBPVH.js", imports: void 0, hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/api.products": { id: "routes/api.products", parentId: "root", path: "api/products", index: void 0, caseSensitive: void 0, module: "/build/routes/api.products-CXE3YENA.js", imports: void 0, hasAction: !0, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/api.products.$id": { id: "routes/api.products.$id", parentId: "routes/api.products", path: ":id", index: void 0, caseSensitive: void 0, module: "/build/routes/api.products.$id-6DRUOZDE.js", imports: void 0, hasAction: !0, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 } }, version: "3e346364", hmr: { runtime: "/build/_shared/chunk-MCH5QMAS.js", timestamp: 1785134334729 }, url: "/build/manifest-3E346364.js" };

// server-entry-module:@remix-run/dev/server-build
var mode = "development", assetsBuildDirectory = "public/build", future = { v3_fetcherPersist: !1, v3_relativeSplatPath: !1, v3_throwAbortReason: !1, v3_routeConfig: !1, v3_singleFetch: !1, v3_lazyRouteDiscovery: !1, unstable_optimizeDeps: !1 }, publicPath = "/build/", entry = { module: entry_server_exports }, routes = {
  root: {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: root_exports
  },
  "routes/api.products.$id": {
    id: "routes/api.products.$id",
    parentId: "routes/api.products",
    path: ":id",
    index: void 0,
    caseSensitive: void 0,
    module: api_products_id_exports
  },
  "routes/api.products": {
    id: "routes/api.products",
    parentId: "root",
    path: "api/products",
    index: void 0,
    caseSensitive: void 0,
    module: api_products_exports
  },
  "routes/api._index": {
    id: "routes/api._index",
    parentId: "root",
    path: "api",
    index: !0,
    caseSensitive: void 0,
    module: api_index_exports
  }
};
export {
  assets_manifest_default as assets,
  assetsBuildDirectory,
  entry,
  future,
  mode,
  publicPath,
  routes
};
//# sourceMappingURL=index.js.map
