const { BadRequestError } = require('../../domain/errors');

const INT_PATTERN = /^\d+$/;

/** Valida identificadores numéricos (ej. parseInt(req.params.id, 10)) antes de llegar a la base de datos. */
const parseId = (valor, nombre = 'id') => {
  const texto = typeof valor === 'string' ? valor.trim() : String(valor ?? '');
  const id = Number.parseInt(texto, 10);
  if (!INT_PATTERN.test(texto) || !Number.isSafeInteger(id) || id <= 0 || id > 2147483647) {
    throw new BadRequestError(`El parámetro "${nombre}" debe ser un entero positivo.`, {
      [nombre]: `Valor recibido no válido: "${texto}".`,
    });
  }
  return id;
};

const parseOptionalId = (valor, nombre) => {
  if (valor === undefined || valor === null || valor === '') return null;
  return parseId(valor, nombre);
};

module.exports = { parseId, parseOptionalId };
