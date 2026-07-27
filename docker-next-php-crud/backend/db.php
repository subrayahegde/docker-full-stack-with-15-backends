<?php
// db.php - Database connection helper

function getDBConnection() {
    $host = getenv('DB_HOST') ?: 'database';
    $port = getenv('DB_PORT') ?: '5432';
    $db   = getenv('DB_NAME') ?: 'clidb';
    $user = getenv('DB_USER') ?: 'postgres';
    $pass = getenv('DB_PASSWORD') ?: 'Pass123';

    $dsn = "pgsql:host=$host;port=$port;dbname=$db;";

    try {
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        return new PDO($dsn, $user, $pass, $options);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database connection failed: " . $e->getMessage()]);
        exit;
    }
}

