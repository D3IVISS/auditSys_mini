class ListarAuditoresUseCase {
  constructor({ usuarioRepository }) {
    this.usuarioRepository = usuarioRepository;
  }

  async execute() {
    return this.usuarioRepository.listarAuditores();
  }
}

module.exports = ListarAuditoresUseCase;
