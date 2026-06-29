import type { Selection } from "d3";
import { select } from "d3";
import { connectVertices, ensureEl, getBase64, getCoordinates, getGridPolygon, rn, unique } from "@/utils";
import { createVibeGameTownLayout } from "./vibe-game-town-generator";

type MapSelection = Selection<SVGSVGElement, unknown, null, undefined>;

// project canvas coordinates to geographic [lon, lat], rounded to 4 decimals
const toGeoCoordinates = (x: number, y: number) => getCoordinates(x, y, mapCoordinates, graphWidth, graphHeight, 4);

export interface GetMapURLOptions {
  debug?: boolean;
  noLabels?: boolean;
  noWater?: boolean;
  noScaleBar?: boolean;
  noIce?: boolean;
  noVignette?: boolean;
  fullMap?: boolean;
  noViewbox?: boolean; // accepted by some callers (view-3d); currently unused here
}

export async function exportToSvg(): Promise<void> {
  TIME && console.time("exportToSvg");
  try {
    const url = await getMapURL("svg", { fullMap: true });
    const link = document.createElement("a");
    link.download = `${getFileName()}.svg`;
    link.href = url;
    link.click();

    const message = `${link.download} is saved. Open 'Downloads' screen (CTRL + J) to check`;
    tip(message, true, "success", 5000);
  } catch (error) {
    ERROR && console.error(error);
    tip(`SVG export failed: ${(error as Error)?.message || "Unknown error"}`, true, "error", 5000);
  } finally {
    TIME && console.timeEnd("exportToSvg");
  }
}

export async function exportToPng(): Promise<void> {
  TIME && console.time("exportToPng");
  try {
    const url = await getMapURL("png");
    const resolution = ensureEl<HTMLInputElement>("pngResolutionInput").valueAsNumber;
    const link = document.createElement("a");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = svgWidth * resolution;
    canvas.height = svgHeight * resolution;

    const blob = await new Promise<Blob>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
          if (!blob) return reject(new Error("Cannot render PNG image"));
          resolve(blob);
        }, "image/png");
      };
      img.onerror = () => reject(new Error("Cannot load map image for PNG export"));
      img.src = url;
    });

    link.download = `${getFileName()}.png`;
    link.href = window.URL.createObjectURL(blob);
    link.click();
    window.setTimeout(() => {
      canvas.remove();
      window.URL.revokeObjectURL(link.href);
    }, 1000);

    const message = `${link.download} is saved. Open 'Downloads' screen (CTRL + J) to check. You can set image scale in options`;
    tip(message, true, "success", 5000);
  } catch (error) {
    ERROR && console.error(error);
    tip(`PNG export failed: ${(error as Error)?.message || "Unknown error"}`, true, "error", 5000);
  } finally {
    TIME && console.timeEnd("exportToPng");
  }
}

export async function exportGameMapImages(): Promise<void> {
  TIME && console.time("exportGameMapImages");
  try {
    await loadScript("libs/jszip.min.js");
    const zip = new window.JSZip();
    const baseName = getFileName("game-map");
    const [svgBlob, pngBlob] = await Promise.all([getSvgBlob(), getPngBlob(true)]);

    zip.file(`${baseName}.svg`, svgBlob);
    zip.file(`${baseName}.png`, pngBlob);

    const archive = await zip.generateAsync({ type: "blob" });
    downloadBlob(archive, `${baseName}-images.zip`);
    tip(`${baseName}-images.zip is saved. It contains the SVG and PNG map renders`, true, "success", 7000);
  } catch (error) {
    ERROR && console.error(error);
    tip(`Game map image export failed: ${(error as Error)?.message || "Unknown error"}`, true, "error", 5000);
  } finally {
    TIME && console.timeEnd("exportGameMapImages");
  }
}

export function exportGameTopologyJson(): void {
  if (customization) {
    tip("Game data cannot be exported when edit mode is active, please exit the mode and retry", false, "error");
    return;
  }

  const baseName = getFileName("vibe-game-map");
  const json = JSON.stringify(getVibeGameMapData());
  downloadFile(json, `${baseName}.json`, "application/json");
  tip("vibe-game map JSON is saved", true, "success", 7000);
}

export async function exportGameMapFiles(): Promise<void> {
  if (customization) {
    tip("Game data cannot be exported when edit mode is active, please exit the mode and retry", false, "error");
    return;
  }

  TIME && console.time("exportGameMapFiles");
  try {
    await loadScript("libs/jszip.min.js");
    const zip = new window.JSZip();
    const baseName = getFileName("vibe-game-map");
    const [svgBlob, pngBlob] = await Promise.all([getSvgBlob(), getPngBlob(true)]);
    const json = JSON.stringify(getVibeGameMapData(`${baseName}.png`));

    zip.file(`${baseName}.svg`, svgBlob);
    zip.file(`${baseName}.png`, pngBlob);
    zip.file(`${baseName}.json`, json);

    const archive = await zip.generateAsync({ type: "blob" });
    downloadBlob(archive, `${baseName}.zip`);
    tip(`${baseName}.zip is saved. It contains the PNG map render and vibe-game JSON`, true, "success", 7000);
  } catch (error) {
    ERROR && console.error(error);
    tip(`vibe-game export failed: ${(error as Error)?.message || "Unknown error"}`, true, "error", 5000);
  } finally {
    TIME && console.timeEnd("exportGameMapFiles");
  }
}

