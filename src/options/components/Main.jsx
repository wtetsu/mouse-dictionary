/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React from "react";
import swal from "sweetalert";
import lodash from "lodash";
import immer from "immer";
import LoadDictionary from "./LoadDictionary";
import BasicSettings from "./BasicSettings";
import AdvancedSettings from "./AdvancedSettings";
import PersistenceSettings from "./PersistenceSettings";
import res from "../lib/resources";
import dict from "../lib/dict";
import defaultSettings from "../../settings/defaultsettings";
import dom from "../../lib/dom";
import env from "../../settings/env";
import ContentGenerator from "../../main/contentgenerator";
import mdwindow from "../../main/mdwindow";
import storage from "../../lib/storage";
import utils from "../lib/utils";
import generateEntries from "../../lib/entry/generate";

const KEY_LOADED = "**** loaded ****";
const KEY_USER_CONFIG = "**** config ****";

const getDefaultSettings = () => {
  return lodash.cloneDeep(defaultSettings);
};

export default class Main extends React.Component {
  constructor(props) {
    super(props);
    const initialLang = utils.decideInitialLanguage(navigator.languages);
    res.setLang(initialLang);
    this.state = {
      encoding: "Shift-JIS",
      format: "EIJIRO",
      dictDataUsage: 0,
      busy: false,
      progress: "",
      settings: null,
      trialText: "rained cats and dogs",
      basicSettingsOpened: false,
      advancedSettingsOpened: false,
      lang: initialLang,
      initialized: false
    };

    this.doChangeState = this.doChangeState.bind(this);
    this.doChangeSettings = this.doChangeSettings.bind(this);
    this.doChangeColorSettings = this.doChangeColorSettings.bind(this);
    this.doChangeReplaceRule = this.doChangeReplaceRule.bind(this);
    this.doMoveReplaceRule = this.doMoveReplaceRule.bind(this);
    this.doRemoveReplaceRule = this.doRemoveReplaceRule.bind(this);
    this.doLoad = this.doLoad.bind(this);
    this.doClear = this.doClear.bind(this);
    this.doLoadInitialDict = this.doLoadInitialDict.bind(this);
    this.doSaveSettings = this.doSaveSettings.bind(this);
    this.doBackToDefaultSettings = this.doBackToDefaultSettings.bind(this);
    this.doAddReplaceRule = this.doAddReplaceRule.bind(this);
    this.doToggleBasicSettings = this.doToggleBasicSettings.bind(this);
    this.doToggleAdvancedSettings = this.doToggleAdvancedSettings.bind(this);
    this.doSwitchLanguage = this.doSwitchLanguage.bind(this);

    this.updateTrialWindowWithDebounce = lodash.debounce(
      () => {
        this.updateTrialWindow(this.state.settings);
      },
      64,
      { leading: true }
    );
  }

  render() {
    const state = this.state;

    return (
      <div>
        <div onClick={this.doSwitchLanguage} style={{ position: "absolute", top: 0, left: -30, cursor: "pointer" }}>
          {this.state.lang}
        </div>
        <LoadDictionary
          encoding={state.encoding}
          format={state.format}
          onChangeState={this.doChangeState}
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

        {!this.state.busy && !env.disableUserSettings && this.state.initialized && <hr />}

        {!this.state.busy && !env.disableUserSettings && this.state.initialized && (
          <div>
            <img src="settings1.png" style={{ verticalAlign: "bottom" }} />
            <a onClick={this.doToggleBasicSettings} style={{ cursor: "pointer" }}>
              {this.state.basicSettingsOpened ? res.get("closeBasicSettings") : res.get("openBasicSettings")}
            </a>
          </div>
        )}

        <br />

        {(this.state.basicSettingsOpened || this.state.advancedSettingsOpened) && (
          <PersistenceSettings
            onClickSaveSettings={this.doSaveSettings}
            onClickBackToDefaultSettings={this.doBackToDefaultSettings}
          />
        )}

        {this.state.basicSettingsOpened && (
          <BasicSettings
            onChange={this.doChangeSettings}
            onChangeState={this.doChangeState}
            onChangeSettings={this.doChangeSettings}
            onChangeColorSettings={this.doChangeColorSettings}
            doLoadInitialDict={this.doLoadInitialDict}
            busy={state.busy}
            settings={state.settings}
            trialText={state.trialText}
          />
        )}

        <br />
        {this.state.basicSettingsOpened && (
          <div style={{ fontSize: "10px" }}>
            <img src="settings2.png" style={{ verticalAlign: "bottom" }} />
            <a onClick={this.doToggleAdvancedSettings} style={{ cursor: "pointer" }}>
              {this.state.advancedSettingsOpened ? res.get("closeAdvancedSettings") : res.get("openAdvancedSettings")}
            </a>
          </div>
        )}

        <br />

        {this.state.advancedSettingsOpened && (
          <AdvancedSettings
            onChange={this.doChangeSettings}
            onChangeState={this.doChangeState}
            onChangeSettings={this.doChangeSettings}
            onChangeReplaceRule={this.doChangeReplaceRule}
            onClickAddReplaceRule={this.doAddReplaceRule}
            onClickMoveReplaceRule={this.doMoveReplaceRule}
            onClickRemoveReplaceRule={this.doRemoveReplaceRule}
            settings={state.settings}
          />
        )}
      </div>
    );
  }

