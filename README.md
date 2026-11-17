# AuditSys Mini · GRC ISO/IEC 27002:2022

Sistema académico para planear, ejecutar e informar auditorías de controles de seguridad de la información con base en **ISO/IEC 27002:2022** y la metodología de **ISO 19011:2018**.

> Todos los datos de *Empresa ABC* son ficticios. El indicador de cumplimiento es descriptivo y **no constituye certificación**.

## Estructura del monorepo

```
auditsys-mini/
├── database/
│   ├── schema.sql               # Tablas, llaves foráneas, CHECK, triggers, RLS
│   └── seed_empresa_abc.sql     # 13 controles, 13 evaluaciones, EV-01…EV-12, H-01…H-04, R-01…R-04
├── backend/                     # Node.js + Express · Arquitectura Hexagonal
│   └── src/
│       ├── domain/              # Reglas puras: errores, validación, políticas, IndicadorService, puertos
│       ├── application/         # Casos de uso (un caso por clase · SRP)
│       ├── infrastructure/      # Adaptadores: PostgreSQL (pg), HTTP (Express), CORS, contenedor DI
│       ├── app.js               # Fábrica de la app Express
│       └── server.js            # Arranque y apagado controlado
├── frontend/                    # React 18 + Vite + Tailwind CSS + lucide-react
│   └── src/
│       ├── lib/                 # Cliente REST, metadatos de UI, formato
│       ├── hooks/               # useApiHealth, useAuditWorkspace (estado sincronizado con la API)
│       ├── components/          # UI base, gráficos, sidebar, modales
│       └── views/               # 5 módulos funcionales
├── render.yaml                  # Blueprint de despliegue del backend
└── package.json                 # Scripts de conveniencia del monorepo
```

## Arquitectura del backend

| Capa | Responsabilidad | Ejemplos |
| --- | --- | --- |
| Dominio | Reglas de negocio sin dependencias externas | `IndicadorService`, `AuditoriaPolicy`, `EvaluacionPolicy`, `Validator`, puertos (`*Repository`) |
| Aplicación | Orquestación de casos de uso | `EvaluarControlUseCase`, `RegistrarHallazgoUseCase`, `GenerarReporteUseCase` |
| Infraestructura | Adaptadores de entrada y salida | `Pg*Repository`, controladores Express, CORS dinámico, `container.js` |

Los casos de uso dependen de abstracciones (puertos); `container.js` es la única raíz de composición donde se inyectan los adaptadores PostgreSQL.

## API REST

| Método | Ruta | Requisito | Descripción |
| --- | --- | --- | --- |
| GET | `/api/health` | — | Estado de la API y de PostgreSQL (200 / 503) |
| GET | `/api/usuarios` | RF01 | Auditores disponibles |
| GET | `/api/auditorias` | RF01 | Lista con resumen de indicadores |
| POST | `/api/auditorias` | RF01 | Registra una auditoría (`fecha_fin ≥ fecha_inicio`) |
| GET | `/api/controles?id_auditoria=1` | RF02 | Catálogo con criterio, pregunta orientadora y estado actual |
| POST | `/api/evaluaciones/evaluar` | RF03 | Crea/actualiza evaluación; `NO_APLICABLE` exige justificación |
| POST | `/api/evidencias` | RF04 | Evidencia vinculada a una evaluación (código `EV-nn` automático) |
| POST | `/api/hallazgos` | RF05, RF06 | Hallazgo + recomendación en una transacción (`H-nn` / `R-nn`) |
| GET | `/api/auditorias/:id/indicadores` | RF07 | Indicador base e índice ponderado, por dominio |
| GET | `/api/auditorias/:id/reporte` | RF08, RF09 | Consolidado completo + matriz de trazabilidad |
| POST | `/api/auditorias/:id/informes` | RF08 | Emite una versión inmutable del informe (snapshot JSONB) |

Validación: los identificadores se validan con `parseInt(valor, 10)` y patrón estricto (`/^\d+$/`) → **400** si son inválidos; reglas de negocio → **422/409**; recurso inexistente → **404**. Los errores de PostgreSQL se traducen a códigos HTTP (nunca 500 por tipos inválidos).

### Cálculo RF07 (Empresa ABC)

```
Aplicables       = 13 evaluados − 1 NO_APLICABLE = 12
Indicador base   = 4 / 12            = 33.3 %
Índice ponderado = (4 + 5 × 0.5) / 12 = 54.2 %
```

### Ejemplos de petición

