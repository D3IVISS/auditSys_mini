-- =============================================================================
-- AuditSys Mini · Esquema relacional PostgreSQL (Supabase)
-- Norma de referencia: ISO/IEC 27002:2022 · Metodología: ISO 19011:2018
-- Ejecutar completo en: Supabase → SQL Editor → New query → Run
-- ADVERTENCIA: el script es re-ejecutable y elimina las tablas existentes.
-- =============================================================================

BEGIN;

DROP TABLE IF EXISTS informe            CASCADE;
DROP TABLE IF EXISTS recomendacion      CASCADE;
DROP TABLE IF EXISTS hallazgo           CASCADE;
DROP TABLE IF EXISTS evidencia          CASCADE;
DROP TABLE IF EXISTS evaluacion_control CASCADE;
DROP TABLE IF EXISTS control            CASCADE;
DROP TABLE IF EXISTS auditoria          CASCADE;
DROP TABLE IF EXISTS usuario            CASCADE;
DROP FUNCTION IF EXISTS fn_set_actualizado_en() CASCADE;

-- -----------------------------------------------------------------------------
-- Función de auditoría temporal (actualizado_en)
-- -----------------------------------------------------------------------------
CREATE FUNCTION fn_set_actualizado_en()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.actualizado_en := NOW();
  RETURN NEW;
END;
$$;

