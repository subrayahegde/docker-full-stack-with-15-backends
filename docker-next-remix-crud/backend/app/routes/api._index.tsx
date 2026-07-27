// app/routes/api._index.tsx
import { json } from "@remix-run/node";

export async function loader() {
  return json({ 
    message: "Welcome to the API. Available endpoints: /api/products" 
  }, { status: 200 });
}
