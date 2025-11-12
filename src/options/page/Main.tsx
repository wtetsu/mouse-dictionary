/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import { produce } from "immer";
import { useEffect, useReducer } from "react";
import {
  Button,
  DataUsage,
  EditableSpan,
  ExternalLink,
  Launch,
  Overlay,
  Panel,
  Switch,
  Toggle,
} from "../component/atom";
import {
  AdvancedSettings,
  BasicSettings,
  LoadDictionary,
  OperationPanel,
  Tips,
  WholeSettings,
} from "../component/organism";
import { config, defaultSettings, env } from "../extern";
import { data, dict, message, res } from "../logic";
import { detectFileEncoding } from "../logic/encoding";
import { usePreview } from "../logic/preview";

import type { TextResourceKeys } from "../resource";
import type { DictionaryFile, MouseDictionarySettings } from "../types";

type MainState = {
  dictDataUsage?: number;
  busy: boolean;
  progress: string;
  settings: MouseDictionarySettings;
  previewText: string;
  panelLevel: 0 | 1 | 2 | 3;
  lang: string;
  initialized: boolean;
};

type Action =
  | {
      type: "patch";
      statePatch: Partial<MainState> | undefined;
      settingsPatch: Partial<MouseDictionarySettings> | undefined;
    }
  | {
      type: "replace";
      settings: MouseDictionarySettings;
    };

const reducer = (state: MainState, action: Action): MainState => {
  switch (action.type) {
    case "patch":
      return produce(state, (d) => {
        Object.assign(d, action.statePatch);
        Object.assign(d.settings, action.settingsPatch);
      });
    case "replace":
      return produce(state, (d) => {
        d.settings = action.settings;
      });
  }
};

const initialState: MainState = {
  dictDataUsage: undefined,
  busy: false,
  progress: "",
  settings: {} as MouseDictionarySettings,
  previewText: "rained cats and dogs",
  panelLevel: 0,
  lang: "",
  initialized: false,
};

type UpdateState = (state: Partial<MainState>) => void;

export const Main: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    lang: res.getLang(),
  });

  const { updatePreview, setPreviewVisible } = usePreview();

  useEffect(() => {
    const init = async () => {
      const settings = data.preProcessSettings(await config.loadRawSettings());
      updatePreview(settings, state.previewText, true);
      updateState({ settings });

      const isLoaded = await config.isDataReady();
      if (!isLoaded) {
        const ok = await confirmAndLoadInitialDict("confirmLoadInitialDict", updateState);
        updateState({ initialized: ok, dictDataUsage: -1 });
        return;
      }
      updateState({ initialized: true });
    };
    init();
  }, []);
  useEffect(() => {
    if (!state.initialized) return;
    updatePreview(state.settings, state.previewText, true);
  }, [state.settings, state.previewText]);

  useEffect(() => {
    if (!state.initialized) return;
    const visible = state.panelLevel >= 1 && state.panelLevel <= 2;
    setPreviewVisible(visible);
  }, [state.panelLevel]);

  const updateState = (
    statePatch: Record<string, any> | undefined,
    settingsPatch: Partial<MouseDictionarySettings> | undefined = undefined,
  ): void => {
    dispatch({ type: "patch", statePatch, settingsPatch });
  };

  const doFactoryReset = (): void => {
    dispatch({
      type: "replace",
      settings: data.preProcessSettings(defaultSettings.get()),
    });
  };

  const switchLanguage = (): void => {
    const newLang = state.lang === "ja" ? "en" : "ja";
    res.setLang(newLang);
    updateState({ lang: newLang });
  };

  return (
    <>
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <ExternalLink href={`https://mouse-dictionary.netlify.app/${state.lang}/`}>
          <img src="img/logo.png" width="250" className="hover_zoom" />
        </ExternalLink>
        <div style={{ fontSize: "12px", color: "#888", marginTop: "5px" }}>v{VERSION}</div>
      </div>

      <div>
        <div style={{ position: "absolute", top: 0, left: -30, cursor: "pointer" }} onClick={() => switchLanguage()}>
          {state.lang}
        </div>
        <LoadDictionary busy={state.busy} trigger={(e) => loadDictionaryData(e.payload, updateState)} />

        <Panel active={env.get().support.localGetBytesInUse && !state.busy}>
          <DataUsage byteSize={state.dictDataUsage} onUpdate={(byteSize) => updateState({ dictDataUsage: byteSize })} />
        </Panel>
        <div style={{ fontSize: "75%" }}>
          <span>{state.progress}</span>
        </div>

        <div style={{ cursor: "pointer", fontSize: "75%" }} onClick={() => updateState({ dictDataUsage: -1 })} />

        <Switch visible={state.initialized && state.panelLevel === 0}>
          <Tips style={{ position: "absolute", bottom: -10, left: 315, width: 300 }} />
          <Launch
            href="pdf/web/viewer.html"
            text={res.get("openPdfViewer")}
            image="img/pdf.png"
            style={{ position: "absolute", bottom: 0, left: 380 }}
          />
        </Switch>

        <Panel active={!state.busy && env.get().enableUserSettings && state.initialized}>
          <hr style={{ marginTop: 15 }} />

          <Toggle
            switch={state.panelLevel >= 1}
            image="img/settings1.png"
            text1={res.get("openBasicSettings")}
            text2={res.get("closeBasicSettings")}
            onClick={() => updateState({ panelLevel: state.panelLevel !== 0 ? 0 : 1 })}
          />
        </Panel>

        <Panel active={state.panelLevel >= 1}>
          <div style={{ marginBottom: 20 }}>
            <span>{res.get("previewText")}: </span>
            <EditableSpan
              value={state.previewText}
              style={{ width: 300 }}
              onChange={(e) => updateState({ previewText: e.target.value })}
            />
          </div>
          <OperationPanel
            disable={state.busy}
            trigger={(type) => {
              switch (type) {
                case "save":
                  return saveSettings(state.settings);
                case "factoryReset":
                  return doFactoryReset();
              }
            }}
          />
          <BasicSettings
            onUpdate={(statePatch, settingsPatch) => updateState(statePatch, settingsPatch)}
            busy={state.busy}
            settings={state.settings}
          >
            <label>{res.get("dictionaryData")}</label>
            <Button
              type="revert"
              text={res.get("loadInitialDict")}
              disabled={state.busy}
              onClick={() => confirmAndLoadInitialDict("confirmReloadInitialDict", updateState)}
            />
          </BasicSettings>
          <br />

          <Toggle
            switch={state.panelLevel >= 2}
            image="img/settings2.png"
            text1={res.get("openAdvancedSettings")}
            text2={res.get("closeAdvancedSettings")}
            onClick={() => updateState({ panelLevel: state.panelLevel !== 1 ? 1 : 2 })}
          />
        </Panel>

        <Panel active={state.panelLevel >= 2}>
          <Button
            type="json"
            text={res.get("openJsonEditor")}
            disabled={state.busy}
            onClick={() => updateState({ panelLevel: 3 })}
          />

          <AdvancedSettings
            onUpdate={(statePatch, settingsPatch) => updateState(statePatch, settingsPatch)}
            settings={state.settings}
          />
        </Panel>

        <Overlay active={state.panelLevel >= 3}>
          <WholeSettings
            initialValue={state.settings}
            onChange={(newSettings) => updateState({ panelLevel: 2 }, newSettings)}
          />
        </Overlay>
      </div>
    </>
  );
};

