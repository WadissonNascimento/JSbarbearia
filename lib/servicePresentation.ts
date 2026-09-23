type PresentableService = {
  name: string;
  description?: string | null;
};

export function isComboService(service: PresentableService) {
  return service.description?.trim().toLocaleLowerCase("pt-BR").startsWith("combo") ?? false;
}

export function sortServicesForDisplay<T extends PresentableService>(services: T[]) {
  const ordered = [...services];
  const eyebrowIndex = ordered.findIndex(
    (service) => service.name.trim().toLocaleLowerCase("pt-BR") === "sobrancelha",
  );

  if (eyebrowIndex < 0) return ordered;

  const [eyebrow] = ordered.splice(eyebrowIndex, 1);
  ordered.splice(Math.min(3, ordered.length), 0, eyebrow);
  return ordered;
}
