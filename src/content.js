import text from "./text";
import res from "./resources";
import Draggable from "./draggable";
import ShortCache from "./shortcache";
import atcursor from "./atcursor";
import dom from "./dom";
import defaultSettings from "./defaultsettings";
import env from "./env";
import mdwindow from "./mdwindow";

const KEY_USER_CONFIG = "**** config ****";

const loadUserSettings = async () => {
  return new Promise(resolve => {
    chrome.storage.sync.get([KEY_USER_CONFIG], d => {
      const userSettings = JSON.parse(d[KEY_USER_CONFIG]);
      resolve(userSettings);
    });
  });
};

const processSettings = settings => {
  const jsonItems = ["normalDialogStyles", "movingDialogStyles", "hiddenDialogStyles"];
  for (let i = 0; i < jsonItems.length; i++) {
    const item = jsonItems[i];
    settings[item] = JSON.parse(settings[item]);
  }

  if (env.disableKeepingWindowStatus && settings.initialPosition === "keep") {
    settings.initialPosition = "right";
  }
};

const initializeSettings = async () => {
  const settings = Object.assign({}, defaultSettings);
  processSettings(settings);

  const userSettings = await loadUserSettings();
  processSettings(userSettings);

  for (const item of Object.keys(userSettings)) {
    settings[item] = userSettings[item];
  }
  return settings;
};

const main = async () => {
  // Pages which have frames are not supported.
  const frames = document.getElementsByTagName("frame");
  if (frames && frames.length >= 1) {
    alert(res("doesntSupportFrame"));
    return;
  }

  const DIALOG_ID = "____MOUSE_DICTIONARY_GtUfqBap4c8u";
  let _area = document.getElementById(DIALOG_ID);

  const _settings = await initializeSettings();

  if (_area) {
    const isHidden = _area.getAttribute("data-mouse-dictionary-hidden");
    if (isHidden === "true") {
      dom.applyStyles(_area, _settings.normalDialogStyles);
      _area.setAttribute("data-mouse-dictionary-hidden", "false");
    } else {
      dom.applyStyles(_area, _settings.hiddenDialogStyles);
      _area.setAttribute("data-mouse-dictionary-hidden", "true");
    }
    return;
  }

  // Compile templates, regular expressions so that it works fast
  let _contentGenerator;
  try {
    _contentGenerator = new mdwindow.ContentGenerator(_settings);
  } catch (e) {
    _contentGenerator = null;
    console.error(e);
  }

  let _lastText = null;
  const _shortCache = new ShortCache(100);

  let _selection = null;

  document.body.addEventListener("mouseup", () => {
    _selection = window.getSelection().toString();
    parseTextAndLookup(_selection);
  });

  document.body.addEventListener("mousemove", ev => {
    let textAtCursor;
    if (_selection) {
      textAtCursor = _selection;
    } else {
      textAtCursor = atcursor(ev.target, ev.clientX, ev.clientY);
    }
    if (!textAtCursor) {
      return;
    }

    parseTextAndLookup(textAtCursor);
  });

  const parseTextAndLookup = textToLookup => {
    if (!textToLookup || _lastText == textToLookup) {
      return;
    }

    const cache = _shortCache.get(textToLookup);
    if (cache) {
      _area.content.innerHTML = "";
      _area.content.appendChild(cache);
      return;
    }

    const lookupWords = text.createLookupWords(textToLookup, _settings.lookupWithCapitalized);

    return lookup(lookupWords).then(newDom => {
      _shortCache.put(textToLookup, newDom);
      _lastText = textToLookup;
    });
  };

  const lookup = lookupWords => {
    return _contentGenerator.generate(lookupWords).then(contentHtml => {
      const newDom = dom.create(contentHtml);
      _area.content.innerHTML = "";
      _area.content.appendChild(newDom);

      return newDom;
    });
  };

  _area = mdwindow.create(_settings);
  _area.dialog.id = DIALOG_ID;

  const LAST_POSITION_KEY = "**** last_position ****";

  const fetchInitialPosition = () => {
    return new Promise(resolve => {
      let left;
      switch (_settings.initialPosition) {
        case "right":
          left = document.documentElement.clientWidth - _area.dialog.clientWidth - 5;
          resolve({ left });
          break;
        case "left":
          left = 5;
          resolve({ left });
          break;
        case "keep":
          chrome.storage.sync.get([LAST_POSITION_KEY], r => {
            // onGot
            const lastPosition = JSON.parse(r[LAST_POSITION_KEY]);
            if (lastPosition) {
              if (lastPosition.width < 50) {
                lastPosition.width = 50;
              }
              if (lastPosition.height < 50) {
                lastPosition.height = 50;
              }
            }
            resolve(lastPosition || {});
          });
          break;
        default:
          resolve({});
          left = 5;
      }
    });
  };

  dom.applyStyles(_area.dialog, _settings.hiddenDialogStyles);
  document.body.appendChild(_area.dialog);

  fetchInitialPosition().then(position => {
    if (Number.isFinite(position.left)) {
      _area.dialog.style["left"] = `${position.left}px`;
    }
    if (Number.isFinite(position.top)) {
      _area.dialog.style["top"] = `${position.top}px`;
    }
    if (Number.isFinite(position.width)) {
      _area.dialog.style["width"] = `${position.width}px`;
    }
    if (Number.isFinite(position.height)) {
      _area.dialog.style["height"] = `${position.height}px`;
    }

    dom.applyStyles(_area.dialog, _settings.normalDialogStyles);

    const draggable = new Draggable(_settings.normalDialogStyles, _settings.movingDialogStyles);
    if (!_settings.disableKeepingWindowStatus) {
      draggable.onchange = e => {
        const positionData = {};
        positionData[LAST_POSITION_KEY] = JSON.stringify(e);
        chrome.storage.sync.set(positionData, () => {
          // saved
        });
      };
    }
    draggable.add(_area.dialog, _area.header);
  });
};

main();
