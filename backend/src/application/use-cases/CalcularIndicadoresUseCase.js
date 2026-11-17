const IndicadorService = require('../../domain/services/IndicadorService');
const { NotFoundError } = require('../../domain/errors');

class CalcularIndicadoresUseCase {
  constructor({ auditoriaRepository, evaluacionRepository, hallazgoRepository }) {
    this.auditoriaRepository = auditoriaRepository;
    this.evaluacionRepository = evaluacionRepository;
    this.hallazgoRepository = hallazgoRepository;
  }

  async execute(idAuditoria) {
    const auditoria = await this.auditoriaRepository.buscarPorId(idAuditoria);
    if (!auditoria) throw new NotFoundError(`No existe la auditoría ${idAuditoria}.`);

    const [filas, severidades] = await Promise.all([
      this.evaluacionRepository.conteosPorCategoria(idAuditoria),
      this.hallazgoRepository.conteoPorSeveridad(idAuditoria),
    ]);
    const totalCatalogo = filas.reduce((acc, f) => acc + Number(f.total), 0);

    return IndicadorService.consolidar({ idAuditoria, filas, severidades, totalCatalogo });
  }
}

module.exports = CalcularIndicadoresUseCase;
