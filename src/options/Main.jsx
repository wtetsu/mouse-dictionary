import "babel-polyfill";
import React from "react";
import { render } from "react-dom";
import MouseDictionaryOptions from "./MouseDictionaryOptions";
import swal from "sweetalert";
import res from "./resources";
import dict from "./dict";
import defaultSettings from "../defaultsettings";

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
      config: null
    };
    this.doChangeState = this.doChangeState.bind(this);
    this.doLoad = this.doLoad.bind(this);
    this.doClear = this.doClear.bind(this);
  }

  render() {
    const state = this.state;

    return (
      <MouseDictionaryOptions
        encoding={state.encoding}
        format={state.format}
        onChange={this.doChangeState}
        doLoad={this.doLoad}
        doClear={this.doClear}
        dictDataUsage={state.dictDataUsage}
        busy={state.busy}
        progress={state.progress}
        config={state.config}
      />
    );
  }

  componentDidMount() {
    this.updateDictDataUsage();

    chrome.storage.local.get([KEY_LOADED, KEY_USER_CONFIG], r => {
      if (r[KEY_LOADED]) {
        let config = this.tryToParseJson(r[KEY_USER_CONFIG]);
        if (!config) {
          config = {
            contentTemplate: defaultSettings.contentTemplate
          };
        }
        this.setState({ config });
      } else {
        this.registerDefaultDict();
      }
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

      if (name !== "contentTemplate") {
        newState[name] = e.target.value;
      } else {
        newState.config = {
          contentTemplate: e.target.value
        };
      }
      this.setState(newState);
    }
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
}

window.onerror = msg => {
  swal({
    text: msg,
    icon: "error"
  });
};

render(<Main />, document.getElementById("app"));
