/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import immer from "immer";
import debounce from "lodash/debounce";
import { MouseDictionarySettings } from "../types";
import dom from "../../lib/dom";
import storage from "../../lib/storage";
import Generator from "../../main/generator";
import view from "../../main/view";
import entry from "../../main/entry";

type PreviewWindow = { dialog: HTMLElement; content: HTMLElement };

export class Preview {
  element: HTMLElement;
  update: (settings: MouseDictionarySettings, text: string, refresh: boolean) => void;
  previewWindow: PreviewWindow;
  generator: Generator;

  constructor(settings: MouseDictionarySettings) {
    this.update = debounce(this.updateBody.bind(this), 64, { leading: true });
    this.generator = new Generator(settings);

    this.previewWindow = this.createWindow(settings);

    this.element = dom.create('<div style="position:absolute;top:10;left:0;"></div>') as HTMLElement;
    this.element.appendChild(this.previewWindow.dialog);
    this.element.hidden = true;

    document.body.appendChild(this.element);
  }

  updateBody(settings: MouseDictionarySettings, text: string, refresh: boolean): void {
    this.updateWindow(settings, refresh);
    this.updateText(text, settings.lookupWithCapitalized);
    dom.applyStyles(this.previewWindow.dialog, {
      width: `${settings.width}px`,
      height: `${settings.height}px`,
      zIndex: 9999,
    });
  }

  async updateText(trialText: string, lookupWithCapitalized: boolean): Promise<void> {
    const { entries, lang } = entry.build(trialText, lookupWithCapitalized, false);

    console.time("update");

    const descriptions = await storage.local.get(entries);
    const { html } = this.generator.generate(entries, descriptions, lang === "en");

    if (this.previewWindow) {
      const newDom = dom.create(html);
      this.previewWindow.content.innerHTML = "";
      this.previewWindow.content.appendChild(newDom);
    }

    console.timeEnd("update");
  }

  createWindow(settings: MouseDictionarySettings): PreviewWindow {
    const tmpSettings = immer(settings, (d) => {
      d.normalDialogStyles = null;
      d.hiddenDialogStyles = null;
      d.movingDialogStyles = null;
    });
    const trialWindow = view.create(tmpSettings) as PreviewWindow;
    dom.applyStyles(trialWindow.dialog, {
      cursor: "zoom-out",
      top: "30px",
      left: "5px",
    });

    trialWindow.dialog.addEventListener("click", () => {
      dom.applyStyles(trialWindow.dialog, {
        width: "100px",
        height: "100px",
      });
    });
    return trialWindow;
  }

  updateWindow(settings: MouseDictionarySettings, refresh: boolean): void {
    try {
      const newGenerator = new Generator(settings);
      if (newGenerator) {
        this.generator = newGenerator;
      }
    } catch {
      // Creating a Generator instance fails when settings is incorrect
    }

    let orgPreviewWindow = null;
    if (refresh) {
      orgPreviewWindow = this.previewWindow;
      this.previewWindow = null;
    }
    if (!this.previewWindow) {
      try {
        this.previewWindow = this.createWindow(settings);
        this.element.appendChild(this.previewWindow.dialog);
      } catch (e) {
        console.error(e);
      }
    }
    if (orgPreviewWindow?.dialog) {
      this.element.removeChild(orgPreviewWindow.dialog);
    }
  }

  setVisible(visible: boolean): void {
    this.element.hidden = !visible;
  }
}
