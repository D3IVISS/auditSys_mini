class SistemaController {
  constructor({ verificarSalud, listarAuditores }) {
    this.verificarSalud = verificarSalud;
    this.listarAuditores = listarAuditores;
  }

  health = async (req, res) => {
    const estado = await this.verificarSalud.execute();
    res.status(estado.database.status === 'UP' ? 200 : 503).json(estado);
  };

  usuarios = async (req, res) => {
    res.json(await this.listarAuditores.execute());
  };
}

module.exports = SistemaController;
