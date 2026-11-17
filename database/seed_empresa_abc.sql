-- =============================================================================
-- AuditSys Mini · Datos de ejemplo: Empresa ABC (FICTICIA, fines académicos)
-- Ejecutar DESPUÉS de schema.sql. Re-ejecutable: limpia la auditoría de ejemplo.
-- Resultado esperado (RF07): 13 evaluados, 12 aplicables
--   Indicador base   = 4 / 12            = 33.3 %
--   Índice ponderado = (4 + 5 × 0.5) / 12 = 54.2 %
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- Usuarios
-- -----------------------------------------------------------------------------
INSERT INTO usuario (nombre, correo, rol) VALUES
  ('Ana R.',            'ana.r@auditsys.local',   'auditor'),
  ('Coordinación GRC',  'admin@auditsys.local',   'admin')
ON CONFLICT (correo) DO UPDATE SET nombre = EXCLUDED.nombre, rol = EXCLUDED.rol;

-- -----------------------------------------------------------------------------
-- Catálogo de controles ISO/IEC 27002:2022 (criterios redactados con fines
-- académicos; deben contrastarse con el texto oficial de la norma)
-- -----------------------------------------------------------------------------
INSERT INTO control (codigo_iso, nombre, categoria, criterio, pregunta_orientadora) VALUES
  ('5.1',  'Políticas de seguridad de la información', 'ORGANIZACIONAL',
   'ISO/IEC 27002:2022, control 5.1: definir, aprobar por la dirección, publicar, comunicar y revisar en intervalos planificados la política de seguridad de la información.',
   '¿Existe una política aprobada por la dirección, comunicada y revisada en intervalos planificados?'),
  ('5.15', 'Control de acceso', 'ORGANIZACIONAL',
   'ISO/IEC 27002:2022, control 5.15: establecer e implementar reglas para controlar el acceso físico y lógico con base en requisitos del negocio y de seguridad.',
   '¿Hay reglas de acceso basadas en requisitos del negocio y de seguridad?'),
  ('5.18', 'Derechos de acceso', 'ORGANIZACIONAL',
   'ISO/IEC 27002:2022, control 5.18: aprovisionar, revisar, modificar y retirar los derechos de acceso conforme a la política y reglas de control de acceso.',
   '¿Se aprueban, revisan y retiran los derechos de acceso mediante un procedimiento?'),
  ('5.24', 'Planificación y preparación de la gestión de incidentes', 'ORGANIZACIONAL',
   'ISO/IEC 27002:2022, control 5.24: definir procesos, roles y responsabilidades para la gestión de incidentes de seguridad de la información.',
   '¿Hay procesos, roles y responsabilidades definidos para gestionar incidentes?'),
  ('6.3',  'Concienciación, educación y formación en seguridad de la información', 'PERSONAS',
   'ISO/IEC 27002:2022, control 6.3: el personal y las partes interesadas pertinentes reciben concienciación, educación y formación adecuadas y actualizaciones periódicas.',
   '¿El personal recibe formación periódica y pertinente en seguridad de la información?'),
  ('7.2',  'Controles físicos de entrada', 'FISICO',
   'ISO/IEC 27002:2022, control 7.2: proteger las áreas seguras mediante controles de entrada y puntos de acceso apropiados.',
   '¿Las áreas seguras tienen controles de entrada y registro de accesos?'),
  ('8.5',  'Autenticación segura', 'TECNOLOGICO',
   'ISO/IEC 27002:2022, control 8.5: implementar tecnologías y procedimientos de autenticación segura acordes con las restricciones de acceso y el riesgo.',
   '¿La autenticación es acorde con el riesgo (por ejemplo, múltiple factor en accesos privilegiados)?'),
  ('8.7',  'Protección contra el malware', 'TECNOLOGICO',
   'ISO/IEC 27002:2022, control 8.7: implementar protección contra malware respaldada por la concienciación adecuada de los usuarios.',
   '¿Existe protección contra malware actualizada en equipos y servidores?'),
  ('8.8',  'Gestión de las vulnerabilidades técnicas', 'TECNOLOGICO',
   'ISO/IEC 27002:2022, control 8.8: obtener información sobre vulnerabilidades técnicas, evaluar la exposición y tomar medidas apropiadas.',
   '¿Se identifican, evalúan y tratan periódicamente las vulnerabilidades técnicas?'),
  ('8.13', 'Copias de seguridad de la información', 'TECNOLOGICO',
   'ISO/IEC 27002:2022, control 8.13: mantener y probar periódicamente copias de seguridad de la información, el software y los sistemas.',
   '¿Las copias se realizan según una política y se prueba su restauración?'),
  ('8.15', 'Registro de eventos', 'TECNOLOGICO',
   'ISO/IEC 27002:2022, control 8.15: producir, almacenar, proteger y analizar registros de actividades, excepciones, fallos y otros eventos relevantes.',
   '¿Se generan, protegen y revisan los registros de actividad?'),
  ('8.23', 'Filtrado web', 'TECNOLOGICO',
   'ISO/IEC 27002:2022, control 8.23: gestionar el acceso a sitios web externos para reducir la exposición a contenido malicioso.',
   '¿Se gestiona el acceso a sitios web externos para reducir la exposición a contenido malicioso?'),
  ('8.31', 'Separación de los entornos de desarrollo, prueba y producción', 'TECNOLOGICO',
   'ISO/IEC 27002:2022, control 8.31: separar y proteger los entornos de desarrollo, prueba y producción.',
   '¿Los entornos están separados y protegidos? (puede resultar no aplicable)')