```bash
curl -X POST http://localhost:5000/api/evaluaciones/evaluar \
  -H "Content-Type: application/json" \
  -d '{"id_auditoria":1,"id_control":13,"estado":"NO_APLICABLE","observacion":"Fuera del alcance","justificacion_na":"La empresa no desarrolla software propio."}'

curl -X POST http://localhost:5000/api/hallazgos \
  -H "Content-Type: application/json" \
  -d '{"id_evaluacion":9,"severidad":"ALTA","condicion":"No se ejecutan escaneos de vulnerabilidades.","criterio":"ISO/IEC 27002:2022, control 8.8","causa":"Sin responsable asignado","efecto_riesgo":"Explotación de vulnerabilidades conocidas.","recomendacion":{"descripcion":"Escaneo mensual con plazos de remediación.","prioridad":"ALTA","plazo_dias":60}}'
```

## Módulos del frontend

1. **Dashboard ejecutivo** — KPIs sincronizados, distribución por dominio ISO, auditorías registradas y alta de nuevas auditorías.
2. **Evaluación de controles** — Acordeón por dominio, pregunta orientadora, formulario con justificación N/A condicional y modal de evidencias.
3. **Hallazgos y CAPA** — Tarjetas Condición / Criterio / Causa / Efecto con acción CAPA y modal de creación vinculado al control.
4. **Evidencias y trazabilidad** — Matriz control → evidencia → hallazgo → recomendación con alertas de integridad y registro de evidencias.
5. **Informe ISO 19011:2018** — Vista documental con estilos `@media print` (hoja blanca, sin sidebar ni botones) y salvaguarda normativa.

---

## Guía paso a paso

### 1. Base de datos en Supabase

1. Cree un proyecto en [supabase.com](https://supabase.com) y guarde la contraseña de la base de datos.
2. Abra **SQL Editor → New query**, pegue el contenido de `database/schema.sql` y pulse **Run**.
3. En una nueva consulta, ejecute `database/seed_empresa_abc.sql`.
4. Verifique: `SELECT estado, COUNT(*) FROM evaluacion_control GROUP BY estado;` → 4 / 5 / 3 / 1.
5. Obtenga la cadena: botón **Connect** (o *Project Settings → Database*) → **Connection string → URI**. Use el **Session pooler** (puerto 5432) o el **Transaction pooler** (puerto 6543), que funcionan desde redes IPv4 como Render. Reemplace `[YOUR-PASSWORD]` por su contraseña.

### 2. Ejecución local

```bash
# Backend (puerto 5000)
cd backend
cp .env.example .env        # en Windows: copy .env.example .env
#   DATABASE_URL="postgresql://postgres.xxxx:CONTRASEÑA@aws-0-....pooler.supabase.com:6543/postgres"
#   FRONTEND_URL=http://localhost:5173
npm install
npm run dev                 # http://localhost:5000/api/health

# Frontend (puerto 5173) — en otra terminal
cd frontend
cp .env.example .env        # VITE_API_BASE_URL=http://localhost:5000/api
npm install
npm run dev                 # http://localhost:5173
```

> Si la contraseña contiene `#`, encierre `DATABASE_URL` entre comillas dobles en `.env` (dotenv interpreta `#` como comentario). El backend tolera caracteres especiales sin codificar en la contraseña.

El indicador de la barra lateral debe mostrar **API CONECTADA**.

### 3. Despliegue (GitHub + Render + Vercel)

**GitHub**

```bash
git init
git add .
git commit -m "AuditSys Mini v2: monorepo hexagonal + GRC UI"
git branch -M main
git remote add origin https://github.com/<usuario>/auditsys-mini.git
git push -u origin main
```

**Render (backend)**

1. *New → Web Service* → conecte el repositorio (o *New → Blueprint* para usar `render.yaml`).
2. Root Directory: `backend` · Build: `npm install --omit=dev` · Start: `npm start` · Health check: `/api/health`.
3. Variables: `DATABASE_URL` (pooler de Supabase), `DATABASE_SSL=true`, `NODE_ENV=production`, `FRONTEND_URL` (se completa tras crear Vercel).
4. Despliegue y copie la URL, p. ej. `https://auditsys-mini-api.onrender.com`.

**Vercel (frontend)**

1. *Add New → Project* → importe el repositorio.
2. Root Directory: `frontend` · Framework: **Vite** · Build: `npm run build` · Output: `dist`.
3. Variable: `VITE_API_BASE_URL=https://auditsys-mini-api.onrender.com/api` y despliegue.
4. Vuelva a Render y defina `FRONTEND_URL=https://<su-app>.vercel.app,https://*.vercel.app` (el comodín habilita los *preview deployments*). Guarde para redesplegar.

Comprobación final: abra la URL de Vercel, confirme **API CONECTADA** y que el Dashboard muestre **33.3 %** y **54.2 %** para Empresa ABC.

> En el plan gratuito de Render el servicio se suspende por inactividad; la primera petición puede tardar ~50 s y el indicador mostrará **SIN CONEXIÓN** hasta que despierte (se reintenta cada 20 s).
