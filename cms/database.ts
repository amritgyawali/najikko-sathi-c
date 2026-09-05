/** Preserve certificate verification when connecting to Supabase's private CA. */
export function databasePoolConfig() {
  let connectionString = process.env.DATABASE_URI || "";
  const ca = process.env.DATABASE_SSL_CA?.replace(/\\n/g, "\n");

  if (ca && connectionString) {
    const connection = new URL(connectionString);
    // node-postgres replaces the SSL object when these URL options are present.
    for (const key of ["sslmode", "sslcert", "sslkey", "sslrootcert", "ssl", "uselibpqcompat"]) {
      connection.searchParams.delete(key);
    }
    connectionString = connection.toString();
  }

  return {
    connectionString,
    // Payload keeps one connection for reconnect handling. Mutations also
    // need a transaction connection and a separate document-lock query.
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
    ...(ca ? { ssl: { ca, rejectUnauthorized: true } } : {}),
  };
}
