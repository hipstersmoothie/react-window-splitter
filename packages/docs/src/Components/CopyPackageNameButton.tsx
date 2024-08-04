"use client";

import { CopyIcon } from "@radix-ui/react-icons";
import { Button, TooltipTrigger } from "react-aria-components";
import { Tooltip } from "./Tooltip";
import { useRef, useState } from "react";

const DEFAULT_MESSAGE = "Copy package name";
const COPY_MESSAGE = "Copied!";

export function CopyPackageNameButton() {
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const onPress = () => {
    navigator.clipboard.writeText("react-window-splitter");

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setMessage(COPY_MESSAGE);
    setOpen(true);

    timeoutRef.current = setTimeout(() => {
      setMessage(DEFAULT_MESSAGE);
      setOpen(false);
    }, 2000);
  };

  return (
    <TooltipTrigger isOpen={open} onOpenChange={setOpen}>
      <Button
        onPress={onPress}
        className={({ isFocusVisible }) => {
          return `
            absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-graya-ui backdrop-blur rounded
            opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity
            ${isFocusVisible ? "" : "focus:outline-none"}
          `;
        }}
      >
        <CopyIcon />
      </Button>
      <Tooltip>{message}</Tooltip>
    </TooltipTrigger>
  );
}
