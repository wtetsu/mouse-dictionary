/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import dom from "../lib/dom";
import Draggable from "../lib/draggable";
import anki from "../lib/anki";
import sound from "../lib/sound";
import traverser from "../lib/traverser";
import utils from "../lib/utils";
import config from "./config";
import entryDefault from "./entry/default";
import Lookuper from "./lookuper";
import rule from "./rule";

const POSITION_FIELDS = ["left", "top", "width", "height"];
const ANKI_STORAGE_KEY = "md_anki_settings";
const ANKI_DEFAULT_TAGS = "mouse-dictionary";
const ANKI_DEFAULT_FIELD_MAPPING = {
  Expression: "head",
  Meaning: "desc_html",
  Source: "title",
  Url: "url",
  Context: "selection",
  CreatedAt: "date",
};

const attach = async (settings, dialog, doUpdateContent) => {
  let enableDefault = true;
  let lastSelectionText = "";

  const traverse = traverser.build(rule.doLetters, settings.parseWordsLimit);
  const lookuper = new Lookuper(settings, entryDefault(), doUpdateContent);

  const draggable = new Draggable(settings.normalDialogStyles, settings.movingDialogStyles);
  draggable.events.change = (e) => config.savePosition(e);
  draggable.add(dialog);

  setDialogEvents(dialog);

  document.body.addEventListener("mousedown", () => {
    lookuper.suspended = true;
  });

  document.body.addEventListener("mouseup", async (e) => {
    draggable.onMouseUp(e);
    lookuper.suspended = false;

    const selectionText = utils.getSelection();
    lastSelectionText = selectionText;
    const updated = await lookuper.aimedLookup(selectionText);
    if (updated) {
      draggable.resetScroll();
    }

    const range = utils.omap(dialog.style, utils.convertToInt, POSITION_FIELDS);
    const didMouseUpOnTheWindow = utils.isInsideRange(range, {
      x: e.clientX,
      y: e.clientY,
    });
    lookuper.halfLocked = didMouseUpOnTheWindow;
  });

  const onMouseMoveFirst = async (e) => {
    // Wait until rule loading finish
    await rule.load();

    onMouseMove = onMouseMoveSecondOrLater;
    onMouseMove(e);
  };

  const onMouseMoveSecondOrLater = async (e) => {
    draggable.onMouseMove(e);
    if (enableDefault) {
      const textList = traverse(e.target, e.clientX, e.clientY);
      const updated = await lookuper.lookupAll(textList);
      if (updated) {
        draggable.resetScroll();
      }
    }
  };
  let onMouseMove = onMouseMoveFirst;
  document.body.addEventListener("mousemove", (e) => onMouseMove(e));

  document.body.addEventListener("keydown", (e) => {
    if (e.key === "Shift") {
      draggable.activateSnap(e);
    }
  });

  document.body.addEventListener("keyup", (e) => {
    if (e.key === "Shift") {
      draggable.deactivateSnap(e);
    }
  });

  chrome.runtime.onMessage.addListener((request) => {
    const m = request.message;
    switch (m?.type) {
      case "text":
        lookuper.update(m.text, m.withCapitalized, m.mustIncludeOriginalText, m.enableShortWord);
        break;
      case "mousemove":
        draggable.onMouseMove(m);
        break;
      case "mouseup":
        draggable.onMouseUp();
        break;
      case "enable_default":
        enableDefault = true;
        break;
      case "disable_default":
        enableDefault = false;
        break;
      case "scroll_up":
        draggable.scroll(-50);
        break;
      case "scroll_down":
        draggable.scroll(50);
        break;
    }
  });

  const selectedText = utils.getSelection();
  if (selectedText) {
    lastSelectionText = selectedText;
    // Wait until rule loading finish
    await rule.load();
    // First invoke
    lookuper.aimedLookup(selectedText);
  }

  // Guide handling
  let snapGuide = null;
  draggable.events.move = () => {
    if (snapGuide) {
      return;
    }
    snapGuide = createSnapGuideElement();
    dialog.appendChild(snapGuide);
  };
  draggable.events.finish = () => {
    if (!snapGuide) {
      return;
    }
    snapGuide.remove();
    snapGuide = null;
  };

  dialog.addEventListener("click", (e) => {
    const target = e.target;
    const addButton = target?.closest?.("[data-md-anki-add]");
    if (!addButton) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();

    const entry = addButton.closest("[data-md-entry]");
    const head = entry?.dataset?.mdHead ?? "";
    const desc = entry?.dataset?.mdDesc ?? "";
    openAnkiDialog(dialog, {
      head,
      desc,
      selection: lastSelectionText,
    });
  });
};

