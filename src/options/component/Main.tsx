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
import LoadDictionary from "./LoadDictionary";
import BasicSettings from "./BasicSettings";
import AdvancedSettings from "./AdvancedSettings";
import PersistenceSettings from "./PersistenceSettings";
import res from "../logic/resource";
import dict from "../logic/dict";
import data from "../logic/data";
import dom from "../../lib/dom";
import storage from "../../lib/storage";
import Generator from "../../main/generator";
import view from "../../main/view";
import config from "../../main/config";
import entry from "../../main/entry";
import env from "../../settings/env";
import defaultSettings from "../../settings/defaultsettings";
import JsonEditor from "./JsonEditor";

export default class Main extends React.Component {
  constructor(props) {
    super(props);
    this.contentEditable = React.createRef();

    const initialLang = decideInitialLanguage(navigator.languages);
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

    this.doChangeState = this.doChangeState.bind(this);
    this.doChangeSettings = this.doChangeSettings.bind(this);
    this.doChangeReplaceRule = this.doChangeReplaceRule.bind(this);

    this.doLoad = this.doLoad.bind(this);
    this.doClear = this.doClear.bind(this);
    this.doLoadInitialDict = this.doLoadInitialDict.bind(this);
    this.doSaveSettings = this.doSaveSettings.bind(this);
    this.doBackToDefaultSettings = this.doBackToDefaultSettings.bind(this);
    this.doToggleBasicSettings = this.doToggleBasicSettings.bind(this);
    this.doToggleAdvancedSettings = this.doToggleAdvancedSettings.bind(this);
    this.doSwitchLanguage = this.doSwitchLanguage.bind(this);

    this.updateTrialWindowWithDebounce = debounce(
      () => {
        this.updateTrialWindow(this.state.settings);
      },
      64,
      { leading: true }
    );

    this.trialWindow = null;
    this.needRecreateTrialWindow = false;
  }

