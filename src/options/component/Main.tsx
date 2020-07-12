/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React from "react";
import ContentEditable from "react-contenteditable";
import swal from "sweetalert";
import debounce from "lodash/debounce";
import immer from "immer";
import { LoadDictionary } from "./LoadDictionary";
import { BasicSettings } from "./BasicSettings";
import { AdvancedSettings, AdvancedSettingsChangeReplaceRuleEvent } from "./AdvancedSettings";
import { PersistenceSettings } from "./PersistenceSettings";
import { JsonEditor } from "./JsonEditor";
import * as res from "../logic/resource";
import * as dict from "../logic/dict";
import * as data from "../logic/data";
import dom from "../../lib/dom";
import storage from "../../lib/storage";
import Generator from "../../main/generator";
import view from "../../main/view";
import config from "../../main/config";
import entry from "../../main/entry";
import env from "../../settings/env";
import defaultSettings from "../../settings/defaultsettings";
import { MouseDictionarySettings } from "../types";

type MainState = {
  encoding: string;
  format: string;
  dictDataUsage: string;
  busy: boolean;
  progress: string;
  settings: MouseDictionarySettings;
  trialText: string;
  basicSettingsOpened: boolean;
  advancedSettingsOpened: boolean;
  jsonEditorOpened: boolean;
  lang: string;
  initialized: boolean;
};

type PreviewWindows = { dialog: HTMLElement; content: HTMLElement };

export class Main extends React.Component<Record<string, unknown>, MainState> {
  contentEditable: { current: any };
  updatePreviewWindowWithDebounce: () => void;
  previewWindow: PreviewWindows;
  needRecreatePreviewWindow: boolean;
  generator: Generator;

  constructor(props: Record<string, unknown>) {
    super(props);
    this.contentEditable = React.createRef();

    const initialLang = decideInitialLanguage([...navigator.languages]);
    res.setLang(initialLang);
    this.state = {
      encoding: "Shift-JIS",
      format: "EIJIRO",
      dictDataUsage: null,
      busy: false,
      progress: "",
      settings: null,
      trialText: "rained cats and dogs",
      basicSettingsOpened: false,
      advancedSettingsOpened: false,
      jsonEditorOpened: false,
      lang: initialLang,
      initialized: false,
    };

    this.updatePreviewWindowWithDebounce = debounce(
      () => {
        this.updatePreviewWindow(this.state.settings);
      },
      64,
      { leading: true }
    );

    this.previewWindow = null;
    this.needRecreatePreviewWindow = false;
  }

