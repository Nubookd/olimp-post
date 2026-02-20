import React, { FC } from "react";
import styles from "./Button.module.scss";

interface Props extends React.ComponentPropsWithoutRef<"button"> {
  children?: React.ReactNode;
  variant: "primary" | "secondary";
  className?: string;
}

const Button: FC<Props> = ({
  children,
  variant,
  className,
  ...props
}) => {
  return (
    <button
      className={`${styles.button} ${styles[`${variant}--button`]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
