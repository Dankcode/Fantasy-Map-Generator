"use client";

import {useCallback, useRef, useState} from "react";

const FMG_SRC = "/fmg/index.html?seed=424242&width=640&height=360&options=default";

type LegacyTab = "layersTab" | "styleTab" | "optionsTab" | "toolsTab";
type LegacyButton =
  | "editHeightmapButton"
  | "editBiomesButton"
  | "editStatesButton"
  | "editCulturesButton"
  | "editProvincesButton";

export function FmgLauncher() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("Loading original generator");

  const withLegacyDocument = useCallback((callback: (document: Document, win: Window) => void) => {
    const frame = iframeRef.current;
    const document = frame?.contentDocument;
    const win = frame?.contentWindow;
    if (!document || !win) {
      setStatus("Map frame is not ready yet");
      return;
    }
    callback(document, win);
  }, []);

  const openLegacyTab = useCallback(
    (tabId: LegacyTab) => {
      withLegacyDocument(document => {
        const options = document.getElementById("options");
        const trigger = document.getElementById("optionsTrigger") as HTMLButtonElement | null;
        if (options?.style.display === "none") trigger?.click();
        (document.getElementById(tabId) as HTMLButtonElement | null)?.click();
        setStatus(`Opened ${tabId.replace("Tab", "").toLowerCase()} panel`);
      });
    },
    [withLegacyDocument]
  );

  const clickLegacyButton = useCallback(
    (buttonId: LegacyButton, nextStatus: string) => {
      withLegacyDocument(document => {
        const options = document.getElementById("options");
        const trigger = document.getElementById("optionsTrigger") as HTMLButtonElement | null;
        if (options?.style.display === "none") trigger?.click();
        (document.getElementById("toolsTab") as HTMLButtonElement | null)?.click();
        (document.getElementById(buttonId) as HTMLButtonElement | null)?.click();
        setStatus(nextStatus);
      });
    },
    [withLegacyDocument]
  );

  const openMapEditor = useCallback(() => {
    clickLegacyButton("editHeightmapButton", "Opened map editor");
  }, [clickLegacyButton]);

  const regenerate = useCallback(() => {
    withLegacyDocument((_document, win) => {
      const maybeWindow = win as Window & {regeneratePrompt?: () => void};
      if (typeof maybeWindow.regeneratePrompt === "function") maybeWindow.regeneratePrompt();
      else setReloadKey(key => key + 1);
      setStatus("Generation command sent");
    });
  }, [withLegacyDocument]);

  const reloadMap = useCallback(() => {
    setReady(false);
    setStatus("Reloading original generator");
    setReloadKey(key => key + 1);
  }, []);

  const exportGameFiles = useCallback(() => {
    withLegacyDocument((_document, win) => {
      const legacyWindow = win as Window & {
        lazy?: {exportMap?: () => Promise<{exportGameMapFiles?: () => Promise<void>}>};
      };
      legacyWindow.lazy
        ?.exportMap?.()
        .then(module => module.exportGameMapFiles?.())
        .then(() => setStatus("Game export started"))
        .catch(() => setStatus("Game export failed"));
    });
  }, [withLegacyDocument]);

  return (
    <main className="next-shell">
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true">
          FMG
        </div>
        <h1>World Topology</h1>
        <div className="topbar-actions">
          <button type="button" onClick={reloadMap}>
            Reload
          </button>
          <button type="button" onClick={openMapEditor}>
            Map Editor
          </button>
          <button type="button" onClick={regenerate}>
            New Map
          </button>
          <button type="button" onClick={exportGameFiles}>
            Export Game Files
          </button>
        </div>
      </header>

      <aside className="tool-rail" aria-label="Map panel shortcuts">
        <button type="button" onClick={() => openLegacyTab("layersTab")} title="Layers">
          L
        </button>
        <button type="button" onClick={() => openLegacyTab("styleTab")} title="Style">
          S
        </button>
        <button type="button" onClick={() => openLegacyTab("optionsTab")} title="Options">
          O
        </button>
        <button type="button" onClick={() => openLegacyTab("toolsTab")} title="Tools">
          T
        </button>
      </aside>

      <section className="map-frame" aria-label="Original Fantasy Map Generator">
        <iframe
          key={reloadKey}
          ref={iframeRef}
          src={FMG_SRC}
          title="Azgaar's Fantasy Map Generator"
          onLoad={() => {
            setReady(true);
            setStatus("Original generator ready");
          }}
        />
      </section>

      <aside className="concept-panel" aria-label="Generator navigation">
        <div className="panel-title">
          <div>
            <span className="panel-kicker">Launcher</span>
            <h2>World Topology</h2>
          </div>
          <span className={ready ? "status-dot ready" : "status-dot"} />
        </div>
        <button className="primary-action" type="button" onClick={() => openLegacyTab("optionsTab")}>
          Open Generator Options
          <span aria-hidden="true">→</span>
        </button>
        <button className="primary-action editor-action" type="button" onClick={openMapEditor}>
          Open Map Editor
          <span aria-hidden="true">→</span>
        </button>
        <div className="panel-tabs" aria-label="Original menu tabs">
          <button type="button" onClick={() => openLegacyTab("layersTab")}>
            Layers
          </button>
          <button type="button" onClick={() => openLegacyTab("styleTab")}>
            Style
          </button>
          <button type="button" onClick={() => openLegacyTab("optionsTab")}>
            Options
          </button>
          <button type="button" onClick={() => openLegacyTab("toolsTab")}>
            Tools
          </button>
        </div>
        <div className="control-group">
          <label>
            Editor
            <button type="button" onClick={openMapEditor}>
              Heightmap editor
            </button>
          </label>
          <label>
            Seed
            <button type="button" onClick={() => openLegacyTab("optionsTab")}>
              Edit in original panel
            </button>
          </label>
          <label>
            Land
            <button type="button" onClick={() => openLegacyTab("styleTab")}>
              Style presets
            </button>
          </label>
          <label>
            Climate
            <button type="button" onClick={() => openLegacyTab("layersTab")}>
              Biomes layer
            </button>
          </label>
          <label>
            Population
            <button type="button" onClick={() => openLegacyTab("toolsTab")}>
              Burgs tools
            </button>
          </label>
        </div>
        <div className="action-row">
          <button type="button" onClick={regenerate}>
            Re-generate
          </button>
          <button type="button" onClick={exportGameFiles}>
            Export
          </button>
          <button type="button" onClick={reloadMap}>
            Revert
          </button>
        </div>
        <p className="panel-status">{status}</p>
      </aside>
    </main>
  );
}
