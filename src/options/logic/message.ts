/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import swal from "sweetalert";

type Icon = "info" | "success" | "warning" | "error";
type Buttons = "ok" | "okCancel";

export const info = (text: string, buttons?: Buttons): Promise<any> => {
  return show(text, "info", buttons);
};

export const notice = (text: string, buttons?: Buttons): Promise<any> => {
  return show(text, "info", buttons, { closeOnClickOutside: false });
};

export const success = (text: string, buttons?: Buttons): Promise<any> => {
  return show(text, "success", buttons);
};

export const warn = (text: string, buttons?: Buttons): Promise<any> => {
  return show(text, "warning", buttons);
};

export const error = (text: string, buttons?: Buttons): Promise<any> => {
  return show(text, "error", buttons);
};

const show = (text: string, icon: Icon, buttons?: Buttons, extraOptions?: Record<string, unknown>): Promise<any> => {
  const options = {
    text,
    icon,
    buttons: buttons === "okCancel" ? [true, true] : null,
  };
  if (extraOptions) {
    Object.assign(options, extraOptions);
  }
  return swal(options);
};
