import { useState, useEffect, useCallback } from "react";
import type { Room } from "../schemas/roomSchema";

const API_URL = "https://gh-budapest-rooms.vercel.app/api/rooms";

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [cargando, setCargando] = useState(true);

  const ensureOk = async (res: Response, accion: string) => {
    if (res.ok) return;

    let detalle = "";
    try {
      detalle = await res.text();
    } catch {
      detalle = "";
    }

    throw new Error(
      `No se pudo ${accion}. API respondió ${res.status} ${res.statusText}${
        detalle ? ` - ${detalle}` : ""
      }`,
    );
  };

  const cargarRooms = useCallback(async () => {
    try {
      setCargando(true);
      const res = await fetch(API_URL);
      await ensureOk(res, "cargar habitaciones");
      const data = await res.json();
      setRooms(data);
    } catch (error) {
      console.error(error);
      alert("Error cargando habitaciones. Revisa la consola para más detalle.");
    } finally {
      setCargando(false);
    }
  }, []);

  const agregarRoom = async (roomData: Omit<Room, "_id">) => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(roomData),
    });

    await ensureOk(res, "crear la habitación");
    await cargarRooms();
  };

  const editarRoom = async (id: string, roomData: Omit<Room, "_id">) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(roomData),
    });

    await ensureOk(res, "editar la habitación");
    await cargarRooms();
  };

  const eliminarRoom = async (id: string) => {
    if (!window.confirm("¿Confirmas eliminar esta suite, Monsieur?")) return;

    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    await ensureOk(res, "eliminar la habitación");
    await cargarRooms();
  };

  useEffect(() => {
    cargarRooms();
  }, [cargarRooms]);

  return { rooms, cargando, agregarRoom, editarRoom, eliminarRoom };
}
