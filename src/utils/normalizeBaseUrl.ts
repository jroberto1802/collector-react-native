export function normalizeBaseUrl(value: string) {
  const trimmedValue = value.trim();
  const markdownUrl = trimmedValue.match(/^\[[^\]]+\]\((https?:\/\/[^)]+)\)$/i);
  const normalizedValue = markdownUrl?.[1] ?? trimmedValue;

  return normalizedValue.replace(/\/+$/, '');
}
