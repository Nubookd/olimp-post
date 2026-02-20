"use client";
import Loader from "@/components/ui/Loader";
import styles from "./Catalog.module.scss";
import { useState, useEffect, memo, FC } from "react";
import Button from "@/components/ui/Button";
import { IOrderItem } from "@/types";

interface Props {
  addItem: (product: IOrderItem) => void;
}
const CatalogComponent: FC<Props> = ({ addItem }) => {
  const [catalog, setCatalog] = useState<IOrderItem[]>([]);

  useEffect(() => {
    const getCatalog = async () => {
      try {
        const res = await fetch("/api/catalog");
        const data = await res.json();
        setCatalog(data);
      } catch (error) {
        console.error("Ошибка загрузки каталога:", error);
      }
    };
    getCatalog();
  }, []);
  return (
    <>
      {catalog.length === 0 ? (
        <Loader />
      ) : (
        <table className={styles.catalog}>
          <thead>
            <tr>
              <td scope="col">Наименование</td>
              <td scope="col">Класс</td>
              <td scope="col">Марка</td>
              <td scope="col">Цена</td>
            </tr>
          </thead>
          <tbody>
            {catalog.map((item) => (
              <tr key={item.id}>
                <th scope="row">{item.name}</th>
                <td>{item.class}</td>
                <td>{item.stamp}</td>
                <td>{item.price} ₽</td>
                <td>
                  <Button variant="primary" onClick={() => addItem(item)}>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6 1V11"
                        stroke="black"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M11 6H1"
                        stroke="black"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
};

const Catalog = memo(CatalogComponent);
export default Catalog;
