export function normalizeName(name: string): string {
  if (!name) return "";
  
  // Convert to lowercase
  let normalized = name.toLowerCase();
  
  // Remove accents/diacritics
  normalized = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  // Remove hyphens, extra punctuation, and extra spaces
  normalized = normalized.replace(/[-_.,;!?'"()]/g, " ");
  
  // Replace multiple spaces with a single space
  normalized = normalized.replace(/\s+/g, " ").trim();
  
  // Capitalize first letter strictly
  if (normalized.length > 0) {
    normalized = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }
  
  return normalized;
}

export function standardizeEquipment(equipment: string | null | undefined): string | null {
  if (!equipment) return null;
  const normalized = equipment.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  if (normalized.includes("barbell") || normalized.includes("barra")) return "Barra";
  if (normalized.includes("dumbbell") || normalized.includes("halter")) return "Halter";
  if (normalized.includes("machine") || normalized.includes("maquina")) return "Máquina";
  if (normalized.includes("cable") || normalized.includes("cabo") || normalized.includes("polia")) return "Cabo";
  if (normalized.includes("body") || normalized.includes("peso") || normalized.includes("livre") || normalized === "nenhum") return "Peso corporal";
  if (normalized.includes("kettlebell")) return "Kettlebell";
  if (normalized.includes("band") || normalized.includes("elastico")) return "Elástico";
  if (normalized.includes("smith")) return "Máquina Smith";
  
  // Return the original with a capitalized first letter if unknown
  return equipment.charAt(0).toUpperCase() + equipment.slice(1).toLowerCase().trim();
}
