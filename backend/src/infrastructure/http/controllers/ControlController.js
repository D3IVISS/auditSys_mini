const { parseOptionalId } = require('../params');

class ControlController {
  constructor({ consultarCatalogo }) {
    this.consultarCatalogo = consultarCatalogo;
  }

  listar = async (req, res) => {
    const idAuditoria = parseOptionalId(req.query.id_auditoria, 'id_auditoria');
    res.json(await this.consultarCatalogo.execute(idAuditoria));
  };
}

module.exports = ControlController;
