import React, { FC } from "react";
import styles from "./OperatorProfile.module.scss";

interface Props {
  children?: React.ReactNode;
}

const OperatorProfile: FC<Props> = ({ children }) => {
  return (
    <div>
      {children}
    </div>
  )
};

export default OperatorProfile;

