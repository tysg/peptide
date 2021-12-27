function extractCursor(source: string) {
  // TODO: is there an off-by-one here?
  const idx = source.indexOf("$");
  const sourceCode = source.replace("$", "");
  return { cursor: idx, code: sourceCode };
}

export { extractCursor };
