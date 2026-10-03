/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import dom from "../lib/dom";
import template from "../lib/template";
import type { DialogStyles, ParsedSettings } from "../types";

export type View = { dialog: HTMLElement; content: HTMLElement };

type ViewSettings = Pick<
  ParsedSettings,
  "dialogTemplate" | "contentWrapperTemplate" | "backgroundColor" | "width" | "height"
> & { normalDialogStyles?: DialogStyles | null };

const createDialogElement = (settings: ViewSettings): HTMLElement => {
  const html = template.render(settings.dialogTemplate, {
    backgroundColor: settings.backgroundColor,
    width: settings.width,
    height: settings.height,
    scroll: "scroll", // For backward compatibility
  });
  const dialog = dom.create(html);
  dom.applyStyles(dialog, settings.normalDialogStyles);
  return dialog;
};

const create = (settings: ViewSettings): View => {
  const dialog = createDialogElement(settings);
  const content = dom.create(settings.contentWrapperTemplate);
  dialog.appendChild(content);
  return { dialog, content };
};

export default { create };
