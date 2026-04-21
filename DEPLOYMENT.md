# 🚀 Guía Completa de Deploy en Vercel

Este documento tiene instrucciones paso a paso para desplegar tu sitio en Vercel.

## ¿Por qué Vercel?

✅ **Gratis** - Sin costo por siempre (plan gratuito)
✅ **Rápido** - Despliega en segundos
✅ **Automático** - Se redespliega con cada push a GitHub
✅ **Seguro** - SSL incluido, sin configuración
✅ **Escalable** - Soporta tráfico masivo sin problemas
✅ **Hecho para Next.js** - Vercel es de los creadores de Next.js

## Requisitos

- ✅ Código en GitHub (repositorio público o privado)
- ✅ Cuenta en Vercel (gratis)
- ✅ Dominio viniciogarzon.com (opcional, puedes usar subdominio de Vercel)

## Paso 1: Crear Repositorio en GitHub

### Si no tienes cuenta en GitHub

1. Ve a **https://github.com/signup**
2. Ingresa tu email
3. Crea contraseña
4. Completa el CAPTCHA
5. Verifica tu email

### Crear el repositorio

1. Después de tener cuenta, ve a **https://github.com/new**
2. Ingresa estos datos:
   - **Repository name**: `vinicio-garzon-next`
   - **Description**: `Modern portfolio built with Next.js`
   - **Visibility**: Selecciona `Public` (necesario para Vercel free)
3. **NO** inicialices con README (ya lo tenemos)
4. Click en **Create repository**

### Resultado

Verás una pantalla con instrucciones. **Copia el código** que aparece, será algo como:

```bash
git remote add origin https://github.com/TU-USUARIO/vinicio-garzon-next.git
git branch -M main
git push -u origin main
```

## Paso 2: Subir Código a GitHub

Abre terminal/cmd en la carpeta del proyecto y ejecuta:

### Inicializar Git (si no lo has hecho)

```bash
git init
git add .
git commit -m "Initial commit: Vinicio Garzon portfolio with Next.js"
```

### Conectar con GitHub y subir

Pega el código que copiaste del paso anterior:

```bash
git remote add origin https://github.com/TU-USUARIO/vinicio-garzon-next.git
git branch -M main
git push -u origin main
```

**Nota**: Reemplaza `TU-USUARIO` con tu usuario real de GitHub.

### Verificar

Ve a tu repositorio en GitHub (https://github.com/TU-USUARIO/vinicio-garzon-next) y verifica que se hayan subido todos los archivos.

## Paso 3: Conectar con Vercel y Desplegar

### Crear cuenta en Vercel

1. Ve a **https://vercel.com/signup**
2. Click en **Continue with GitHub**
3. Autoriza a Vercel para acceder a GitHub
4. Completa tu perfil

### Importar el proyecto

1. En el dashboard de Vercel, haz click en **Add New...**
2. Selecciona **Project**
3. Click en **Import Git Repository**
4. Busca `vinicio-garzon-next` en el listado
5. Click en **Import**

### Configuración del Proyecto

Vercel debería detectar automáticamente que es un proyecto Next.js. Verifica:

- **Framework Preset**: Next.js ✓
- **Build Command**: `next build` ✓
- **Output Directory**: `.next` ✓
- **Install Command**: `npm install` ✓

Si todo está bien, click en **Deploy**

### ¡Espera el Deploy!

Vercel comenzará a construir tu sitio. Verás una barra de progreso. Esto toma 1-2 minutos.

Cuando termine, verás un mensaje "Congratulations! Your project has been successfully deployed"

## Paso 4: Tu URL en Vercel

Después del deploy, tu sitio estará disponible en:

```
https://vinicio-garzon-next.vercel.app
```

Esta es tu URL pública. Puedes compartirla, pero normalmente querrás usar tu dominio propio.

## Paso 5: Conectar tu Dominio (viniciogarzon.com)

### Opción A: Si tu dominio ya existe

1. En el dashboard de Vercel, ve a tu proyecto
2. Settings → Domains
3. Ingresa: `viniciogarzon.com`
4. Click en **Add**
5. Vercel te dará 4 nameservers, copialos
6. Ve a tu proveedor de dominio (Godaddy, Namecheap, Hostinger, etc.)
7. Busca "Nameservers" o "DNS"
8. Reemplaza los nameservers actuales con los de Vercel
9. Guarda cambios

**Espera 24-48 horas** a que los cambios se propaguen

### Opción B: Si quieres usar un subdominio temporal

Mientras esperas, puedes usar:
- `blog.viniciogarzon.com`
- `nuevo.viniciogarzon.com`

Sigue los mismos pasos pero ingresa el subdominio.

## Paso 6: Actualizar Automáticamente

¡Lo mejor parte! Ahora cuando hagas cambios:

```bash
# Edita los archivos que quieras
# Por ejemplo: src/data/blog.json

# Luego simplemente haz push a GitHub
git add .
git commit -m "Descripción del cambio"
git push
```

**Vercel detectará automáticamente los cambios** y redesplegará tu sitio en segundos. ¡Sin hacer nada!

## Paso 7: Monitorar Deployments

En el dashboard de Vercel puedes ver:

- **Deployments**: Historial de todos los deploys
- **Analytics**: Tráfico, rendimiento, etc.
- **Settings**: Configuración del proyecto
- **Domains**: Tus dominios conectados

## Variables de Entorno en Vercel (Opcional)

Si necesitas variables secretas:

1. Settings → Environment Variables
2. Agrega tus variables
3. Re-deploya el proyecto

Ejemplo:
```
NEXT_PUBLIC_SITE_URL = https://www.viniciogarzon.com
NEXT_PUBLIC_CONTACT_EMAIL = yo@viniciogarzon.com
```

## Solución de Problemas

### El deploy falla

1. Revisa los logs de error en Vercel
2. Verifica que `npm run build` funciona localmente
3. Asegúrate que todos los archivos se subieron a GitHub

### El dominio no redirige

1. Espera 48 horas (DNS puede ser lento)
2. Verifica que los nameservers estén correctos
3. Usa una herramienta como https://www.whatsmydns.net/ para verificar

### Ver logs de deploy

En Vercel, haz click en el deployment → Logs

### Rollback a versión anterior

En Deployments, selecciona un deploy anterior y haz click en "Redeploy"

## Dominio Personalizado vs Subdominio de Vercel

| Aspecto | Vercel | Dominio Personalizado |
|--------|--------|----------------------|
| URL | vinicio-next.vercel.app | viniciogarzon.com |
| Costo | Gratis | Tu proveedor |
| Configuración | Automática | Manual (1 vez) |
| Profesional | Menos | Más |

## Checklist Final

- [ ] Código en GitHub
- [ ] Proyecto importado en Vercel
- [ ] Deploy exitoso
- [ ] URL de Vercel funciona
- [ ] Dominio conectado (opcional)
- [ ] Cambios en GitHub → Auto deploy en Vercel

## ¿Necesitas ayuda?

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **GitHub Help**: https://docs.github.com

¡Felicidades! Tu sitio está en vivo 🎉
