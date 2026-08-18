# 💼 Dashboard de Facturación — React + TypeScript

Frontend para un sistema de facturación desarrollado con **React, TypeScript, Tailwind CSS y Axios**, conectado a una API REST en **ASP.NET Core 8** mediante autenticación JWT.

Este repositorio corresponde al frontend del proyecto. El backend gestiona autenticación, clientes, productos, facturas, stock y métricas.

## 🚀 Tecnologías

- React
- TypeScript
- Vite
- Axios
- Tailwind CSS
- JWT
- Recharts
- Lucide Icons

## ✅ Funcionalidades

- Inicio de sesión mediante JWT.
- Consumo de endpoints protegidos de la API .NET.
- Dashboard con métricas de ventas.
- Gráficos de ventas mensuales y clientes principales.
- Gestión de clientes: crear, listar y eliminar.
- CRUD visual de productos.
- Control y visualización de stock.
- Emisión de facturas.
- Anulación de facturas con restauración de stock desde el backend.
- Visualización protegida de la factura HTML usando el token JWT.
- Filtros y búsqueda de comprobantes.
- Diseño responsive.

## ⚙️ Requisitos

- Node.js y npm.
- La API backend de facturación en ejecución.

En desarrollo, el backend puede ejecutarse por ejemplo en:

```txt
http://localhost:5000
```

## 🔧 Configuración

Crea un archivo `.env` en la raíz del proyecto tomando como referencia `.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

No subas tu archivo `.env` al repositorio. Ya se encuentra incluido en `.gitignore`.

## ▶️ Ejecutar localmente

```bash
npm install
npm run dev
```

Por defecto Vite abrirá la aplicación en:

```txt
http://localhost:5173
```

## 🔐 Acceso

El backend crea el usuario administrador con:

```txt
Usuario: admin
```

La contraseña **no está incluida en este repositorio**. Debes usar el valor configurado en la variable de entorno `ADMIN_PASSWORD` del backend.

Ejemplo de configuración en PowerShell para el backend:

```powershell
$env:ADMIN_PASSWORD="TuPasswordSegura2026!"
```

Luego inicia sesión en el frontend utilizando esa contraseña.

## 🔗 Integración con el backend

Axios utiliza `VITE_API_URL` como URL base. El interceptor HTTP agrega automáticamente el token JWT almacenado después del login:

```txt
Authorization: Bearer <token>
```

Si la API responde `401 Unauthorized`, la sesión local se elimina automáticamente.

La vista HTML de cada factura también se solicita mediante Axios con el JWT, por lo que no depende de una URL hardcodeada ni expone el endpoint protegido sin autenticación.

## 📦 Comandos

```bash
npm run dev
npm run build
npm run preview
```

## 🌐 Deploy

Al desplegar el frontend, configura la variable:

```env
VITE_API_URL=https://tu-api.example.com/api
```

También debes permitir el dominio del frontend dentro de la política CORS del backend.

## 🎯 Descripción para GitHub

```txt
Dashboard de facturación desarrollado con React, TypeScript y Tailwind, conectado a una API REST en ASP.NET Core mediante JWT. Incluye gestión de clientes y productos, emisión de facturas, métricas y visualización de ventas.
```

## 👨‍💻 Autor

**Eduardo Jahir Montaño Condemayta**

Backend / Full Stack Developer — Lima, Perú
