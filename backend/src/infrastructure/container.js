const PostgresDatabase = require('./database/PostgresDatabase');
const PgSaludAdapter = require('./persistence/PgSaludAdapter');
const PgUsuarioRepository = require('./persistence/PgUsuarioRepository');
const PgAuditoriaRepository = require('./persistence/PgAuditoriaRepository');
const PgControlRepository = require('./persistence/PgControlRepository');
const PgEvaluacionRepository = require('./persistence/PgEvaluacionRepository');
const PgEvidenciaRepository = require('./persistence/PgEvidenciaRepository');
const PgHallazgoRepository = require('./persistence/PgHallazgoRepository');
const PgInformeRepository = require('./persistence/PgInformeRepository');

const VerificarSaludUseCase = require('../application/use-cases/VerificarSaludUseCase');
const ListarAuditoresUseCase = require('../application/use-cases/ListarAuditoresUseCase');
const ListarAuditoriasUseCase = require('../application/use-cases/ListarAuditoriasUseCase');
const RegistrarAuditoriaUseCase = require('../application/use-cases/RegistrarAuditoriaUseCase');
const ConsultarCatalogoUseCase = require('../application/use-cases/ConsultarCatalogoUseCase');
const EvaluarControlUseCase = require('../application/use-cases/EvaluarControlUseCase');
const RegistrarEvidenciaUseCase = require('../application/use-cases/RegistrarEvidenciaUseCase');
const RegistrarHallazgoUseCase = require('../application/use-cases/RegistrarHallazgoUseCase');
const CalcularIndicadoresUseCase = require('../application/use-cases/CalcularIndicadoresUseCase');
const GenerarReporteUseCase = require('../application/use-cases/GenerarReporteUseCase');
const EmitirInformeUseCase = require('../application/use-cases/EmitirInformeUseCase');

const SistemaController = require('./http/controllers/SistemaController');
const AuditoriaController = require('./http/controllers/AuditoriaController');
const ControlController = require('./http/controllers/ControlController');
const EvaluacionController = require('./http/controllers/EvaluacionController');

/** Raíz de composición: único lugar donde se conectan puertos y adaptadores. */
const buildContainer = (env) => {
  const db = new PostgresDatabase({ databaseUrl: env.databaseUrl, ssl: env.databaseSsl });

  const saludPort = new PgSaludAdapter({ db });
  const usuarioRepository = new PgUsuarioRepository({ db });
  const auditoriaRepository = new PgAuditoriaRepository({ db });
  const controlRepository = new PgControlRepository({ db });
  const evaluacionRepository = new PgEvaluacionRepository({ db });
  const evidenciaRepository = new PgEvidenciaRepository({ db });
  const hallazgoRepository = new PgHallazgoRepository({ db });
  const informeRepository = new PgInformeRepository({ db });

  const calcularIndicadores = new CalcularIndicadoresUseCase({ auditoriaRepository, evaluacionRepository, hallazgoRepository });
  const generarReporte = new GenerarReporteUseCase({
    auditoriaRepository,
    controlRepository,
    evaluacionRepository,
    evidenciaRepository,
    hallazgoRepository,
    informeRepository,
    calcularIndicadores,
  });

  return {
    db,
    controllers: {
      sistemaController: new SistemaController({
        verificarSalud: new VerificarSaludUseCase({ saludPort }),
        listarAuditores: new ListarAuditoresUseCase({ usuarioRepository }),
      }),
      auditoriaController: new AuditoriaController({
        listarAuditorias: new ListarAuditoriasUseCase({ auditoriaRepository }),
        registrarAuditoria: new RegistrarAuditoriaUseCase({ auditoriaRepository, usuarioRepository }),
        calcularIndicadores,
        generarReporte,
        emitirInforme: new EmitirInformeUseCase({ generarReporte, informeRepository }),
      }),
      controlController: new ControlController({
        consultarCatalogo: new ConsultarCatalogoUseCase({ controlRepository, auditoriaRepository }),
      }),
      evaluacionController: new EvaluacionController({
        evaluarControl: new EvaluarControlUseCase({ auditoriaRepository, controlRepository, evaluacionRepository }),
        registrarEvidencia: new RegistrarEvidenciaUseCase({ auditoriaRepository, evaluacionRepository, evidenciaRepository }),
        registrarHallazgo: new RegistrarHallazgoUseCase({ auditoriaRepository, evaluacionRepository, hallazgoRepository }),
      }),
    },
  };
};

module.exports = buildContainer;
