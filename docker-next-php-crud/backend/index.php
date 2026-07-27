<?php
// index.php - Main API Router & CRUD Controller

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'db.php';
$db = getDBConnection();

$method = $_SERVER['REQUEST_METHOD'];
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Split the path into chunks safely, omitting empty array spaces
$uriSegments = array_values(array_filter(explode('/', trim($requestUri, '/'))));

// Enforce strict check for the prefix structure: /api/products
if (empty($uriSegments[0]) || $uriSegments[0] !== 'api' || empty($uriSegments[1]) || $uriSegments[1] !== 'products') {
    http_response_code(404);
    echo json_encode(["message" => "Endpoint not found. Use http://localhost:8000/api/products"]);
    exit;
}

// Check if an explicit ID was supplied at position index [2] (e.g., /api/products/5)
$productId = isset($uriSegments[2]) && is_numeric($uriSegments[2]) ? (int)$uriSegments[2] : null;

switch ($method) {
    
    // ==========================================
    // READ (Get all products or get single item)
    // ==========================================
    case 'GET':
        if ($productId) {
            $stmt = $db->prepare("SELECT * FROM products WHERE id = ?");
            $stmt->execute([$productId]);
            $product = $stmt->fetch();
            
            if ($product) {
                echo json_encode($product);
            } else {
                http_response_code(404);
                echo json_encode(["message" => "Product not found"]);
            }
        } else {
            $stmt = $db->query("SELECT * FROM products ORDER BY id DESC");
            $products = $stmt->fetchAll();
            echo json_encode($products);
        }
        break;

    // ==========================================
    // CREATE (Insert a new product record)
    // ==========================================
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (empty($data['name']) || empty($data['price'])) {
            http_response_code(400);
            echo json_encode(["message" => "Incomplete data. 'name' and 'price' are required."]);
            break;
        }

        $sql = "INSERT INTO products (name, description, price) VALUES (:name, :description, :price) RETURNING id";
        $stmt = $db->prepare($sql);
        
        try {
            $stmt->execute([
                ':name' => $data['name'],
                ':description' => $data['description'] ?? null,
                ':price' => $data['price']
            ]);
            $newId = $stmt->fetchColumn();
            
            http_response_code(201);
            echo json_encode(["message" => "Product created successfully", "id" => $newId]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["message" => "Unable to create product", "error" => $e->getMessage()]);
        }
        break;

    // ==========================================
    // UPDATE (Modify an existing product record)
    // ==========================================
    case 'PUT':
        if (!$productId) {
            http_response_code(400);
            echo json_encode(["message" => "Missing target product ID in path"]);
            break;
        }

        $data = json_decode(file_get_contents("php://input"), true);
        
        if (empty($data['name']) || empty($data['price'])) {
            http_response_code(400);
            echo json_encode(["message" => "Incomplete data. 'name' and 'price' are required."]);
            break;
        }

        $sql = "UPDATE products SET name = :name, description = :description, price = :price WHERE id = :id";
        $stmt = $db->prepare($sql);
        
        try {
            $stmt->execute([
                ':name' => $data['name'],
                ':description' => $data['description'] ?? null,
                ':price' => $data['price'],
                ':id' => $productId
            ]);
            
            if ($stmt->rowCount() > 0) {
                echo json_encode(["message" => "Product updated successfully"]);
            } else {
                http_response_code(404);
                echo json_encode(["message" => "Product not found or no changes made"]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["message" => "Unable to update product", "error" => $e->getMessage()]);
        }
        break;

    // ==========================================
    // DELETE (Remove a product record)
    // ==========================================
    case 'DELETE':
        if (!$productId) {
            http_response_code(400);
            echo json_encode(["message" => "Missing target product ID in path"]);
            break;
        }

        $stmt = $db->prepare("DELETE FROM products WHERE id = ?");
        
        try {
            $stmt->execute([$productId]);
            if ($stmt->rowCount() > 0) {
                echo json_encode(["message" => "Product deleted successfully"]);
            } else {
                http_response_code(404);
                echo json_encode(["message" => "Product not found"]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["message" => "Unable to delete product", "error" => $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["message" => "HTTP Method not allowed"]);
        break;
}

