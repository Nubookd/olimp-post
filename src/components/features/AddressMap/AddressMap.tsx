"use client";

import React, { FC, useState } from "react";
import styles from "./AddressMap.module.scss";
import { Map, Placemark, YMaps } from "@pbe/react-yandex-maps";
import { ICheque } from "@/types";
import type { MapEvent } from "yandex-maps";
interface Props {
  children?: React.ReactNode;
  setOrder: React.Dispatch<React.SetStateAction<ICheque>>;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
  setIsGeocoding: React.Dispatch<React.SetStateAction<boolean>>;
}

interface GeocodeResponse {
  address: {
    formatted: string;
  };
}

const AddressMap: FC<Props> = ({ setOrder, setAddress, setIsGeocoding }) => {
  const [coords, setCoords] = useState([55.751574, 37.573856]);
  const [error, setError] = useState<string | null>(null);

  const getAddressFromCoords = async (
    lat: number,
    lon: number,
  ): Promise<string> => {
    try {
      const res = await fetch(`/api/geocode?lat=${lat}&lon=${lon}`);
      
      const data: GeocodeResponse = await res.json();
      return data.address.formatted;
    } catch (error) {
      return `Координаты: ${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    }
  };
  const handleMapClick = async (e: MapEvent) => {
    const newCoords = e.get("coords");
    setCoords(newCoords);
    setError(null);

    setIsGeocoding(true);
    try {
      const address = await getAddressFromCoords(newCoords[0], newCoords[1]);

      setAddress(address);

      setOrder((prev) => ({
        ...prev,
        deliveryAddress: address,
        deliveryLat: newCoords[0],
        deliveryLon: newCoords[1],
      }));
    } catch (error) {
      console.error("Ошибка при получении адреса:", error);
      setAddress("Не удалось определить адрес");
      setError("Ошибка определения адреса. Попробуйте еще раз.");
    } finally {
      setIsGeocoding(false);
    }
  };

  return (
    <>
      <YMaps>
        <Map
          state={{ center: coords, zoom: 12 }}
          width="100%"
          height="400px"
          onClick={handleMapClick}
        >
          <Placemark geometry={coords} />
        </Map>
      </YMaps>
    </>
  );
};

export default AddressMap;