const setDialogEvents = (dialog) => {
  dialog.addEventListener("mouseenter", (e) => {
    for (const elem of e.target.querySelectorAll("[data-md-pronunciation]")) {
      if (elem.dataset.mdPronunciationSet) {
        continue;
      }
      elem.dataset.mdPronunciationSet = "true";
      elem.addEventListener("click", () => sound.pronounce(elem.dataset.mdPronunciation));
    }
    for (const elem of e.target.querySelectorAll("[data-md-hovervisible]")) {
      elem.style.visibility = "visible";
    }
  });
  dialog.addEventListener("mouseleave", (e) => {
    for (const elem of e.target.querySelectorAll("[data-md-hovervisible]")) {
      elem.style.visibility = "hidden";
    }
  });
};

const openAnkiDialog = async (dialog, entry) => {
  const existing = dialog.querySelector("[data-md-anki-overlay]");
  if (existing) {
    existing.remove();
  }

  const overlay = dom.create(`
    <div data-md-anki-overlay="true" style="position:absolute;top:6px;left:6px;right:6px;bottom:6px;background:#ffffff;border:1px solid #a0a0a0;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.2);padding:8px;z-index:2147483647;overflow:auto;">
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <div style="font-weight:bold;font-size:14px;">Add to Anki</div>
        <button data-md-anki-close="true" style="border:0;background:transparent;font-size:16px;cursor:pointer;">✕</button>
      </div>
      <div data-md-anki-body="true" style="margin-top:8px;font-size:12px;"></div>
    </div>
  `);
  dialog.appendChild(overlay);

  overlay.querySelector("[data-md-anki-close]").addEventListener("click", (e) => {
    e.preventDefault();
    overlay.remove();
  });

  const body = overlay.querySelector("[data-md-anki-body]");
  body.textContent = "Loading AnkiConnect data...";

  let deckNames = [];
  let modelNames = [];
  try {
    [deckNames, modelNames] = await Promise.all([anki.deckNames(), anki.modelNames()]);
  } catch (error) {
    body.textContent = `Failed to connect AnkiConnect: ${error?.message ?? "Unknown error"}`;
    return;
  }

  const stored = await loadAnkiSettings();
  const selectedDeck = stored.deckName ?? deckNames[0] ?? "";
  const selectedModel =
    stored.modelName ?? (modelNames.includes(anki.DEFAULT_MODEL_NAME) ? anki.DEFAULT_MODEL_NAME : modelNames[0] ?? "");
  const tagsValue = stored.tags ?? ANKI_DEFAULT_TAGS;

  body.innerHTML = `
    <div style="margin-bottom:8px;">
      <label style="display:block;margin-bottom:4px;">Deck</label>
      <select data-md-anki-deck style="width:100%;padding:4px;"></select>
    </div>
    <div style="margin-bottom:8px;">
      <label style="display:block;margin-bottom:4px;">Note type</label>
      <select data-md-anki-model style="width:100%;padding:4px;"></select>
      <div data-md-anki-model-actions="true" style="margin-top:4px;"></div>
    </div>
    <div style="margin-bottom:8px;">
      <label style="display:block;margin-bottom:4px;">Tags (comma or space separated)</label>
      <input data-md-anki-tags style="width:100%;padding:4px;" />
    </div>
    <div data-md-anki-fields="true" style="margin-bottom:8px;"></div>
    <div style="display:flex;gap:8px;justify-content:flex-end;">
      <button data-md-anki-add-note="true" style="padding:6px 10px;border:1px solid #2b6cb0;background:#3182ce;color:#fff;border-radius:4px;cursor:pointer;">Add</button>
    </div>
    <div data-md-anki-status="true" style="margin-top:8px;color:#444;"></div>
  `;

  const deckSelect = body.querySelector("[data-md-anki-deck]");
  const modelSelect = body.querySelector("[data-md-anki-model]");
  const tagsInput = body.querySelector("[data-md-anki-tags]");
  const fieldsArea = body.querySelector("[data-md-anki-fields]");
  const modelActions = body.querySelector("[data-md-anki-model-actions]");
  const statusArea = body.querySelector("[data-md-anki-status]");

  fillSelect(deckSelect, deckNames, selectedDeck);
  fillSelect(modelSelect, modelNames, selectedModel);
  tagsInput.value = tagsValue;

  const updateFields = async (modelName) => {
    if (!modelName) {
      fieldsArea.textContent = "No note types found.";
      return;
    }
    fieldsArea.textContent = "Loading fields...";
    const fields = await anki.modelFieldNames(modelName);
    const mapping = stored.fieldMapping?.[modelName] ?? ANKI_DEFAULT_FIELD_MAPPING;
    renderFieldMapping(fieldsArea, fields, mapping);
  };

  const updateModelActions = () => {
    modelActions.innerHTML = "";
    if (modelNames.includes(anki.DEFAULT_MODEL_NAME)) {
      return;
    }
    const createButton = dom.create(
      `<button data-md-anki-create-model="true" style="padding:4px 8px;border:1px solid #a0a0a0;background:#f8f8f8;border-radius:4px;cursor:pointer;">Create "${anki.DEFAULT_MODEL_NAME}" note type</button>`,
    );
    modelActions.appendChild(createButton);
    createButton.addEventListener("click", async (e) => {
      e.preventDefault();
      statusArea.textContent = "Creating note type...";
      try {
        await anki.createDefaultModel();
        modelNames = await anki.modelNames();
        fillSelect(modelSelect, modelNames, anki.DEFAULT_MODEL_NAME);
        await updateFields(anki.DEFAULT_MODEL_NAME);
        statusArea.textContent = `Created "${anki.DEFAULT_MODEL_NAME}".`;
      } catch (error) {
        statusArea.textContent = error?.message ?? "Failed to create note type.";
      }
      updateModelActions();
    });
  };

  await updateFields(modelSelect.value);
  updateModelActions();

  modelSelect.addEventListener("change", async () => {
    await updateFields(modelSelect.value);
    updateModelActions();
  });

  body.querySelector("[data-md-anki-add-note]").addEventListener("click", async (e) => {
    e.preventDefault();
    statusArea.textContent = "Adding...";
    const selectedModelName = modelSelect.value;
    if (!selectedModelName) {
      statusArea.textContent = "Select a note type.";
      return;
    }
    const fieldData = collectFieldValues(fieldsArea, entry);
    const tags = parseTags(tagsInput.value);
    try {
      await anki.addNote({
        deckName: deckSelect.value,
        modelName: selectedModelName,
        fields: fieldData,
        tags,
      });
      statusArea.textContent = "Added!";
      await saveAnkiSettings({
        deckName: deckSelect.value,
        modelName: selectedModelName,
        tags: tagsInput.value,
        fieldMapping: readFieldMapping(fieldsArea, selectedModelName, stored.fieldMapping),
      });
    } catch (error) {
      statusArea.textContent = error?.message ?? "Failed to add note.";
    }
  });
};

