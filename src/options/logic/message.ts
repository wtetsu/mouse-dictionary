/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import Swal, { type SweetAlertIcon } from "sweetalert2";
import * as res from "./resource";

const Toast = Swal.mixin({
  toast: true,
  position: "bottom-end",
  width: "28em",
  showConfirmButton: false,
  showCloseButton: true,
  timer: 4000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

const notify = (icon: SweetAlertIcon, title: string, text?: string): void => {
  Toast.fire({ icon, title, text });
};

export const info = (text: string, description?: string): void => notify("info", text, description);

export const success = (text: string, description?: string): void => notify("success", text, description);

export const warn = (text: string, description?: string): void => notify("warning", text, description);

export const error = (text: string, description?: string): void => notify("error", text, description);

// Resolves to true on OK, false on Cancel
export const confirm = async (text: string, kind: "info" | "warning" = "info"): Promise<boolean> => {
  const result = await Swal.fire({
    icon: kind,
    text,
    showCancelButton: true,
    confirmButtonText: res.get("ok"),
    cancelButtonText: res.get("cancel"),
    allowOutsideClick: false,
  });
  return result.isConfirmed;
};
