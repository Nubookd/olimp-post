import React, { FC } from "react";
import styles from "./OrdersPagination.module.scss";
import Button from "@/components/ui/Button";

interface Props {
  children?: React.ReactNode;
  handlePaginationNext: () => void;
  handlePaginationPrev: () => void;
  page: number;
  totalPage: number;
  loading: boolean;
}

const OrdersPagination: FC<Props> = ({
  handlePaginationNext,
  handlePaginationPrev,
  page,
  totalPage,
  loading,
}) => {
  return (
    <div className={styles.pagination}>
      <Button
        variant="primary"
        onClick={handlePaginationPrev}
        disabled={page <= 1 || loading}
      >
        <svg
          width="42"
          height="33"
          viewBox="0 0 42 33"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17.2963 32L1 16.5M1 16.5H41M1 16.5L17.2963 1"
            stroke="#373737"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Button>
      <span>{totalPage > 0 ? `${page} / ${totalPage}` : 0}</span>
      <Button
        variant="primary"
        onClick={handlePaginationNext}
        disabled={page >= totalPage || loading}
      >
        <svg
          width="42"
          height="33"
          viewBox="0 0 42 33"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M24.7037 32L41 16.5M41 16.5H1M41 16.5L24.7037 1"
            stroke="#373737"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Button>
    </div>
  );
};

export default OrdersPagination;
