# Decisiones técnicas — Nomi

Este documento detalla la elección de cada servicio de AWS utilizado en el proyecto, las alternativas evaluadas, los motivos técnicos y de aprendizaje detrás de cada decisión.

---

## 1. Decisiones por servicio de AWS

### 1.1 Amazon Rekognition Custom Labels (detección de ingredientes)
* **Decisión:** Entrenar un modelo personalizado (`nomi-detector`) sobre Amazon Rekognition Custom Labels con un catálogo cerrado de 24 etiquetas en español.
* **Alternativas consideradas:**
  * *API externa de IA generativa con visión:* Enviar la imagen a un modelo multimodal con un prompt para que devolviera la lista de ingredientes.
  * *Amazon Rekognition estándar (`DetectLabels`):* Usar las etiquetas generales de AWS sin entrenamiento adicional.
* **Por qué esta opción:**
  * **Exploración del ecosistema AWS:** Buscamos profundizar en los servicios nativos de machine learning de AWS y comprobar en la práctica qué tan viable es aprovechar su modelo base preentrenado mediante *transfer learning* con un dataset propio.
  * **Ventaja técnica a gran escala frente a una API genérica de IA:** Aunque una API multimodal es rápida para prototipar, a gran escala y con un dataset más amplio un modelo especializado de visión resulta más sólido y predecible: opera sobre un catálogo cerrado de ingredientes evitando alucinaciones o respuestas inconsistentes, devuelve puntajes de confianza y cajas delimitadoras exactas (`BoundingBox`) y nos ayuda a evitar enviar imágenes de usuarios a proveedores externos o gestionar llaves de API de terceros, integrándose de forma nativa con S3 e IAM.

---

### 1.2 AWS Lambda (lógica de backend y procesamiento de imágenes)
* **Decisión:** Implementar tanto los endpoints de gestión de fotos como el procesamiento automático de detección de ingredientes mediante funciones AWS Lambda.
* **Alternativas consideradas:**
  * *Servidor backend monolítico en Amazon EC2:* Configurar una instancia virtual con el servidor web, dependencias, procesos en segundo plano y reglas de red.
* **Por qué esta opción:**
  * **Simplicidad de creación y conexión:** Crear una función Lambda y conectarla de forma nativa a eventos de Amazon S3 o rutas de API Gateway es mucho más directo que aprovisionar, configurar y mantener un servidor en EC2 con sistema operativo, puertos y seguridad de red.
  * **Ejecución orientada a eventos y bajo costo:** La detección solo se ejecuta cuando llega una nueva imagen a S3, escala automáticamente y permite desacoplar la configuración del código mediante variables de entorno (`MODELO_ARN` y `MIN_CONFIANZA`).

---

### 1.3 Amazon S3 (almacenamiento de imágenes, resultados y sitio estático)
* **Decisión:** Usar Amazon S3 para almacenar las fotografías subidas por los usuarios, los archivos `.json` con los ingredientes detectados y los archivos estáticos del cliente web.
* **Alternativas consideradas:**
  * *Guardar imágenes codificadas en Base64 dentro de DynamoDB:* Centralizar archivos y metadatos en la base de datos.
* **Por qué esta opción:** Debido a que S3 está diseñado específicamente para archivos multimedia, soporta URLs prefirmadas para subir fotos de forma segura sin sobrecargar el backend, dispara automáticamente la Lambda de detección al recibir un objeto nuevo y permite alojar el frontend estático sin administrar un servidor web adicional.

---

### 1.4 Amazon API Gateway (puntos de entrada HTTP)
* **Decisión:** Exponer los endpoints REST de la aplicación (generación de URL de subida y consulta de fotos/resultados) a través de Amazon API Gateway.
* **Alternativas consideradas:**
  * *Exponer directamente un servidor web como Express o FastAPI en EC2:* Gestionar manualmente HTTPS, rutas y políticas CORS.
* **Por qué esta opción:** Se integra directamente con AWS Lambda, provee URLs HTTPS listas para consumo, simplifica la configuración de CORS para el cliente web y evita administrar un balanceador de carga o proxy inverso en EC2, además de la velocidad de la configuración de un API Gateway.

