<?php
/**
 * ARCHIVO PRIVADO - NÚCLEO (CORE)
 * Implementación SOLID, SRP, SoC, DRY.
 * Soporte de Autenticación Dual (Token API / Sesión WP) y gestión CORS.
 * RUTA: /home/rccgaowg/9z3k7v/v2/env_newface/update_profile_core.php
 */

// Bloqueo de acceso directo
if (!defined('NFC_SECURE_BOOT')) {
    header("HTTP/1.1 403 Forbidden");
    exit('Acceso denegado.');
}

/* ====================================================================
 * 1. CONFIGURACIÓN
 * ==================================================================== */
$external_config = require '/home/rccgaowg/9z3k7v/v2/env_newface/etc.php';

$config = [
    'wp_load_path'    => '/home/rccgaowg/my.newfacecards.com/wp-load.php',
    'auth_token'      => '',
    'allowed_methods' => ['POST', 'OPTIONS'], // Se permite OPTIONS para preflight
    'cors_origin'     => '*' // Puede restringirse al dominio del frontend
];

/* ====================================================================
 * 2. CONSTANTES DE DOMINIO (Evitar Magic Strings)
 * ==================================================================== */
class AuthType {
    public const SESSION = 'session';
    public const TOKEN = 'token';
    public const NONE = 'none';
}

/* ====================================================================
 * 3. INTERFACES
 * ==================================================================== */
interface UserRepositoryInterface {
    public function updateUser(int $userId, array $data): bool;
    public function getLastError(): string;
}

/* ====================================================================
 * 4. SERVICIOS DE INFRAESTRUCTURA (SRP & SoC)
 * ==================================================================== */

/**
 * Gestor de Entorno WordPress
 */
class WpEnvironmentLoader {
    public static function load(string $wpLoadPath): void {
        if (!defined('ABSPATH')) {
            define('WP_USE_THEMES', false);
            if (!file_exists($wpLoadPath)) {
                throw new Exception("Error crítico: No se pudo localizar wp-load.php");
            }
            require_once $wpLoadPath;
        }
    }
}

/**
 * Middleware de CORS
 */
class CorsMiddleware {
    private string $allowedOrigin;

    public function __construct(string $allowedOrigin) {
        $this->allowedOrigin = $allowedOrigin;
    }

    public function handlePreflight(): void {
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            $this->sendHeaders();
            http_response_code(200);
            exit;
        }
    }

    public function sendHeaders(): void {
        header("Access-Control-Allow-Origin: " . $this->allowedOrigin);
        header("Access-Control-Allow-Methods: POST, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
    }
}

/**
 * Servicio de Respuestas HTTP
 */
class HttpResponder {
    public static function json(int $statusCode, bool $success, string $message, array $data = []): void {
        header("Content-Type: application/json; charset=UTF-8");
        http_response_code($statusCode);
        
        $response = ['success' => $success, 'message' => $message];
        if (!empty($data)) {
            $response['data'] = $data;
        }
        
        echo json_encode($response);
        exit;
    }
}

/**
 * Servicio de Autenticación Estratégica
 */
class Authenticator {
    private string $expectedToken;
    private string $activeAuthType = AuthType::NONE;

    public function __construct(string $expectedToken) {
        $this->expectedToken = $expectedToken;
    }

    public function authenticate(): bool {
        // 1. Evaluar Sesión activa de WordPress (Prioridad de seguridad interna)
        if (function_exists('is_user_logged_in') && is_user_logged_in()) {
            $this->activeAuthType = AuthType::SESSION;
            return true;
        }

        // 2. Evaluar Token de API externa
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        
        // Fallback por si el servidor ejecuta PHP como CGI y recorta la cabecera
        if (empty($authHeader) && function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            $authHeader = $headers['Authorization'] ?? '';
        }

        if ($authHeader === "Bearer {$this->expectedToken}") {
            $this->activeAuthType = AuthType::TOKEN;
            return true;
        }

        return false;
    }

    public function getActiveAuthType(): string {
        return $this->activeAuthType;
    }
}

/**
 * Validador de Peticiones
 */
class RequestValidator {
    public function isMethodAllowed(array $allowedMethods): bool {
        return in_array($_SERVER['REQUEST_METHOD'], $allowedMethods);
    }

    public function getJsonPayload(): ?array {
        $input = file_get_contents("php://input");
        $data = json_decode($input, true);
        return is_array($data) ? $data : null;
    }

    public function isCorpusValid(?string $jsonString): bool {
        if (empty($jsonString)) return false;
        json_decode($jsonString);
        return json_last_error() === JSON_ERROR_NONE;
    }
}

/**
 * Adaptador de Infraestructura para WordPress
 */
