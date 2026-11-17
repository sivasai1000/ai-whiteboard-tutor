// Display catalog only. The server-configured model remains the sole enabled model.
export const modelCatalog = [
  { id: "gpt-6-luna", label: "GPT-6 Luna", description: "Everyday learning" },
  {
    id: "gpt-6.1-sol",
    label: "GPT-6.1 Sol",
    description: "General-purpose assistance",
  },
  {
    id: "gpt-6.1-terra",
    label: "GPT-6.1 Terra",
    description: "Coding and technical work",
  },
  {
    id: "gpt-6-astra",
    label: "GPT-6 Astra",
    description: "Advanced reasoning",
  },
];

export const modelAccessContact = {
  name: "Sivasai",
  email: "sivasaimallipudi9h@gmail.com",
};

export const reasoningEfforts = [
  { id: "low", label: "Low", description: "Faster, with less reasoning cost" },
  {
    id: "medium",
    label: "Medium",
    description: "More time for complex explanations",
  },
  {
    id: "high",
    label: "High",
    description: "Most reasoning; may take longer and cost more",
  },
];

export function modelLabel(id) {
  return modelCatalog.find((model) => model.id === id)?.label || id;
}
