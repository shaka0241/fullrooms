import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  roomSchema,
  type RoomFormData,
  type Room,
} from "../schemas/roomSchema";
import { useRooms } from "../hooks/useRooms";

export function AdminRooms() {
  const { rooms, cargando, agregarRoom, editarRoom, eliminarRoom } = useRooms();

  // 1. Estado para saber si estamos editando (guardamos el ID)
  const [idEditando, setIdEditando] = useState<string | null>(null);

  // 2. useRef: Nuestro "gancho" al DOM para hacer scroll automático
  const formularioRef = useRef<HTMLElement>(null);

  // 3. Inicializamos React Hook Form conectado con Zod
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
  });

  // 4. Qué pasa cuando Zod aprueba el formulario
  const onSubmit = async (data: RoomFormData) => {
    // Transformamos el string de amenidades en un array real para la API
    const amenitiesArray = data.amenities.split(",").map((item) => item.trim());

    const roomPayload = {
      ...data,
      amenities: amenitiesArray,
    };

    if (idEditando) {
      await editarRoom(idEditando, roomPayload);
      setIdEditando(null);
    } else {
      await agregarRoom(roomPayload);
    }

    reset(); // RHF limpia los inputs mágicamente
  };

  // 5. Preparar la edición cuando hacen clic en el ícono ✏️
  const prepararEdicion = (room: Room) => {
    setIdEditando(room._id);

    // Llenamos el formulario usando setValue de RHF
    setValue("name", room.name);
    setValue("category", room.category);
    setValue("price", room.price);
    setValue("description", room.description);
    setValue("amenities", room.amenities.join(", ")); // Convertimos Array a String

    // Magia de useRef: Hacemos scroll suave hasta el formulario
    formularioRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const cancelarEdicion = () => {
    setIdEditando(null);
    reset();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-serif text-slate-800">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* LA TABLA DE DATOS */}
        <section className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black uppercase tracking-widest text-indigo-900">
              🏨 Directorio de Suites
            </h2>
            <button
              onClick={() => {
                cancelarEdicion();
                formularioRef.current?.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded font-bold hover:bg-indigo-700 transition flex items-center gap-2"
            >
              ➕ Nueva Suite
            </button>
          </div>

          {cargando ? (
            <p className="text-center animate-pulse py-10">
              Cargando registros...
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 border-b-2 border-slate-300">
                  <tr>
                    <th className="p-3 font-bold uppercase text-sm">Suite</th>
                    <th className="p-3 font-bold uppercase text-sm">
                      Categoría
                    </th>
                    <th className="p-3 font-bold uppercase text-sm">Precio</th>
                    <th className="p-3 font-bold uppercase text-sm text-center">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rooms.map((room) => (
                    <tr
                      key={room._id}
                      className="hover:bg-indigo-50 transition-colors group"
                    >
                      <td className="p-3 font-bold">{room.name}</td>
                      <td className="p-3 text-sm text-slate-600">
                        {room.category}
                      </td>
                      <td className="p-3 font-mono text-indigo-700 font-bold">
                        ${room.price}
                      </td>
                      <td className="p-3 text-center space-x-4">
                        {/* ÍCONO EDITAR */}
                        <button
                          onClick={() => prepararEdicion(room)}
                          className="text-xl hover:scale-125 transition-transform"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        {/* ÍCONO ELIMINAR */}
                        <button
                          onClick={() => eliminarRoom(room._id)}
                          className="text-xl hover:scale-125 transition-transform"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* EL FORMULARIO (Enganchado con useRef) */}
        <section
          ref={formularioRef}
          className="bg-indigo-900 p-8 rounded-xl shadow-xl text-white"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            {idEditando ? "✏️ Modificar Registro" : "➕ Registrar Nueva Suite"}
          </h2>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Input Nombre */}
            <div className="space-y-1">
              <label className="text-sm font-bold text-indigo-200">
                Nombre de la Suite
              </label>
              <input
                {...register("name")}
                className="w-full p-2 rounded bg-indigo-800 border border-indigo-700 text-white focus:ring-2 focus:ring-amber-400 outline-none"
              />
              {errors.name && (
                <p className="text-red-400 text-sm">{errors.name.message}</p>
              )}
            </div>

            {/* Input Categoría */}
            <div className="space-y-1">
              <label className="text-sm font-bold text-indigo-200">
                Categoría
              </label>
              <input
                {...register("category")}
                className="w-full p-2 rounded bg-indigo-800 border border-indigo-700 text-white focus:ring-2 focus:ring-amber-400 outline-none"
              />
              {errors.category && (
                <p className="text-red-400 text-sm">
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Input Precio */}
            <div className="space-y-1">
              <label className="text-sm font-bold text-indigo-200">
                Precio / Noche ($)
              </label>
              <input
                type="number"
                {...register("price")}
                className="w-full p-2 rounded bg-indigo-800 border border-indigo-700 text-white focus:ring-2 focus:ring-amber-400 outline-none"
              />
              {errors.price && (
                <p className="text-red-400 text-sm">{errors.price.message}</p>
              )}
            </div>

            {/* Input Amenidades */}
            <div className="space-y-1">
              <label className="text-sm font-bold text-indigo-200">
                Amenidades (Separadas por coma)
              </label>
              <input
                {...register("amenities")}
                placeholder="Ej: Toallas, Jabón, Vista al mar"
                className="w-full p-2 rounded bg-indigo-800 border border-indigo-700 text-white focus:ring-2 focus:ring-amber-400 outline-none"
              />
              {errors.amenities && (
                <p className="text-red-400 text-sm">
                  {errors.amenities.message}
                </p>
              )}
            </div>

            {/* Input Descripción */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-bold text-indigo-200">
                Descripción Detallada
              </label>
              <textarea
                {...register("description")}
                rows={3}
                className="w-full p-2 rounded bg-indigo-800 border border-indigo-700 text-white focus:ring-2 focus:ring-amber-400 outline-none"
              />
              {errors.description && (
                <p className="text-red-400 text-sm">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Botones */}
            <div className="md:col-span-2 flex gap-4 pt-4 border-t border-indigo-800">
              <button
                type="submit"
                className="bg-amber-500 text-indigo-950 px-8 py-3 rounded font-black hover:bg-amber-400 transition uppercase text-sm shadow-md"
              >
                {idEditando ? "Guardar Cambios" : "Crear Suite"}
              </button>

              {idEditando && (
                <button
                  type="button"
                  onClick={cancelarEdicion}
                  className="bg-transparent text-indigo-200 px-6 py-3 rounded font-bold hover:bg-indigo-800 border border-indigo-600 transition"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
