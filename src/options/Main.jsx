import "babel-polyfill";
import React from "react";
import { render } from "react-dom";
import swal from "sweetalert";
import MouseDictionaryOptions from "./MouseDictionaryOptions";
import res from "./resources";
import dict from "./dict";
import defaultSettings from "../defaultsettings";
import mdwindow from "../mdwindow";
import text from "../text";
import dom from "../dom";

const KEY_LOADED = "**** loaded ****";
const KEY_USER_CONFIG = "**** config ****";

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      encoding: "Shift-JIS",
      format: "EIJIRO",
      dictDataUsage: "-",
      busy: false,
      progress: "",
      settings: null,
      trialText: "rained cats and dogs",
      settings1Opened: false,
      settings2Opened: false
    };

    this.doChangeState = this.doChangeState.bind(this);
    this.doChangeSettings = this.doChangeSettings.bind(this);
    this.doChangeColorSettings = this.doChangeColorSettings.bind(this);
    this.doChangeReplaceRule = this.doChangeReplaceRule.bind(this);

    this.doLoad = this.doLoad.bind(this);
    this.doClear = this.doClear.bind(this);

    this.doSaveSettings = this.doSaveSettings.bind(this);
    this.doBackToDefaultSettings = this.doBackToDefaultSettings.bind(this);

    this.doAddReplaceRule = this.doAddReplaceRule.bind(this);

    this.doOpenSettings1 = this.doOpenSettings1.bind(this);
    this.doOpenSettings2 = this.doOpenSettings2.bind(this);
  }

  render() {
    const state = this.state;

    return (
      <MouseDictionaryOptions
        encoding={state.encoding}
        format={state.format}
        onChangeState={this.doChangeState}
        onChangeSettings={this.doChangeSettings}
        onChangeColorSettings={this.doChangeColorSettings}
        onChangeReplaceRule={this.doChangeReplaceRule}
        onClickAddReplaceRule={this.doAddReplaceRule}
        onClickSaveSettings={this.doSaveSettings}
        onClickBackToDefaultSettings={this.doBackToDefaultSettings}
        onClickOpenSettings1={this.doOpenSettings1}
        onClickOpenSettings2={this.doOpenSettings2}
        settings1Opened={state.settings1Opened}
        settings2Opened={state.settings2Opened}
        doLoad={this.doLoad}
        doClear={this.doClear}
        dictDataUsage={state.dictDataUsage}
        busy={state.busy}
        progress={state.progress}
        settings={state.settings}
        trialText={state.trialText}
      />
    );
  }

  componentDidMount() {
    this.updateDictDataUsage();

    chrome.storage.local.get([KEY_LOADED], r => {
      if (!r[KEY_LOADED]) {
        this.registerDefaultDict();
      }
    });

    chrome.storage.sync.get([KEY_USER_CONFIG], r => {
      const settings = {};
      for (let key of Object.keys(defaultSettings)) {
        settings[key] = defaultSettings[key];
      }

      let userSettings = this.tryToParseJson(r[KEY_USER_CONFIG]);
      if (userSettings) {
        for (let key of Object.keys(userSettings)) {
          settings[key] = userSettings[key];
        }
      }

      this.setState({ settings });
      this.contentGenerator = new mdwindow.ContentGenerator(settings);

      setInterval(() => {
        if (!this.newSettingsTime) {
          return;
        }
        // update

        if (this.newSettingsTime + 100 <= new Date().getTime()) {
          this.updateTrialWindow(this.newSettings);
          this.newSettingsTime = null;
          this.newSettings = null;
        }
      }, 10);
    });
  }

  tryToParseJson(json) {
    let result;
    try {
      result = JSON.parse(json);
    } catch (e) {
      result = null;
    }
    return result;
  }

  updateDictDataUsage() {
    if (chrome.storage.local.getBytesInUse) {
      chrome.storage.local.getBytesInUse(null, byteSize => {
        const kb = Math.floor(byteSize / 1024).toLocaleString();
        this.setState({
          dictDataUsage: res("dictDataUsage", kb)
        });
      });
    } else {
      // Firefox doesn't support getBytesInUse(at least 62.0)
      this.setState({ dictDataUsage: "" });
    }
  }

  async registerDefaultDict() {
    const willLoad = await swal({
      text: res("confirmLoadInitialDict"),
      icon: "info",
      buttons: true,
      closeOnClickOutside: false
    });

    if (willLoad) {
      this.setState({ busy: true });
      const { wordCount } = await dict.registerDefaultDict();

      this.updateDictDataUsage();
      const loaded = {};
      loaded[KEY_LOADED] = true;
      chrome.storage.local.set(loaded);
      this.setState({ busy: false, progress: "" });

      await swal({
        text: res("finishRegister", wordCount),
        icon: "success"
      });
    }
  }

  doChangeState(name, e) {
    if (name) {
      const newState = {};
      newState[name] = e.target.value;
      this.setState(newState);

      if (name === "trialText") {
        this.updateTrialText(this.state.settings, e.target.value);
      }
    }
  }

  doChangeSettings(name, e) {
    if (!name) {
      return;
    }
    const newSettings = Object.assign({}, this.state.settings);
    let newValue;
    if (e.target.type === "number") {
      newValue = parseInt(e.target.value, 10);
    } else {
      newValue = e.target.value;
    }
    newSettings[name] = newValue;

    this.setState({
      settings: newSettings
    });
    this.setUpdateTrialWindowTimer(newSettings);
  }

  doChangeColorSettings(name, e) {
    if (!name) {
      return;
    }
    const newSettings = Object.assign({}, this.state.settings);
    newSettings[name] = e.hex;
    this.setState({
      settings: newSettings
    });
    this.setUpdateTrialWindowTimer(newSettings);
  }

  setUpdateTrialWindowTimer(newSettings) {
    this.newSettingsTime = new Date().getTime();
    this.newSettings = newSettings;
  }

  async doLoad() {
    const file = document.getElementById("dictdata").files[0];
    if (!file) {
      swal({
        title: res("selectDictFile"),
        icon: "info"
      });
      return;
    }
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
          this.setState({ progress: res("progressRegister", ev.count, ev.word.head) });
          break;
        }
      }
    };
    this.setState({ busy: true });
    try {
      const { wordCount } = await dict.load({ file, encoding, format, event });
      swal({
        text: res("finishRegister", wordCount),
        icon: "success"
      });
      const loaded = {};
      loaded[KEY_LOADED] = true;
      chrome.storage.local.set(loaded);

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

  doClear() {
    swal({
      text: res("clearAllDictData"),
      icon: "warning",
      buttons: true,
      dangerMode: true
    }).then(willDelete => {
      if (willDelete) {
        this.setState({ busy: true });

        chrome.storage.local.clear(() => {
          swal({
            text: res("finishedClear"),
            icon: "success"
          });
          this.setState({ busy: false });
          this.updateDictDataUsage();
        });
      }
    });
  }

  doAddReplaceRule() {
    const newReplaceRules = [].concat(this.state.settings.replaceRules);
    newReplaceRules.push({ search: "", replace: "" });

    const newSettings = Object.assign({}, this.state.settings);
    newSettings.replaceRules = newReplaceRules;
    this.setState({
      settings: newSettings
    });
    this.setUpdateTrialWindowTimer(newSettings);
  }

  doChangeReplaceRule(e) {
    // name: replaceRule.search.0
    const name = e.target.name;
    if (!name) {
      return;
    }
    const arr = name.split(".");
    if (arr.length !== 3 || arr[0] != "replaceRule") {
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

      const newSettings = Object.assign({}, this.state.settings);
      newSettings.replaceRules = newReplaceRules;
      this.setState({
        settings: newSettings
      });
      this.updateTrialWindow(newSettings);
    }
  }

  updateTrialWindow(settings) {
    if (this.trialWindow && this.trialWindow.dialog) {
      document.body.removeChild(this.trialWindow.dialog);
      this.trialWindow = null;
    }
    if (settings) {
      try {
        this.contentGenerator = new mdwindow.ContentGenerator(settings);
        this.trialWindow = mdwindow.create(settings);
        document.body.appendChild(this.trialWindow.dialog);
        this.updateTrialText(settings);
      } catch (e) {
        this.contentGenerator = null;
      }
    }
  }

  updateTrialText(settings, trialText) {
    const actualTrialText = trialText || this.state.trialText;
    const lookupWords = text.createLookupWords(actualTrialText, settings.lookupWithCapitalized);
    this.contentGenerator.generate(lookupWords).then(contentHtml => {
      const newDom = dom.create(contentHtml);
      this.trialWindow.content.innerHTML = "";
      this.trialWindow.content.appendChild(newDom);
    });
  }

  doSaveSettings() {
    const settings = Object.assign({}, this.state.settings);
    if (settings.replaceRules) {
      settings.replaceRules = settings.replaceRules.filter(r => r.search && r.replace);
    }

    const newData = {};
    newData[KEY_USER_CONFIG] = JSON.stringify(settings);

    chrome.storage.sync.set(newData, () => {
      swal({
        text: "保存しました。",
        icon: "info"
      });
    });
  }

  doBackToDefaultSettings() {
    const settings = Object.assign({}, defaultSettings);
    this.setState({ settings });
    this.updateTrialWindow(settings);
  }

  doOpenSettings1() {
    this.updateTrialWindow(this.state.settings);

    this.setState({
      settings1Opened: true
    });
  }

  doOpenSettings2() {
    this.setState({
      settings2Opened: true
    });
  }
}

window.onerror = msg => {
  swal({
    text: msg,
    icon: "error"
  });
};

render(<Main />, document.getElementById("app"));
