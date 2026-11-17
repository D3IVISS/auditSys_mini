const { ValidationError } = require('./errors');

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

class Validator {
  constructor() {
    this.errors = {};
  }

  add(campo, mensaje) {
    if (!this.errors[campo]) this.errors[campo] = mensaje;
    return this;
  }

  text(obj, campo, etiqueta, { required = true, max = 5000, min = 1 } = {}) {
    const value = obj[campo];
    if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
      if (required) this.add(campo, `Campo obligatorio: ${etiqueta.toLowerCase()}.`);
      return null;
    }
    if (typeof value !== 'string') {
      this.add(campo, `${etiqueta} debe ser texto.`);
      return null;
    }
    const trimmed = value.trim();
    if (trimmed.length < min) this.add(campo, `${etiqueta} debe tener al menos ${min} caracteres.`);
    if (trimmed.length > max) this.add(campo, `${etiqueta} admite máximo ${max} caracteres.`);
    return trimmed;
  }

  positiveInt(obj, campo, etiqueta, { required = true, max = 2147483647 } = {}) {
    const value = obj[campo];
    if (value === undefined || value === null || value === '') {
      if (required) this.add(campo, `Campo obligatorio: ${etiqueta.toLowerCase()}.`);
      return null;
    }
    const parsed = typeof value === 'number' ? value : Number.parseInt(String(value).trim(), 10);
    if (!Number.isInteger(parsed) || parsed <= 0 || parsed > max || String(parsed) !== String(value).trim()) {
      this.add(campo, `${etiqueta} debe ser un entero positivo${max < 2147483647 ? ` (máx. ${max})` : ''}.`);
      return null;
    }
    return parsed;
  }

  oneOf(obj, campo, etiqueta, opciones, { required = true, defaultValue = null } = {}) {
    const value = obj[campo];
    if (value === undefined || value === null || value === '') {
      if (required) this.add(campo, `Campo obligatorio: ${etiqueta.toLowerCase()}.`);
      return defaultValue;
    }
    const normalized = String(value).trim().toUpperCase();
    if (!opciones.includes(normalized)) {
      this.add(campo, `${etiqueta} debe ser uno de: ${opciones.join(', ')}.`);
      return null;
    }
    return normalized;
  }

  date(obj, campo, etiqueta, { required = true } = {}) {
    const value = obj[campo];
    if (value === undefined || value === null || value === '') {
      if (required) this.add(campo, `Campo obligatorio: ${etiqueta.toLowerCase()}.`);
      return null;
    }
    const str = String(value).trim();
    const time = Date.parse(`${str}T00:00:00Z`);
    if (!ISO_DATE.test(str) || Number.isNaN(time) || new Date(time).toISOString().slice(0, 10) !== str) {
      this.add(campo, `${etiqueta} debe tener formato AAAA-MM-DD válido.`);
      return null;
    }
    return str;
  }

  boolean(obj, campo, etiqueta, { defaultValue = false } = {}) {
    const value = obj[campo];
    if (value === undefined || value === null || value === '') return defaultValue;
    if (typeof value === 'boolean') return value;
    if (value === 'true') return true;
    if (value === 'false') return false;
    this.add(campo, `${etiqueta} debe ser verdadero o falso.`);
    return defaultValue;
  }

  assert(mensajeGeneral = 'Los datos enviados no son válidos.') {
    if (Object.keys(this.errors).length > 0) {
      throw new ValidationError(mensajeGeneral, this.errors);
    }
  }
}

const asObject = (value) => (value && typeof value === 'object' && !Array.isArray(value) ? value : {});

module.exports = { Validator, asObject };