  async componentDidMount() {
    const isLoaded = await storage.local.pickOut(KEY_LOADED);
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
    const userSettingsJson = await storage.sync.pickOut(KEY_USER_CONFIG);
    const userSettings = utils.tryToParseJson(userSettingsJson);
    const settings = Object.assign({}, getDefaultSettings(), userSettings);
    this.setState({ settings });
    this.contentGenerator = new ContentGenerator(settings);
  }

  async updateDictDataUsage() {
    const byteSize = await storage.local.getBytesInUse();
    const kb = isFinite(byteSize) ? Math.floor(byteSize / 1024).toLocaleString() : "";
    this.setState({
      dictDataUsage: kb
    });
  }

  async confirmAndLoadInitialDict(messageId) {
    const willLoad = await swal({
      text: res.get(messageId),
      icon: "info",
      buttons: true,
      closeOnClickOutside: false
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

    await storage.local.set({
      [KEY_LOADED]: true
    });

    await swal({
      text: res.get("finishRegister", finalWordCount),
      icon: "success"
    });
  }

  doChangeState(name, e) {
    if (name) {
      this.setState({
        [name]: e.target.value
      });
      if (name === "trialText") {
        this.updateTrialText(this.state.settings, e.target.value);
      }
    }
  }

  doChangeSettings(name, e) {
    if (!name) {
      return;
    }
    const newSettings = immer(this.state.settings, d => {
      d[name] = getTargetValue(e.target);
    });
    if (this.shouldRecreateTrialWindow(name)) {
      this.removeAndCreateTrialWindow(newSettings);
    }
    this.setState({ settings: newSettings });
  }

  doChangeColorSettings(name, e) {
    if (!name) {
      return;
    }
    const newSettings = Object.assign({}, this.state.settings);
    newSettings[name] = e.hex;

    if (this.shouldRecreateTrialWindow(name)) {
      this.removeAndCreateTrialWindow(newSettings);
    }

    this.setState({
      settings: newSettings
    });
  }

  shouldRecreateTrialWindow(propName) {
    const props = new Set(["scroll", "backgroundColor", "dialogTemplate", "contentWrapperTemplate"]);
    return props.has(propName);
  }

  async doLoad() {
    const file = document.getElementById("dictdata").files[0];
    const encoding = this.state.encoding;
    if (!file) {
      swal({
        title: res.get("selectDictFile"),
        icon: "info"
      });
      return;
    }
    let willContinue = true;
    if (encoding === "Shift-JIS") {
      const fileMayBeSjis = await utils.fileMayBeSjis(file);
      if (!fileMayBeSjis) {
        willContinue = await swal({
          title: res.get("fileMayNotBeShiftJis"),
          icon: "warning",
          buttons: true
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
    const event = ev => {
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
        icon: "success"
      });
      storage.local.set({
        [KEY_LOADED]: true
      });

      this.updateDictDataUsage();
    } catch (e) {
      swal({
        text: e.toString(),
        icon: "error"
      });
    } finally {
      this.setState({ busy: false, progress: "" });
    }
  }

  async doClear() {
    const willDelete = await swal({
      text: res.get("clearAllDictData"),
      icon: "warning",
      buttons: true,
      dangerMode: true
    });
    if (!willDelete) {
      return;
    }

    this.setState({ busy: true });
    await storage.local.clear();
    swal({
      text: res.get("finishedClear"),
      icon: "success"
    });
    this.setState({ busy: false });
    this.updateDictDataUsage();
  }

  doLoadInitialDict() {
    this.confirmAndLoadInitialDict("confirmReloadInitialDict");
  }

  doAddReplaceRule() {
    const newReplaceRules = [].concat(this.state.settings.replaceRules);
    newReplaceRules.push({ key: new Date().toString(), search: "", replace: "" });

    const newSettings = Object.assign({}, this.state.settings);
    newSettings.replaceRules = newReplaceRules;
    this.setState({
      settings: newSettings
    });
  }

  doChangeReplaceRule(e) {
    // name: replaceRule.search.0
    const name = e.target.name;
    if (!name) {
      return;
    }
    const arr = name.split(".");
    if (arr.length !== 3 || arr[0] !== "replaceRule") {
      return;
    }
    const type = arr[1];
    const index = parseInt(arr[2], 10);
    const newReplaceRules = [].concat(this.state.settings.replaceRules);
    if (index < newReplaceRules.length) {
      switch (type) {
        case "search":
          newReplaceRules[index].search = e.target.value;
          break;
        case "replace":
          newReplaceRules[index].replace = e.target.value;
          break;
      }
      this.updateReplaceRules(newReplaceRules);
    }
  }

  doMoveReplaceRule(index, offset) {
    const newReplaceRules = [].concat(this.state.settings.replaceRules);
    const a = newReplaceRules[index];
    const b = newReplaceRules[index + offset];
    if (a && b) {
      newReplaceRules[index] = b;
      newReplaceRules[index + offset] = a;
      this.updateReplaceRules(newReplaceRules);
    }
  }

  doRemoveReplaceRule(index) {
    const newReplaceRules = [].concat(this.state.settings.replaceRules);
    newReplaceRules.splice(index, 1);
    this.setState(newReplaceRules);
    this.updateReplaceRules(newReplaceRules);
  }

  updateReplaceRules(newReplaceRules) {
    const newSettings = Object.assign({}, this.state.settings);
    newSettings.replaceRules = newReplaceRules;
    this.setState({
      settings: newSettings
    });
  }

  updateTrialWindow(settings) {
    if (!this.state.basicSettingsOpened) {
      return;
    }
    try {
      // Creating a ContentGenerator instance fails when settings is wrong
      const newContentGenerator = new ContentGenerator(settings);
      if (newContentGenerator) {
        this.contentGenerator = newContentGenerator;
      }
    } catch {
      // NOP
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
      this.trialWindow.dialog.style.width = `${settings.width}px`;
      this.trialWindow.dialog.style.height = `${settings.height}px`;
      this.trialWindow.dialog.style.zIndex = 9999;
    }
  }

  createTrialWindow(settings) {
    const tmpSettings = {
      ...settings,
      normalDialogStyles: null,
      hiddenDialogStyles: null,
      movingDialogStyles: null
    };
    const trialWindow = mdwindow.create(tmpSettings);
    trialWindow.dialog.style.cursor = "zoom-out";
    trialWindow.dialog.style.top = "30px";
    trialWindow.dialog.addEventListener("click", () => {
      trialWindow.dialog.style.width = "100px";
      trialWindow.dialog.style.height = "100px";
    });
    return trialWindow;
  }

  removeAndCreateTrialWindow(settings) {
    if (!settings) {
      return;
    }
    this.removeTrialWindow();
  }

  removeTrialWindow() {
    if (this.trialWindow && this.trialWindow.dialog) {
      document.body.removeChild(this.trialWindow.dialog);
      this.trialWindow = null;
    }
  }

  async updateTrialText(settings, trialText) {
    if (!this.trialWindow) {
      return;
    }
    const actualTrialText = trialText || this.state.trialText;

    const { entries, lang } = generateEntries(actualTrialText, settings.lookupWithCapitalized, false);

    let startTime;
    if (process.env.NODE_ENV !== "production") {
      startTime = new Date().getTime();
    }

    const descriptions = await storage.local.get(entries);
    const { html } = await this.contentGenerator.generate(entries, descriptions, lang === "en");

    if (this.trialWindow) {
      const newDom = dom.create(html);
      this.trialWindow.content.innerHTML = "";
      this.trialWindow.content.appendChild(newDom);
    }

    if (process.env.NODE_ENV !== "production") {
      const time = new Date().getTime() - startTime;
      console.info(`${time}ms:${entries}`);
    }
  }

  async doSaveSettings() {
    await storage.sync.set({
      [KEY_USER_CONFIG]: JSON.stringify(this.state.settings)
    });
    swal({
      text: res.get("finishSaving"),
      icon: "info"
    });
  }

  doBackToDefaultSettings() {
    const newSettings = getDefaultSettings();
    this.removeAndCreateTrialWindow(newSettings);
    this.setState({ settings: newSettings });
  }

  doToggleBasicSettings() {
    if (!this.state.basicSettingsOpened) {
      // Open
      this.setState({
        basicSettingsOpened: true,
        advancedSettingsOpened: false
      });
      this.removeAndCreateTrialWindow(this.state.settings);
    } else {
      // Close
      this.setState({
        basicSettingsOpened: false,
        advancedSettingsOpened: false
      });
      this.removeTrialWindow();
    }
  }

  doToggleAdvancedSettings() {
    this.setState({
      advancedSettingsOpened: !this.state.advancedSettingsOpened
    });
  }

  doSwitchLanguage() {
    const newLang = this.state.lang === "ja" ? "en" : "ja";
    res.setLang(newLang);
    this.setState({
      lang: newLang
    });
  }
}
const getTargetValue = target => {
  let newValue;
  switch (target.type) {
    case "number":
      newValue = parseInt(target.value, 10);
      break;
    case "checkbox":
      newValue = target.checked;
      break;
    default:
      newValue = target.value;
  }
  return newValue;
};
