const { parseId } = require('../params');

class AuditoriaController {
  constructor({ listarAuditorias, registrarAuditoria, calcularIndicadores, generarReporte, emitirInforme }) {
    this.listarAuditorias = listarAuditorias;
    this.registrarAuditoria = registrarAuditoria;
    this.calcularIndicadores = calcularIndicadores;
    this.generarReporte = generarReporte;
    this.emitirInforme = emitirInforme;
  }

  listar = async (req, res) => {
    res.json(await this.listarAuditorias.execute());
  };

  crear = async (req, res) => {
    const auditoria = await this.registrarAuditoria.execute(req.body);
    res.status(201).location(`/api/auditorias/${auditoria.id_auditoria}`).json(auditoria);
  };

  indicadores = async (req, res) => {
    const id = parseId(req.params.id, 'id');
    res.json(await this.calcularIndicadores.execute(id));
  };

  reporte = async (req, res) => {
    const id = parseId(req.params.id, 'id');
    res.json(await this.generarReporte.execute(id));
  };

  emitir = async (req, res) => {
    const id = parseId(req.params.id, 'id');
    res.status(201).json(await this.emitirInforme.execute(id));
  };
}

module.exports = AuditoriaController;