const fillSelect = (select, list, selectedValue) => {
  select.innerHTML = "";
  for (const item of list) {
    const opt = document.createElement("option");
    opt.value = item;
    opt.textContent = item;
    if (item === selectedValue) {
      opt.selected = true;
    }
    select.appendChild(opt);
  }
};

const renderFieldMapping = (container, fields, mapping) => {
  container.innerHTML = "";
  const options = [
    { value: "head", label: "Head (word)" },
    { value: "desc_html", label: "Meaning (HTML)" },
    { value: "desc_text", label: "Meaning (plain)" },
    { value: "selection", label: "Selection" },
    { value: "title", label: "Page title" },
    { value: "url", label: "URL" },
    { value: "date", label: "Date" },
    { value: "empty", label: "(empty)" },
    { value: "custom", label: "Custom..." },
  ];

  for (const fieldName of fields) {
    const fieldRow = dom.create(`
      <div data-md-anki-field-row="true" style="margin-bottom:6px;">
        <label style="display:block;margin-bottom:4px;">${escapeHtml(fieldName)}</label>
        <div style="display:flex;gap:6px;align-items:center;">
          <select data-md-anki-field="${escapeHtml(fieldName)}" style="flex:1;padding:4px;"></select>
          <input data-md-anki-custom="${escapeHtml(fieldName)}" style="flex:1;padding:4px;display:none;" />
        </div>
      </div>
    `);
    const select = fieldRow.querySelector(`[data-md-anki-field="${cssEscape(fieldName)}"]`);
    const customInput = fieldRow.querySelector(`[data-md-anki-custom="${cssEscape(fieldName)}"]`);
    for (const optItem of options) {
      const opt = document.createElement("option");
      opt.value = optItem.value;
      opt.textContent = optItem.label;
      select.appendChild(opt);
    }
    const defaultValue = mapping?.[fieldName] ?? "empty";
    select.value = defaultValue;
    customInput.style.display = select.value === "custom" ? "block" : "none";
    select.addEventListener("change", () => {
      customInput.style.display = select.value === "custom" ? "block" : "none";
    });
    container.appendChild(fieldRow);
  }
};

