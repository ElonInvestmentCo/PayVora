import React from "react";
import { Modal, type ModalProps, Platform } from "react-native";
import { FocusScope } from "@tamagui/focus-scope";

interface FocusedModalProps extends ModalProps {
  children: React.ReactNode;
  loop?: boolean;
}

export function FocusedModal({
  children,
  loop = true,
  ...modalProps
}: FocusedModalProps) {
  if (Platform.OS !== "web") {
    return <Modal {...modalProps}>{children}</Modal>;
  }

  return (
    <Modal {...modalProps}>
      <FocusScope trapped loop={loop} focusOnIdle={100}>
        {children}
      </FocusScope>
    </Modal>
  );
}
