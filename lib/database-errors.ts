export function isDatabaseUnavailable(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes("can't reach database") ||
    message.includes("database does not exist") ||
    message.includes("table") ||
    message.includes("relation") ||
    message.includes("database url") ||
    message.includes("datasource") ||
    message.includes("prismaclientinitializationerror")
  );
}
