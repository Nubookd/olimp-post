export type OrderStatus =
  | "PENDING"
  | "AGREED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export const statuses = [
  {
    value: "PENDING" as OrderStatus,
    label: "На рассмотрение",
    display: "Ожидает рассмотрения",
  },
  {
    value: "AGREED" as OrderStatus,
    label: "Согласованно",
    display: "Согласованно",
  },
  { value: "SHIPPED" as OrderStatus, label: "Отгружено", display: "В пути" },
  {
    value: "DELIVERED" as OrderStatus,
    label: "Доставлено",
    display: "Доставлено",
  },
  {
    value: "CANCELLED" as OrderStatus,
    label: "Отменено",
    display: "Отменено",
  },
];

export const statusesMap = Object.fromEntries(
  statuses.map((s) => [s.value, s.display]),
);