  render() {
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
          <div onClick={this.doSwitchLanguage} style={{ position: "absolute", top: 0, left: -30, cursor: "pointer" }}>
            {this.state.lang}
          </div>
          <LoadDictionary
            encoding={state.encoding}
            format={state.format}
            changeState={this.doChangeState}
            doLoad={this.doLoad}
            doClear={this.doClear}
            dictDataUsage={state.dictDataUsage}
            busy={state.busy}
            progress={state.progress}
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
                <a onClick={this.doToggleBasicSettings} style={{ cursor: "pointer" }}>
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
                onChange={(e) => this.doChangeState("trialText", e.target.value)}
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
              onClickSaveSettings={this.doSaveSettings}
              onClickBackToDefaultSettings={this.doBackToDefaultSettings}
            />
          )}

          {this.state.basicSettingsOpened && (
            <BasicSettings
              changeSettings={this.doChangeSettings}
              doLoadInitialDict={this.doLoadInitialDict}
              busy={state.busy}
              settings={state.settings}
              trialText={state.trialText}
            />
          )}

          <br />
          {this.state.basicSettingsOpened && (
            <div>
              <img src="settings1.png" style={{ verticalAlign: "bottom" }} />
              <a onClick={this.doToggleAdvancedSettings} style={{ cursor: "pointer" }}>
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
                    setState={(newState) => {
                      this.removeTrialWindow();
                      this.setState(newState);
                    }}
                  />
                </div>
              )}

              <AdvancedSettings
                changeSettings={this.doChangeSettings}
                changeReplaceRule={this.doChangeReplaceRule}
                settings={state.settings}
              />
            </>
          )}
        </div>
      </>
    );
  }

  async componentDidMount() {
    const isLoaded = await config.isDataReady();
    if (!isLoaded) {
      this.confirmAndLoadInitialDict("confirmLoadInitialDict");
    }
    await this.initializeUserSettings();
    await this.updateDictDataUsage();
    this.setState({ initialized: true });
  }

  componentDidUpdate() {
    this.updateTrialWindowWithDebounce();
  }

  async initializeUserSettings() {
    const settings = data.preProcessSettings(await config.loadRawSettings());
    this.setState({ settings });
    this.generator = new Generator(settings);
  }

  async updateDictDataUsage() {
    if (env.disableUserSettings) {
      return;
    }
    const byteSize = await storage.local.getBytesInUse();
    const kb = isFinite(byteSize) ? Math.floor(byteSize / 1024).toLocaleString() : "";
    this.setState({
      dictDataUsage: kb,
    });
  }

  async confirmAndLoadInitialDict(messageId) {
    const willLoad = await swal({
      text: res.get(messageId),
      icon: "info",
      buttons: true,
      closeOnClickOutside: false,
    });
    if (!willLoad) {
      return;
    }

    this.loadInitialDict();
  }

  async loadInitialDict() {
    let finalWordCount;
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

  doChangeState(name, value) {
    this.setState({ [name]: value });
    if (name === "trialText") {
      this.updateTrialText(this.state.settings, value);
    }
  }

  doChangeSettings(name, newValue) {
    if (dialogFields.has(name)) {
      this.needRecreateTrialWindow = true;
    }
    const newSettings = immer(this.state.settings, (d) => {
      d[name] = newValue;
    });
    this.setState({ settings: newSettings });
  }

  async doLoad() {
    const file = document.getElementById("dictdata").files[0];
    const encoding = this.state.encoding;
    if (!file) {
      swal({
        title: res.get("selectDictFile"),
        icon: "info",
      });
      return;
    }
    let willContinue = true;
    if (encoding === "Shift-JIS") {
      if (!(await fileMayBeShiftJis(file))) {
        willContinue = await swal({
          title: res.get("fileMayNotBeShiftJis"),
          icon: "warning",
          buttons: true,
        });
      }
    }
    if (willContinue) {
      this.loadDictionaryFile(file);
    }
  }

  async loadDictionaryFile(file) {
    const encoding = this.state.encoding;
    const format = this.state.format;
    const event = (ev) => {
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
      const { wordCount } = await dict.load({ file, encoding, format, event });
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
  async doClear() {
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

  doLoadInitialDict() {
    this.confirmAndLoadInitialDict("confirmReloadInitialDict");
  }

  doChangeReplaceRule(type, data) {
    switch (type) {
      case "add":
        this.addReplaceRule();
        break;
      case "change":
        this.changeReplaceRule(data.name, data.value);
        break;
      case "move":
        this.moveReplaceRule(data.index, data.offset);
        break;
      case "delete":
        this.deleteReplaceRule(data.index);
        break;
    }
  }

  addReplaceRule() {
    const newSettings = immer(this.state.settings, (d) => {
      const newKey = new Date().getTime().toString();
      d.replaceRules.push({ key: newKey, search: "", replace: "" });
    });
    this.setState({ settings: newSettings });
  }

  changeReplaceRule(name, value) {
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

  moveReplaceRule(index, offset) {
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

  deleteReplaceRule(index) {
    const newSettings = immer(this.state.settings, (d) => {
      d.replaceRules.splice(index, 1);
    });
    this.setState({ settings: newSettings });
  }

  updateTrialWindow(settings) {
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
    let orgTrialWindow = null;
    if (this.needRecreateTrialWindow) {
      orgTrialWindow = this.trialWindow;
      this.trialWindow = null;
      this.needRecreateTrialWindow = false;
    }
    if (!this.trialWindow) {
      try {
        this.trialWindow = this.createTrialWindow(settings);
        document.body.appendChild(this.trialWindow.dialog);
      } catch (e) {
        console.error(e);
      }
    }
    if (this.trialWindow) {
      this.updateTrialText(settings);
      dom.applyStyles(this.trialWindow.dialog, {
        width: `${settings.width}px`,
        height: `${settings.height}px`,
        zIndex: 9999,
      });
    }
    if (orgTrialWindow?.dialog) {
      document.body.removeChild(orgTrialWindow.dialog);
    }
  }

  createTrialWindow(settings) {
    const tmpSettings = immer(settings, (d) => {
      d.normalDialogStyles = null;
      d.hiddenDialogStyles = null;
      d.movingDialogStyles = null;
    });
    const trialWindow = view.create(tmpSettings);
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

  removeTrialWindow() {
    if (this.trialWindow?.dialog) {
      document.body.removeChild(this.trialWindow.dialog);
      this.trialWindow = null;
    }
  }

  async updateTrialText(settings, trialText) {
    if (!this.trialWindow) {
      return;
    }
    const actualTrialText = trialText ?? this.state.trialText;

    const { entries, lang } = entry.build(actualTrialText, settings.lookupWithCapitalized, false);

    console.time("update");

    const descriptions = await storage.local.get(entries);
    const { html } = await this.generator.generate(entries, descriptions, lang === "en");

    if (this.trialWindow) {
      const newDom = dom.create(html);
      this.trialWindow.content.innerHTML = "";
      this.trialWindow.content.appendChild(newDom);
    }

    console.timeEnd("update");
  }

  async doSaveSettings() {
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

  doBackToDefaultSettings() {
    this.needRecreateTrialWindow = true;
    const newSettings = data.preProcessSettings(getDefaultSettings());
    this.setState({ settings: newSettings });
  }

  doToggleBasicSettings() {
    this.removeTrialWindow();
    this.setState({
      basicSettingsOpened: !this.state.basicSettingsOpened,
      advancedSettingsOpened: false,
    });
  }

  doToggleAdvancedSettings() {
    this.setState({
      advancedSettingsOpened: !this.state.advancedSettingsOpened,
    });
  }

  doSwitchLanguage() {
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

const decideInitialLanguage = (languages) => {
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

const fileMayBeShiftJis = async (file) => {
  return new Promise((done, fail) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target.result;
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