const collectFieldValues = (container, entry) => {
  const result = {};
  const rows = container.querySelectorAll("[data-md-anki-field-row]");
  const descHtml = entry?.desc ?? "";
  const descText = htmlToText(descHtml);
  const selection = entry?.selection ?? "";
  const nowDate = new Date().toISOString().slice(0, 10);
  const sourceTitle = document.title ?? "";
  const url = location.href ?? "";

  rows.forEach((row) => {
    const select = row.querySelector("select");
    const fieldName = select.dataset.mdAnkiField;
    const customInput = row.querySelector("input");
    const value = resolveFieldValue(select.value, customInput.value, {
      head: entry?.head ?? "",
      descHtml,
      descText,
      selection,
      title: sourceTitle,
      url,
      date: nowDate,
    });
    result[fieldName] = value;
  });

  return result;
};

const readFieldMapping = (container, modelName, existingMapping = {}) => {
  const mapping = { ...existingMapping };
  mapping[modelName] = {};
  const rows = container.querySelectorAll("[data-md-anki-field-row]");
  rows.forEach((row) => {
    const select = row.querySelector("select");
    const fieldName = select.dataset.mdAnkiField;
    mapping[modelName][fieldName] = select.value;
  });
  return mapping;
};

const resolveFieldValue = (source, customValue, context) => {
  switch (source) {
    case "head":
      return context.head;
    case "desc_html":
      return context.descHtml;
    case "desc_text":
      return context.descText;
    case "selection":
      return context.selection;
    case "title":
      return context.title;
    case "url":
      return context.url;
    case "date":
      return context.date;
    case "custom":
      return customValue ?? "";
    case "empty":
    default:
      return "";
  }
};

const parseTags = (value) =>
  (value ?? "")
    .split(/[\s,]+/)
    .map((v) => v.trim())
    .filter(Boolean);

const loadAnkiSettings = async () => {
  const data = await chrome.storage.local.get(ANKI_STORAGE_KEY);
  return data?.[ANKI_STORAGE_KEY] ?? {};
};

const saveAnkiSettings = (settings) => chrome.storage.local.set({ [ANKI_STORAGE_KEY]: settings });

const htmlToText = (html) => {
  const temp = document.createElement("div");
  temp.innerHTML = html ?? "";
  return temp.textContent ?? "";
};

const escapeHtml = (str) =>
  (str ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));

const cssEscape = (str) =>
  (globalThis.CSS && CSS.escape ? CSS.escape(str) : (str ?? "").replace(/["\\]/g, "\\$&"));

const createSnapGuideElement = () => {
  const guideElement = dom.create("<div>Shift+Move: Smart-snap</div");
  dom.applyStyles(guideElement, {
    right: "0px",
    top: "0px",
    position: "absolute",
    color: "#FFFFFF",
    backgroundColor: "#4169e1",
    fontSize: "small",
    opacity: "0.90",
    margin: "4px",
    padding: "3px",
    borderRadius: "5px 5px 5px 5px",
  });
  return guideElement;
};

export default { attach };