-- -----------------------------------------------------------------------------
-- usuario: auditores y administradores
-- -----------------------------------------------------------------------------
CREATE TABLE usuario (
  id_usuario  SERIAL PRIMARY KEY,
  nombre      VARCHAR(120) NOT NULL,
  correo      VARCHAR(160) NOT NULL UNIQUE,
  rol         VARCHAR(10)  NOT NULL DEFAULT 'auditor'
              CHECK (rol IN ('auditor', 'admin')),
  creado_en   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- auditoria (RF01)
-- -----------------------------------------------------------------------------
CREATE TABLE auditoria (
  id_auditoria    SERIAL PRIMARY KEY,
  organizacion    VARCHAR(120) NOT NULL CHECK (LENGTH(TRIM(organizacion)) > 0),
  objetivo        TEXT         NOT NULL CHECK (LENGTH(TRIM(objetivo)) > 0),
  alcance         TEXT         NOT NULL CHECK (LENGTH(TRIM(alcance)) > 0),
  referentes      TEXT         NOT NULL DEFAULT 'ISO 19011:2018; ISO/IEC 27001:2022; ISO/IEC 27002:2022',
  fecha_inicio    DATE         NOT NULL,
  fecha_fin       DATE         NOT NULL,
  estado          VARCHAR(15)  NOT NULL DEFAULT 'BORRADOR'
                  CHECK (estado IN ('BORRADOR', 'EN_EJECUCION', 'EN_REVISION', 'CERRADA')),
  id_auditor      INTEGER      NOT NULL REFERENCES usuario(id_usuario) ON DELETE RESTRICT,
  creado_en       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  actualizado_en  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_auditoria_fechas CHECK (fecha_fin >= fecha_inicio)
);

CREATE TRIGGER trg_auditoria_actualizado
BEFORE UPDATE ON auditoria
FOR EACH ROW EXECUTE FUNCTION fn_set_actualizado_en();

-- -----------------------------------------------------------------------------
-- control: catálogo normativo ISO/IEC 27002:2022 (RF02)
-- -----------------------------------------------------------------------------
CREATE TABLE control (
  id_control            SERIAL PRIMARY KEY,
  codigo_iso            VARCHAR(10)  NOT NULL UNIQUE CHECK (codigo_iso ~ '^[5-8]\.[0-9]{1,2}$'),
  nombre                VARCHAR(160) NOT NULL,
  categoria             VARCHAR(15)  NOT NULL
                        CHECK (categoria IN ('ORGANIZACIONAL', 'PERSONAS', 'FISICO', 'TECNOLOGICO')),
  criterio              TEXT         NOT NULL CHECK (LENGTH(TRIM(criterio)) > 0),
  pregunta_orientadora  TEXT         NOT NULL CHECK (LENGTH(TRIM(pregunta_orientadora)) > 0)
);

-- -----------------------------------------------------------------------------
-- evaluacion_control (RF03): estado de un control dentro de una auditoría
-- -----------------------------------------------------------------------------
CREATE TABLE evaluacion_control (
  id_evaluacion     SERIAL PRIMARY KEY,
  id_auditoria      INTEGER     NOT NULL REFERENCES auditoria(id_auditoria) ON DELETE CASCADE,
  id_control        INTEGER     NOT NULL REFERENCES control(id_control)     ON DELETE RESTRICT,
  estado            VARCHAR(16) NOT NULL
                    CHECK (estado IN ('IMPLEMENTADO', 'PARCIAL', 'NO_IMPLEMENTADO', 'NO_APLICABLE')),
  observacion       TEXT        NOT NULL CHECK (LENGTH(TRIM(observacion)) > 0),
  justificacion_na  TEXT,
  evaluado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_evaluacion_auditoria_control UNIQUE (id_auditoria, id_control),
  CONSTRAINT ck_evaluacion_justificacion_na CHECK (
    estado <> 'NO_APLICABLE'
    OR (justificacion_na IS NOT NULL AND LENGTH(TRIM(justificacion_na)) > 0)
  )
);

CREATE INDEX ix_evaluacion_auditoria ON evaluacion_control(id_auditoria);
CREATE INDEX ix_evaluacion_control   ON evaluacion_control(id_control);

CREATE TRIGGER trg_evaluacion_actualizado
BEFORE UPDATE ON evaluacion_control
FOR EACH ROW EXECUTE FUNCTION fn_set_actualizado_en();

-- -----------------------------------------------------------------------------
-- evidencia (RF04): soporte documental de una evaluación
-- -----------------------------------------------------------------------------
CREATE TABLE evidencia (
  id_evidencia        SERIAL PRIMARY KEY,
  codigo              VARCHAR(8)   NOT NULL CHECK (codigo ~ '^EV-[0-9]{2,3}$'),
  id_auditoria        INTEGER      NOT NULL REFERENCES auditoria(id_auditoria) ON DELETE CASCADE,
  id_evaluacion       INTEGER      NOT NULL REFERENCES evaluacion_control(id_evaluacion) ON DELETE CASCADE,
  descripcion         TEXT         NOT NULL CHECK (LENGTH(TRIM(descripcion)) > 0),
  fuente              VARCHAR(160) NOT NULL CHECK (LENGTH(TRIM(fuente)) > 0),
  tipo                VARCHAR(12)  NOT NULL DEFAULT 'DOCUMENTAL'
                      CHECK (tipo IN ('DOCUMENTAL', 'ENTREVISTA', 'OBSERVACION', 'CAPTURA', 'REGISTRO')),
  referencia_archivo  TEXT,
  es_simulada         BOOLEAN      NOT NULL DEFAULT TRUE,
  fecha_recoleccion   DATE         NOT NULL DEFAULT CURRENT_DATE,
  creado_en           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_evidencia_codigo UNIQUE (id_auditoria, codigo)
);

CREATE INDEX ix_evidencia_evaluacion ON evidencia(id_evaluacion);

-- -----------------------------------------------------------------------------
-- hallazgo (RF05): desviación sustentada (condición, criterio, causa, efecto)
-- -----------------------------------------------------------------------------
CREATE TABLE hallazgo (
  id_hallazgo    SERIAL PRIMARY KEY,
  codigo         VARCHAR(8)  NOT NULL CHECK (codigo ~ '^H-[0-9]{2,3}$'),
  id_auditoria   INTEGER     NOT NULL REFERENCES auditoria(id_auditoria) ON DELETE CASCADE,
  id_evaluacion  INTEGER     NOT NULL REFERENCES evaluacion_control(id_evaluacion) ON DELETE CASCADE,
  condicion      TEXT        NOT NULL CHECK (LENGTH(TRIM(condicion)) > 0),
  criterio       TEXT        NOT NULL CHECK (LENGTH(TRIM(criterio)) > 0),
  causa          TEXT        NOT NULL CHECK (LENGTH(TRIM(causa)) > 0),
  efecto_riesgo  TEXT        NOT NULL CHECK (LENGTH(TRIM(efecto_riesgo)) > 0),
  severidad      VARCHAR(5)  NOT NULL CHECK (severidad IN ('ALTA', 'MEDIA', 'BAJA')),
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_hallazgo_codigo UNIQUE (id_auditoria, codigo)
);

CREATE INDEX ix_hallazgo_evaluacion ON hallazgo(id_evaluacion);

-- -----------------------------------------------------------------------------
-- recomendacion (RF06): acción correctiva/preventiva (CAPA) por hallazgo
-- -----------------------------------------------------------------------------
CREATE TABLE recomendacion (
  id_recomendacion  SERIAL PRIMARY KEY,
  codigo            VARCHAR(8)  NOT NULL CHECK (codigo ~ '^R-[0-9]{2,3}$'),
  id_hallazgo       INTEGER     NOT NULL REFERENCES hallazgo(id_hallazgo) ON DELETE CASCADE,
  descripcion       TEXT        NOT NULL CHECK (LENGTH(TRIM(descripcion)) > 0),
  prioridad         VARCHAR(5)  NOT NULL CHECK (prioridad IN ('ALTA', 'MEDIA', 'BAJA')),
  plazo_dias        INTEGER     NOT NULL CHECK (plazo_dias BETWEEN 1 AND 730),
  creado_en         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ix_recomendacion_hallazgo ON recomendacion(id_hallazgo);

-- -----------------------------------------------------------------------------
-- informe (RF08): instantánea versionada del consolidado
-- -----------------------------------------------------------------------------
CREATE TABLE informe (
  id_informe        SERIAL PRIMARY KEY,
  id_auditoria      INTEGER      NOT NULL REFERENCES auditoria(id_auditoria) ON DELETE CASCADE,
  version           INTEGER      NOT NULL CHECK (version > 0),
  indicador_base    NUMERIC(5,1) NOT NULL,
  indice_ponderado  NUMERIC(5,1) NOT NULL,
  snapshot          JSONB        NOT NULL,
  generado_en       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_informe_version UNIQUE (id_auditoria, version)
);

-- -----------------------------------------------------------------------------
-- Seguridad Supabase: RLS activo sin políticas bloquea el acceso anónimo vía
-- PostgREST. El backend se conecta con el rol propietario (postgres), que
-- no está sujeto a RLS, por lo que la API Express opera con normalidad.
-- -----------------------------------------------------------------------------
ALTER TABLE usuario            ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria          ENABLE ROW LEVEL SECURITY;
ALTER TABLE control            ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluacion_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidencia          ENABLE ROW LEVEL SECURITY;
ALTER TABLE hallazgo           ENABLE ROW LEVEL SECURITY;
ALTER TABLE recomendacion      ENABLE ROW LEVEL SECURITY;
ALTER TABLE informe            ENABLE ROW LEVEL SECURITY;

COMMIT;
