# **Documentación de API: Actualización de Perfil (New Face Cards)**

Esta documentación describe el uso y funcionamiento del endpoint de actualización de perfiles de usuario. El sistema utiliza una arquitectura de pasarela (Gateway) y núcleo (Core) para garantizar la seguridad de los datos y el aislamiento de la lógica de negocio.

## **📌 Información General**

* **URL Base:** https://my.newfacecards.com  
* **Endpoint Público (Gateway):** /nfc/gateway-profile.php  
* **Lógica Interna (Core):** /home/rccgaowg/9z3k7v/v2/env\_newface/update\_profile\_core.php (No accesible públicamente)  
* **Método HTTP Permitido:** POST  
* **Content-Type:** application/json

## **🏗️ Arquitectura (Nota para Agentes IA / Desarrolladores)**

El sistema aplica principios SOLID, SRP y DRY.

Cualquier petición al endpoint público (gateway-profile.php) es validada a nivel de entorno y delegada mediante require\_once al núcleo (update\_profile\_core.php).

* **No interactuar directamente con la base de datos** para actualizar estos perfiles, utilizar siempre este endpoint para mantener la consistencia en el backend de WordPress (wp\_update\_user).

## **🔐 Autenticación**

El endpoint está protegido mediante autenticación de token estático (API Key). Debe enviarse en los encabezados (Headers) de la petición HTTP.

* **Header Key:** Authorization  
* **Header Value:** Bearer \<TU\_API\_KEY\_FRONTEND\>

*(El token se extrae directamente de las variables de entorno del servidor en etc.php).*

## **📦 Request Payload (Cuerpo de la Petición)**

El cuerpo de la petición debe ser un objeto JSON válido. El sistema permite la actualización de múltiples campos de manera simultánea.

### **Esquema de Datos**

| Campo | Tipo | Requerido | Descripción |
| :---- | :---- | :---- | :---- |
| user\_id | Integer | **Sí** | El ID único del usuario en la base de datos de WordPress. |
| description | String | Opcional | **IMPORTANTE:** Este campo actúa como un corpus de datos avanzado. Debe ser un **String que contenga un JSON válido y escapado**. |
| first\_name | String | Opcional | Nombre del usuario. |
| last\_name | String | Opcional | Apellidos del usuario. |
| user\_url | String | Opcional | URL del sitio web del usuario. |
| nickname | String | Opcional | Alias o apodo del usuario. |

*Nota: Se debe enviar user\_id junto con al menos **uno** de los campos opcionales para que la actualización sea procesada.*

## **💻 Ejemplos de Petición**

### **1\. cURL**

curl \--location '\[https://my.newfacecards.com/nfc/gateway-profile.php\](https://my.newfacecards.com/nfc/gateway-profile.php)' \\  
\--header 'Content-Type: application/json' \\  
\--header 'Authorization: Bearer \<TU\_API\_KEY\_FRONTEND\>' \\  
\--data '{  
    "user\_id": 1,  
    "first\_name": "Ivan",  
    "last\_name": "Gonzalez",  
    "user\_url": "\[https://my.newfacecards.com\](https://my.newfacecards.com)",  
    "description": "{\\"role\\": \\"CEO\\", \\"agency\\": \\"Klef\\", \\"specialties\\": \[\\"Tech\\", \\"Design\\"\]}"  
}'

### **2\. JavaScript (Fetch API)**

const updateProfile \= async () \=\> {  
  const payload \= {  
    user\_id: 1,  
    first\_name: "Ivan",  
    nickname: "ivangonzalez",  
    // Recuerda: description debe ser un objeto JSON convertido a String  
    description: JSON.stringify({  
      role: "CEO",  
      agency: "Klef"  
    })  
  };

  const response \= await fetch('\[https://my.newfacecards.com/nfc/gateway-profile.php\](https://my.newfacecards.com/nfc/gateway-profile.php)', {  
    method: 'POST',  
    headers: {  
      'Content-Type': 'application/json',  
      'Authorization': 'Bearer \<TU\_API\_KEY\_FRONTEND\>'  
    },  
    body: JSON.stringify(payload)  
  });

  const data \= await response.json();  
  console.log(data);  
};

## **📥 Respuestas (Responses)**

Todas las respuestas del servidor se devuelven en formato application/json e incluyen un flag booleano success.

### **✅ Éxito (HTTP 200 OK)**

Se devuelve cuando la actualización en la base de datos de WordPress fue exitosa.

{  
  "success": true,  
  "message": "Perfil actualizado exitosamente con todos los campos especificados."  
}

### **❌ Errores Comunes**

**HTTP 400 Bad Request (Payload Inválido / Faltan Datos)**

{  
  "success": false,  
  "message": "Estructura de payload inválida. Se requiere 'user\_id'."  
}

**HTTP 400 Bad Request (El campo description NO es un JSON válido)**

{  
  "success": false,  
  "message": "El campo 'description' debe contener un JSON estructurado válido."  
}

**HTTP 401 Unauthorized (Token faltante o incorrecto)**

{  
  "success": false,  
  "message": "No autorizado. Token inválido o ausente."  
}

**HTTP 405 Method Not Allowed (Se intentó usar GET, PUT, etc.)**

{  
  "success": false,  
  "message": "Método HTTP no permitido."  
}

**HTTP 500 Internal Server Error (Fallo en WordPress / Base de datos)**

{  
  "success": false,  
  "message": "Fallo al actualizar el perfil: No se proporcionaron campos válidos para actualizar."  
}  
