/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React from "react";
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
import * as message from "../logic/message";
import storage from "../../lib/storage";
import config from "../../main/config";
import env from "../../settings/env";
import defaultSettings from "../../settings/defaultsettings";
import { MouseDictionarySettings } from "../types";
import { Overlay } from "../component/Overlay";
import { Panel } from "../component/Panel";
import { ExternalLink } from "../component/ExternalLink";

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

  async componentDidMount(): Promise<void> {
    const isLoaded = await config.isDataReady();
    if (!isLoaded) {
      this.confirmAndLoadInitialDict("confirmLoadInitialDict");
    }

    const settings = data.preProcessSettings(await config.loadRawSettings());
    this.setState({ settings });

    this.preview = new Preview(settings);

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
    const willLoad = await message.notice(res.get(messageId), "okCancel");
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
    await message.success(res.get("finishRegister", { count: finalWordCount }));
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
    } else {
      if (newState.openedPanelLevel === 1 && this.state.openedPanelLevel === 0) {
        this.preview.updateText(newState.trialText, newState.settings.lookupWithCapitalized);
      }
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
      message.warn(res.get("selectDictFile"));
      return;
    }
    let willContinue = true;
    if (encoding === "Shift-JIS") {
      if (!(await fileMayBeShiftJis(file))) {
        willContinue = await message.warn(res.get("fileMayNotBeShiftJis"), "okCancel");
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
      message.success(res.get("finishRegister", { count }));
      config.setDataReady(true);
      this.updateDictDataUsage();
    } catch (e) {
      message.error(e.toString());
    } finally {
      this.updateState({ busy: false, progress: "" });
    }
  }

  async saveSettings(): Promise<void> {
    const settings = data.postProcessSettings(this.state.settings);
    try {
      await config.saveSettings(settings);
      message.info(res.get("finishSaving"));
    } catch (e) {
      message.error(e.message);
    }
  }

  doFactoryReset(): void {
    this.updateState(null, data.preProcessSettings(getDefaultSettings()));
  }

  toggleBasicSettings(): void {
    this.updateState({ openedPanelLevel: this.state.openedPanelLevel !== 0 ? 0 : 1 });
  }

  toggleAdvancedSettings(): void {
    this.updateState({ openedPanelLevel: this.state.openedPanelLevel !== 1 ? 1 : 2 });
  }

  switchLanguage(): void {
    const newLang = this.state.lang === "ja" ? "en" : "ja";
    res.setLang(newLang);
    this.setState({
      lang: newLang,
    });
  }

  render(): JSX.Element {
    const state = this.state;
    return (
      <>
        <div style={{ textAlign: "center", marginBottom: "10px" }}>
          <ExternalLink href={`https://mouse-dictionary.netlify.app/${state.lang}/`}>
            <img src="logo.png" width="250" />
          </ExternalLink>
        </div>

        <div>
          <div
            style={{ position: "absolute", top: 0, left: -30, cursor: "pointer" }}
            onClick={() => this.switchLanguage()}
          >
            {state.lang}
          </div>
          <LoadDictionary
            busy={state.busy}
            progress={state.progress}
            trigger={(e) => {
              switch (e.type) {
                case "load":
                  return this.loadDictionaryData(e.payload.encoding, e.payload.format);
                case "clear":
                  // Not supported for the moment due to instability of chrome.storage.local.clear()
                  return;
              }
            }}
          />

          <div style={{ fontSize: "75%" }}>
            <DataUsage byteSize={state.dictDataUsage}></DataUsage>
            <div>
              <span>{state.progress}</span>
            </div>
          </div>

          <Panel active={!state.busy && !env.disableUserSettings && state.initialized}>
            <hr style={{ marginTop: 15 }} />
            <ExternalLink href="https://github.com/wtetsu/mouse-dictionary/wiki/Download-dictionary-data">
              {res.get("downloadDictData")}
            </ExternalLink>

            <div style={{ marginTop: 30, marginBottom: 30 }}>
              <img src="settings1.png" style={{ verticalAlign: "bottom" }} />
              <a style={{ cursor: "pointer" }} onClick={() => this.toggleBasicSettings()}>
                {state.openedPanelLevel >= 1 ? res.get("closeBasicSettings") : res.get("openBasicSettings")}
              </a>
            </div>
          </Panel>

          <Panel active={state.openedPanelLevel >= 1}>
            <div>
              <span>{res.get("trialText")}: </span>
              <EditableSpan
                value={state.trialText}
                onChange={(e) => this.updateState({ trialText: e.target.value })}
              ></EditableSpan>
              <br />
              <br />
            </div>
            <OperationPanel
              disable={state.busy}
              trigger={(type) => {
                switch (type) {
                  case "save":
                    return this.saveSettings();
                  case "factoryReset":
                    return this.doFactoryReset();
                }
              }}
            />
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
                disabled={state.busy}
                onClick={() => this.confirmAndLoadInitialDict("confirmReloadInitialDict")}
              >
                {res.get("loadInitialDict")}
              </button>
            </BasicSettings>
            <br />
            <div>
              <img src="settings1.png" style={{ verticalAlign: "bottom" }} />
              <a style={{ cursor: "pointer" }} onClick={() => this.toggleAdvancedSettings()}>
                {state.openedPanelLevel === 2 ? res.get("closeAdvancedSettings") : res.get("openAdvancedSettings")}
              </a>
            </div>
            <br />
          </Panel>

          <Panel active={state.openedPanelLevel >= 2}>
            <button
              type="button"
              className="button-small button-black"
              style={{ marginRight: 5, cursor: "pointer" }}
              onClick={() => {
                const jsonEditorOpened = !state.jsonEditorOpened;
                this.updateState({ jsonEditorOpened });
              }}
            >
              {res.get("openJsonEditor")}
            </button>

            <AdvancedSettings
              onUpdate={(statePatch, settingsPatch) => this.updateState(statePatch, settingsPatch)}
              settings={state.settings}
            />
          </Panel>

          <Overlay active={state.jsonEditorOpened}>
            <JsonEditor
              initialValue={state.settings}
              onUpdate={(e) => {
                this.updateState(e.payload.state, e.payload.settings);
              }}
            />
          </Overlay>
        </div>
      </>
    );
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