export async function exportToJpeg(): Promise<void> {
  TIME && console.time("exportToJpeg");
  try {
    const url = await getMapURL("png");
    const resolution = ensureEl<HTMLInputElement>("pngResolutionInput").valueAsNumber;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = svgWidth * resolution;
    canvas.height = svgHeight * resolution;

    const quality = Math.min(rn(1 - resolution / 20, 2), 0.92);
    const blob = await new Promise<Blob>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          blob => {
            if (!blob) return reject(new Error("Cannot render JPEG image"));
            resolve(blob);
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => reject(new Error("Cannot load map image for JPEG export"));
      img.src = url;
    });

    const link = document.createElement("a");
    link.download = `${getFileName()}.jpeg`;
    link.href = window.URL.createObjectURL(blob);
    link.click();
    tip(`${link.download} is saved. Open "Downloads" screen (CTRL + J) to check`, true, "success", 7000);
    window.setTimeout(() => window.URL.revokeObjectURL(link.href), 5000);
  } catch (error) {
    ERROR && console.error(error);
    tip(`JPEG export failed: ${(error as Error)?.message || "Unknown error"}`, true, "error", 5000);
  } finally {
    TIME && console.timeEnd("exportToJpeg");
  }
}

async function getSvgBlob(): Promise<Blob> {
  const url = await getMapURL("svg", { fullMap: true });
  const response = await fetch(url);
  return response.blob();
}

async function getPngBlob(fullMap = false): Promise<Blob> {
  const url = await getMapURL("png", { fullMap });
  const resolution = ensureEl<HTMLInputElement>("pngResolutionInput")?.valueAsNumber || 1;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const width = fullMap ? graphWidth : svgWidth;
  const height = fullMap ? graphHeight : svgHeight;
  canvas.width = width * resolution;
  canvas.height = height * resolution;

  const img = new Image();
  img.src = url;
  await loadImageElement(img);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const blob = await canvasToBlob(canvas, "image/png");
  canvas.remove();
  return blob;
}

function downloadBlob(blob: Blob, fileName: string): void {
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  window.setTimeout(() => window.URL.revokeObjectURL(link.href), 5000);
}

function loadImageElement(img: HTMLImageElement): Promise<void> {
  return new Promise((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Cannot load map image"));
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, qualityArgument = 1): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas toBlob() error"));
      },
      mimeType,
      qualityArgument
    );
  });
}

