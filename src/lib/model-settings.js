// Display catalog only. The server-configured model remains the sole enabled model.
export const modelCatalog = [
  { id: "gpt-6-luna", label: "GPT-6 Luna" },
  { id: "gpt-6.1-sol", label: "GPT-6.1 Sol" },
  { id: "gpt-6.1-terra", label: "GPT-6.1 Terra" },
  { id: "gpt-6-astra", label: "GPT-6 Astra" },
];

export const modelAccessContact = {
  name: "Sivasai",
  email: "sivasaimallipudi9h@gmail.com",
};

export const reasoningEfforts = [
  { id: "low", label: "Low", description: "Fast, lower cost" },
  { id: "medium", label: "Medium", description: "Balanced reasoning" },
  { id: "high", label: "High", description: "Deeper, higher cost" },
];

export function modelLabel(id) {
  return modelCatalog.find((model) => model.id === id)?.label || id;
}
