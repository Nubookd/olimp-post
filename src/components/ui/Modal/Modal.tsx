"use client";

import React, { FC, useEffect, useRef } from "react";
import styles from "./Modal.module.scss";
import { useRouter } from "next/navigation";

interface Props {
  children?: React.ReactNode;
  type: "dialog" | "action";
  closeUrl?: string;
  onClose?: () => void;
}

const Modal: FC<Props> = ({ children, type, closeUrl, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleClose = () => {
    if (type === "action" && closeUrl) {
      router.push(closeUrl);
    } else if (type === "action") {
      router.back();
    } else if (onClose) {
      onClose();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className={styles.overlay} onClick={handleClose} />
      <div ref={modalRef} className={styles.modal}>
        <svg
          className={styles["modal--close"]}
          onClick={handleClose}
          width="29"
          height="29"
          viewBox="0 0 29 29"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.07227 7.07121L21.2144 21.2133"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M21.2129 7.07121L7.07076 21.2133"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        {children}
      </div>
    </>
  );
};

export default Modal;