function getVibeGameMapData(pngFileName?: string) {
  const peoplePerPoint = populationRate * urbanization;
  const cells = Array.from(pack.cells.i).map(cellId => {
    const height = pack.cells.h[cellId];
    return {
      id: cellId,
      coordinate: roundPoint(pack.cells.p[cellId]),
      geo_coordinate: toGeoCoordinates(...pack.cells.p[cellId]),
      height,
      elevation: height,
      terrain: height >= 20 ? "land" : "water",
      area: pack.cells.area[cellId],
      feature: pack.cells.f[cellId],
      biome: pack.cells.biome[cellId],
      culture: pack.cells.culture[cellId],
      state: pack.cells.state[cellId],
      province: pack.cells.province[cellId],
      religion: pack.cells.religion[cellId],
      good: pack.cells.good?.[cellId] || 0,
      market: pack.cells.market?.[cellId] || 0,
      river: pack.cells.r[cellId] || 0,
      flux: pack.cells.fl[cellId] || 0,
      population_points: rn(Number(pack.cells.pop[cellId]), 3),
      burg: pack.cells.burg[cellId] || 0,
      neighbors: pack.cells.c[cellId]
    };
  });

  return {
    metadata: {
      schema: "vibe-game-map",
      schema_version: 2,
      source: "Azgaar Fantasy Map Generator",
      exported_at: new Date().toISOString(),
      map_name: mapName.value,
      seed,
      map_id: mapId,
      width: graphWidth,
      height: graphHeight,
      profile: {
        purpose: "voxel-mmorpg-test",
        default_cells: Number(pointsInput.dataset.cells),
        default_people_per_population_point: populationRate,
        default_urbanization: urbanization,
        target_town_population: 100,
        max_standard_town_population: 120,
        max_capital_population: 300,
        street_bias: "horizontal-main"
      }
    },
    image: {
      file: pngFileName || null,
      coordinate_space: "fmg-svg-pixels",
      width: graphWidth,
      height: graphHeight
    },
    world: {
      map_coordinates: mapCoordinates,
      width: graphWidth,
      height: graphHeight,
      cells,
      features: pack.features.map(feature => ({ ...feature })),
      routes: pack.routes.map(createGameRoute),
      rivers: pack.rivers.map(river => ({
        id: river.i,
        name: river.name,
        type: river.type,
        source_cell: river.source,
        mouth_cell: river.mouth,
        parent: river.parent,
        basin: river.basin,
        length: river.length,
        discharge: river.discharge,
        width: river.width,
        cells: river.cells,
        points: river.points?.map(point => roundPoint([point[0], point[1]]))
      }))
    },
    entities: {
      burgs: pack.burgs.filter(burg => burg.i && !burg.removed).map(burg => createGameBurgNode(burg, peoplePerPoint)),
      states: pack.states
        .filter(state => state.i && !state.removed)
        .map(state => ({
          id: state.i,
          name: state.name,
          full_name: state.fullName,
          form: state.form,
          color: state.color,
          capital: state.capital,
          center_cell: state.center,
          culture: state.culture,
          cells: state.cells,
          burgs: state.burgs,
          population: {
            rural_points: rn(Number(state.rural || 0), 3),
            urban_points: rn(Number(state.urban || 0), 3)
          },
          neighbors: state.neighbors || []
        })),
      cultures: pack.cultures
        .filter(culture => culture.i && !culture.removed)
        .map(culture => ({
          id: culture.i,
          name: culture.name,
          type: culture.type,
          color: culture.color,
          center_cell: culture.center,
          cells: culture.cells
        })),
      religions: pack.religions
        .filter(religion => religion.i && !religion.removed)
        .map(religion => ({
          id: religion.i,
          name: religion.name,
          type: religion.type,
          color: religion.color,
          center_cell: religion.center,
          cells: religion.cells
        })),
      provinces: pack.provinces
        .filter(province => province.i && !province.removed)
        .map(province => ({
          id: province.i,
          name: province.name,
          full_name: province.fullName,
          color: province.color,
          center_cell: province.center,
          burg: province.burg,
          cell_count: countCellsInProvince(province.i)
        }))
    },
    legacy_fmg_refs: {
      biomes: biomesData.name,
      notes
    }
  };
}

function countCellsInProvince(provinceId: number): number {
  let count = 0;
  for (const cellProvinceId of pack.cells.province) {
    if (cellProvinceId === provinceId) count++;
  }
  return count;
}

function createGameRoute(route: (typeof pack.routes)[number]) {
  return {
    id: route.i,
    kind: route.group,
    feature: route.feature,
    cells: route.cells || route.points?.map(point => point[2]).filter(cellId => cellId !== undefined) || [],
    points: route.points?.map(point => roundPoint([point[0], point[1]])) || []
  };
}

function createGameBurgNode(burg: (typeof pack.burgs)[number], peoplePerPoint: number) {
  const population = getGamePopulation(burg, peoplePerPoint);
  const town = createVibeGameTownLayout({
    burgId: burg.i,
    name: burg.name,
    seed,
    center: [burg.x, burg.y],
    population,
    biomeName: biomesData.name[pack.cells.biome[burg.cell]],
    capital: Boolean(burg.capital),
    port: Boolean(burg.port),
    walls: Boolean(burg.walls),
    temple: Boolean(burg.temple),
    plaza: Boolean(burg.plaza),
    connections: getBurgTownConnections(burg)
  });

  return {
    id: burg.i,
    name: burg.name,
    group: burg.group,
    state: burg.state,
    culture: burg.culture,
    feature: burg.feature,
    cell: burg.cell,
    coordinate_center: roundPoint([burg.x, burg.y]),
    geo_coordinate: toGeoCoordinates(burg.x, burg.y),
    population,
    original_population_points: rn(Number(burg.population || 0), 3),
    town,
    infrastructure: town,
    buildings: town.buildings,
    streets: town.streets,
    walls: town.walls,
    farms: town.farms,
    doodads: town.doodads,
    flags: {
      capital: Boolean(burg.capital),
      port: Boolean(burg.port),
      citadel: Boolean(burg.citadel),
      plaza: Boolean(burg.plaza),
      walls: town.walls.length > 0,
      temple: Boolean(burg.temple)
    }
  };
}

function getBurgTownConnections(burg: (typeof pack.burgs)[number]) {
  const connections: Partial<Record<"north" | "east" | "south" | "west", boolean>> = {};
  const routeLinks = pack.cells.routes?.[burg.cell];
  if (!routeLinks) return connections;

  for (const neighborId of Object.keys(routeLinks).map(Number)) {
    const neighbor = pack.cells.p[neighborId];
    if (!neighbor) continue;
    const dx = neighbor[0] - burg.x;
    const dy = neighbor[1] - burg.y;
    if (Math.abs(dx) > Math.abs(dy)) connections[dx > 0 ? "east" : "west"] = true;
    else connections[dy > 0 ? "south" : "north"] = true;
  }
  return connections;
}