  render(): JSX.Element {
    const state = this.state;

    return (
      <>
        <div style={{ textAlign: "center", marginBottom: "10px" }}>
          <a
            href={`https://mouse-dictionary.netlify.app/${this.state.lang}/`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "underline", fontSize: "small" }}
          >
            <img src="logo.png" width="250" />
          </a>
        </div>

        <div>
          <div onClick={this.switchLanguage} style={{ position: "absolute", top: 0, left: -30, cursor: "pointer" }}>
            {this.state.lang}
          </div>
          <LoadDictionary
            encoding={state.encoding}
            format={state.format}
            dictDataUsage={state.dictDataUsage}
            busy={state.busy}
            progress={state.progress}
            onUpdate={(statePatch) => this.updateState(statePatch)}
            trigger={(type) => {
              switch (type) {
                case "load":
                  this.loadDictionaryData();
                  break;
                case "clear":
                  this.clearDictionaryData();
                  break;
              }
            }}
          />

          <img
            src="loading.gif"
            width="32"
            height="32"
            style={{ verticalAlign: "middle", display: this.state.initialized ? "none" : "inline" }}
          />

          {!this.state.busy && !env.disableUserSettings && this.state.initialized && (
            <>
              <hr style={{ marginTop: 15 }} />
              <a
                href="https://github.com/wtetsu/mouse-dictionary/wiki/Download-dictionary-data"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "underline", fontSize: "small" }}
              >
                {res.get("downloadDictData")}
              </a>

              <div style={{ marginTop: 30 }}>
                <img src="settings1.png" style={{ verticalAlign: "bottom" }} />
                <a style={{ cursor: "pointer" }} onClick={() => this.toggleBasicSettings()}>
                  {this.state.basicSettingsOpened ? res.get("closeBasicSettings") : res.get("openBasicSettings")}
                </a>
              </div>
            </>
          )}

          {(this.state.basicSettingsOpened || this.state.advancedSettingsOpened) && (
            <>
              <span>{res.get("trialText")}: </span>
              <ContentEditable
                innerRef={this.contentEditable}
                html={this.state.trialText}
                disabled={false}
                onChange={(e) => this.updateState({ trialText: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                  }
                }}
                tagName="span"
              />
              <br />
              <br />
            </>
          )}

          {(this.state.basicSettingsOpened || this.state.advancedSettingsOpened) && (
            <PersistenceSettings
              trigger={(type) => {
                switch (type) {
                  case "save":
                    this.saveSettings();
                    break;
                  case "factoryReset":
                    this.doFactoryReset();
                    break;
                }
              }}
            />
          )}

          {this.state.basicSettingsOpened && (
            <BasicSettings
              onUpdate={(statePatch, settingsPatch) => this.updateState(statePatch, settingsPatch)}
              trigger={(type) => {
                switch (type) {
                  case "loadInitialDict":
                    this.doLoadInitialDict();
                    break;
                }
              }}
              busy={state.busy}
              settings={state.settings}
              trialText={state.trialText}
            />
          )}

          <br />
          {this.state.basicSettingsOpened && (
            <div>
              <img src="settings1.png" style={{ verticalAlign: "bottom" }} />
              <a style={{ cursor: "pointer" }} onClick={() => this.toggleAdvancedSettings()}>
                {this.state.advancedSettingsOpened ? res.get("closeAdvancedSettings") : res.get("openAdvancedSettings")}
              </a>
            </div>
          )}

          <br />

          {this.state.advancedSettingsOpened && (
            <>
              <button
                type="button"
                className="button-small button-black"
                style={{ marginRight: 5, cursor: "pointer" }}
                onClick={() => {
                  const jsonEditorOpened = !this.state.jsonEditorOpened;
                  this.setState({ jsonEditorOpened });
                }}
              >
                {res.get("openJsonEditor")}
              </button>

              {this.state.jsonEditorOpened && (
                <div
                  style={{
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 10000,
                    backgroundColor: "#ffffff",
                    position: "fixed",
                    opacity: 0.99,
                  }}
                >
                  <JsonEditor
                    initialValue={this.state.settings}
                    onUpdate={(e) => {
                      this.removePreviewWindow();
                      const newState = immer(this.state, (d) => {
                        Object.assign(d, e.payload.state);
                        if (e.payload.settings) {
                          d.settings = e.payload.settings;
                        }
                      });
                      this.updateState(newState);
                    }}
                  />
                </div>
              )}

              <AdvancedSettings
                onUpdate={(statePatch, settingsPatch) => this.updateState(statePatch, settingsPatch)}
                changeReplaceRule={(e) => this.updateReplaceRule(e)}
                settings={state.settings}
              />
            </>
          )}
        </div>
      </>
    );
  }

  async componentDidMount(): Promise<void> {
    const isLoaded = await config.isDataReady();
    if (!isLoaded) {
      this.confirmAndLoadInitialDict("confirmLoadInitialDict");
    }
    await this.initializeUserSettings();
    await this.updateDictDataUsage();
    this.setState({ initialized: true });
  }

  componentDidUpdate(): void {
    this.updatePreviewWindowWithDebounce();
  }

  async initializeUserSettings(): Promise<void> {
    const settings = data.preProcessSettings(await config.loadRawSettings());
    this.setState({ settings });
    this.generator = new Generator(settings);
  }

  async updateDictDataUsage(): Promise<void> {
    if (env.disableUserSettings) {
      return;
    }
    const byteSize = await storage.local.getBytesInUse();
    const kb = isFinite(byteSize) ? Math.floor(byteSize / 1024).toLocaleString() : "";
    this.setState({
      dictDataUsage: kb,
    });
  }

  async confirmAndLoadInitialDict(messageId: string): Promise<void> {
    const willLoad = await swal({
      text: res.get(messageId),
      icon: "info",
      buttons: [true, true],
      closeOnClickOutside: false,
    });
    if (!willLoad) {
      return;
    }

    this.loadInitialDict();
  }

  async loadInitialDict(): Promise<void> {
    let finalWordCount: number;
    try {
      this.setState({ busy: true, basicSettingsOpened: false, advancedSettingsOpened: false });
      finalWordCount = await dict.registerDefaultDict((wordCount, progress) => {
        const message = res.get("progressRegister", wordCount, progress);
        this.setState({ progress: message });
      });
      this.updateDictDataUsage();
    } finally {
      this.setState({ busy: false, progress: "" });
    }

    await config.setDataReady(true);

    await swal({
      text: res.get("finishRegister", finalWordCount),
      icon: "success",
    });
  }

  updateState(statePatch: Record<string, any>, settingsPatch: MouseDictionarySettings = null): void {
    const newState = immer(this.state, (d) => {
      Object.assign(d, statePatch);
      if (settingsPatch) {
        Object.assign(d.settings, settingsPatch);
      }
    });
    this.setState(newState);
    if (statePatch?.trialText) {
      this.updateTrialText(statePatch.trialText, newState.settings.lookupWithCapitalized);
    }
    if (!settingsPatch) {
      return;
    }
    for (const name of Object.keys(settingsPatch)) {
      if (dialogFields.has(name)) {
        this.needRecreatePreviewWindow = true;
        break;
      }
    }
  }

  async loadDictionaryData(): Promise<void> {
    const input = document.getElementById("dictdata") as HTMLInputElement;
    const file = input.files[0];

    const encoding = this.state.encoding;
    if (!file) {
      swal({
        title: res.get("selectDictFile"),
        icon: "warning",
      });
      return;
    }
    let willContinue = true;
    if (encoding === "Shift-JIS") {
      if (!(await fileMayBeShiftJis(file))) {
        willContinue = await swal({
          title: res.get("fileMayNotBeShiftJis"),
          icon: "warning",
          buttons: [true, true],
        });
      }
    }
    if (willContinue) {
      this.loadDictionaryFile(file);
    }
  }

  async loadDictionaryFile(file: File): Promise<void> {
    const encoding = this.state.encoding;
    const format = this.state.format;
    const event = (ev: any) => {
      switch (ev.name) {
        case "reading": {
          const loaded = ev.loaded.toLocaleString();
          const total = ev.total.toLocaleString();
          this.setState({ progress: `${loaded} / ${total} Byte` });
          break;
        }
        case "loading": {
          this.setState({ progress: res.get("progressRegister", ev.count, ev.word.head) });
          break;
        }
      }
    };
    try {
      this.setState({ busy: true, basicSettingsOpened: false, advancedSettingsOpened: false });
      const wordCount = await dict.load({ file, encoding, format, event });
      swal({
        text: res.get("finishRegister", wordCount),
        icon: "success",
      });
      config.setDataReady(true);
      this.updateDictDataUsage();
    } catch (e) {
      swal({
        text: e.toString(),
        icon: "error",
      });
    } finally {
      this.setState({ busy: false, progress: "" });
    }
  }

  /**
   * Not supported for the moment due to instability of chrome.storage.local.clear()
   */
  async clearDictionaryData(): Promise<void> {
    // const willDelete = await swal({
    //   text: res.get("clearAllDictData"),
    //   icon: "warning",
    //   buttons: true,
    //   dangerMode: true
    // });
    // if (!willDelete) {
    //   return;
    // }
    // this.setState({ busy: true });
    // await storage.local.clear();
    // swal({
    //   text: res.get("finishedClear"),
    //   icon: "success"
    // });
    // this.setState({ busy: false });
    // this.updateDictDataUsage();
  }

  doLoadInitialDict(): void {
    this.confirmAndLoadInitialDict("confirmReloadInitialDict");
  }

  updateReplaceRule(action: AdvancedSettingsChangeReplaceRuleEvent): void {
    switch (action.type) {
      case "add":
        this.addReplaceRule();
        break;
      case "change":
        this.changeReplaceRule(action.payload.name, action.payload.value);
        break;
      case "move":
        this.moveReplaceRule(action.payload.index, action.payload.offset);
        break;
      case "delete":
        this.deleteReplaceRule(action.payload.index);
        break;
    }
  }

  addReplaceRule(): void {
    const newSettings = immer(this.state.settings, (d) => {
      const newKey = new Date().getTime().toString();
      d.replaceRules.push({ key: newKey, search: "", replace: "" });
    });
    this.setState({ settings: newSettings });
  }

  changeReplaceRule(name: string, value: string): void {
    // name: replaceRule.search.0
    const [, type, indexStr] = name.split(".");
    if (!["search", "replace"].includes(type)) {
      return;
    }
    const index = parseInt(indexStr, 10);
    if (index < 0 || index >= this.state.settings.replaceRules.length) {
      return;
    }
    const newSettings = immer(this.state.settings, (d) => {
      d.replaceRules[index][type] = value;
    });
    this.setState({ settings: newSettings });
  }

  moveReplaceRule(index: number, offset: number): void {
    const index2 = index + offset;
    if (Math.min(index, index2) < 0 || Math.max(index, index2) >= this.state.settings.replaceRules.length) {
      return;
    }
    const newSettings = immer(this.state.settings, (d) => {
      const rules = d.replaceRules;
      [rules[index], rules[index2]] = [rules[index2], rules[index]];
    });
    this.setState({ settings: newSettings });
  }

  deleteReplaceRule(index: number): void {
    const newSettings = immer(this.state.settings, (d) => {
      d.replaceRules.splice(index, 1);
    });
    this.setState({ settings: newSettings });
  }

  updatePreviewWindow(settings: MouseDictionarySettings): void {
    if (!this.state.basicSettingsOpened) {
      return;
    }
    try {
      // Creating a Generator instance fails when settings is wrong
      const newGenerator = new Generator(settings);
      if (newGenerator) {
        this.generator = newGenerator;
      }
    } catch {
      // NOP
    }
    let orgPreviewWindow = null;
    if (this.needRecreatePreviewWindow) {
      orgPreviewWindow = this.previewWindow;
      this.previewWindow = null;
      this.needRecreatePreviewWindow = false;
    }
    if (!this.previewWindow) {
      try {
        this.previewWindow = this.createPreviewWindow(settings);
        document.body.appendChild(this.previewWindow.dialog);
      } catch (e) {
        console.error(e);
      }
    }
    if (this.previewWindow) {
      this.updateTrialText(this.state.trialText, settings.lookupWithCapitalized);
      dom.applyStyles(this.previewWindow.dialog, {
        width: `${settings.width}px`,
        height: `${settings.height}px`,
        zIndex: 9999,
      });
    }
    if (orgPreviewWindow?.dialog) {
      document.body.removeChild(orgPreviewWindow.dialog);
    }
  }

  createPreviewWindow(settings: MouseDictionarySettings): PreviewWindows {
    const tmpSettings = immer(settings, (d) => {
      d.normalDialogStyles = null;
      d.hiddenDialogStyles = null;
      d.movingDialogStyles = null;
    });
    const trialWindow: PreviewWindows = view.create(tmpSettings);
    dom.applyStyles(trialWindow.dialog, {
      cursor: "zoom-out",
      top: "30px",
    });

    trialWindow.dialog.addEventListener("click", () => {
      dom.applyStyles(trialWindow.dialog, {
        width: "100px",
        height: "100px",
      });
    });
    return trialWindow;
  }

  removePreviewWindow(): void {
    if (this.previewWindow?.dialog) {
      document.body.removeChild(this.previewWindow.dialog);
      this.previewWindow = null;
    }
  }

  async updateTrialText(trialText: string, lookupWithCapitalized: boolean): Promise<void> {
    if (!this.previewWindow) {
      return;
    }
    const { entries, lang } = entry.build(trialText, lookupWithCapitalized, false);

    console.time("update");

    const descriptions = await storage.local.get(entries);
    const { html } = await this.generator.generate(entries, descriptions, lang === "en");

    if (this.previewWindow) {
      const newDom = dom.create(html);
      this.previewWindow.content.innerHTML = "";
      this.previewWindow.content.appendChild(newDom);
    }

    console.timeEnd("update");
  }

  async saveSettings(): Promise<void> {
    const settings = data.postProcessSettings(this.state.settings);
    try {
      await config.saveSettings(settings);
      swal({
        text: res.get("finishSaving"),
        icon: "info",
      });
    } catch (e) {
      swal({
        text: e.message,
        icon: "error",
      });
    }
  }

  doFactoryReset(): void {
    this.needRecreatePreviewWindow = true;
    const newSettings = data.preProcessSettings(getDefaultSettings());
    this.setState({ settings: newSettings });
  }

  toggleBasicSettings(): void {
    this.removePreviewWindow();
    this.setState({
      basicSettingsOpened: !this.state.basicSettingsOpened,
      advancedSettingsOpened: false,
    });
  }

  toggleAdvancedSettings(): void {
    this.setState({
      advancedSettingsOpened: !this.state.advancedSettingsOpened,
    });
  }

  switchLanguage(): void {
    const newLang = this.state.lang === "ja" ? "en" : "ja";
    res.setLang(newLang);
    this.setState({
      lang: newLang,
    });
  }
}

const defaultSettingsJson = JSON.stringify(defaultSettings);

const getDefaultSettings = () => {
  return JSON.parse(defaultSettingsJson);
};

const dialogFields = new Set(["scroll", "backgroundColor", "dialogTemplate", "contentWrapperTemplate"]);

const decideInitialLanguage = (languages: string[]) => {
  if (!languages) {
    return "en";
  }
  const validLanguages = ["en", "ja"];
  let result = "en";
  for (let i = 0; i < languages.length; i++) {
    const lang = languages[i].toLowerCase().split("-")[0];
    if (validLanguages.includes(lang)) {
      result = lang;
      break;
    }
  }
  return result;
};

const fileMayBeShiftJis = async (file: File) => {
  return new Promise((done, fail) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target.result as ArrayBuffer;
        const length = Math.min(512, buffer.byteLength);
        const bytes = new Uint8Array(buffer, 0, length);
        const mayBeSjis = data.byteArrayMayBeShiftJis(bytes);
        done(mayBeSjis);
      } catch {
        fail();
      }
    };
    try {
      reader.readAsArrayBuffer(file);
    } catch {
      fail();
    }
  });
};
