class EvaluacionController {
  constructor({ evaluarControl, registrarEvidencia, registrarHallazgo }) {
    this.evaluarControl = evaluarControl;
    this.registrarEvidencia = registrarEvidencia;
    this.registrarHallazgo = registrarHallazgo;
  }

  evaluar = async (req, res) => {
    const resultado = await this.evaluarControl.execute(req.body);
    res.status(resultado.creada ? 201 : 200).json(resultado);
  };

  evidencia = async (req, res) => {
    res.status(201).json(await this.registrarEvidencia.execute(req.body));
  };

  hallazgo = async (req, res) => {
    res.status(201).json(await this.registrarHallazgo.execute(req.body));
  };
}

module.exports = EvaluacionController;
