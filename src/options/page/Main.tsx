/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React from "react";
import swal from "sweetalert";
import immer from "immer";
import {
  AdvancedSettings,
  BasicSettings,
  DataUsage,
  EditableSpan,
  JsonEditor,
  LoadDictionary,
  OperationPanel,
} from "../component";
import { Preview } from "../logic/preview";
import * as res from "../logic/resource";
import * as dict from "../logic/dict";
import * as data from "../logic/data";
import storage from "../../lib/storage";
import config from "../../main/config";
import env from "../../settings/env";
import defaultSettings from "../../settings/defaultsettings";
import { MouseDictionarySettings } from "../types";

type MainProps = Record<string, unknown>;

type MainState = {
  dictDataUsage?: number;
  busy: boolean;
  progress: string;
  settings: MouseDictionarySettings;
  trialText: string;
  openedPanelLevel: 0 | 1 | 2;
  jsonEditorOpened: boolean;
  lang: string;
  initialized: boolean;
};

const DIALOG_FIELDS = new Set(["scroll", "backgroundColor", "dialogTemplate", "contentWrapperTemplate"]);

export class Main extends React.Component<MainProps, MainState> {
  preview: Preview;

  constructor(props: MainProps) {
    super(props);

    const initialLang = decideInitialLanguage([...navigator.languages]);
    res.setLang(initialLang);
    this.state = {
      dictDataUsage: null,
      busy: false,
      progress: "",
      settings: {} as MouseDictionarySettings,
      trialText: "rained cats and dogs",
      openedPanelLevel: 0,
      jsonEditorOpened: false,
      lang: initialLang,
      initialized: false,
    };
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
          <div
            style={{ position: "absolute", top: 0, left: -30, cursor: "pointer" }}
            onClick={() => this.switchLanguage()}
          >
            {this.state.lang}
          </div>
          <LoadDictionary
            busy={state.busy}
            progress={state.progress}
            trigger={(e) => {
              switch (e.type) {
                case "load":
                  this.loadDictionaryData(e.payload.encoding, e.payload.format);
                  break;
                case "clear":
                  // Not supported for the moment due to instability of chrome.storage.local.clear()
                  break;
              }
            }}
          />

          <div style={{ fontSize: "75%" }}>
            <DataUsage byteSize={this.state.dictDataUsage}></DataUsage>
            <div>
              <span>{this.state.progress}</span>
            </div>
          </div>

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

              <div style={{ marginTop: 30, marginBottom: 30 }}>
                <img src="settings1.png" style={{ verticalAlign: "bottom" }} />
                <a style={{ cursor: "pointer" }} onClick={() => this.toggleBasicSettings()}>
                  {this.state.openedPanelLevel >= 1 ? res.get("closeBasicSettings") : res.get("openBasicSettings")}
                </a>
              </div>
            </>
          )}

          {this.state.openedPanelLevel >= 1 && (
            <div>
              <span>{res.get("trialText")}: </span>
              <EditableSpan
                value={this.state.trialText}
                onChange={(e) => this.updateState({ trialText: e.target.value })}
              ></EditableSpan>

              <br />
              <br />
            </div>
          )}

          {this.state.openedPanelLevel >= 1 && (
            <OperationPanel
              disable={this.state.busy}
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

          {this.state.openedPanelLevel >= 1 && (
            <BasicSettings
              onUpdate={(statePatch, settingsPatch) => this.updateState(statePatch, settingsPatch)}
              busy={state.busy}
              settings={state.settings}
              trialText={state.trialText}
            >
              <label>{res.get("dictionaryData")}</label>
              <button
                type="button"
                className="button-outline button-small"
                style={{ marginRight: 5, cursor: "pointer" }}
                disabled={this.state.busy}
                onClick={() => this.confirmAndLoadInitialDict("confirmReloadInitialDict")}
              >
                {res.get("loadInitialDict")}
              </button>
            </BasicSettings>
          )}

          <br />
          {this.state.openedPanelLevel >= 1 && (
            <div>
              <img src="settings1.png" style={{ verticalAlign: "bottom" }} />
              <a style={{ cursor: "pointer" }} onClick={() => this.toggleAdvancedSettings()}>
                {this.state.openedPanelLevel === 2 ? res.get("closeAdvancedSettings") : res.get("openAdvancedSettings")}
              </a>
            </div>
          )}

          <br />

          {this.state.openedPanelLevel === 2 && (
            <>
              <button
                type="button"
                className="button-small button-black"
                style={{ marginRight: 5, cursor: "pointer" }}
                onClick={() => {
                  const jsonEditorOpened = !this.state.jsonEditorOpened;
                  this.updateState({ jsonEditorOpened });
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
                      this.updateState(e.payload.state, e.payload.settings);
                    }}
                  />
                </div>
              )}

              <AdvancedSettings
                onUpdate={(statePatch, settingsPatch) => this.updateState(statePatch, settingsPatch)}
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

    const settings = data.preProcessSettings(await config.loadRawSettings());
    this.setState({ settings });

    this.preview = new Preview(settings);
    this.preview.updateText(this.state.trialText, settings.lookupWithCapitalized);

    await this.updateDictDataUsage();
    this.setState({ initialized: true });
  }

  async updateDictDataUsage(): Promise<void> {
    if (env.disableUserSettings) {
      return;
    }
    this.updateState({ dictDataUsage: null });
    const byteSize = await storage.local.getBytesInUse();
    this.updateState({ dictDataUsage: byteSize });
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
      this.updateState({ busy: true, openedPanelLevel: 0 });
      finalWordCount = await dict.registerDefaultDict((count, progress) => {
        const message = res.get("progressRegister", { count, progress });
        this.updateState({ progress: message });
      });
      this.updateDictDataUsage();
    } finally {
      this.updateState({ busy: false, progress: "" });
    }

    await config.setDataReady(true);

    await swal({
      text: res.get("finishRegister", { count: finalWordCount }),
      icon: "success",
    });
  }

  updateState(statePatch: Partial<MainState>, settingsPatch: Partial<MouseDictionarySettings> = null): void {
    const newState = immer(this.state, (d) => {
      Object.assign(d, statePatch);
      if (settingsPatch) {
        Object.assign(d.settings, settingsPatch);
      }
    });
    this.setState(newState);

    if (settingsPatch) {
      let refresh = false;
      for (const name of Object.keys(settingsPatch)) {
        if (DIALOG_FIELDS.has(name)) {
          refresh = true;
          break;
        }
      }
      this.preview.update(newState.settings, newState.trialText, refresh);
    }

    this.preview.setVisible(newState.openedPanelLevel >= 1 && !newState.jsonEditorOpened);

    if (statePatch?.trialText) {
      this.preview.updateText(statePatch.trialText, newState.settings.lookupWithCapitalized);
    }
  }

  async loadDictionaryData(encoding: string, format: string): Promise<void> {
    const input = document.getElementById("dictdata") as HTMLInputElement;
    const file = input.files[0];
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
      this.loadDictionaryFile(file, encoding, format);
    }
  }

  async loadDictionaryFile(file: File, encoding: string, format: string): Promise<void> {
    const event = (ev: any) => {
      switch (ev.name) {
        case "reading": {
          const loaded = ev.loaded.toLocaleString();
          const total = ev.total.toLocaleString();
          this.updateState({ progress: `${loaded} / ${total} Byte` });
          break;
        }
        case "loading": {
          this.updateState({ progress: res.get("progressRegister", { count: ev.count, progress: ev.word.head }) });
          break;
        }
      }
    };
    try {
      this.updateState({ busy: true, openedPanelLevel: 0 });
      const count = await dict.load({ file, encoding, format, event });
      swal({
        text: res.get("finishRegister", { count }),
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
      this.updateState({ busy: false, progress: "" });
    }
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
    this.updateState(null, data.preProcessSettings(getDefaultSettings()));
  }

  toggleBasicSettings(): void {
    this.updateState({ openedPanelLevel: this.state.openedPanelLevel === 0 ? 1 : 0 });
  }

  toggleAdvancedSettings(): void {
    this.updateState({ openedPanelLevel: this.state.openedPanelLevel === 1 ? 2 : 1 });
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
