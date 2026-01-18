// src/domain/concordia/useCaseKey.ts

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildUseCaseKey(params: {
  sector?: string | null;
  useCaseTitle?: string | null;
}) {
  const sector = slugify(params.sector || "generic");
  const title = slugify(params.useCaseTitle || "use-case");
  return `${sector}::${title}`;
}