---

### 1.5 Amazon DynamoDB (persistencia de datos)
* **Decisión:** Utilizar Amazon DynamoDB como base de datos NoSQL para guardar los registros y metadatos de la aplicación.
* **Alternativas consideradas:**
  * *Base de datos relacional administrada como Amazon RDS con PostgreSQL o MySQL.*
* **Por qué esta opción:** Al ser totalmente *serverless*, encaja de forma natural con AWS Lambda sin problemas de manejo de conexiones simultáneas ni necesidad de mantener una instancia de base de datos encendida, además de que ofrece baja latencia en consultas por clave y permite adaptar el esquema con agilidad conforme evoluciona el proyecto.

---

### 1.6 Docker en [EC2 / ECS Fargate] (backend principal de la aplicación)
* **Decisión:** Empaquetar todo el código del backend principal de Nomi en un contenedor **Docker** y desplegarlo en Amazon ECS Fargate.
* **Alternativas consideradas:**
  * *Instalar el backend directamente en una instancia EC2 sin contenedores:* Configurar manualmente el sistema operativo, dependencias y versiones en el servidor.
  * *Dividir todo el backend en funciones AWS Lambda:* Fragmentar toda la lógica de negocio y rutas de la app en múltiples funciones separadas.
* **Por qué esta opción:**
  * **Despliegue reproducible y ordenado:** Docker empaqueta el código junto con sus dependencias exactas, garantizando que el backend funcione igual en local y en AWS al momento de subir cambios.
  * **Por qué ECS Fargate:** Permite correr el contenedor directamente sin administrar servidores, parches ni sistema operativo de una instancia EC2.

---

### 1.7 Amazon Cognito (autenticación y gestión de usuarios)
- **Decisión:** Utilizar **Amazon Cognito** para administrar el registro, inicio de sesión y autenticación de usuarios de Nomi.
- **Alternativas consideradas:**
  - *Autenticación propia en el backend y DynamoDB:* Programar y mantener manualmente el cifrado de contraseñas, manejo de sesiones, recuperación de cuentas y emisión de tokens JWT.
- **Por qué esta opción:** Evita implementar lógica crítica de seguridad desde cero, además que se integra de forma nativa con el resto del ecosistema AWS como el API Gateway y backend sin depender de terceros y agiliza la puesta en marcha del control de acceso de usuarios.

---



## 2. Cambios realizados desde la entrega intermedia

1. **Integración completa de detección de ingredientes:** Se conectó el evento de carga en S3 con la Lambda que invoca el modelo `nomi-detector` de Amazon Rekognition Custom Labels y guarda el archivo `.json` resultante junto a la imagen.
2. **Calibración de umbrales y limpieza de resultados:** En las pruebas iniciales con `MIN_CONFIANZA` en `7%`, el modelo devolvía casi todas sus 24 etiquetas por imagen. Se ajustó el umbral mínimo a 12%, se eliminaron duplicados y se normalizaron nombres en español.
3. **Corrección del manejo de extensiones en S3:** Se reemplazó el cambio fijo de `.jpg` a `.json` por el uso del nombre base del archivo y se ignoraron eventos de archivos `.json` para soportar `.jpeg`/`.png` y evitar bucles infinitos.
4. **Parametrización fuera del código:** Se movieron el ARN del modelo y el umbral de confianza a variables de entorno de Lambda.

---

## 3. Alcance, costos y limitaciones documentadas

* **Modelo apagado fuera de pruebas (`STOPPED`):** Para proteger los créditos de AWS Academy, la versión del modelo de Rekognition Custom Labels permanece detenida y se inicia bajo demanda (`start-project-version`) durante pruebas y demostraciones.
* **Tamaño inicial del dataset:** Al haberse entrenado con un conjunto acotado, debido a las limitaciones de los creditos del lab AWS Academy, el tiempo que toma entrenar el modelo y los dataset limitados de imagenes que necesitabamos, resulto en que las puntuaciones de confianza son más bajas en escenas muy saturadas por ello la interfaz permite al usuario revisar y ajustar la lista detectada.