const saveSettings = async (rawSettings: MouseDictionarySettings): Promise<void> => {
  const settings = data.postProcessSettings(rawSettings);
  try {
    await config.saveSettings(settings);
  } catch (e) {
    if (e instanceof Error) {
      message.error(e.toString());
    } else {
      message.error(String(e));
    }
  }
};

const confirmAndLoadInitialDict = async (messageId: TextResourceKeys, updateState: UpdateState): Promise<boolean> => {
  const willLoad = await message.notice(res.get(messageId), "okCancel");
  if (!willLoad) {
    return false;
  }

  let finalWordCount: number;
  try {
    updateState({ busy: true, panelLevel: 0 });
    finalWordCount = await dict.registerDefaultDict((count, progress) => {
      const message = res.get("progressRegister", { count, progress });
      updateState({ progress: message });
    });
    updateState({ dictDataUsage: -1 });
  } finally {
    updateState({ busy: false, progress: "" });
  }
  await config.setDataReady(true);
  await message.success(res.get("finishRegister", { count: finalWordCount }));

  return true;
};

const loadDictionaryData = async (dictionaryFile: DictionaryFile, updateState: UpdateState): Promise<void> => {
  const { file, encoding, format } = dictionaryFile;
  if (!file) {
    message.warn(res.get("selectDictFile"));
    return;
  }
  if (encoding === "Shift_JIS" && (await detectFileEncoding(file)) !== "Shift_JIS") {
    const willContinue = await message.warn(res.get("fileMayNotBeShiftJis"), "okCancel");
    if (!willContinue) {
      return;
    }
  }
  try {
    updateState({ busy: true, panelLevel: 0 });
    const count = await dict.load({ file, encoding, format }, (ev) => {
      if (ev.name === "reading") {
        const progress = `${ev.loaded.toLocaleString()} / ${ev.total.toLocaleString()} Byte`;
        updateState({ progress });
      }
      if (ev.name === "loading") {
        const progress = res.get("progressRegister", {
          count: ev.count?.toLocaleString(),
          progress: ev.word.head,
        });
        updateState({ progress });
      }
    });
    message.success(res.get("finishRegister", { count: count?.toLocaleString() }));
    config.setDataReady(true);
  } catch (e) {
    if (e instanceof Error) {
      message.error(e.toString());
    } else {
      message.error(String(e));
    }
  } finally {
    updateState({ busy: false, progress: "", dictDataUsage: -1 });
  }
};
