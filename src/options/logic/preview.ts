/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import immer from "immer";
import { debounce } from "../logic/debounce";
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
    this.update = debounce(this.updateBody.bind(this), 64);
    this.element = dom.create('<div style="position:absolute;top:10;left:0;"></div>') as HTMLElement;
    this.element.hidden = true;
    document.body.appendChild(this.element);
    this.refreshGenerator(settings);
    this.refreshElement(settings);
  }

  updateBody(settings: MouseDictionarySettings, text: string, refresh: boolean): void {
    if (refresh) {
      this.refreshElement(settings);
    }
    this.refreshGenerator(settings);
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

  refreshGenerator(settings: MouseDictionarySettings): void {
    try {
      const newGenerator = new Generator(settings);
      if (newGenerator) {
        this.generator = newGenerator;
      }
    } catch {
      // Creating a Generator instance fails when settings is incorrect
    }
  }

  refreshElement(settings: MouseDictionarySettings): void {
    const orgPreviewWindow = this.previewWindow;
    this.previewWindow = null;

    try {
      this.previewWindow = this.createWindow(settings);
      this.element.appendChild(this.previewWindow.dialog);
    } catch (e) {
      console.error(e);
    }

    if (orgPreviewWindow?.dialog) {
      this.element.removeChild(orgPreviewWindow.dialog);
    }
  }

  setVisible(visible: boolean): void {
    this.element.hidden = !visible;
  }
}