class WordPressUserRepository implements UserRepositoryInterface {
    private string $lastError = '';

    public function updateUser(int $userId, array $data): bool {
        $updatePayload = ['ID' => $userId];
        $allowedFields = ['first_name', 'last_name', 'description', 'user_url', 'nickname'];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updatePayload[$field] = $data[$field];
            }
        }

        if (count($updatePayload) === 1) {
            $this->lastError = "No se proporcionaron campos válidos para actualizar.";
            return false;
        }

        $result = wp_update_user($updatePayload);

        if (is_wp_error($result)) {
            $this->lastError = $result->get_error_message();
            return false;
        }

        return true;
    }

    public function getLastError(): string {
        return $this->lastError;
    }
}

/* ====================================================================
 * 5. ORQUESTADOR (Caso de Uso)
 * ==================================================================== */

class UpdateProfileUseCase {
    private Authenticator $auth;
    private RequestValidator $validator;
    private UserRepositoryInterface $repository;

    public function __construct(
        Authenticator $auth, 
        RequestValidator $validator, 
        UserRepositoryInterface $repository
    ) {
        $this->auth = $auth;
        $this->validator = $validator;
        $this->repository = $repository;
    }

    public function execute(): void {
        $payload = $this->validator->getJsonPayload();
        $userId = 0;

        // Arquitectura Intencional de Seguridad:
        // Si es por sesión, el SSOT es el núcleo de WP. Ignoramos cualquier ID enviado por el cliente.
        // Si es por token (máquina a máquina), dependemos del ID dictado en el payload.
        if ($this->auth->getActiveAuthType() === AuthType::SESSION) {
            $userId = get_current_user_id();
            if ($userId === 0) {
                HttpResponder::json(403, false, "Estado de sesión corrupto o no inicializado.");
            }
        } elseif ($this->auth->getActiveAuthType() === AuthType::TOKEN) {
            if (!$payload || !isset($payload['user_id'])) {
                HttpResponder::json(400, false, "Estructura de payload inválida. Se requiere 'user_id' explícito.");
            }
            $userId = intval($payload['user_id']);
        } else {
            HttpResponder::json(401, false, "Flujo de autenticación no resuelto.");
        }

        $updateData = [];

        // Validar e incorporar 'description' (JSON estructurado)
        if (isset($payload['description'])) {
            $jsonCorpus = is_array($payload['description']) ? json_encode($payload['description']) : $payload['description'];
            if (!$this->validator->isCorpusValid($jsonCorpus)) {
                HttpResponder::json(400, false, "El campo 'description' debe contener un JSON estructurado válido.");
            }
            $updateData['description'] = $jsonCorpus;
        }

        // Incorporar campos opcionales
        $optionalFields = ['first_name', 'last_name', 'user_url', 'nickname'];
        foreach ($optionalFields as $field) {
            if (isset($payload[$field])) {
                $updateData[$field] = $payload[$field];
            }
        }

        // Ejecutar Actualización
        $success = $this->repository->updateUser($userId, $updateData);

        if ($success) {
            HttpResponder::json(200, true, "Perfil actualizado exitosamente.");
        } else {
            HttpResponder::json(500, false, "Fallo al actualizar el perfil: " . $this->repository->getLastError());
        }
    }
}

/* ====================================================================
 * 6. BOOTSTRAP DE EJECUCIÓN (Tubería de Ciclo de Vida)
 * ==================================================================== */
try {
    $validator = new RequestValidator();
    
    // 1. Validar método base
    if (!$validator->isMethodAllowed($config['allowed_methods'])) {
        HttpResponder::json(405, false, "Método HTTP no permitido.");
    }

    // 2. Interceptar CORS Preflight Inmediatamente
    $cors = new CorsMiddleware($config['cors_origin']);
    $cors->handlePreflight();

    // 3. Cargar el entorno para la validación de sesión
    WpEnvironmentLoader::load($config['wp_load_path']);

    // 4. Evaluar Autenticación
    $auth = new Authenticator($config['auth_token']);
    if (!$auth->authenticate()) {
        $cors->sendHeaders();
        HttpResponder::json(401, false, "Acceso denegado. Se requiere Token API o Sesión activa.");
    }

    // 5. Inhibir CORS si la validación fue externa (Token)
    if ($auth->getActiveAuthType() === AuthType::TOKEN) {
        $cors->sendHeaders();
    }

    // 6. Ejecutar Orquestador
    $repository = new WordPressUserRepository();
    $app = new UpdateProfileUseCase($auth, $validator, $repository);
    
    $app->execute();

} catch (Exception $e) {
    HttpResponder::json(500, false, "Error fatal de infraestructura: " . $e->getMessage());
}