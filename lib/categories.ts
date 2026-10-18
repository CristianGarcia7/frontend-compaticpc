/**
 * Component categories accepted by the API. Single source of truth for the
 * consultation form, the catalog admin form and the field examples.
 */
export const CATEGORIES = [
  "RAM",
  "Almacenamiento",
  "Procesador",
  "Tarjeta gráfica",
  "Fuente de poder",
  "Batería",
  "Cargador",
] as const;
export type Category = (typeof CATEGORIES)[number];
export const isCategory = (value: unknown): value is Category =>
  typeof value === "string" &&
  (CATEGORIES as readonly string[]).includes(value);

type CategoryGuide = {
  /** Example for the "Referencia exacta" field. */
  reference: string;
  /** Example for the specifications textarea. */
  specifications: string;
  /** Where a technician can find the data for this category. */
  where: string[];
};
export const CATEGORY_GUIDE: Record<Category, CategoryGuide> = {
  RAM: {
    reference: "Ej. Kingston KVR32S22S8/8",
    specifications: "Ej. DDR4, SO-DIMM, 8 GB, 3200 MHz, 1.2 V, CL22, 260 pines",
    where: [
      "La etiqueta adhesiva del módulo indica tipo, capacidad, velocidad y voltaje.",
      "En Windows, ejecute «wmic memorychip get partnumber,speed,capacity» en la consola.",
      "CPU-Z (pestaña SPD) o HWiNFO muestran el número de parte de cada módulo instalado.",
    ],
  },
  Almacenamiento: {
    reference: "Ej. Samsung 980 MZ-V8V500",
    specifications: "Ej. SSD M.2 2280, NVMe PCIe 3.0 x4, 500 GB, clave M",
    where: [
      'La etiqueta de la unidad indica formato (2.5", M.2 2242/2280), interfaz y capacidad.',
      "El manual del equipo indica qué ranuras M.2 tiene y si admiten NVMe o solo SATA.",
      "CrystalDiskInfo o HWiNFO muestran el modelo y la interfaz de la unidad actual.",
    ],
  },
  Procesador: {
    reference: "Ej. Intel Core i5-12400F",
    specifications:
      "Ej. Socket LGA1700, 65 W TDP, 6 núcleos, requiere BIOS 0812 o superior",
    where: [
      "La ficha del fabricante (Intel ARK, AMD) indica socket, TDP y memoria compatible.",
      "La lista de CPU soportadas de la placa base indica la versión mínima de BIOS.",
      "CPU-Z (pestaña CPU) muestra el socket y el procesador instalado.",
    ],
  },
  "Tarjeta gráfica": {
    reference: "Ej. MSI GeForce RTX 4060 VENTUS 2X 8G",
    specifications:
      "Ej. PCIe 4.0 x8, 115 W, 1 conector de 8 pines, 199 mm de largo, fuente recomendada 550 W",
    where: [
      "La ficha del fabricante indica consumo, conectores de alimentación y largo de la tarjeta.",
      "Mida el espacio libre en el gabinete y revise la potencia en la etiqueta de la fuente.",
      "GPU-Z muestra el modelo y la interfaz PCIe de la tarjeta instalada.",
    ],
  },
  "Fuente de poder": {
    reference: "Ej. Corsair CV550",
    specifications:
      "Ej. 550 W, ATX, 80 Plus Bronze, 1 conector PCIe 8 pines, EPS 4+4",
    where: [
      "La etiqueta lateral de la fuente indica potencia total, amperaje por línea y certificación.",
      "Compare con el consumo (TDP) del procesador y de la tarjeta gráfica en sus fichas técnicas.",
    ],
  },
  Batería: {
    reference: "Ej. Dell 0M5NJ8",
    specifications: "Ej. 11.55 V, 54 Wh, 3 celdas, parte 0M5NJ8",
    where: [
      "La etiqueta de la batería original indica voltaje, Wh, número de celdas y número de parte.",
      "El manual de servicio del equipo lista los números de parte compatibles.",
      "En Windows, «powercfg /batteryreport» genera un informe con el modelo de la batería.",
    ],
  },
  Cargador: {
    reference: "Ej. Lenovo ADLX65YLC3A",
    specifications: "Ej. 65 W, 20 V / 3.25 A, USB-C PD",
    where: [
      "La etiqueta del cargador original indica potencia (W), voltaje y amperaje de salida.",
      "La etiqueta inferior del equipo indica el voltaje y amperaje de entrada requeridos.",
      "Compruebe el conector: USB-C con Power Delivery, punta redonda (diámetro) o propietario.",
    ],
  },
};

/** Where to find the equipment data (brand, model, board, serial). */
export const EQUIPMENT_WHERE = [
  "La etiqueta inferior o trasera del equipo indica marca, modelo exacto y número de serie.",
  "En Windows, ejecute «msinfo32»: muestra el modelo del sistema y la placa base.",
  "CPU-Z (pestaña Mainboard y Memory) o HWiNFO muestran placa, tipo de memoria y ranuras.",
  "El manual del fabricante o la configuración del BIOS indican el máximo de memoria admitido.",
];
