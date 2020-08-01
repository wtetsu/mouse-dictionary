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
  Button,
  DataUsage,
  EditableSpan,
  ExternalLink,
  JsonEditor,
  LoadDictionary,
  OperationPanel,
  Overlay,
  Panel,
  Toggle,
} from "../component";
import { data, dict, message, Preview, res } from "../logic";
import { config, defaultSettings, env } from "../extern";
import { MouseDictionarySettings } from "../types";

type MainProps = Record<string, unknown>;

type MainState = {
  dictDataUsage?: number;
  busy: boolean;
  progress: string;
  settings: MouseDictionarySettings;
  trialText: string;
  panelLevel: 0 | 1 | 2 | 3;
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
      panelLevel: 0,
      lang: initialLang,
      initialized: false,
    };
  }

  async componentDidMount(): Promise<void> {
    const settings = data.preProcessSettings(await config.loadRawSettings());
    this.setState({ settings });
    this.preview = new Preview(settings);

    const isLoaded = await config.isDataReady();
    if (!isLoaded) {
      const ok = await this.confirmAndLoadInitialDict("confirmLoadInitialDict");
      this.updateState({ initialized: ok, dictDataUsage: -1 });
      return;
    }
    this.updateState({ initialized: true });
  }

  async confirmAndLoadInitialDict(messageId: string): Promise<boolean> {
    const willLoad = await message.notice(res.get(messageId), "okCancel");
    if (!willLoad) {
      return false;
    }
    await this.loadInitialDict();
    return true;
  }

  async loadInitialDict(): Promise<void> {
    let finalWordCount: number;
    try {
      this.updateState({ busy: true, panelLevel: 0 });
      finalWordCount = await dict.registerDefaultDict((count, progress) => {
        const message = res.get("progressRegister", { count, progress });
        this.updateState({ progress: message });
      });
      this.updateState({ dictDataUsage: -1 });
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
      const shouldRefresh = data.hasAny(DIALOG_FIELDS, Object.keys(settingsPatch));
      this.preview.update(newState.settings, newState.trialText, shouldRefresh);
    } else {
      if (newState.panelLevel === 1 && this.state.panelLevel === 0) {
        this.preview.updateText(newState.trialText, newState.settings.lookupWithCapitalized);
      }
    }
    this.preview.setVisible(newState.panelLevel >= 1 && newState.panelLevel <= 2);
    if (statePatch?.trialText) {
      this.preview.updateText(statePatch.trialText, newState.settings.lookupWithCapitalized);
    }
  }

  async loadDictionaryData(file: File, encoding: string, format: string): Promise<void> {
    if (!file) {
      message.warn(res.get("selectDictFile"));
      return;
    }
    if (encoding === "Shift-JIS" && !(await data.fileMayBeShiftJis(file))) {
      const willContinue = await message.warn(res.get("fileMayNotBeShiftJis"), "okCancel");
      if (!willContinue) {
        return;
      }
    }
    try {
      this.updateState({ busy: true, panelLevel: 0 });
      const count = await dict.load({ file, encoding, format }, (ev) => {
        if (ev.name === "reading") {
          const progress = `${ev.loaded.toLocaleString()} / ${ev.total.toLocaleString()} Byte`;
          this.updateState({ progress });
        }
        if (ev.name === "loading") {
          const progress = res.get("progressRegister", { count: ev.count?.toLocaleString(), progress: ev.word.head });
          this.updateState({ progress });
        }
      });
      message.success(res.get("finishRegister", { count: count?.toLocaleString() }));
      config.setDataReady(true);
    } catch (e) {
      message.error(e.toString());
    } finally {
      this.updateState({ busy: false, progress: "", dictDataUsage: -1 });
    }
  }

  doFactoryReset(): void {
    this.updateState(null, data.preProcessSettings(getDefaultSettings()));
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
            trigger={(e) => {
              switch (e.type) {
                case "load":
                  return this.loadDictionaryData(e.payload.file, e.payload.encoding, e.payload.format);
                case "clear":
                  // Not supported for the moment due to instability of chrome.storage.local.clear()
                  return;
              }
            }}
          />

          <Panel active={!env.disableUserSettings && !state.busy}>
            <DataUsage
              byteSize={state.dictDataUsage}
              onUpdate={(byteSize) => this.updateState({ dictDataUsage: byteSize })}
            />
          </Panel>
          <div style={{ fontSize: "75%" }}>
            <span>{state.progress}</span>
          </div>

          <div
            style={{ cursor: "pointer", fontSize: "75%" }}
            onClick={() => this.updateState({ dictDataUsage: -1 })}
          ></div>

          <Panel active={!state.busy && !env.disableUserSettings && state.initialized}>
            <hr style={{ marginTop: 15 }} />
            <ExternalLink href="https://github.com/wtetsu/mouse-dictionary/wiki/Download-dictionary-data">
              {res.get("downloadDictData")}
            </ExternalLink>
            <Toggle
              switch={state.panelLevel >= 1}
              image="settings1.png"
              text1={res.get("openBasicSettings")}
              text2={res.get("closeBasicSettings")}
              onClick={() => this.updateState({ panelLevel: this.state.panelLevel !== 0 ? 0 : 1 })}
            />
          </Panel>

          <Panel active={state.panelLevel >= 1}>
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
                    return saveSettings(state.settings);
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
              <Button
                type="revert"
                text={res.get("loadInitialDict")}
                disabled={state.busy}
                onClick={() => this.confirmAndLoadInitialDict("confirmReloadInitialDict")}
              />
            </BasicSettings>
            <br />

            <Toggle
              switch={state.panelLevel >= 2}
              image="settings2.png"
              text1={res.get("openAdvancedSettings")}
              text2={res.get("closeAdvancedSettings")}
              onClick={() => this.updateState({ panelLevel: this.state.panelLevel !== 1 ? 1 : 2 })}
            />
          </Panel>

          <Panel active={state.panelLevel >= 2}>
            <Button
              type="json"
              text={res.get("openJsonEditor")}
              disabled={state.busy}
              onClick={() => this.updateState({ panelLevel: 3 })}
            />

            <AdvancedSettings
              onUpdate={(statePatch, settingsPatch) => this.updateState(statePatch, settingsPatch)}
              settings={state.settings}
            />
          </Panel>

          <Overlay active={state.panelLevel >= 3}>
            <JsonEditor
              initialValue={state.settings}
              onChange={(newSettings) => this.updateState({ panelLevel: 2 }, newSettings)}
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

const saveSettings = async (rawSettings: MouseDictionarySettings): Promise<void> => {
  const settings = data.postProcessSettings(rawSettings);
  try {
    await config.saveSettings(settings);
    message.info(res.get("finishSaving"));
  } catch (e) {
    message.error(e.message);
  }
};
