import { useState, useEffect, useCallback } from "react";
import type { Room } from "../schemas/roomSchema";

const API_URL = "https://gh-budapest-rooms.vercel.app/api/rooms";

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarRooms = useCallback(async () => {
    try {
      setCargando(true);
      const res = await fetch(API_URL);
      const data = await res.json();
      setRooms(data);
    } finally {
      setCargando(false);
    }
  }, []);

  const agregarRoom = async (roomData: Omit<Room, "_id">) => {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(roomData),
    });
    await cargarRooms();
  };

  const editarRoom = async (id: string, roomData: Omit<Room, "_id">) => {
    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(roomData),
    });
    await cargarRooms();
  };

  const eliminarRoom = async (id: string) => {
    if (!window.confirm("¿Confirmas eliminar esta suite, Monsieur?")) return;
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    await cargarRooms();
  };

  useEffect(() => {
    cargarRooms();
  }, [cargarRooms]);

  return { rooms, cargando, agregarRoom, editarRoom, eliminarRoom };
}
