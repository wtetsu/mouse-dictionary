/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import anki from "../lib/anki";
import dom from "../lib/dom";
import Draggable from "../lib/draggable";
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
const ANKI_OVERLAY_NORMAL_STYLES = {
  opacity: 1,
};
const ANKI_OVERLAY_MOVING_STYLES = {
  opacity: 0.9,
};
const ANKI_DEFAULT_FIELD_MAPPING = {
  Expression: "head",
  Meaning: "meaning",
  Synonyms: "synonyms",
  Notes: "notes",
  Pronunciation: "pronunciation",
  Etymology: "etymology",
  Inflection: "inflection",
  InflectionEn: "inflectionEn",
  Syllables: "syllables",
  Examples: "examples",
  ExamplesEn: "examplesEn",
  Url: "url",
};

const attach = async (settings, dialog, doUpdateContent) => {
  let enableDefault = true;
  let lastSelectionText = "";
  let ankiDialogOpen = false;
  let ankiDraggable = null;

  const traverse = traverser.build(rule.doLetters, settings.parseWordsLimit);
  const lookuper = new Lookuper(settings, entryDefault(), doUpdateContent);

  const draggable = new Draggable(settings.normalDialogStyles, settings.movingDialogStyles);
  draggable.events.change = (e) => config.savePosition(e);
  draggable.add(dialog);

  setDialogEvents(dialog);
  const shiftWheel = createShiftWheelHandler(dialog);

  document.body.addEventListener("mousedown", () => {
    lookuper.suspended = true;
  });

  document.body.addEventListener("mouseup", async (e) => {
    if (ankiDialogOpen) {
      ankiDraggable?.onMouseUp(e);
      return;
    }
    if (isOverlayTarget(e.target)) {
      return;
    }
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
    if (ankiDialogOpen) {
      ankiDraggable?.onMouseMove(e);
      return;
    }
    // Wait until rule loading finish
    await rule.load();

    onMouseMove = onMouseMoveSecondOrLater;
    onMouseMove(e);
  };

  const onMouseMoveSecondOrLater = async (e) => {
    if (ankiDialogOpen) {
      ankiDraggable?.onMouseMove(e);
      return;
    }
    draggable.onMouseMove(e);
    if (!enableDefault || isOverlayTarget(e.target)) {
      return;
    }

    const textList = traverse(e.target, e.clientX, e.clientY);
    const updated = await lookuper.lookupAll(textList);
    if (updated) {
      draggable.resetScroll();
    }
  };
  let onMouseMove = onMouseMoveFirst;
  document.body.addEventListener("mousemove", (e) => onMouseMove(e));

  document.body.addEventListener("keydown", (e) => {
    if (e.key === "Shift") {
      enableDefault = false;
      draggable.activateSnap(e);
      ankiDraggable?.activateSnap(e);
      setDialogLocked(dialog, true);
      shiftWheel.activate();
    }
  });

  document.body.addEventListener("keyup", (e) => {
    if (e.key === "Shift") {
      draggable.deactivateSnap(e);
      ankiDraggable?.deactivateSnap(e);
      enableDefault = true;
      setDialogLocked(dialog, false);
      shiftWheel.deactivate();
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
    openAnkiDialog(
      dialog,
      {
        head,
        desc,
        selection: lastSelectionText,
      },
      (open, _overlay, overlayDraggable) => {
        ankiDialogOpen = open;
        ankiDraggable = overlayDraggable;
      },
    );
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
    for (const elem of e.target.querySelectorAll("[data-md-skell]")) {
      if (elem.dataset.mdSkellSet) {
        continue;
      }
      const entry = elem.closest("[data-md-entry]");
      const head = entry?.dataset?.mdHead ?? "";
      if (head) {
        elem.setAttribute(
          "href",
          `https://skell.sketchengine.eu/#result?f=wordsketch&lang=en&query=${encodeURIComponent(head)}`,
        );
      }
      elem.dataset.mdSkellSet = "true";
    }
    for (const elem of e.target.querySelectorAll("[data-md-youglish]")) {
      if (elem.dataset.mdYouglishSet) {
        continue;
      }
      const entry = elem.closest("[data-md-entry]");
      const head = entry?.dataset?.mdHead ?? "";
      if (head) {
        elem.setAttribute(
          "href",
          `https://youglish.com/pronounce/${encodeURIComponent(head)}/english`,
        );
      }
      elem.dataset.mdYouglishSet = "true";
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

const setDialogLocked = (dialog, locked) => {
  if (locked) {
    dialog.dataset.mdLocked = "true";
    dialog.style.outline = "2px solid #2f7a4a";
    dialog.style.boxShadow = "0 0 0 3px rgba(47, 122, 74, 0.25)";
  } else {
    delete dialog.dataset.mdLocked;
    dialog.style.outline = "";
    dialog.style.boxShadow = "";
  }
};

const createShiftWheelHandler = (dialog) => {
  const onShiftWheel = (e) => {
    if (!e.shiftKey) {
      return;
    }
    dialog.scrollTop += e.deltaY;
    e.preventDefault();
  };
  let active = false;
  return {
    activate: () => {
      if (active) return;
      window.addEventListener("wheel", onShiftWheel, { passive: false, capture: true });
      active = true;
    },
    deactivate: () => {
      if (!active) return;
      window.removeEventListener("wheel", onShiftWheel, { capture: true });
      active = false;
    },
  };
};

const isOverlayTarget = (target) => {
  const overlay = document.querySelector("[data-md-anki-overlay]");
  return overlay?.contains(target);
};

const openAnkiDialog = async (dialog, entry, setOpen) => {
  const existing = document.querySelector("[data-md-anki-overlay]");
  if (existing) {
    existing.remove();
  }

  const overlay = dom.create(`
    <div data-md-anki-overlay="true" style="position:fixed;background:#f0fff4;border:1px solid #9cc2a4;border-radius:8px;box-shadow:0 6px 18px rgba(10,40,20,0.22);padding:10px;z-index:2147483647;overflow:auto;scrollbar-width:none;-ms-overflow-style:none;font-family:'hiragino kaku gothic pro', meiryo, sans-serif;color:#0f1f12;">
      <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #cbe4d1;padding-bottom:6px;">
        <div style="font-weight:bold;font-size:14px;color:#12351b;">Add to Anki</div>
        <button data-md-anki-close="true" style="border:0;background:transparent;font-size:16px;cursor:pointer;color:#12351b;">✕</button>
      </div>
      <div data-md-anki-body="true" style="margin-top:8px;font-size:12px;"></div>
    </div>
  `);
  document.body.appendChild(overlay);
  const scrollbarStyle = document.createElement("style");
  scrollbarStyle.textContent = `
    * { box-sizing: border-box; }
    *::-webkit-scrollbar { display: none; }
  `;
  overlay.appendChild(scrollbarStyle);
  placeOverlayNextToDialog(overlay, dialog);
  const stopClick = (e) => e.stopPropagation();
  overlay.addEventListener("click", stopClick);
  overlay.addEventListener(
    "mousedown",
    (e) => {
      if (isFormControl(e.target)) {
        e.stopPropagation();
      }
    },
    true,
  );

  const overlayDraggable = new Draggable(ANKI_OVERLAY_NORMAL_STYLES, ANKI_OVERLAY_MOVING_STYLES);
  overlayDraggable.add(overlay);
  setOpen?.(true, overlay, overlayDraggable);

  overlay.querySelector("[data-md-anki-close]").addEventListener("click", (e) => {
    e.preventDefault();
    overlay.remove();
    setOpen?.(false, null, null);
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
    stored.modelName ??
    (modelNames.includes(anki.DEFAULT_MODEL_NAME) ? anki.DEFAULT_MODEL_NAME : (modelNames[0] ?? ""));
  const tagsValue = stored.tags ?? ANKI_DEFAULT_TAGS;

  const parsedEntry = parseEntryDetails(htmlToTextPreserveBreaks(entry?.desc ?? ""));

  body.innerHTML = `
    <div style="margin-bottom:8px;">
      <label style="display:block;margin-bottom:4px;color:#12351b;">Deck</label>
      <select data-md-anki-deck style="width:100%;padding:6px;border:1px solid #9cc2a4;border-radius:6px;background:#ffffff;color:#0f1f12;"></select>
    </div>
    <div style="margin-bottom:8px;">
      <label style="display:block;margin-bottom:4px;color:#12351b;">Note type</label>
      <select data-md-anki-model style="width:100%;padding:6px;border:1px solid #9cc2a4;border-radius:6px;background:#ffffff;color:#0f1f12;"></select>
      <div data-md-anki-model-actions="true" style="margin-top:4px;"></div>
    </div>
    <div style="margin-bottom:8px;">
      <label style="display:block;margin-bottom:4px;color:#12351b;">Tags (comma or space separated)</label>
      <input data-md-anki-tags style="width:100%;padding:6px;border:1px solid #9cc2a4;border-radius:6px;background:#ffffff;color:#0f1f12;" />
    </div>
    <div data-md-anki-fields="true" style="margin-bottom:8px;"></div>
    <div style="display:flex;gap:8px;justify-content:flex-end;">
      <button data-md-anki-edit="true" style="padding:6px 12px;border:1px solid #7ea488;background:#dff3e3;color:#12351b;border-radius:6px;cursor:pointer;">Edit</button>
      <button data-md-anki-add-note="true" style="padding:6px 12px;border:1px solid #1e5f3a;background:#2f7a4a;color:#ffffff;border-radius:6px;cursor:pointer;">Add</button>
    </div>
    <div data-md-anki-status="true" style="margin-top:8px;color:#12351b;"></div>
  `;

  const deckSelect = body.querySelector("[data-md-anki-deck]");
  const modelSelect = body.querySelector("[data-md-anki-model]");
  const tagsInput = body.querySelector("[data-md-anki-tags]");
  const fieldsArea = body.querySelector("[data-md-anki-fields]");
  const modelActions = body.querySelector("[data-md-anki-model-actions]");
  const statusArea = body.querySelector("[data-md-anki-status]");
  const editButton = body.querySelector("[data-md-anki-edit]");
  let isEditing = false;

  fillSelect(deckSelect, deckNames, selectedDeck);
  fillSelect(modelSelect, modelNames, selectedModel);
  const mergedTagValue = mergeTags(tagsValue, parsedEntry.tags);
  tagsInput.value = mergedTagValue;
  setEditingState(body, isEditing);

  const updateFields = async (modelName) => {
    if (!modelName) {
      fieldsArea.textContent = "No note types found.";
      return;
    }
    fieldsArea.textContent = "Loading fields...";
    const fields = await anki.modelFieldNames(modelName);
    const mapping = ANKI_DEFAULT_FIELD_MAPPING;
    renderFieldInputs(fieldsArea, fields, mapping, entry, parsedEntry, isEditing);
    setEditingState(body, isEditing);
  };

  const updateModelActions = () => {
    modelActions.innerHTML = "";
    if (modelNames.includes(anki.DEFAULT_MODEL_NAME)) {
      const updateButton = dom.create(
        `<button data-md-anki-update-model="true" style="padding:4px 8px;border:1px solid #7ea488;background:#dff3e3;border-radius:4px;cursor:pointer;color:#12351b;">Update "${anki.DEFAULT_MODEL_NAME}" templates</button>`,
      );
      modelActions.appendChild(updateButton);
      updateButton.addEventListener("click", async (e) => {
        e.preventDefault();
        if (modelSelect.value !== anki.DEFAULT_MODEL_NAME) {
          statusArea.textContent = `Select "${anki.DEFAULT_MODEL_NAME}" to update templates.`;
          return;
        }
        const ok = confirm(
          `Update "${anki.DEFAULT_MODEL_NAME}" templates and CSS to the latest version?\\nExisting notes will not be deleted.`,
        );
        if (!ok) {
          return;
        }
        statusArea.textContent = "Updating templates...";
        try {
          await anki.updateDefaultModel();
          statusArea.textContent = `Updated "${anki.DEFAULT_MODEL_NAME}".`;
        } catch (error) {
          statusArea.textContent = error?.message ?? "Failed to update templates.";
        }
      });
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
    const extraTags = parseTags(tagsInput.value);
    const autoTags = parsedEntry.tags ?? [];
    const tags = dedupe([...extraTags, ...autoTags]);
    try {
      await anki.addNote({
        deckName: deckSelect.value,
        modelName: selectedModelName,
        fields: fieldData,
        tags,
      });
      statusArea.textContent = "Added!";
      const userTags = removeAutoTags(extraTags).join(" ");
      await saveAnkiSettings({
        deckName: deckSelect.value,
        modelName: selectedModelName,
        tags: userTags,
      });
      overlay.remove();
      setOpen?.(false, null, null);
    } catch (error) {
      statusArea.textContent = error?.message ?? "Failed to add note.";
    }
  });

  editButton.addEventListener("click", (e) => {
    e.preventDefault();
    isEditing = !isEditing;
    setEditingState(body, isEditing);
    editButton.dataset.mdEditing = isEditing.toString();
    editButton.textContent = isEditing ? "Lock" : "Edit";
  });
};

const setEditingState = (container, enabled) => {
  const textInputs = container.querySelectorAll("textarea, input");
  textInputs.forEach((input) => {
    if (input.type === "checkbox" || input.type === "radio") {
      return;
    }
    input.disabled = !enabled;
    input.readOnly = !enabled;
    if (enabled) {
      input.style.background = "#ffffff";
      input.style.color = "#0f1f12";
      input.style.cursor = "text";
      input.style.borderColor = "#9cc2a4";
    } else {
      input.style.background = "#e6f4ea";
      input.style.color = "#6b7d71";
      input.style.cursor = "not-allowed";
      input.style.borderColor = "#c1d5c7";
    }
  });
};

const isFormControl = (target) => {
  const elem = target?.closest?.("input, textarea, select, button, option, label");
  return Boolean(elem);
};

const mergeTags = (storedTags, autoTags = []) => {
  return dedupe([...parseTags(storedTags), ...autoTags]).join(" ");
};

const placeOverlayNextToDialog = (overlay, dialog) => {
  const dialogRect = dialog.getBoundingClientRect();
  const overlayWidth = Math.min(420, Math.max(320, dialogRect.width));
  const overlayHeight = Math.min(window.innerHeight - 20, Math.max(260, dialogRect.height));

  let left = dialogRect.right + 10;
  let top = dialogRect.top;

  if (left + overlayWidth > window.innerWidth - 10) {
    left = dialogRect.left - overlayWidth - 10;
  }
  if (left < 10) {
    left = 10;
  }
  if (top + overlayHeight > window.innerHeight - 10) {
    top = Math.max(10, window.innerHeight - overlayHeight - 10);
  }

  dom.applyStyles(overlay, {
    left: `${Math.round(left)}px`,
    top: `${Math.round(top)}px`,
    width: `${Math.round(overlayWidth)}px`,
    height: `${Math.round(overlayHeight)}px`,
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

const renderFieldInputs = (container, fields, mapping, entry, parsedEntry, editable) => {
  container.innerHTML = "";
  const defaults = {
    head: entry?.head ?? "",
    meaning: parsedEntry.meaning,
    synonyms: parsedEntry.synonyms,
    notes: parsedEntry.notes,
    pronunciation: parsedEntry.pronunciation,
    etymology: parsedEntry.etymology,
    inflection: parsedEntry.inflection,
    inflectionEn: parsedEntry.inflectionEn,
    syllables: parsedEntry.syllables,
    examples: parsedEntry.examples,
    examplesEn: parsedEntry.examplesEn,
    url: location.href ?? "",
  };
  const singleLineFields = new Set(["Expression", "Pronunciation", "Inflection", "InflectionEn", "Syllables"]);
  for (const fieldName of fields) {
    const isSingleLine = singleLineFields.has(fieldName);
    const fieldRow = dom.create(`
      <div data-md-anki-field-row="true" style="margin-bottom:6px;">
        <label style="display:block;margin-bottom:4px;color:#12351b;">${escapeHtml(fieldName)}</label>
        ${
          isSingleLine
            ? `<input data-md-anki-field="${escapeHtml(fieldName)}" style="width:100%;padding:6px;border:1px solid #9cc2a4;border-radius:6px;background:#ffffff;color:#0f1f12;" />`
            : `<textarea data-md-anki-field="${escapeHtml(fieldName)}" style="width:100%;padding:6px;min-height:60px;border:1px solid #9cc2a4;border-radius:6px;background:#ffffff;color:#0f1f12;"></textarea>`
        }
      </div>
    `);
    const textarea = fieldRow.querySelector(`[data-md-anki-field="${cssEscape(fieldName)}"]`);
    const key = mapping?.[fieldName];
    textarea.value = defaults[key] ?? "";
    textarea.disabled = !editable;
    textarea.readOnly = !editable;
    container.appendChild(fieldRow);
  }
};

const collectFieldValues = (container, _entry) => {
  const result = {};
  const rows = container.querySelectorAll("[data-md-anki-field-row]");

  rows.forEach((row) => {
    const input = row.querySelector("textarea, input");
    if (!input) {
      return;
    }
    const fieldName = input.dataset.mdAnkiField;
    result[fieldName] = input.value ?? "";
  });

  return result;
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

const htmlToTextPreserveBreaks = (html) => {
  const temp = document.createElement("div");
  temp.innerHTML = (html ?? "").replace(/<br\s*\/?>/gi, "\n");
  return temp.textContent ?? "";
};

const parseEntryDetails = (descText) => {
  let text = normalizeText(descText);

  const synonyms = [];

  const { text: textAfterSynTags, values: synTagValues } = extractInlineTag(text, ["類", "同"]);
  text = textAfterSynTags;
  synonyms.push(...synTagValues);

  const { text: textAfterPron, value: pronunciationRaw } = extractSingleTag(text, "発音");
  text = textAfterPron;
  const { text: textAfterKana, value: kanaPronunciation } = extractSingleTag(text, "＠");
  text = textAfterKana;
  const { text: textAfterEty, value: etymology } = extractSingleTag(text, "語源");
  text = textAfterEty;
  const { text: textAfterInf, value: inflection } = extractSingleTag(text, "変化");
  text = textAfterInf;
  const { text: textAfterSyl, value: syllables } = extractSingleTag(text, "分節");
  text = textAfterSyl;

  const levelTag = extractLevelTag(text);
  text = levelTag.text;
  const tags = [];
  if (levelTag.value) {
    const levelValues = extractLevelValues(levelTag.value);
    for (const levelValue of levelValues) {
      tags.push(`level-${levelValue}`);
    }
  }

  const examples = [];
  const notesParts = [];

  const skipTags = ["類", "同", "発音", "＠", "語源", "変化", "分節"];
  const lines = (text ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  let currentSense = "";
  const meaningLines = [];

  for (const line of lines) {
    let working = line;
    const senseMatch = working.match(/^\s*(\{[^}]+\})/);
    if (senseMatch?.[1]) {
      currentSense = senseMatch[1].trim();
    }
    const lineRefs = extractAll(working, /<→([^>]+)>/g);
    if (lineRefs.length > 0) {
      synonyms.push(...lineRefs);
      working = working.replace(/＝?<→[^>]+>/g, "");
    }

    const addNote = (value) => {
      const trimmed = (value ?? "").trim();
      if (!trimmed) return;
      notesParts.push(currentSense ? `${currentSense} ${trimmed}` : trimmed);
    };

    const addExample = (value) => {
      const trimmed = (value ?? "").trim();
      if (!trimmed) return;
      examples.push(currentSense ? `${currentSense} ${trimmed}` : trimmed);
    };

    // Extract bracket tags (other than skipTags) and remove them from the line
    const bracketRe = /【([^】]+)】([^【◆]*)/g;
    let match = null;
    while (true) {
      match = bracketRe.exec(working);
      if (!match) {
        break;
      }
      const tag = match?.[1];
      if (!tag || skipTags.includes(tag)) {
        continue;
      }
      addNote(`【${tag}】${(match?.[2] ?? "").trim()}`.trim());
    }
    working = working.replace(/【[^】]+】[^【◆]*/g, "");

    // Extract examples marked by ■
    if (working.includes("■")) {
      const parts = working.split("■");
      working = parts.shift()?.trim() ?? "";
      for (const part of parts) {
        const example = part.replace(/^・?/, "").trim();
        if (example) {
          addExample(example);
        }
      }
    }

    // Split notes after ◆ but keep "◆＝" inside meaning
    if (working.includes("◆")) {
      const parts = working.split("◆");
      working = parts.shift()?.trim() ?? "";
      for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed) continue;
        if (trimmed.startsWith("＝")) {
          working = `${working} ◆ ${trimmed}`.trim();
          continue;
        }
        addNote(trimmed);
      }
    }

    if (working.length > 0) {
      if (lineRefs.length > 0) {
        if (/^\s*\{[^}]+\}\s*:\s*$/.test(working)) {
          working = `${working} ${lineRefs.join(", ")}`.trim();
        } else if (!working.trim()) {
          working = lineRefs.join(", ");
        }
      }
      meaningLines.push(working);
    }
  }

  const meaning = normalizeLines(meaningLines.join("\n"));
  let notes = normalizeNotes(notesParts);
  const { notes: cleanedNotes, examples: labeledExamples } = extractLabeledExamplesFromNotes(notes);
  notes = cleanedNotes;
  if (labeledExamples.length > 0) {
    examples.push(...labeledExamples);
  }

  const examplesEn = extractEnglishOnlyFromList(examples);
  const inflectionEn = extractEnglishOnlyFromText(inflection);

  return {
    meaning: trimTrailingPunctuation(meaning),
    synonyms: trimTrailingPunctuation(dedupe(synonyms).join(", ")),
    pronunciation: trimTrailingPunctuation(joinParts(pronunciationRaw, kanaPronunciation)),
    etymology: trimTrailingPunctuation(etymology),
    inflection: trimTrailingPunctuation(inflection),
    inflectionEn,
    syllables: trimTrailingPunctuation(syllables),
    examples: formatExamples(dedupe(examples)),
    examplesEn,
    notes: trimTrailingPunctuation(notes),
    tags,
  };
};

const extractAll = (text, re) => {
  const values = [];
  for (const match of text.matchAll(re)) {
    if (match?.[1]) {
      values.push(match[1].trim());
    }
  }
  return values;
};

const extractInlineTag = (text, tags) => {
  const values = [];
  let next = text;
  for (const tag of tags) {
    const re = new RegExp(`【${tag}】([^【◆\\n]+)`, "g");
    for (const match of next.matchAll(re)) {
      if (match?.[1]) {
        values.push(match[1].trim());
      }
    }
    next = next.replace(re, "");
  }
  return { text: next, values };
};

const extractSingleTag = (text, tag) => {
  const re = new RegExp(`【${tag}】([^【◆\\n]+)`, "g");
  const values = [];
  for (const match of text.matchAll(re)) {
    if (match?.[1]) {
      values.push(match[1].trim());
    }
  }
  return {
    text: text.replace(re, ""),
    value: values.join(" / "),
  };
};

const joinParts = (...parts) =>
  parts
    .map((part) => (part ?? "").trim())
    .filter((part) => part.length > 0)
    .join(" / ");

const extractLevelTag = (text) => {
  const re = /【レベル】([^【◆\n]+)/g;
  const values = [];
  for (const match of text.matchAll(re)) {
    if (match?.[1]) {
      values.push(match[1].trim());
    }
  }
  return { text: text.replace(re, ""), value: values.join(" / ") };
};

const extractLevelValues = (value) => {
  const cleaned = (value ?? "").replace(/[、。]/g, " ").trim();
  const matches = cleaned.match(/\d+/g);
  if (!matches) {
    return [];
  }
  return matches.map((v) => v.trim()).filter(Boolean);
};

const normalizeText = (text) =>
  (text ?? "")
    .replace(/、[ \t]*/g, "、")
    .replace(/[ \t]+/g, " ")
    .replace(/\r/g, "");

const normalizeLines = (text) =>
  (text ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map(trimTrailingPunctuation)
    .join("\n");

const normalizeNotes = (parts) =>
  parts
    .map((part) => (part ?? "").trim())
    .filter((part) => part.length > 0)
    .map(trimTrailingPunctuation)
    .join(" / ");

const dedupe = (list) => Array.from(new Set(list.filter(Boolean)));

const trimTrailingPunctuation = (value) => (value ?? "").replace(/[、。]+$/g, "").trim();

const removeAutoTags = (tags) => tags.filter((tag) => !/^level-\d+$/i.test(tag));

const extractLabeledExamplesFromNotes = (notes) => {
  if (!notes) {
    return { notes: "", examples: [] };
  }
  const parts = notes
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
  const examples = [];
  const kept = [];
  for (const part of parts) {
    if (part.startsWith("例:")) {
      const example = part.replace(/^例:\s*/, "").trim();
      if (example) {
        examples.push(example);
      }
    } else if (part.includes("例:")) {
      const idx = part.indexOf("例:");
      const head = part.slice(0, idx).trim();
      const tail = part.slice(idx + 2).trim();
      if (head) {
        kept.push(head);
      }
      if (tail) {
        examples.push(tail);
      }
    } else {
      kept.push(part);
    }
  }
  return { notes: kept.join(" / "), examples };
};

const formatExamples = (list) => {
  const cleaned = list.map((item) => trimTrailingPunctuation(item)).filter(Boolean);
  if (cleaned.length === 0) {
    return "";
  }
  if (cleaned.length === 1) {
    return cleaned[0];
  }
  return cleaned.map((item, index) => `${index + 1}. ${item}`).join("\n");
};

const extractEnglishOnlyFromList = (list) => {
  if (!list || list.length === 0) {
    return "";
  }
  const results = [];
  for (const item of list) {
    const cleaned = extractEnglishOnlyFromText(item);
    if (cleaned) {
      results.push(cleaned);
    }
  }
  return results.join("\n");
};

const extractEnglishOnlyFromText = (text) => {
  if (!text) {
    return "";
  }
  const withoutSense = text.replace(/^\{[^}]+\}\s*/, "");
  const withoutNumber = withoutSense.replace(/^\d+\.\s*/, "");
  const asciiOnly = withoutNumber.replace(/[^\x20-\x7E]/g, "").trim();
  if (!/[A-Za-z]/.test(asciiOnly)) {
    return "";
  }
  return asciiOnly;
};

const escapeHtml = (str) =>
  (str ?? "").replace(
    /[&<>"']/g,
    (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch],
  );

const cssEscape = (str) => (globalThis.CSS && CSS.escape ? CSS.escape(str) : (str ?? "").replace(/["\\]/g, "\\$&"));

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
