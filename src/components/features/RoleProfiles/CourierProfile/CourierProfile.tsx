import React, { FC } from "react";
import styles from "./CourierProfile.module.scss";

interface Props {
  children?: React.ReactNode;
}

const CourierProfile: FC<Props> = ({ children }) => {
  return (
    <div>
      {children}
    </div>
  )
};

export default CourierProfile;

