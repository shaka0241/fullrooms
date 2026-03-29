import { z } from "zod";

export const roomSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 letras"),
  category: z.string().min(3, "La categoría es obligatoria"),
  // z.coerce.number() convierte mágicamente el texto del input a número
  price: z.coerce.number().min(1, "El precio debe ser mayor a 0"),
  description: z.string().min(10, "Añade una descripción más detallada"),
  // Pedimos las amenidades como string (separadas por coma) para el formulario
  amenities: z
    .string()
    .min(3, "Añade al menos una amenidad (ej: Toalla, Jabón)"),
});

// Zod es tan inteligente que crea la Interface de TypeScript por nosotros
export type RoomFormData = z.infer<typeof roomSchema>;

// Interface de lo que devuelve la API (incluye el ID y amenities como Array)
export interface Room {
  _id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  amenities: string[];
}
