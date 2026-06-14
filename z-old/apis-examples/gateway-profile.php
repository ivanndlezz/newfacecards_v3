<?php
/**
 * ARCHIVO PÚBLICO - PASARELA DE ACTUALIZACIÓN (PROFILE GATEWAY)
 * Responsabilidad (SRP): Exponer la URL públicamente e iniciar el sistema seguro de actualización.
 * Sin lógica de negocio, sin credenciales.
 */

// 1. Definir constante de arranque seguro (SoC)
define('NFC_SECURE_BOOT', true);

// 2. Ruta al núcleo del sistema (zona no pública)
$core_path = '/home/rccgaowg/9z3k7v/v2/env_newface/update_profile_core.php';

// 3. Validación de integridad básica (Falla segura)
if (!file_exists($core_path)) {
    header("Content-Type: application/json; charset=UTF-8");
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "error" => "Error crítico de infraestructura. Sistema de actualización no disponible."
    ]);
    exit;
}

// 4. Ceder el control al núcleo
require_once $core_path;