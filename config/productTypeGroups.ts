export interface ProductTypeGroup {
  name: string;
  types: string[];
}

export const PRODUCT_TYPE_GROUPS: ProductTypeGroup[] = [
  {
    name: "Chassis & Structure",
    types: [
      "chassis",
      "Chassis Parts",
      "bulkheads",
      "front bulkhead",
      "bumpers",
      "block carriers",
      "battery mounts",
      "mounts",
    ],
  },
  {
    name: "Suspension",
    types: [
      "Suspension Parts",
      "suspension parts",
      "Shock Parts",
      "shock parts",
      "Shock Tower",
      "front arms",
      "rear arms",
      "Turnbuckles",
      "hinge pins",
    ],
  },
  {
    name: "Transmission & Drivetrain",
    types: [
      "Transmission Parts",
      "transmission",
      "transmission case",
      "gears",
      "hub smission",
      "Motor Plate",
    ],
  },
  {
    name: "Steering",
    types: [
      "steering parts",
      "Steering Parts",
      "bellcranks",
      "steering blocks",
    ],
  },
  {
    name: "Body & Aero",
    types: [
      "body parts",
      "body posts",
      "RC10 B3 body",
      "rc10 body",
      "nose tubes",
      "wing tubes",
      "Nose Plate",
    ],
  },
  {
    name: "Hardware & Components",
    types: [
      "Hardware",
      "hardware",
      "RC10 Hardware",
      "Gear Cover",
    ],
  },
  {
    name: "Materials",
    types: [
      "Carbon Fiber Parts",
      "Titanium Parts",
      "Plastic Parts",
    ],
  },
  {
    name: "Complete Sets & Kits",
    types: [
      "Plastic Set",
      "Buggy Car Kits",
    ],
  },
  {
    name: "Model-Specific Parts",
    types: [
      "B4 parts",
      "T4 parts",
      "RC10 Parts",
    ],
  },
  {
    name: "Tools",
    types: [
      "tools",
    ],
  },
];

// Get all product types that are in groups
export const getGroupedTypes = (): string[] => {
  return PRODUCT_TYPE_GROUPS.flatMap((group) => group.types);
};

// Find matching types in a group (case-insensitive)
export const findMatchingTypesInGroup = (groupTypes: string[], allTypes: string[]): string[] => {
  const groupTypesLower = groupTypes.map((t) => t.toLowerCase());
  return allTypes.filter((type) => {
    return groupTypesLower.includes(type.toLowerCase());
  });
};

// Get product types that are not in any group (case-insensitive matching)
export const getUngroupedTypes = (allTypes: string[]): string[] => {
  const groupedTypesLower = getGroupedTypes().map((t) => t.toLowerCase());
  return allTypes.filter((type) => {
    return !groupedTypesLower.includes(type.toLowerCase());
  });
};

