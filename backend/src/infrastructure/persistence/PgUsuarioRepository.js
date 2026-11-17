const UsuarioRepository = require('../../domain/ports/UsuarioRepository');

class PgUsuarioRepository extends UsuarioRepository {
  constructor({ db }) {
    super();
    this.db = db;
  }

  async listarAuditores() {
    const { rows } = await this.db.query(
      'SELECT id_usuario, nombre, correo, rol FROM usuario ORDER BY rol DESC, nombre ASC',
    );
    return rows;
  }

  async existe(idUsuario) {
    const { rowCount } = await this.db.query('SELECT 1 FROM usuario WHERE id_usuario = $1', [idUsuario]);
    return rowCount > 0;
  }
}

module.exports = PgUsuarioRepository;