function getGamePopulation(burg: (typeof pack.burgs)[number], peoplePerPoint: number): number {
  const raw = Math.round(Number(burg.population || 0) * peoplePerPoint);
  const max = burg.capital ? 300 : 120;
  return Math.max(20, Math.min(max, raw));
}

function roundPoint(point: [number, number]): [number, number] {
  return [rn(point[0], 2), rn(point[1], 2)];
}

export async function exportToPngTiles(): Promise<void> {
  const status = ensureEl("tileStatus");
  status.innerHTML = "Preparing files...";

  const urlSchema = await getMapURL("tiles", { debug: true, fullMap: true });
  await loadScript("libs/jszip.min.js");
  const zip = new window.JSZip();

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  canvas.width = graphWidth;
  canvas.height = graphHeight;

  const imgSchema = new Image();
  imgSchema.src = urlSchema;
  await loadImage(imgSchema);

  status.innerHTML = "Rendering schema...";
  ctx.drawImage(imgSchema, 0, 0, canvas.width, canvas.height);
  const blob = await canvasToBlob(canvas, "image/png");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  zip.file("schema.png", blob);

  // download tiles
  const url = await getMapURL("tiles", { fullMap: true });
  const tilesX = +ensureEl<HTMLInputElement>("tileColsOutput").value || 2;
  const tilesY = +ensureEl<HTMLInputElement>("tileRowsOutput").value || 2;
  const scale = +ensureEl<HTMLInputElement>("tileScaleOutput").value || 1;
  const tolesTotal = tilesX * tilesY;

  const tileW = (graphWidth / tilesX) | 0;
  const tileH = (graphHeight / tilesY) | 0;

  const width = graphWidth * scale;
  const height = width * (tileH / tileW);
  canvas.width = width;
  canvas.height = height;

  const img = new Image();
  img.src = url;
  await loadImage(img);

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  function getRowLabel(row: number) {
    const first = row >= alphabet.length ? alphabet[Math.floor(row / alphabet.length) - 1] : "";
    const last = alphabet[row % alphabet.length];
    return first + last;
  }

  for (let y = 0, row = 0, id = 1; y + tileH <= graphHeight; y += tileH, row++) {
    const rowName = getRowLabel(row);

    for (let x = 0, cell = 1; x + tileW <= graphWidth; x += tileW, cell++, id++) {
      status.innerHTML = `Rendering tile ${rowName}${cell} (${id} of ${tolesTotal})...`;
      ctx.drawImage(img, x, y, tileW, tileH, 0, 0, width, height);
      const blob = await canvasToBlob(canvas, "image/png");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      zip.file(`${rowName}${cell}.png`, blob);
    }
  }

  status.innerHTML = "Zipping files...";
  zip
    .generateAsync({ type: "blob" })
    .then((blob: Blob) => {
      status.innerHTML = "Downloading the archive...";
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${getFileName()}.zip`;
      link.click();
      link.remove();

      status.innerHTML = 'Done. Check .zip file in "Downloads" (CTRL + J)';
      setTimeout(() => URL.revokeObjectURL(link.href), 5000);
    })
    .catch((error: Error) => {
      ERROR && console.error(error);
      status.innerHTML = "Tiles export failed";
      tip(`PNG tiles export failed: ${error?.message || "Unknown error"}`, true, "error", 5000);
    });

  // promisified img.onload
  function loadImage(img: HTMLImageElement) {
    return new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = err => reject(err);
    });
  }

  // promisified canvas.toBlob
  function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, qualityArgument = 1) {
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        blob => {
          if (blob) resolve(blob);
          else reject(new Error("Canvas toBlob() error"));
        },
        mimeType,
        qualityArgument
      );
    });
  }
}

// parse map svg to object url
export async function getMapURL(type: string, options: GetMapURLOptions = {}): Promise<string> {
  const {
    debug = false,
    noLabels = false,
    noWater = false,
    noScaleBar = false,
    noIce = false,
    noVignette = false,
    fullMap = false
  } = options;

  const cloneEl = (document.getElementById("map") as unknown as SVGSVGElement).cloneNode(true) as SVGSVGElement; // clone svg
  cloneEl.id = "fantasyMap";
  document.body.appendChild(cloneEl);
  const clone: MapSelection = select(cloneEl);
  if (!debug) clone.select("#debug").remove();

  const cloneDefs = cloneEl.getElementsByTagName("defs")[0];
  const svgDefs = document.getElementById("defElements") as unknown as SVGSVGElement;

  const isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
  if (isFirefox && type === "mesh") clone.select("#oceanPattern").remove();
  if (noLabels) {
    clone.select("#labels #states").remove();
    clone.select("#labels #burgLabels").remove();
    clone.select("#icons #burgIcons").remove();
  }
  if (noWater) {
    clone.select("#oceanBase").attr("opacity", 0);
    clone.select("#oceanPattern").attr("opacity", 0);
  }
  if (noIce) clone.select("#ice").remove();
  if (noVignette) clone.select("#vignette").remove();
  if (fullMap) {
    // reset transform to show the whole map
    clone.attr("width", graphWidth).attr("height", graphHeight);
    clone.select("#viewbox").attr("transform", null);

    if (!noScaleBar) {
      drawScaleBar(clone.select("#scaleBar") as unknown as Parameters<typeof drawScaleBar>[0], 1);
      fitScaleBar(clone.select("#scaleBar") as unknown as Parameters<typeof fitScaleBar>[0], graphWidth, graphHeight);
    }
  }
  if (noScaleBar) clone.select("#scaleBar").remove();

  if (type === "svg") removeUnusedElements(clone);
  if (customization && type === "mesh") updateMeshCells(clone);
  inlineStyle(clone);

  // remove unused filters
  const filters = cloneEl.querySelectorAll("filter");
  for (let i = 0; i < filters.length; i++) {
    const id = filters[i].id;
    if (cloneEl.querySelector(`[filter='url(#${id})']`)) continue;
    if (cloneEl.getAttribute("filter") === `url(#${id})`) continue;
    filters[i].remove();
  }

  // remove unused patterns
  const patterns = cloneEl.querySelectorAll("pattern");
  for (let i = 0; i < patterns.length; i++) {
    const id = patterns[i].id;
    if (cloneEl.querySelector(`[fill='url(#${id})']`)) continue;
    patterns[i].remove();
  }

  // remove unused symbols
  const symbols = cloneEl.querySelectorAll("symbol");
  for (let i = 0; i < symbols.length; i++) {
    const id = symbols[i].id;
    if (cloneEl.querySelector(`use[*|href='#${id}']`)) continue;
    symbols[i].remove();
  }

  // add displayed emblems
  if (layerIsOn("toggleEmblems") && emblems.selectAll("use").size()) {
    cloneEl
      .getElementById("emblems")
      ?.querySelectorAll("use")
      .forEach(el => {
        const href = el.getAttribute("href") || el.getAttribute("xlink:href");
        if (!href) return;
        const emblem = document.getElementById(href.slice(1));
        if (emblem) cloneDefs.append(emblem.cloneNode(true));
      });
  } else {
    cloneDefs.querySelector("#defs-emblems")?.remove();
  }

  {
    // replace ocean pattern href to base64
    const image = cloneEl.getElementById("oceanicPattern");
    const href = image?.getAttribute("href");
    if (image && href) {
      await new Promise<void>(resolve => {
        getBase64(href, base64 => {
          if (typeof base64 === "string") image.setAttribute("href", base64);
          resolve();
        });
      });
    }
  }

  {
    // replace texture href to base64
    const image = cloneEl.querySelector("#texture > image");
    const href = image?.getAttribute("href");
    if (image && href) {
      await new Promise<void>(resolve => {
        getBase64(href, base64 => {
          if (typeof base64 === "string") image.setAttribute("href", base64);
          resolve();
        });
      });
    }
  }

  // add relief icons
  if (cloneEl.getElementById("terrain")) {
    const uniqueElements = new Set<string | null>();
    const terrainNodes = cloneEl.getElementById("terrain")!.childNodes;
    for (let i = 0; i < terrainNodes.length; i++) {
      const node = terrainNodes[i] as Element;
      const href = node.getAttribute("href") || node.getAttribute("xlink:href");
      uniqueElements.add(href);
    }

    const defsRelief = svgDefs.getElementById("defs-relief");
    for (const terrain of [...uniqueElements]) {
      if (!terrain) continue;
      const element = defsRelief?.querySelector(terrain);
      if (element) cloneDefs.appendChild(element.cloneNode(true));
    }
  }

  // add wind rose
  if (cloneEl.getElementById("compass")) {
    const rose = svgDefs.getElementById("defs-compass-rose");
    if (rose) cloneDefs.appendChild(rose.cloneNode(true));
  }

  // add burs icons
  if (cloneEl.getElementById("burgIcons")) {
    const groups = cloneEl.getElementById("burgIcons")!.querySelectorAll("g");
    for (const group of Array.from(groups)) {
      const icon = group.dataset.icon && svgDefs.querySelector(group.dataset.icon);
      if (icon) cloneDefs.appendChild(icon.cloneNode(true));
    }
  }

  // add goods icons
  if (cloneEl.getElementById("goodsIcons") || cloneEl.getElementById("goodsBurgs")) {
    const uniqueIcons = new Set<string>();
    const goodsUseElements = cloneEl.querySelectorAll("#goodsIcons use, #goodsBurgs use");
    for (const el of goodsUseElements) {
      const href = el.getAttribute("href") || el.getAttribute("xlink:href");
      if (href) uniqueIcons.add(href);
    }
    const goodsIconsDefs = svgDefs.getElementById("good-icons");
    for (const href of uniqueIcons) {
      const element = goodsIconsDefs?.querySelector(href);
      if (element) cloneDefs.appendChild(element.cloneNode(true));
    }
  }

  // add port icon
  if (cloneEl.getElementById("anchors")) {
    const anchor = svgDefs.getElementById("icon-anchor");
    if (anchor) cloneDefs.appendChild(anchor.cloneNode(true));
  }

  // add grid pattern
  if (cloneEl.getElementById("gridOverlay")?.hasChildNodes()) {
    const type = cloneEl.getElementById("gridOverlay")!.getAttribute("type");
    const pattern = svgDefs.getElementById(`pattern_${type}`);
    if (pattern) cloneDefs.appendChild(pattern.cloneNode(true));
  }

  {
    // replace external marker icons
    const externalMarkerImages = cloneEl.querySelectorAll<SVGImageElement>('#markers image[href]:not([href=""])');
    const imageHrefs = Array.from(externalMarkerImages).map(img => img.getAttribute("href"));

    for (const url of imageHrefs) {
      if (!url) continue;
      await new Promise<void>(resolve => {
        getBase64(url, base64 => {
          externalMarkerImages.forEach(img => {
            if (typeof base64 === "string" && img.getAttribute("href") === url) img.setAttribute("href", base64);
          });
          resolve();
        });
      });
    }
  }

  {
    // replace external regiment icons
    const externalRegimentImages = cloneEl.querySelectorAll<SVGImageElement>('#armies image[href]:not([href=""])');
    const imageHrefs = Array.from(externalRegimentImages).map(img => img.getAttribute("href"));

    for (const url of imageHrefs) {
      if (!url) continue;
      await new Promise<void>(resolve => {
        getBase64(url, base64 => {
          externalRegimentImages.forEach(img => {
            if (typeof base64 === "string" && img.getAttribute("href") === url) img.setAttribute("href", base64);
          });
          resolve();
        });
      });
    }
  }

  if (!cloneEl.getElementById("fogging-cont")) cloneEl.getElementById("fog")?.remove(); // remove unused fog
  if (!cloneEl.getElementById("regions")) cloneEl.getElementById("statePaths")?.remove(); // removed unused statePaths
  if (!cloneEl.getElementById("labels")) cloneEl.getElementById("textPaths")?.remove(); // removed unused textPaths

  // add armies style
  if (cloneEl.getElementById("armies")) {
    cloneEl.insertAdjacentHTML(
      "afterbegin",
      "<style>#armies text {stroke: none; fill: #fff; text-shadow: 0 0 4px #000; dominant-baseline: central; text-anchor: middle; font-family: Helvetica; fill-opacity: 1;}#armies text.regimentIcon {font-size: .8em;}</style>"
    );
  }

  // add xlink: for href to support svg 1.1
  if (type === "svg") {
    cloneEl.querySelectorAll("[href]").forEach(el => {
      const href = el.getAttribute("href");
      el.removeAttribute("href");
      if (href) el.setAttribute("xlink:href", href);
    });
  }

  // add hatchings
  const hatchingUsers = cloneEl.querySelectorAll(`[fill^='url(#hatch']`);
  const hatchingFills = unique(Array.from(hatchingUsers).map(el => el.getAttribute("fill")));
  const hatchingIds = hatchingFills.map(fill => fill!.slice(5, -1));
  for (const hatchingId of hatchingIds) {
    const hatching = svgDefs.getElementById(hatchingId);
    if (hatching) cloneDefs.appendChild(hatching.cloneNode(true));
  }

  // load fonts
  const usedFonts = getUsedFonts(cloneEl);
  const fontsToLoad = usedFonts.filter(font => font.src);
  if (fontsToLoad.length) {
    const dataURLfonts = await loadFontsAsDataURI(fontsToLoad);

    const fontFaces = dataURLfonts
      .map(({ family, src, unicodeRange = "", variant = "normal" }) => {
        return `@font-face {font-family: "${family}"; src: ${src}; unicode-range: ${unicodeRange}; font-variant: ${variant};}`;
      })
      .join("\n");

    const style = document.createElement("style");
    style.setAttribute("type", "text/css");
    style.innerHTML = fontFaces;
    cloneEl.querySelector("defs")!.appendChild(style);
  }

  clone.remove();

  const serialized = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>${new XMLSerializer().serializeToString(cloneEl)}`;
  const blob = new Blob([serialized], { type: "image/svg+xml;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  window.setTimeout(() => window.URL.revokeObjectURL(url), 5000);
  return url;
}

// remove hidden g elements and g elements without children to make downloaded svg smaller in size
function removeUnusedElements(clone: MapSelection): void {
  if (!terrain.selectAll("use").size()) clone.select("#defs-relief").remove();

  for (let empty = 1; empty; ) {
    empty = 0;
    clone.selectAll<SVGGElement, unknown>("g").each(function () {
      if (!this.hasChildNodes() || this.style.display === "none" || this.classList.contains("hidden")) {
        empty++;
        this.remove();
      }
      if (this.hasAttribute("display") && this.style.display === "inline") this.removeAttribute("display");
    });
  }
}

function updateMeshCells(clone: MapSelection): void {
  const renderOcean = ensureEl<HTMLInputElement>("renderOcean").checked;
  const data = renderOcean ? grid.cells.i : grid.cells.i.filter((i: number) => grid.cells.h[i] >= 20);
  const scheme = getColorScheme(terrs.select("#landHeights").attr("scheme"));
  clone.select("#heights").attr("filter", "url(#blur1)");
  clone
    .select("#heights")
    .selectAll("polygon")
    .data(data as number[])
    .join("polygon")
    .attr("points", (d: number) => getGridPolygon(d, grid))
    .attr("id", (d: number) => `cell${d}`)
    .attr("stroke", (d: number) => getColor(grid.cells.h[d], scheme));
}

// for each g element get inline style
function inlineStyle(clone: MapSelection): void {
  const emptyG = clone.append("g").node()!;
  const defaultStyles = window.getComputedStyle(emptyG);

  clone.selectAll<SVGElement, unknown>("g, #ruler *, #scaleBar > text").each(function () {
    const compStyle = window.getComputedStyle(this);
    let style = "";

    for (let i = 0; i < compStyle.length; i++) {
      const key = compStyle[i];
      const value = compStyle.getPropertyValue(key);

      if (key === "cursor") continue; // cursor should be default
      if (this.hasAttribute(key)) continue; // don't add style if there is the same attribute
      if (value === defaultStyles.getPropertyValue(key)) continue;
      style += `${key}:${value};`;
    }

    for (const key in compStyle) {
      const value = compStyle.getPropertyValue(key);

      if (key === "cursor") continue; // cursor should be default
      if (this.hasAttribute(key)) continue; // don't add style if there is the same attribute
      if (value === defaultStyles.getPropertyValue(key)) continue;
      style += `${key}:${value};`;
    }

    if (style !== "") this.setAttribute("style", style);
  });

  emptyG.remove();
}

export function saveGeoJsonCells(): void {
  const { cells, vertices } = pack;
  const json: { type: string; features: unknown[] } = { type: "FeatureCollection", features: [] };

  const getPopulation = (i: number) => {
    const [r, u] = getCellPopulation(i);
    return rn(r + u);
  };

  const getHeight = (i: number) => parseInt(getFriendlyHeight(cells.p[i]), 10);

  function getCellCoordinates(cellVertices: number[]) {
    const coordinates = cellVertices.map(vertex => {
      const [x, y] = vertices.p[vertex];
      return toGeoCoordinates(x, y);
    });
    return [[...coordinates, coordinates[0]]];
  }

  cells.i.forEach(i => {
    const coordinates = getCellCoordinates(cells.v[i]);
    const height = getHeight(i);
    const biome = cells.biome[i];
    const type = pack.features[cells.f[i]].type;
    const population = getPopulation(i);
    const state = cells.state[i];
    const province = cells.province[i];
    const culture = cells.culture[i];
    const religion = cells.religion[i];
    const neighbors = cells.c[i];

    const properties = { id: i, height, biome, type, population, state, province, culture, religion, neighbors };
    const feature = { type: "Feature", geometry: { type: "Polygon", coordinates }, properties };
    json.features.push(feature);
  });

  const fileName = `${getFileName("Cells")}.geojson`;
  downloadFile(JSON.stringify(json), fileName, "application/json");
}

export function saveGeoJsonRoutes(): void {
  const features = pack.routes.map(route => {
    const { i, points, group } = route;
    const name = (route as { name?: string }).name ?? null;
    const coordinates = points.map(([x, y]) => toGeoCoordinates(x, y));
    return {
      type: "Feature",
      geometry: { type: "LineString", coordinates },
      properties: { id: i, group, name }
    };
  });
  const json = { type: "FeatureCollection", features };

  const fileName = `${getFileName("Routes")}.geojson`;
  downloadFile(JSON.stringify(json), fileName, "application/json");
}

export function saveGeoJsonRivers(): void {
  const features = pack.rivers.map(
    ({ i, cells, points, source, mouth, parent, basin, widthFactor, sourceWidth, discharge, name, type }) => {
      if (!cells || cells.length < 2) return null;
      const meanderedPoints = Rivers.addMeandering(cells, points);
      const coordinates = meanderedPoints.map(([x, y]) => toGeoCoordinates(x, y));
      return {
        type: "Feature",
        geometry: { type: "LineString", coordinates },
        properties: { id: i, source, mouth, parent, basin, widthFactor, sourceWidth, discharge, name, type }
      };
    }
  );
  const json = { type: "FeatureCollection", features };

  const fileName = `${getFileName("Rivers")}.geojson`;
  downloadFile(JSON.stringify(json), fileName, "application/json");
}

export function saveGeoJsonMarkers(): void {
  const features = pack.markers.map(marker => {
    const { i, type, icon, x, y, size, fill, stroke } = marker as typeof marker & {
      size?: number;
      fill?: string;
      stroke?: string;
    };
    const coordinates = toGeoCoordinates(x, y);
    const note = notes.find(note => note.id === `marker${i}`);
    const properties = { id: i, type, icon, x, y, ...note, size, fill, stroke };
    return { type: "Feature", geometry: { type: "Point", coordinates }, properties };
  });

  const json = { type: "FeatureCollection", features };

  const fileName = `${getFileName("Markers")}.geojson`;
  downloadFile(JSON.stringify(json), fileName, "application/json");
}

export function saveGeoJsonZones(): void {
  const { zones, cells, vertices } = pack;
  const json: { type: string; features: unknown[] } = { type: "FeatureCollection", features: [] };

  // Helper function to convert zone cells to polygon coordinates
  // Handles multiple disconnected components and holes properly
  function getZonePolygonCoordinates(zoneCells: number[]) {
    const cellsInZone = new Set(zoneCells);
    const ofSameType = (cellId: number) => cellsInZone.has(cellId);
    const ofDifferentType = (cellId: number) => !cellsInZone.has(cellId);

    const checkedCells = new Set<number>();
    const rings: number[][][] = []; // Array of LinearRings (each ring is an array of coordinates)

    // Find all boundary components by tracing each connected region
    for (const cellId of zoneCells) {
      if (checkedCells.has(cellId)) continue;

      // Check if this cell is on the boundary (has a neighbor outside the zone)
      const neighbors = cells.c[cellId];
      const onBorder = neighbors.some(ofDifferentType);
      if (!onBorder) continue;

      // Check if this is an inner lake (hole) - skip if so
      const feature = pack.features[cells.f[cellId]];
      if (feature.type === "lake" && feature.shoreline) {
        if (feature.shoreline.every(ofSameType)) continue;
      }

      // Find a starting vertex that's on the boundary
      const cellVertices = cells.v[cellId];
      let startingVertex = null;

      for (const vertexId of cellVertices) {
        const vertexCells = vertices.c[vertexId];
        if (vertexCells.some(ofDifferentType)) {
          startingVertex = vertexId;
          break;
        }
      }

      if (startingVertex === null) continue;

      // Use connectVertices to trace the boundary (reusing existing logic)
      const vertexChain = connectVertices({
        vertices,
        startingVertex,
        ofSameType,
        addToChecked: (cellId: number) => checkedCells.add(cellId),
        closeRing: false // We'll close it manually after converting to coordinates
      });

      if (vertexChain.length < 3) continue;

      // Convert vertex chain to coordinates
      const coordinates: number[][] = [];
      for (const vertexId of vertexChain) {
        const [x, y] = vertices.p[vertexId];
        coordinates.push(toGeoCoordinates(x, y));
      }

      // Close the ring (first coordinate = last coordinate)
      if (coordinates.length > 0) {
        coordinates.push(coordinates[0]);
      }

      // Only add ring if it has at least 4 positions (minimum for valid LinearRing)
      if (coordinates.length >= 4) {
        rings.push(coordinates);
      }
    }

    return rings;
  }

  // Filter and process zones
  zones.forEach(zone => {
    // Exclude hidden zones and zones with no cells
    if ((zone as { hidden?: boolean }).hidden || !zone.cells || zone.cells.length === 0) return;

    const rings = getZonePolygonCoordinates(zone.cells);

    // Skip if no valid rings were generated
    if (rings.length === 0) return;

    const properties = {
      id: zone.i,
      name: zone.name,
      type: zone.type,
      color: zone.color,
      cells: zone.cells
    };

    // If there's only one ring, use Polygon geometry
    if (rings.length === 1) {
      const feature = {
        type: "Feature",
        geometry: { type: "Polygon", coordinates: rings },
        properties
      };
      json.features.push(feature);
    } else {
      // Multiple disconnected components: use MultiPolygon
      // Each component is wrapped in its own array
      const multiPolygonCoordinates = rings.map(ring => [ring]);
      const feature = {
        type: "Feature",
        geometry: { type: "MultiPolygon", coordinates: multiPolygonCoordinates },
        properties
      };
      json.features.push(feature);
    }
  });

  const fileName = `${getFileName("Zones")}.geojson`;
  downloadFile(JSON.stringify(json), fileName, "application/json");
}

// load a classic library bundle that registers a runtime global (e.g. window.JSZip)
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Cannot load script ${src}`));
    document.head.append(script);
  });
}

// reached lazily via lazy.exportMap()
declare global {
  interface Window {
    JSZip: any; // registered on demand by libs/jszip.min.js (see exportToPngTiles)
  }
}
