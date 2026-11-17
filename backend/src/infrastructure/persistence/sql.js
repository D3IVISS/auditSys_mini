/** Orden natural de códigos ISO (5.1 < 5.15 < 8.8 < 8.13). */
const ORDEN_ISO = (alias) => `string_to_array(${alias}.codigo_iso, '.')::int[]`;

module.exports = { ORDEN_ISO };
