/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React from "react";
import { res } from "../../logic";
import { ExternalLink } from "../atom/ExternalLink";

export const Tips: React.FC = () => {
  return (
    <>
      <ExternalLink href="https://github.com/wtetsu/mouse-dictionary/wiki/Download-dictionary-data" icon={true}>
        {res.get("downloadDictData")}
      </ExternalLink>
      <br />
      <ExternalLink href="https://github.com/wtetsu/mouse-dictionary/wiki/Keyboard-shortcuts" icon={true}>
        {res.get("setKeyboardShortcuts")}
      </ExternalLink>
      <br />
      <ExternalLink href="pdf/web/viewer.html">{res.get("openPdfViewer")}</ExternalLink>
    </>
  );
};