ON CONFLICT (codigo_iso) DO UPDATE SET
  nombre               = EXCLUDED.nombre,
  categoria            = EXCLUDED.categoria,
  criterio             = EXCLUDED.criterio,
  pregunta_orientadora = EXCLUDED.pregunta_orientadora;

-- -----------------------------------------------------------------------------
-- Auditoría, evaluaciones, evidencias, hallazgos y recomendaciones
-- -----------------------------------------------------------------------------
DELETE FROM auditoria WHERE organizacion = 'Empresa ABC (ficticia)';

DO $$
DECLARE
  v_auditor   INTEGER;
  v_auditoria INTEGER;
  v_eval      INTEGER;
  v_hallazgo  INTEGER;
  r           RECORD;
BEGIN
  SELECT id_usuario INTO v_auditor FROM usuario WHERE correo = 'ana.r@auditsys.local';

  INSERT INTO auditoria (organizacion, objetivo, alcance, referentes, fecha_inicio, fecha_fin, estado, id_auditor)
  VALUES (
    'Empresa ABC (ficticia)',
    'Evaluar el estado de implementación de 13 controles seleccionados de ISO/IEC 27002:2022 en los servicios de TI de la organización.',
    'Servidores, estaciones de trabajo, aplicaciones empresariales, bases de datos de clientes, red corporativa y usuarios internos y externos.',
    'ISO 19011:2018 (principios de auditoría); ISO/IEC 27001:2022; ISO/IEC 27002:2022',
    DATE '2026-11-09',
    DATE '2026-11-20',
    'EN_EJECUCION',
    v_auditor
  )
  RETURNING id_auditoria INTO v_auditoria;

  -- Evaluaciones + evidencias (EV-01 … EV-12). 8.31 = NO_APLICABLE sin evidencia (RN03)
  FOR r IN
    SELECT * FROM (VALUES
      ('5.1',  'IMPLEMENTADO',    'Política vigente, aprobada por la gerencia y revisada en 2026.',                 NULL::TEXT, 'EV-01', 'Política de seguridad de la información v2.0',            'Gerencia general',           'DOCUMENTAL'),
      ('5.15', 'IMPLEMENTADO',    'Matriz de roles y permisos aprobada; accesos asignados por perfil.',             NULL,       'EV-02', 'Matriz de roles y permisos aprobada',                     'Área de TI',                 'DOCUMENTAL'),
      ('5.18', 'PARCIAL',         'Altas y bajas gestionadas; la revisión de accesos no es periódica.',             NULL,       'EV-03', 'Entrevista al líder de TI sobre gestión de accesos',      'Líder de TI',                'ENTREVISTA'),
      ('5.24', 'NO_IMPLEMENTADO', 'No hay procedimiento ni roles definidos para la gestión de incidentes.',         NULL,       'EV-04', 'Acta de entrevista que confirma ausencia de procedimiento','Coordinación de operaciones','ENTREVISTA'),
      ('6.3',  'PARCIAL',         'Inducción inicial sin refuerzo anual ni evaluación de eficacia.',                NULL,       'EV-05', 'Lista de asistencia a la inducción de seguridad',         'Talento humano',             'REGISTRO'),
      ('7.2',  'IMPLEMENTADO',    'Acceso al cuarto de servidores con tarjeta de proximidad y bitácora.',           NULL,       'EV-06', 'Registro fotográfico y bitácora de acceso',               'Seguridad física',           'OBSERVACION'),
      ('8.5',  'PARCIAL',         'Autenticación multifactor solo en cuentas administrativas.',                     NULL,       'EV-07', 'Captura de configuración de MFA en el directorio',        'Administrador de plataforma','CAPTURA'),
      ('8.7',  'IMPLEMENTADO',    'Antimalware centralizado y actualizado en toda la muestra revisada.',            NULL,       'EV-08', 'Consola central de antimalware',                          'Mesa de servicio',           'CAPTURA'),
      ('8.8',  'NO_IMPLEMENTADO', 'No se realizan escaneos periódicos de vulnerabilidades.',                        NULL,       'EV-09', 'Acta de entrevista: no existen reportes de escaneo',      'Líder de infraestructura',   'ENTREVISTA'),
      ('8.13', 'PARCIAL',         'Respaldos diarios; sin pruebas de restauración documentadas.',                   NULL,       'EV-10', 'Bitácora de respaldos diarios',                           'Administrador de backups',   'REGISTRO'),
      ('8.15', 'NO_IMPLEMENTADO', 'Registros locales en cada servidor, sin centralización ni revisión.',            NULL,       'EV-11', 'Captura de configuración local de registros',             'Líder de infraestructura',   'CAPTURA'),
      ('8.23', 'PARCIAL',         'Filtrado web operativo solo en la sede principal.',                              NULL,       'EV-12', 'Configuración del proxy corporativo',                     'Área de redes',              'CAPTURA'),
      ('8.31', 'NO_APLICABLE',    'Control excluido del alcance evaluado.',
       'La empresa adquiere soluciones como servicio (SaaS) y no desarrolla software propio.',               NULL,    NULL,                                                       NULL,                         NULL)
    ) AS t(codigo_iso, estado, observacion, justificacion_na, ev_codigo, ev_desc, ev_fuente, ev_tipo)
  LOOP
    INSERT INTO evaluacion_control (id_auditoria, id_control, estado, observacion, justificacion_na)
    SELECT v_auditoria, c.id_control, r.estado, r.observacion, r.justificacion_na
    FROM control c WHERE c.codigo_iso = r.codigo_iso
    RETURNING id_evaluacion INTO v_eval;

    IF r.ev_codigo IS NOT NULL THEN
      INSERT INTO evidencia (codigo, id_auditoria, id_evaluacion, descripcion, fuente, tipo, referencia_archivo, es_simulada, fecha_recoleccion)
      VALUES (r.ev_codigo, v_auditoria, v_eval, r.ev_desc, r.ev_fuente, r.ev_tipo,
              'simulado/' || LOWER(REPLACE(r.ev_codigo, '-', '_')) || '.pdf', TRUE, DATE '2026-11-12');
    END IF;
  END LOOP;

  -- Hallazgos H-01 … H-04 con recomendación R-01 … R-04
  FOR r IN
    SELECT * FROM (VALUES
      ('H-01', '8.8',  'ALTA',
       'No se evidencian escaneos ni reportes periódicos de vulnerabilidades en los servidores expuestos.',
       'ISO/IEC 27002:2022, control 8.8: obtener información sobre vulnerabilidades, evaluar la exposición y tomar medidas apropiadas.',
       'No hay responsable asignado ni procedimiento de gestión de parches y vulnerabilidades.',
       'Mayor probabilidad de explotación de vulnerabilidades conocidas, con impacto en la disponibilidad y confidencialidad de los datos de clientes.',
       'R-01', 'Designar responsable, definir el procedimiento y ejecutar escaneos mensuales con plazos de remediación según la criticidad.', 'ALTA', 60),
      ('H-02', '5.24', 'ALTA',
       'No existe procedimiento documentado ni roles definidos para gestionar incidentes de seguridad; los eventos se atienden de manera informal.',
       'ISO/IEC 27002:2022, control 5.24: definir procesos, roles y responsabilidades para la gestión de incidentes.',
       'Falta de definición de responsabilidades y de un canal único de reporte.',
       'Respuesta tardía o inconsistente, pérdida de evidencia y posible incumplimiento de obligaciones de notificación.',
       'R-02', 'Formalizar el procedimiento, designar el equipo de respuesta, habilitar un canal de reporte y realizar un simulacro semestral.', 'ALTA', 60),
      ('H-03', '8.13', 'MEDIA',
       'Se ejecutan respaldos diarios, pero no hay pruebas de restauración registradas.',
       'ISO/IEC 27002:2022, control 8.13: mantener y probar periódicamente las copias de seguridad.',
       'No existe procedimiento ni responsable de las pruebas de restauración.',
       'Imposibilidad de recuperar información crítica de clientes ante una falla o un ataque de ransomware.',
       'R-03', 'Definir el procedimiento de respaldo y ejecutar pruebas de restauración trimestrales documentadas.', 'MEDIA', 90),
      ('H-04', '8.15', 'MEDIA',
       'Los registros se almacenan localmente en cada servidor, sin centralización ni revisión periódica.',
       'ISO/IEC 27002:2022, control 8.15: producir, proteger y analizar los registros de actividad.',
       'No se ha implementado una solución de gestión de registros.',
       'Dificultad para detectar y reconstruir incidentes, y posibilidad de alteración de los registros.',
       'R-04', 'Centralizar los registros críticos, proteger su integridad y definir una revisión periódica.', 'MEDIA', 120)
    ) AS t(codigo, codigo_iso, severidad, condicion, criterio, causa, efecto, r_codigo, r_desc, r_prioridad, r_plazo)
  LOOP
    SELECT ec.id_evaluacion INTO v_eval
    FROM evaluacion_control ec
    JOIN control c ON c.id_control = ec.id_control
    WHERE ec.id_auditoria = v_auditoria AND c.codigo_iso = r.codigo_iso;

    INSERT INTO hallazgo (codigo, id_auditoria, id_evaluacion, condicion, criterio, causa, efecto_riesgo, severidad)
    VALUES (r.codigo, v_auditoria, v_eval, r.condicion, r.criterio, r.causa, r.efecto, r.severidad)
    RETURNING id_hallazgo INTO v_hallazgo;

    INSERT INTO recomendacion (codigo, id_hallazgo, descripcion, prioridad, plazo_dias)
    VALUES (r.r_codigo, v_hallazgo, r.r_desc, r.r_prioridad, r.r_plazo);
  END LOOP;
END;
$$;

COMMIT;

-- Verificación rápida (opcional):
-- SELECT
--   COUNT(*) FILTER (WHERE estado = 'IMPLEMENTADO')    AS implementados,
--   COUNT(*) FILTER (WHERE estado = 'PARCIAL')         AS parciales,
--   COUNT(*) FILTER (WHERE estado = 'NO_IMPLEMENTADO') AS no_implementados,
--   COUNT(*) FILTER (WHERE estado <> 'NO_APLICABLE')   AS aplicables
-- FROM evaluacion_control ec
-- JOIN auditoria a ON a.id_auditoria = ec.id_auditoria
-- WHERE a.organizacion = 'Empresa ABC (ficticia)';
