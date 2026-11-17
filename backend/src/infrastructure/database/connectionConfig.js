/**
 * Convierte DATABASE_URL en configuración de `pg`. Tolera contraseñas con
 * caracteres reservados (@, #, /, ?) sin codificar, causa habitual del error
 * "Invalid URL" al copiar la cadena desde Supabase.
 */
const URL_PATTERN = /^postgres(?:ql)?:\/\/([^:/?#]+)(?::(.*))?@([^@/:?#]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?.*)?$/;

const safeDecode = (valor) => {
  try {
    return decodeURIComponent(valor);
  } catch {
    return valor;
  }
};

const buildConnectionConfig = (databaseUrl, useSsl) => {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL no está definida. Configure backend/.env a partir de .env.example.');
  }
  const ssl = useSsl ? { rejectUnauthorized: false } : false;
  const match = URL_PATTERN.exec(databaseUrl);
  if (!match) {
    return { connectionString: databaseUrl, ssl };
  }
  const [, user, password = '', host, port = '5432', database = 'postgres'] = match;
  return {
    user: safeDecode(user),
    password: safeDecode(password),
    host,
    port: Number.parseInt(port, 10),
    database: safeDecode(database) || 'postgres',
    ssl,
  };
};

module.exports = { buildConnectionConfig };
