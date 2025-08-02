/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */
import { produce } from "immer";
import { useCallback, useEffect, useRef } from "react";
import { dom, entryDefault, Generator, storage, view } from "../extern";
import { debounce } from "../logic";
import type { MouseDictionarySettings } from "../types";

type PreviewWindow = { dialog: HTMLElement; content: HTMLElement };

export const usePreview = () => {
  const refPreview = useRef<Preview>(null);

  const updatePreview = useCallback((settings: MouseDictionarySettings, previewText: string, refresh: boolean) => {
    if (!refPreview.current) {
      refPreview.current = new Preview(settings);
    }
    refPreview.current?.update(settings, previewText, refresh);
  }, []);

  const setPreviewVisible = useCallback((visible: boolean) => {
    refPreview.current?.setVisible(visible);
  }, []);

  useEffect(() => {
    // cleanup
    return () => {
      refPreview.current?.remove();
    };
  }, []);

  return { updatePreview, setPreviewVisible };
};

class Preview {
  element: HTMLElement;
  update: (settings: MouseDictionarySettings, text: string, refresh: boolean) => void;
  previewWindow: PreviewWindow | undefined;
  generator: Generator;
  buildEntries: (
    text: string,
    withCapitalized: boolean,
    includeOrgText: boolean,
  ) => { entries: string[]; lang: string };

  constructor(settings: MouseDictionarySettings) {
    this.update = debounce(this.updateBody.bind(this), 64);
    this.element = dom.create('<div style="position:absolute;top:10;left:0;z-index:-1;"></div>') as HTMLElement;
    this.element.hidden = true;
    document.body.appendChild(this.element);
    this.refreshGenerator(settings);
    this.refreshElement(settings);
    this.buildEntries = entryDefault();
  }

  updateBody(settings: MouseDictionarySettings, text: string, refresh: boolean): void {
    if (refresh) {
      this.refreshElement(settings);
    }
    this.refreshGenerator(settings);
    this.updateText(text, settings.lookupWithCapitalized);
    const dialog = this.previewWindow?.dialog;
    if (!dialog) {
      return;
    }
    dom.applyStyles(dialog, {
      width: `${settings.width}px`,
      height: `${settings.height}px`,
    });
  }

  async updateText(previewText: string, lookupWithCapitalized: boolean): Promise<void> {
    const { entries, lang } = this.buildEntries(previewText, lookupWithCapitalized, false);

    const descriptions = await storage.local.get(entries);
    const { html } = this.generator.generate(entries, descriptions, lang === "en");

    if (this.previewWindow) {
      const newDom = dom.create(html);
      this.previewWindow.content.innerHTML = "";
      this.previewWindow.content.appendChild(newDom);
    }
  }

  createWindow(settings: MouseDictionarySettings): PreviewWindow {
    const tmpSettings = produce(settings as Partial<MouseDictionarySettings>, (d) => {
      d.normalDialogStyles = undefined;
      d.hiddenDialogStyles = undefined;
      d.movingDialogStyles = undefined;
    });
    return view.create(tmpSettings) as PreviewWindow;
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
    this.previewWindow = undefined;

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

  remove(): void {
    this.element.remove();
  }
}
