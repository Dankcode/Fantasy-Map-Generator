type Direction = "north" | "east" | "south" | "west";

type TileType =
  | "WATER_DEEP"
  | "WATER_SHALLOW"
  | "GRASS"
  | "SAND"
  | "DIRT"
  | "MUD"
  | "SNOW"
  | "ICE"
  | "ASH"
  | "LAVA"
  | "ROCK_GROUND"
  | "CRYSTAL_FLOOR"
  | "ROAD_MAIN"
  | "ROAD_DIRT"
  | "BRIDGE"
  | "BUILDING_FLOOR"
  | "WALL"
  | "EMPTY"
  | "DOCK"
  | "FARM";

type BuildingType =
  | "HOUSE_SMALL"
  | "HOUSE_LARGE"
  | "TAVERN"
  | "BLACKSMITH"
  | "MARKET_STALL"
  | "CHURCH"
  | "TOWER"
  | "MANOR"
  | "FARM_HOUSE";

type DoodadType =
  | "TREE_OAK"
  | "TREE_PINE"
  | "TREE_PALM"
  | "TREE_DEAD"
  | "BUSH"
  | "ROCK"
  | "WELL"
  | "CRATE"
  | "CACTUS"
  | "MUSHROOM"
  | "CRYSTAL"
  | "STUMP"
  | "CROP_WHEAT"
  | "CROP_CORN"
  | "CROP_PUMPKIN"
  | "STREET_LAMP"
  | "TOMBSTONE";

type BiomeType =
  | "PLAINS"
  | "FOREST"
  | "DESERT"
  | "TUNDRA"
  | "TAIGA"
  | "SWAMP"
  | "JUNGLE"
  | "SAVANNA"
  | "BADLANDS"
  | "MOUNTAIN"
  | "VOLCANIC"
  | "OASIS"
  | "COASTAL"
  | "MUSHROOM_FOREST"
  | "CRYSTAL_WASTES"
  | "AUTUMN_FOREST"
  | "CHERRY_BLOSSOM"
  | "GLACIER"
  | "DEAD_LANDS"
  | "HIGHLANDS";

type TownDensity = "VERY_SPARSE" | "SPARSE" | "MEDIUM" | "HIGH" | "EXTREME";
type RoofStyle = "THATCHED" | "TILED" | "SLATE" | "METAL";
type WallTexture = "TIMBER_FRAME" | "STONE" | "STUCCO" | "WOOD";
type Bounds = { minX: number; maxX: number; minY: number; maxY: number };
type MfcgLayers = Record<"roads" | "walls" | "buildings" | "water" | "greens" | "fields", MfcgVectorFeature[]>;
type MatrixTransform = Bounds & { scale: number; margin: number; width: number; height: number };
type RoomType =
  | "ENTRY"
  | "COMMON"
  | "BEDROOM"
  | "KITCHEN"
  | "STORAGE"
  | "SHOP"
  | "WORKSHOP"
  | "FORGE"
  | "TAPROOM"
  | "GUEST_ROOM"
  | "SANCTUARY"
  | "CHANCEL"
  | "TOWER_ROOM"
  | "MANOR_HALL"
  | "STUDY"
  | "FARM_ROOM"
  | "STAIRS";

interface Tile {
  x: number;
  y: number;
  type: TileType;
  variation: number;
  elevation: number;
  roadConnections?: number;
  buildingId?: string;
  doodad?: {
    type: DoodadType;
    id: string;
    offsetX: number;
    offsetY: number;
  };
}

interface Building {
  id: string;
  type: BuildingType;
  x: number;
  y: number;
  width: number;
  height: number;
  doorX: number;
  doorY: number;
  color: string;
  roofColor: string;
  roofStyle: RoofStyle;
  wallTexture: WallTexture;
}

interface BiomeConfig {
  ground: TileType;
  beach: TileType;
  waterDeep: TileType;
  waterShallow: TileType;
  treeDensity: number;
  rockDensity: number;
  trees: DoodadType[];
  secondaryDoodads: DoodadType[];
  elevationOffset: number;
}

interface TownMap {
  width: number;
  height: number;
  tiles: Tile[][];
  buildings: Building[];
  seed: number;
  biome: BiomeType;
  density: TownDensity;
  connections: Record<Direction, boolean>;
}

export interface VibeGameTownOptions {
  burgId: number;
  name: string | undefined;
  seed: string;
  center: [number, number];
  population: number;
  biomeName?: string;
  capital: boolean;
  port: boolean;
  walls: boolean;
  temple: boolean;
  plaza: boolean;
  connections?: Partial<Record<Direction, boolean>>;
}

export interface VibeGameTownLayout {
  source: string;
  seed: number;
  name: string | undefined;
  biome: BiomeType;
  density: TownDensity;
  grid: {
    width: number;
    height: number;
    tile_size_map_units: number;
    origin: [number, number];
    center: [number, number];
  };
  connections: Record<Direction, boolean>;
  tiles: VibeGameTownTile[];
  streets: VibeGameTownStreetTile[];
  buildings: VibeGameTownBuilding[];
  walls: VibeGameTownTile[];
  farms: VibeGameTownTile[];
  doodads: VibeGameTownDoodad[];
  matrix: VibeGameTownMatrix;
}

interface VibeGameTownTile {
  x: number;
  y: number;
  type: TileType;
  elevation: number;
  variation: number;
  coordinate_center: [number, number];
  road_connections?: number;
  building_id?: string;
  doodad_id?: string;
}

interface VibeGameTownStreetTile extends VibeGameTownTile {
  kind: "main" | "dirt" | "bridge" | "dock";
  neighbors: [number, number][];
}

interface VibeGameTownBuilding {
  id: string;
  type: BuildingType;
  grid_rect: { x: number; y: number; width: number; height: number };
  coordinate_center: [number, number];
  footprint: [number, number][];
  connected_buildings: VibeGameConnectedBuilding[];
  door: {
    grid: [number, number];
    coordinate: [number, number];
  };
  color: string;
  roof_color: string;
  roof_style: RoofStyle;
  wall_texture: WallTexture;
  interior: VibeGameBuildingInterior;
  floors: VibeGameBuildingFloor[];
}

interface VibeGameConnectedBuilding {
  building_id: string;
  direction: Direction;
  contact_tiles: [number, number][];
  separated_by_road: false;
}

interface VibeGameBuildingInterior {
  floor_count: number;
  floor_height_voxels: number;
  wall_height_voxels: number;
  has_stairs: boolean;
}

interface VibeGameBuildingFloor {
  level: number;
  elevation_voxels: number;
  rooms: VibeGameBuildingRoom[];
  stairs?: VibeGameBuildingStairs;
}

interface VibeGameBuildingRoom {
  id: string;
  type: RoomType;
  name: string;
  floor: number;
  grid_rect: { x: number; y: number; width: number; height: number };
  coordinate_center: [number, number];
  footprint: [number, number][];
  tiles: [number, number][];
  doors: VibeGameBuildingDoor[];
}

interface VibeGameBuildingDoor {
  id: string;
  kind: "exterior" | "interior" | "stairs";
  grid: [number, number];
  coordinate: [number, number];
  connects_to?: string;
}

interface VibeGameBuildingStairs {
  id: string;
  grid: [number, number];
  coordinate: [number, number];
  connects_to_level: number | null;
}

interface VibeGameTownDoodad {
  id: string;
  type: DoodadType;
  grid: [number, number];
  coordinate: [number, number];
  offset: [number, number];
}

export interface VibeGameTownMatrix {
  schema: "vibe-game-town-matrix";
  schema_version: 1;
  coordinate_space: "town-grid";
  block: {
    size_map_units: number;
    origin: [number, number];
    width: number;
    height: number;
  };
  character: {
    width_blocks: 1;
    height_blocks: 2;
    clearance_height_voxels: 2;
  };
  legend: {
    terrain: Record<number, string>;
    rooms: Record<number, RoomType>;
  };
  terrain: number[][];
  solid_height_voxels: number[][];
  clearance_height_voxels: number[][];
  walkable: number[][];
  street_width_blocks: number[][];
  city_wall: {
    height_voxels: number;
    walkway_width_blocks: 1;
    wall: [number, number][];
    walkway: [number, number][];
    gates: [number, number][];
  };
  interiors: VibeGameBuildingMatrix[];
  voxel_town: VibeGameVoxelTown;
}

interface VibeGameBuildingMatrix {
  building_id: string;
  type: BuildingType;
  grid_rect: { x: number; y: number; width: number; height: number };
  connected_buildings: VibeGameConnectedBuilding[];
  wall_height_voxels: number;
  floor_height_voxels: number;
  floors: VibeGameBuildingFloorMatrix[];
}

interface VibeGameBuildingFloorMatrix {
  level: number;
  elevation_voxels: number;
  width: number;
  height: number;
  room: number[][];
  walkable: number[][];
  wall_north: number[][];
  wall_east: number[][];
  wall_south: number[][];
  wall_west: number[][];
  doors: VibeGameBuildingMatrixDoor[];
  stairs: [number, number] | null;
}

interface VibeGameBuildingMatrixDoor {
  kind: "exterior" | "interior" | "stairs";
  floor: number;
  grid: [number, number];
  local: [number, number];
  direction: Direction | "up" | "down" | null;
  connects_to?: string;
}

type VibeGameVoxelKind =
  | "ground"
  | "road"
  | "water"
  | "city_wall"
  | "wall_walkway"
  | "gate"
  | "building_floor"
  | "building_wall"
  | "building_roof"
  | "interior_wall"
  | "stairs"
  | "obstacle";

export interface VibeGameVoxelTown {
  schema: "vibe-game-voxel-town";
  schema_version: 1;
  coordinate_space: "town-cubic-grid";
  cubic_grid: {
    origin: [number, number, number];
    width: number;
    height: number;
    depth: number;
    voxel_size_blocks: 1;
    tile_size_map_units: number;
    axes: {
      x: "east";
      y: "south";
      z: "up";
    };
  };
  character: {
    width_voxels: 1;
    height_voxels: 2;
    clearance_height_voxels: 2;
  };
  materials: Record<number, VibeGameVoxelKind>;
  voxels: VibeGameVoxel[];
}

interface VibeGameVoxel {
  x: number;
  y: number;
  z: number;
  material: number;
  kind: VibeGameVoxelKind;
  solid: boolean;
  face?: Direction;
  building_id?: string;
  floor?: number;
  room?: RoomType;
}

type VibeGameTownMatrixBase = Omit<VibeGameTownMatrix, "voxel_town">;

type MfcgGeometryType =
  | "Point"
  | "MultiPoint"
  | "LineString"
  | "MultiLineString"
  | "Polygon"
  | "MultiPolygon"
  | "GeometryCollection";

export interface MfcgVectorGeometry {
  type: MfcgGeometryType;
  coordinates?: unknown;
  geometries?: MfcgVectorGeometry[];
}

export interface MfcgVectorFeature {
  type?: string;
  id?: string | null;
  name?: string | null;
  properties?: Record<string, unknown>;
  props?: { h?: Record<string, unknown> } | Record<string, unknown>;
  geometry?: MfcgVectorGeometry;
  geometries?: MfcgVectorGeometry[];
  items?: MfcgVectorFeature[];
}

export interface MfcgVectorData {
  type?: string;
  features?: MfcgVectorFeature[];
  items?: MfcgVectorFeature[];
}

export interface MfcgMatrixOptions {
  width?: number;
  height?: number;
  origin?: [number, number];
  tileSize?: number;
}

export interface TownGeneratorUrlState {
  source: "TownGeneratorOS.StateManager";
  size: number;
  seed: number;
  canonical_search: string;
  parameters: Record<string, string>;
}

const WIDTH = 80;
const HEIGHT = 60;
const TOWN_BUILDING_PLOT_SCALE = 3;
const MIN_BUILDING_CELLS = 9;
const MAX_TOWN_DIM = 256;
const MATRIX_MARGIN = 4;
const TOWN_GENERATOR_DEFAULT_SIZE = 15;
const TOWN_GENERATOR_DEFAULT_SEED = -1;
const TOWN_GENERATOR_MIN_SIZE = 6;
const TOWN_GENERATOR_MAX_SIZE = 40;
const CHARACTER_HEIGHT_VOXELS = 2;
const CITY_WALL_HEIGHT_VOXELS = 4;
const DOODAD_HEIGHT_VOXELS = 2;
const TERRAIN_CODES: Record<TileType | "WALL_WALKWAY" | "GATE", number> = {
  EMPTY: 0,
  GRASS: 1,
  SAND: 2,
  DIRT: 3,
  MUD: 4,
  SNOW: 5,
  ICE: 6,
  ASH: 7,
  LAVA: 8,
  ROCK_GROUND: 9,
  CRYSTAL_FLOOR: 10,
  WATER_SHALLOW: 11,
  WATER_DEEP: 12,
  ROAD_MAIN: 13,
  ROAD_DIRT: 14,
  BRIDGE: 15,
  DOCK: 16,
  FARM: 17,
  BUILDING_FLOOR: 18,
  WALL: 19,
  WALL_WALKWAY: 20,
  GATE: 21
};

const ROOM_CODES: Record<RoomType, number> = {
  ENTRY: 1,
  COMMON: 2,
  BEDROOM: 3,
  KITCHEN: 4,
  STORAGE: 5,
  SHOP: 6,
  WORKSHOP: 7,
  FORGE: 8,
  TAPROOM: 9,
  GUEST_ROOM: 10,
  SANCTUARY: 11,
  CHANCEL: 12,
  TOWER_ROOM: 13,
  MANOR_HALL: 14,
  STUDY: 15,
  FARM_ROOM: 16,
  STAIRS: 17
};

const VOXEL_MATERIAL_CODES: Record<VibeGameVoxelKind, number> = {
  ground: 1,
  road: 2,
  water: 3,
  city_wall: 4,
  wall_walkway: 5,
  gate: 6,
  building_floor: 7,
  building_wall: 8,
  building_roof: 9,
  interior_wall: 10,
  stairs: 11,
  obstacle: 12
};

const BIOME_DATA: Record<BiomeType, BiomeConfig> = {
  PLAINS: {
    ground: "GRASS",
    beach: "SAND",
    waterDeep: "WATER_DEEP",
    waterShallow: "WATER_SHALLOW",
    treeDensity: 0.4,
    rockDensity: 0.01,
    trees: ["TREE_OAK"],
    secondaryDoodads: ["BUSH"],
    elevationOffset: 0
  },
  FOREST: {
    ground: "GRASS",
    beach: "SAND",
    waterDeep: "WATER_DEEP",
    waterShallow: "WATER_SHALLOW",
    treeDensity: 0.3,
    rockDensity: 0.02,
    trees: ["TREE_OAK", "TREE_PINE"],
    secondaryDoodads: ["BUSH", "STUMP"],
    elevationOffset: 0
  },
  DESERT: {
    ground: "SAND",
    beach: "SAND",
    waterDeep: "WATER_DEEP",
    waterShallow: "WATER_SHALLOW",
    treeDensity: 0.95,
    rockDensity: 0.05,
    trees: ["CACTUS"],
    secondaryDoodads: ["ROCK"],
    elevationOffset: 0.05
  },
  TUNDRA: {
    ground: "SNOW",
    beach: "DIRT",
    waterDeep: "ICE",
    waterShallow: "ICE",
    treeDensity: 0.7,
    rockDensity: 0.03,
    trees: ["TREE_PINE"],
    secondaryDoodads: ["ROCK"],
    elevationOffset: 0
  },
  TAIGA: {
    ground: "SNOW",
    beach: "DIRT",
    waterDeep: "WATER_DEEP",
    waterShallow: "ICE",
    treeDensity: 0.25,
    rockDensity: 0.03,
    trees: ["TREE_PINE"],
    secondaryDoodads: ["STUMP"],
    elevationOffset: 0.1
  },
  SWAMP: {
    ground: "MUD",
    beach: "MUD",
    waterDeep: "WATER_DEEP",
    waterShallow: "WATER_SHALLOW",
    treeDensity: 0.3,
    rockDensity: 0.02,
    trees: ["TREE_OAK"],
    secondaryDoodads: ["BUSH"],
    elevationOffset: -0.15
  },
  JUNGLE: {
    ground: "GRASS",
    beach: "MUD",
    waterDeep: "WATER_DEEP",
    waterShallow: "WATER_SHALLOW",
    treeDensity: 0.2,
    rockDensity: 0.04,
    trees: ["TREE_PALM", "TREE_OAK"],
    secondaryDoodads: ["BUSH"],
    elevationOffset: 0
  },
  SAVANNA: {
    ground: "GRASS",
    beach: "DIRT",
    waterDeep: "WATER_DEEP",
    waterShallow: "WATER_SHALLOW",
    treeDensity: 0.7,
    rockDensity: 0.05,
    trees: ["TREE_OAK"],
    secondaryDoodads: ["ROCK"],
    elevationOffset: 0.05
  },
  BADLANDS: {
    ground: "DIRT",
    beach: "SAND",
    waterDeep: "WATER_DEEP",
    waterShallow: "WATER_SHALLOW",
    treeDensity: 0.95,
    rockDensity: 0.15,
    trees: ["TREE_DEAD"],
    secondaryDoodads: ["ROCK", "CACTUS"],
    elevationOffset: 0.1
  },
  MOUNTAIN: {
    ground: "ROCK_GROUND",
    beach: "DIRT",
    waterDeep: "WATER_DEEP",
    waterShallow: "WATER_SHALLOW",
    treeDensity: 0.6,
    rockDensity: 0.2,
    trees: ["TREE_PINE"],
    secondaryDoodads: ["ROCK"],
    elevationOffset: 0.2
  },
  VOLCANIC: {
    ground: "ASH",
    beach: "ROCK_GROUND",
    waterDeep: "LAVA",
    waterShallow: "LAVA",
    treeDensity: 0.9,
    rockDensity: 0.3,
    trees: ["TREE_DEAD"],
    secondaryDoodads: ["ROCK"],
    elevationOffset: 0.1
  },
  OASIS: {
    ground: "SAND",
    beach: "GRASS",
    waterDeep: "WATER_DEEP",
    waterShallow: "WATER_SHALLOW",
    treeDensity: 0.8,
    rockDensity: 0.02,
    trees: ["TREE_PALM"],
    secondaryDoodads: ["BUSH"],
    elevationOffset: -0.1
  },
  COASTAL: {
    ground: "SAND",
    beach: "SAND",
    waterDeep: "WATER_DEEP",
    waterShallow: "WATER_SHALLOW",
    treeDensity: 0.6,
    rockDensity: 0.05,
    trees: ["TREE_PALM"],
    secondaryDoodads: ["ROCK"],
    elevationOffset: -0.15
  },
  MUSHROOM_FOREST: {
    ground: "MUD",
    beach: "DIRT",
    waterDeep: "WATER_DEEP",
    waterShallow: "WATER_SHALLOW",
    treeDensity: 0.4,
    rockDensity: 0.05,
    trees: ["MUSHROOM"],
    secondaryDoodads: ["CRYSTAL"],
    elevationOffset: 0
  },
  CRYSTAL_WASTES: {
    ground: "CRYSTAL_FLOOR",
    beach: "ROCK_GROUND",
    waterDeep: "WATER_DEEP",
    waterShallow: "ICE",
    treeDensity: 0.8,
    rockDensity: 0.3,
    trees: ["CRYSTAL"],
    secondaryDoodads: ["ROCK"],
    elevationOffset: 0
  },
  AUTUMN_FOREST: {
    ground: "GRASS",
    beach: "DIRT",
    waterDeep: "WATER_DEEP",
    waterShallow: "WATER_SHALLOW",
    treeDensity: 0.3,
    rockDensity: 0.02,
    trees: ["TREE_OAK"],
    secondaryDoodads: ["STUMP"],
    elevationOffset: 0
  },
  CHERRY_BLOSSOM: {
    ground: "GRASS",
    beach: "SAND",
    waterDeep: "WATER_DEEP",
    waterShallow: "WATER_SHALLOW",
    treeDensity: 0.35,
    rockDensity: 0.02,
    trees: ["TREE_OAK"],
    secondaryDoodads: ["BUSH"],
    elevationOffset: 0
  },
  GLACIER: {
    ground: "SNOW",
    beach: "ICE",
    waterDeep: "WATER_DEEP",
    waterShallow: "ICE",
    treeDensity: 0.9,
    rockDensity: 0.1,
    trees: ["ROCK"],
    secondaryDoodads: ["ROCK"],
    elevationOffset: 0.05
  },
  DEAD_LANDS: {
    ground: "DIRT",
    beach: "MUD",
    waterDeep: "WATER_DEEP",
    waterShallow: "WATER_SHALLOW",
    treeDensity: 0.5,
    rockDensity: 0.1,
    trees: ["TREE_DEAD"],
    secondaryDoodads: ["STUMP"],
    elevationOffset: 0
  },
  HIGHLANDS: {
    ground: "GRASS",
    beach: "ROCK_GROUND",
    waterDeep: "WATER_DEEP",
    waterShallow: "WATER_SHALLOW",
    treeDensity: 0.8,
    rockDensity: 0.15,
    trees: ["TREE_PINE"],
    secondaryDoodads: ["ROCK"],
    elevationOffset: 0.2
  }
};

const ROAD_TYPES: TileType[] = ["ROAD_MAIN", "ROAD_DIRT", "BRIDGE", "DOCK"];
const WATER_TYPES: TileType[] = ["WATER_DEEP", "WATER_SHALLOW", "LAVA", "ICE"];
const VALID_BUILD_GROUND: TileType[] = ["GRASS", "SAND", "DIRT", "SNOW", "ASH", "MUD", "ROCK_GROUND", "CRYSTAL_FLOOR"];
const VALID_DOODAD_GROUND: TileType[] = ["GRASS", "DIRT", "SNOW", "SAND", "MUD", "ASH", "ROCK_GROUND", "CRYSTAL_FLOOR"];

export function createVibeGameTownLayout(options: VibeGameTownOptions): VibeGameTownLayout {
  const generator = new TownGenerator({
    seed: hashSeed(`${options.seed}:${options.burgId}:TownGeneratorOS`),
    biome: getTownBiome(options.biomeName, options.port),
    density: getTownDensity(options.population, options.capital || options.walls || options.plaza),
    connections: getConnections(options)
  });
  const town = generator.generate();
  applyFmgBurgFlags(town, options);
  const tileSize = getTileSize(options.population, options.capital);
  const origin: [number, number] = [
    round(options.center[0] - (town.width * tileSize) / 2),
    round(options.center[1] - (town.height * tileSize) / 2)
  ];
  const tiles = flattenTiles(town, origin, tileSize);
  const streets = getStreetTiles(town, origin, tileSize);
  const buildings = addConnectedTownBuildings(
    town.buildings.map(building => getBuildingLayout(building, origin, tileSize, town.seed))
  );
  const walls = tiles.filter(tile => tile.type === "WALL");
  const farms = tiles.filter(tile => tile.type === "FARM");
  const doodads = getDoodads(town, origin, tileSize);

  return {
    source: "TownGeneratorOS RealmSmithGenerator",
    seed: town.seed,
    name: options.name,
    biome: town.biome,
    density: town.density,
    grid: {
      width: town.width,
      height: town.height,
      tile_size_map_units: tileSize,
      origin,
      center: options.center
    },
    connections: town.connections,
    tiles,
    streets,
    buildings,
    walls,
    farms,
    doodads,
    matrix: createTownMatrix(town, buildings, origin, tileSize)
  };
}

export function parseTownGeneratorUrlState(input: string): TownGeneratorUrlState {
  const params = getTownGeneratorSearchParams(input);
  const sizeParam = parseIntegerParam(params.get("size"));
  const seedParam = parseIntegerParam(params.get("seed"));
  const size =
    sizeParam === null
      ? TOWN_GENERATOR_DEFAULT_SIZE
      : clamp(sizeParam, TOWN_GENERATOR_MIN_SIZE, TOWN_GENERATOR_MAX_SIZE);
  const seed = seedParam !== null && seedParam > 0 ? seedParam : TOWN_GENERATOR_DEFAULT_SEED;

  return {
    source: "TownGeneratorOS.StateManager",
    size,
    seed,
    canonical_search: `?size=${size}&seed=${seed}`,
    parameters: Object.fromEntries(params.entries())
  };
}

function applyFmgBurgFlags(town: TownMap, options: VibeGameTownOptions): void {
  if (options.temple && !town.buildings.some(building => building.type === "CHURCH")) {
    const building = getMostProminentBuilding(town);
    if (building) building.type = "CHURCH";
  }

  if (options.capital && !town.buildings.some(building => building.type === "MANOR")) {
    const building = getMostProminentBuilding(town);
    if (building && building.type !== "CHURCH") building.type = "MANOR";
  }
}

function getMostProminentBuilding(town: TownMap): Building | undefined {
  return [...town.buildings].sort((a, b) => b.width * b.height - a.width * a.height)[0];
}

function scaleBuildingPlot(size: { w: number; h: number }): { w: number; h: number } {
  return {
    w: size.w * TOWN_BUILDING_PLOT_SCALE,
    h: size.h * TOWN_BUILDING_PLOT_SCALE
  };
}

function getRoadParcelPlot(
  roadTile: { x: number; y: number },
  dir: { x: number; y: number },
  size: { w: number; h: number }
): { x: number; y: number } {
  if (dir.x === 1) return { x: roadTile.x + 1, y: roadTile.y - Math.floor(size.h / 2) };
  if (dir.x === -1) return { x: roadTile.x - size.w, y: roadTile.y - Math.floor(size.h / 2) };
  if (dir.y === 1) return { x: roadTile.x - Math.floor(size.w / 2), y: roadTile.y + 1 };
  return { x: roadTile.x - Math.floor(size.w / 2), y: roadTile.y - size.h };
}

interface TownGeneratorOptions {
  seed: number;
  biome: BiomeType;
  density: TownDensity;
  connections: Record<Direction, boolean>;
}

class TownGenerator {
  private rng: RNG;
  private noise: NoiseGenerator;
  private options: TownGeneratorOptions;
  private biomeConfig: BiomeConfig;

  constructor(options: TownGeneratorOptions) {
    this.rng = new RNG(options.seed);
    this.noise = new NoiseGenerator(options.seed);
    this.options = options;
    this.biomeConfig = BIOME_DATA[options.biome];
  }

  generate(): TownMap {
    const tiles = this.createTiles();
    this.generateTerrain(tiles);
    const center = {
      x: Math.floor(WIDTH / 2) + this.rng.rangeInt(-12, 12),
      y: Math.floor(HEIGHT / 2) + this.rng.rangeInt(-10, 10)
    };

    this.generatePlaza(tiles, center);
    this.generateRoads(tiles, center);
    const buildings = this.placeBuildings(tiles, center);
    this.generateWalls(tiles, buildings);
    this.attachFieldsToFarms(tiles, buildings);
    this.decorateDeadEnds(tiles);
    this.placeDoodads(tiles);
    this.placeStreetLamps(tiles);
    this.setRoadConnections(tiles);

    return {
      width: WIDTH,
      height: HEIGHT,
      tiles,
      buildings,
      seed: this.options.seed,
      biome: this.options.biome,
      density: this.options.density,
      connections: this.options.connections
    };
  }

  private createTiles(): Tile[][] {
    const tiles: Tile[][] = [];
    for (let x = 0; x < WIDTH; x++) {
      tiles[x] = [];
      for (let y = 0; y < HEIGHT; y++) {
        tiles[x][y] = { x, y, type: "EMPTY", variation: this.rng.next(), elevation: 0 };
      }
    }
    return tiles;
  }

  private generateTerrain(tiles: Tile[][]): void {
    const scale = 0.02;
    const { ground, beach, waterDeep, waterShallow, elevationOffset } = this.biomeConfig;

    for (let x = 0; x < WIDTH; x++) {
      for (let y = 0; y < HEIGHT; y++) {
        let value = this.noise.noise(x * scale, y * scale);
        value += this.noise.noise(x * 0.08, y * 0.08) * 0.1;

        const dx = (x - WIDTH / 2) / (WIDTH / 2);
        const dy = (y - HEIGHT / 2) / (HEIGHT / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        const centerBias = 0.25 * (1 - Math.min(1, dist));
        const elevation = Math.max(0, Math.min(1, value + centerBias + elevationOffset));

        tiles[x][y].elevation = elevation;
        if (elevation < 0.35) tiles[x][y].type = waterDeep;
        else if (elevation < 0.42) tiles[x][y].type = waterShallow;
        else if (elevation < 0.48) tiles[x][y].type = beach;
        else tiles[x][y].type = ground;
      }
    }
  }

  private generatePlaza(tiles: Tile[][], center: { x: number; y: number }): void {
    if (isWater(tiles[center.x][center.y].type)) return;

    if (this.options.density === "VERY_SPARSE") {
      tiles[center.x][center.y].doodad = { type: "WELL", id: "town-center", offsetX: 0, offsetY: 0 };
      return;
    }

    const size = 3;
    for (let x = center.x - size; x <= center.x + size; x++) {
      for (let y = center.y - size; y <= center.y + size; y++) {
        if (!inBounds(x, y) || isWater(tiles[x][y].type)) continue;
        if (Math.sqrt((x - center.x) ** 2 + (y - center.y) ** 2) <= size) tiles[x][y].type = "ROAD_MAIN";
      }
    }
    tiles[center.x][center.y].doodad = { type: "WELL", id: "town-center", offsetX: 0, offsetY: 0 };
  }

  private generateRoads(tiles: Tile[][], center: { x: number; y: number }): void {
    if (isWater(tiles[center.x][center.y].type)) return;

    const mainRoadType: TileType = this.options.density === "VERY_SPARSE" ? "ROAD_DIRT" : "ROAD_MAIN";
    const targets = this.getRoadTargets();
    const arteryPoints: { x: number; y: number }[] = [];

    for (const target of targets) {
      let cx = center.x;
      let cy = center.y;
      const totalDx = target.x - cx;
      const totalDy = target.y - cy;
      const distTotal = Math.sqrt(totalDx * totalDx + totalDy * totalDy);
      const stepX = totalDx / distTotal;
      const stepY = totalDy / distTotal;
      let currentDist = 0;

      while (currentDist < distTotal) {
        const noiseValue = this.noise.noise(cx * 0.05, cy * 0.05);
        const curve = (noiseValue - 0.5) * 0.8;
        cx += stepX - stepY * curve;
        cy += stepY + stepX * curve;

        const ix = Math.floor(cx);
        const iy = Math.floor(cy);
        if (!inBounds(ix, iy)) break;

        const tileType = tiles[ix][iy].type;
        if (tileType === "WATER_SHALLOW" && this.tryBuildBridge(tiles, ix, iy, stepX, stepY)) {
          currentDist++;
          continue;
        }
        if (tileType === "WATER_DEEP" || tileType === "WATER_SHALLOW") {
          this.createDock(tiles, ix, iy, stepX, stepY);
          break;
        }
        if (tileType === "LAVA") break;

        if (tileType !== mainRoadType && tileType !== "DOCK" && tileType !== "BRIDGE") {
          tiles[ix][iy].type = mainRoadType;
          tiles[ix][iy].doodad = undefined;
          arteryPoints.push({ x: ix, y: iy });
        }
        currentDist++;
      }
    }

    if (this.options.density !== "VERY_SPARSE" && this.options.density !== "SPARSE") {
      for (const radius of [12, 22]) {
        if (this.rng.chance(0.4)) this.createRingRoad(tiles, center.x, center.y, radius);
      }
    }

    const roadPoints = this.getRoadPoints(tiles, mainRoadType, center);
    const processed = new Set<string>();
    const branchChance = this.getBranchChance();

    for (const point of roadPoints) {
      const hash = `${point.x},${point.y}`;
      if (processed.has(hash)) continue;
      processed.add(hash);
      if (!this.rng.chance(branchChance)) continue;

      const dirs = shuffle(
        [
          { x: 0, y: 1 },
          { x: 0, y: -1 },
          { x: 1, y: 0 },
          { x: -1, y: 0 }
        ],
        this.rng
      );

      for (const dir of dirs) {
        const nx = point.x + dir.x;
        const ny = point.y + dir.y;
        if (inBounds(nx, ny) && tiles[nx][ny].type === mainRoadType) continue;
        if (this.rng.chance(0.6)) this.createStreet(tiles, point.x, point.y, dir.x, dir.y, this.rng.rangeInt(4, 12));
      }
    }
  }

  private getRoadTargets(): { x: number; y: number }[] {
    const targets: { x: number; y: number }[] = [];
    const exitDev = 20;
    if (this.options.connections.north)
      targets.push({ x: Math.floor(WIDTH / 2 + this.rng.range(-exitDev, exitDev)), y: 0 });
    if (this.options.connections.south)
      targets.push({ x: Math.floor(WIDTH / 2 + this.rng.range(-exitDev, exitDev)), y: HEIGHT - 1 });
    if (this.options.connections.east)
      targets.push({ x: WIDTH - 1, y: Math.floor(HEIGHT / 2 + this.rng.range(-exitDev, exitDev)) });
    if (this.options.connections.west)
      targets.push({ x: 0, y: Math.floor(HEIGHT / 2 + this.rng.range(-exitDev, exitDev)) });
    if (!targets.length) targets.push({ x: Math.floor(WIDTH / 2), y: HEIGHT - 1 });
    return targets;
  }

  private getRoadPoints(
    tiles: Tile[][],
    mainRoadType: TileType,
    center: { x: number; y: number }
  ): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];
    for (let x = 0; x < WIDTH; x++) {
      for (let y = 0; y < HEIGHT; y++) {
        if (tiles[x][y].type === mainRoadType) points.push({ x, y });
      }
    }
    return points.sort(
      (a, b) => (a.x - center.x) ** 2 + (a.y - center.y) ** 2 - ((b.x - center.x) ** 2 + (b.y - center.y) ** 2)
    );
  }

  private getBranchChance(): number {
    if (this.options.density === "VERY_SPARSE") return 0.05;
    if (this.options.density === "SPARSE") return 0.1;
    if (this.options.density === "MEDIUM") return 0.2;
    if (this.options.density === "HIGH") return 0.35;
    return 0.6;
  }

  private tryBuildBridge(tiles: Tile[][], startX: number, startY: number, dirX: number, dirY: number): boolean {
    const dx = dirX > 0 ? 1 : dirX < 0 ? -1 : 0;
    const dy = dirY > 0 ? 1 : dirY < 0 ? -1 : 0;
    if (dx !== 0 && dy !== 0) return false;

    let bridgeLen = 0;
    for (let i = 1; i <= 6; i++) {
      const tx = startX + dx * i;
      const ty = startY + dy * i;
      if (!inBounds(tx, ty)) return false;
      if (tiles[tx][ty].type !== "WATER_DEEP" && tiles[tx][ty].type !== "WATER_SHALLOW") {
        bridgeLen = i;
        break;
      }
    }
    if (!bridgeLen) return false;

    for (let i = 0; i < bridgeLen; i++) {
      const tx = startX + dx * i;
      const ty = startY + dy * i;
      if (tiles[tx][ty].type === "WATER_SHALLOW" || tiles[tx][ty].type === "WATER_DEEP") {
        tiles[tx][ty].type = "BRIDGE";
        tiles[tx][ty].doodad = undefined;
      }
    }
    return true;
  }

  private createRingRoad(tiles: Tile[][], cx: number, cy: number, radius: number): void {
    for (let i = 0; i < radius * 4; i++) {
      const angle = (i / (radius * 4)) * Math.PI * 2;
      const x = Math.round(cx + Math.cos(angle) * radius);
      const y = Math.round(cy + Math.sin(angle) * radius * 0.8);
      if (!inInnerBounds(x, y)) continue;
      if (["WATER_DEEP", "WATER_SHALLOW", "LAVA", "ICE", "DOCK", "BRIDGE"].includes(tiles[x][y].type)) continue;
      tiles[x][y].type = "ROAD_MAIN";
    }
  }

  private createDock(tiles: Tile[][], startX: number, startY: number, dirX: number, dirY: number): void {
    const dx = Math.abs(dirX) > Math.abs(dirY) ? (dirX > 0 ? 1 : -1) : 0;
    const dy = dx ? 0 : dirY > 0 ? 1 : -1;
    let cx = startX;
    let cy = startY;

    for (let i = 0; i < this.rng.rangeInt(4, 7); i++) {
      if (!inBounds(cx, cy)) break;
      tiles[cx][cy].type = "DOCK";
      cx += dx;
      cy += dy;
    }

    if (this.rng.chance(0.5) && inInnerBounds(cx, cy)) {
      tiles[cx][cy].type = "DOCK";
      if (dx) {
        tiles[cx][cy - 1].type = "DOCK";
        tiles[cx][cy + 1].type = "DOCK";
      } else {
        tiles[cx - 1][cy].type = "DOCK";
        tiles[cx + 1][cy].type = "DOCK";
      }
    }
  }

  private createStreet(tiles: Tile[][], startX: number, startY: number, dx: number, dy: number, length: number): void {
    let cx = startX;
    let cy = startY;
    let currentDx = dx;
    let currentDy = dy;

    for (let i = 0; i < length; i++) {
      cx += currentDx;
      cy += currentDy;
      if (!inInnerBounds(cx, cy)) break;
      const tile = tiles[cx][cy];
      if (tile.type === "ROAD_MAIN") break;
      if (["WATER_DEEP", "WATER_SHALLOW", "LAVA", "ICE", "DOCK", "BRIDGE"].includes(tile.type)) break;
      tile.type = "ROAD_DIRT";

      if (i > 2 && i < length - 2 && this.rng.chance(0.2)) {
        if (currentDx) {
          currentDy = this.rng.chance(0.5) ? 1 : -1;
          currentDx = 0;
        } else {
          currentDx = this.rng.chance(0.5) ? 1 : -1;
          currentDy = 0;
        }
      }
    }

    if (this.options.density !== "VERY_SPARSE" && this.options.density !== "SPARSE" && this.rng.chance(0.5)) {
      this.createCulDeSac(tiles, cx, cy);
    }
  }

  private createCulDeSac(tiles: Tile[][], cx: number, cy: number): void {
    const neighbors = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
      { x: 1, y: 1 },
      { x: -1, y: 1 },
      { x: 1, y: -1 },
      { x: -1, y: -1 }
    ];

    for (const neighbor of neighbors) {
      const x = cx + neighbor.x;
      const y = cy + neighbor.y;
      if (!inInnerBounds(x, y)) continue;
      if (["WATER_DEEP", "WATER_SHALLOW", "BRIDGE", "DOCK"].includes(tiles[x][y].type)) continue;
      tiles[x][y].type = "ROAD_DIRT";
      tiles[x][y].doodad = undefined;
    }
  }

  private placeBuildings(tiles: Tile[][], center: { x: number; y: number }): Building[] {
    const buildings: Building[] = [];
    const roadTiles = this.getRoadTiles(tiles).sort((a, b) => {
      const aScore = this.getParcelRoadScore(a, center);
      const bScore = this.getParcelRoadScore(b, center);
      return aScore - bScore;
    });
    const targetCount = this.getTargetBuildingCount(roadTiles.length);

    for (const roadTile of roadTiles) {
      if (buildings.length >= targetCount) break;
      const dist = Math.sqrt((roadTile.x - center.x) ** 2 + (roadTile.y - center.y) ** 2);
      const building = this.tryPlaceRoadParcelBuilding(tiles, roadTile, dist);
      if (building) buildings.push(building);
    }

    return buildings;
  }

  private getParcelRoadScore(roadTile: { x: number; y: number }, center: { x: number; y: number }): number {
    const dist = Math.sqrt((roadTile.x - center.x) ** 2 + (roadTile.y - center.y) ** 2);
    return dist + this.noise.noise(roadTile.x * 0.17, roadTile.y * 0.17) * 8;
  }

  private getTargetBuildingCount(roadCount: number): number {
    const densityTarget: Record<TownDensity, number> = {
      VERY_SPARSE: 7,
      SPARSE: 12,
      MEDIUM: 20,
      HIGH: 30,
      EXTREME: 42
    };
    return Math.min(densityTarget[this.options.density], Math.max(4, Math.floor(roadCount / 3)));
  }

  private tryPlaceRoadParcelBuilding(
    tiles: Tile[][],
    roadTile: { x: number; y: number },
    dist: number
  ): Building | null {
    const directions = shuffle(
      [
        { x: 0, y: 1 },
        { x: 0, y: -1 },
        { x: 1, y: 0 },
        { x: -1, y: 0 }
      ],
      this.rng
    );
    const sizes = this.getParcelBuildingSizes(dist);

    for (const dir of directions) {
      const adjacentX = roadTile.x + dir.x;
      const adjacentY = roadTile.y + dir.y;
      if (!inInnerBounds(adjacentX, adjacentY) || isRoad(tiles[adjacentX][adjacentY].type)) continue;

      for (const size of sizes) {
        const plot = getRoadParcelPlot(roadTile, dir, size);
        if (!this.canBuild(tiles, plot.x, plot.y, size.w, size.h)) continue;
        return this.createBuilding(tiles, plot.x, plot.y, size.w, size.h, roadTile, dist);
      }
    }

    return null;
  }

  private getParcelBuildingSizes(dist: number): { w: number; h: number }[] {
    const central = [
      { w: 4, h: 4 },
      { w: 4, h: 3 },
      { w: 3, h: 4 }
    ];
    const standard = [
      { w: 3, h: 3 },
      { w: 2, h: 3 },
      { w: 3, h: 2 },
      { w: 2, h: 2 }
    ];
    return (dist < 16 ? [...central, ...standard] : standard).map(scaleBuildingPlot);
  }

  private getRoadTiles(tiles: Tile[][]): { x: number; y: number }[] {
    const roadTiles: { x: number; y: number }[] = [];
    for (let x = 1; x < WIDTH - 1; x++) {
      for (let y = 1; y < HEIGHT - 1; y++) {
        if (tiles[x][y].type === "ROAD_MAIN" || tiles[x][y].type === "ROAD_DIRT") roadTiles.push({ x, y });
      }
    }
    return roadTiles;
  }

  private canBuild(tiles: Tile[][], x: number, y: number, width: number, height: number): boolean {
    if (x < 5 || x + width >= WIDTH - 5 || y < 5 || y + height >= HEIGHT - 5) return false;
    for (let bx = x; bx < x + width; bx++) {
      for (let by = 0; by < height; by++) {
        const tile = tiles[bx][y + by];
        if (!VALID_BUILD_GROUND.includes(tile.type) || tile.buildingId || tile.doodad) return false;
      }
    }
    return true;
  }

  private createBuilding(
    tiles: Tile[][],
    x: number,
    y: number,
    width: number,
    height: number,
    roadTile: { x: number; y: number },
    distToCenter: number
  ): Building {
    const id = `b_${x}_${y}`;
    let type: BuildingType = "HOUSE_SMALL";

    if (width >= 3 && height >= 3) {
      if (distToCenter < 8 && this.rng.chance(0.3)) type = "CHURCH";
      else if (distToCenter < 12 && this.rng.chance(0.4)) type = "TAVERN";
      else if (distToCenter < 15 && this.rng.chance(0.2)) type = "MANOR";
      else if (this.rng.chance(0.3)) type = "BLACKSMITH";
      else type = "HOUSE_LARGE";
    } else if (width === 2 && height === 2) {
      if (distToCenter > 20 && this.rng.chance(0.4)) type = "FARM_HOUSE";
      else if (distToCenter < 20 && this.rng.chance(0.05)) type = "TOWER";
    } else if (distToCenter < 10 && this.rng.chance(0.3)) type = "MARKET_STALL";

    for (let bx = 0; bx < width; bx++) {
      for (let by = 0; by < height; by++) {
        tiles[x + bx][y + by].type = "BUILDING_FLOOR";
        tiles[x + bx][y + by].buildingId = id;
      }
    }

    const door = this.findDoor(x, y, width, height, roadTile);
    let color = "#ffedd5";
    let roof = "#78350f";
    let roofStyle = this.rng.pick<RoofStyle>(["THATCHED", "TILED", "SLATE"]);
    let wallTexture = this.rng.pick<WallTexture>(["TIMBER_FRAME", "STONE", "STUCCO", "WOOD"]);

    if (this.options.density === "VERY_SPARSE") {
      wallTexture = this.rng.pick<WallTexture>(["WOOD", "TIMBER_FRAME"]);
      roofStyle = this.rng.pick<RoofStyle>(["THATCHED", "SLATE"]);
      if (type === "MANOR") type = "FARM_HOUSE";
      if (type === "TOWER") type = "HOUSE_SMALL";
      if (type === "CHURCH") {
        color = "#d6d3d1";
        roof = "#57534e";
      }
      if (type === "TAVERN") {
        color = "#78350f";
        roof = "#451a03";
      }
    }

    if (roofStyle === "THATCHED") roof = "#d97706";
    if (roofStyle === "TILED") roof = "#991b1b";
    if (roofStyle === "SLATE") roof = "#334155";
    if (type === "TAVERN") {
      color = "#fbbf24";
      roof = "#1e3a8a";
    }
    if (type === "BLACKSMITH") {
      color = "#94a3b8";
      roof = "#334155";
    }
    if (type === "HOUSE_LARGE") roof = "#7f1d1d";
    if (type === "CHURCH") {
      color = "#e2e8f0";
      roof = "#4f46e5";
    }
    if (type === "MANOR") {
      color = "#d1fae5";
      roof = "#065f46";
    }
    if (type === "TOWER") {
      color = "#9ca3af";
      roof = "#111827";
    }
    if (type === "FARM_HOUSE") {
      color = "#fef3c7";
      roof = "#92400e";
    }
    if (type === "HOUSE_SMALL" && this.rng.chance(0.3)) roof = "#57534e";

    return {
      id,
      type,
      x,
      y,
      width,
      height,
      doorX: door.x,
      doorY: door.y,
      color,
      roofColor: roof,
      roofStyle,
      wallTexture
    };
  }

  private findDoor(
    x: number,
    y: number,
    width: number,
    height: number,
    roadTile: { x: number; y: number }
  ): { x: number; y: number } {
    if (roadTile.x < x) return { x: 0, y: clamp(roadTile.y - y, 0, height - 1) };
    if (roadTile.x >= x + width) return { x: width - 1, y: clamp(roadTile.y - y, 0, height - 1) };
    if (roadTile.y < y) return { x: clamp(roadTile.x - x, 0, width - 1), y: 0 };
    if (roadTile.y >= y + height) return { x: clamp(roadTile.x - x, 0, width - 1), y: height - 1 };

    let doorX = 0;
    let doorY = 0;
    let minDistance = Infinity;
    const consider = (candidateX: number, candidateY: number, relativeX: number, relativeY: number) => {
      const distance = (candidateX - roadTile.x) ** 2 + (candidateY - roadTile.y) ** 2;
      if (distance >= minDistance) return;
      minDistance = distance;
      doorX = relativeX;
      doorY = relativeY;
    };

    for (let bx = 0; bx < width; bx++) {
      consider(x + bx, y, bx, 0);
      consider(x + bx, y + height - 1, bx, height - 1);
    }
    for (let by = 0; by < height; by++) {
      consider(x, y + by, 0, by);
      consider(x + width - 1, y + by, width - 1, by);
    }
    return { x: doorX, y: doorY };
  }

  private attachFieldsToFarms(tiles: Tile[][], buildings: Building[]): void {
    if (["DESERT", "GLACIER", "VOLCANIC", "CRYSTAL_WASTES", "BADLANDS"].includes(this.options.biome)) return;
    const farmHouses = buildings.filter(building => building.type === "FARM_HOUSE");

    for (const house of farmHouses) {
      const crop = this.rng.pick<DoodadType>(["CROP_WHEAT", "CROP_CORN", "CROP_PUMPKIN"]);
      let fieldsPlaced = 0;
      const dirs = shuffle(
        [
          { dx: 0, dy: -1 },
          { dx: 0, dy: 1 },
          { dx: 1, dy: 0 },
          { dx: -1, dy: 0 }
        ],
        this.rng
      );

      for (const dir of dirs) {
        if (fieldsPlaced >= this.rng.rangeInt(1, 3)) break;
        const width = this.rng.rangeInt(3, 7);
        const height = this.rng.rangeInt(3, 7);
        let x = house.x;
        let y = house.y;
        if (dir.dx === 1) x = house.x + house.width + 1;
        if (dir.dx === -1) x = house.x - width - 1;
        if (dir.dy === 1) y = house.y + house.height + 1;
        if (dir.dy === -1) y = house.y - height - 1;
        if (dir.dx) y += this.rng.rangeInt(-2, 2);
        else x += this.rng.rangeInt(-2, 2);

        if (!this.canPlaceFarm(tiles, x, y, width, height)) continue;
        this.createFarmField(tiles, x, y, width, height, crop);
        fieldsPlaced++;
      }
    }
  }

  private canPlaceFarm(tiles: Tile[][], x: number, y: number, width: number, height: number): boolean {
    if (x < 1 || x + width >= WIDTH - 1 || y < 1 || y + height >= HEIGHT - 1) return false;
    for (let fx = x; fx < x + width; fx++) {
      for (let fy = y; fy < y + height; fy++) {
        const tile = tiles[fx][fy];
        if (!["GRASS", "DIRT", "MUD"].includes(tile.type) || tile.buildingId || tile.doodad) return false;
      }
    }
    return true;
  }

  private createFarmField(
    tiles: Tile[][],
    x: number,
    y: number,
    width: number,
    height: number,
    crop: DoodadType
  ): void {
    for (let fx = x; fx < x + width; fx++) {
      for (let fy = y; fy < y + height; fy++) {
        tiles[fx][fy].type = "FARM";
        if (fx % 2 === 0) tiles[fx][fy].doodad = { type: crop, id: `crop_${fx}_${fy}`, offsetX: 0, offsetY: 0 };
      }
    }
  }

  private generateWalls(tiles: Tile[][], buildings: Building[]): void {
    if (this.options.density === "VERY_SPARSE" || this.options.density === "SPARSE" || buildings.length < 5) return;
    let minX = WIDTH;
    let maxX = 0;
    let minY = HEIGHT;
    let maxY = 0;
    for (const building of buildings) {
      minX = Math.min(minX, building.x);
      maxX = Math.max(maxX, building.x + building.width);
      minY = Math.min(minY, building.y);
      maxY = Math.max(maxY, building.y + building.height);
    }

    minX = Math.max(2, minX - 6);
    maxX = Math.min(WIDTH - 3, maxX + 6);
    minY = Math.max(2, minY - 6);
    maxY = Math.min(HEIGHT - 3, maxY + 6);
    const setWall = (x: number, y: number) => {
      const type = tiles[x][y].type;
      if (isWater(type) || type === "ROAD_MAIN" || type === "BUILDING_FLOOR") return;
      tiles[x][y].type = "WALL";
      tiles[x][y].doodad = undefined;
    };

    for (let x = minX; x <= maxX; x++) {
      setWall(x, minY);
      setWall(x, maxY);
    }
    for (let y = minY; y <= maxY; y++) {
      setWall(minX, y);
      setWall(maxX, y);
    }
  }

  private decorateDeadEnds(tiles: Tile[][]): void {
    for (let x = 1; x < WIDTH - 1; x++) {
      for (let y = 1; y < HEIGHT - 1; y++) {
        if (tiles[x][y].type !== "ROAD_DIRT") continue;
        const connections = countRoadNeighbors(tiles, x, y);
        if (connections === 1 && this.rng.chance(0.4)) {
          tiles[x][y].doodad = {
            type: this.rng.pick<DoodadType>(["CRATE", "WELL", "STREET_LAMP"]),
            id: `de_${x}_${y}`,
            offsetX: 0,
            offsetY: 0
          };
        }
      }
    }
  }

  private placeDoodads(tiles: Tile[][]): void {
    const { trees, secondaryDoodads, treeDensity, rockDensity } = this.biomeConfig;
    for (let x = 0; x < WIDTH; x++) {
      for (let y = 0; y < HEIGHT; y++) {
        const tile = tiles[x][y];
        if (tile.buildingId || tile.doodad || isRoad(tile.type) || tile.type === "WALL" || tile.type === "FARM")
          continue;
        if (!VALID_DOODAD_GROUND.includes(tile.type)) continue;
        const noiseValue = this.noise.noise(x * 0.15, y * 0.15);
        if (noiseValue > 1 - treeDensity && this.rng.chance(0.6)) {
          tile.doodad = {
            type: this.rng.pick(trees),
            id: `tree_${x}_${y}`,
            offsetX: this.rng.range(-0.2, 0.2),
            offsetY: this.rng.range(-0.2, 0.2)
          };
        } else if (this.rng.chance(rockDensity)) {
          tile.doodad = {
            type: this.rng.pick(secondaryDoodads),
            id: `rock_${x}_${y}`,
            offsetX: this.rng.range(-0.3, 0.3),
            offsetY: this.rng.range(-0.3, 0.3)
          };
        }
      }
    }
  }

  private placeStreetLamps(tiles: Tile[][]): void {
    for (let x = 2; x < WIDTH - 2; x += 3) {
      for (let y = 2; y < HEIGHT - 2; y += 3) {
        if (tiles[x][y].type !== "ROAD_MAIN" || !this.rng.chance(0.15)) continue;
        for (const neighbor of [
          { x: 1, y: 0 },
          { x: -1, y: 0 },
          { x: 0, y: 1 },
          { x: 0, y: -1 }
        ]) {
          const tile = tiles[x + neighbor.x][y + neighbor.y];
          if (isRoad(tile.type) || tile.buildingId || tile.doodad || tile.type === "WALL" || tile.type === "WATER_DEEP")
            continue;
          tile.doodad = { type: "STREET_LAMP", id: `lamp_${x + neighbor.x}_${y + neighbor.y}`, offsetX: 0, offsetY: 0 };
          break;
        }
      }
    }
  }

  private setRoadConnections(tiles: Tile[][]): void {
    for (let x = 0; x < WIDTH; x++) {
      for (let y = 0; y < HEIGHT; y++) {
        if (!isRoad(tiles[x][y].type)) continue;
        let mask = 0;
        if (y > 0 && isRoad(tiles[x][y - 1].type)) mask |= 1;
        if (x < WIDTH - 1 && isRoad(tiles[x + 1][y].type)) mask |= 2;
        if (y < HEIGHT - 1 && isRoad(tiles[x][y + 1].type)) mask |= 4;
        if (x > 0 && isRoad(tiles[x - 1][y].type)) mask |= 8;
        tiles[x][y].roadConnections = mask;
      }
    }
  }
}

class RNG {
  private state: number;

  constructor(seedValue: number) {
    this.state = seedValue;
  }

  next(): number {
    this.state += 0x6d2b79f5;
    let value = this.state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  rangeInt(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  chance(probability: number): boolean {
    return this.next() < probability;
  }

  pick<T>(array: T[]): T {
    return array[this.rangeInt(0, array.length - 1)];
  }
}

class NoiseGenerator {
  private perm: number[] = new Array(512);
  private p: number[] = new Array(256);

  constructor(seedValue: number) {
    const rng = new RNG(seedValue);
    for (let i = 0; i < 256; i++) this.p[i] = i;
    for (let i = 255; i > 0; i--) {
      const n = rng.rangeInt(0, i);
      const temp = this.p[i];
      this.p[i] = this.p[n];
      this.p[n] = temp;
    }
    for (let i = 0; i < 512; i++) this.perm[i] = this.p[i & 255];
  }

  noise(x: number, y: number): number {
    const xBase = Math.floor(x) & 255;
    const yBase = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = fade(x);
    const v = fade(y);
    const a = this.perm[xBase] + yBase;
    const b = this.perm[xBase + 1] + yBase;
    const aa = grad(this.perm[a], x, y);
    const ab = grad(this.perm[a + 1], x - 1, y);
    const ba = grad(this.perm[b], x, y - 1);
    const bb = grad(this.perm[b + 1], x - 1, y - 1);
    return (lerp(v, lerp(u, aa, ab), lerp(u, ba, bb)) + 1) / 2;
  }
}

function getTownBiome(fmgBiomeName: string | undefined, isPort: boolean): BiomeType {
  if (isPort) return "COASTAL";
  const name = (fmgBiomeName || "").toLowerCase();
  if (name.includes("desert")) return "DESERT";
  if (name.includes("tundra")) return "TUNDRA";
  if (name.includes("taiga")) return "TAIGA";
  if (name.includes("swamp") || name.includes("wetland")) return "SWAMP";
  if (name.includes("tropical") || name.includes("rainforest")) return "JUNGLE";
  if (name.includes("savanna")) return "SAVANNA";
  if (name.includes("mountain") || name.includes("alpine")) return "MOUNTAIN";
  if (name.includes("glacier") || name.includes("ice")) return "GLACIER";
  if (name.includes("forest") || name.includes("wood")) return "FOREST";
  if (name.includes("grass") || name.includes("steppe")) return "PLAINS";
  return "PLAINS";
}

function getTownDensity(population: number, isCapital: boolean): TownDensity {
  if (isCapital || population >= 240) return "EXTREME";
  if (population >= 160) return "HIGH";
  if (population >= 80) return "MEDIUM";
  if (population >= 35) return "SPARSE";
  return "VERY_SPARSE";
}

function getConnections(options: VibeGameTownOptions): Record<Direction, boolean> {
  const rng = new RNG(hashSeed(`${options.seed}:${options.burgId}:town-connections`));
  const connections: Record<Direction, boolean> = {
    north: Boolean(options.connections?.north),
    east: Boolean(options.connections?.east),
    south: Boolean(options.connections?.south),
    west: Boolean(options.connections?.west)
  };
  if (Object.values(connections).some(Boolean)) return connections;

  const directions: Direction[] = ["north", "east", "south", "west"];
  shuffle(directions, rng);
  const count = options.capital ? 4 : options.port ? 3 : rng.rangeInt(1, 3);
  for (const direction of directions.slice(0, count)) connections[direction] = true;
  return connections;
}

function getTileSize(population: number, isCapital: boolean): number {
  const size = 0.52 + Math.sqrt(Math.max(20, population)) / (isCapital ? 28 : 34);
  return round(Math.min(1.25, Math.max(0.55, size)), 3);
}

function flattenTiles(town: TownMap, origin: [number, number], tileSize: number): VibeGameTownTile[] {
  const tiles: VibeGameTownTile[] = [];
  for (let x = 0; x < town.width; x++) {
    for (let y = 0; y < town.height; y++) {
      const tile = town.tiles[x][y];
      tiles.push(getTileLayout(tile, origin, tileSize));
    }
  }
  return tiles;
}

function getStreetTiles(town: TownMap, origin: [number, number], tileSize: number): VibeGameTownStreetTile[] {
  const streets: VibeGameTownStreetTile[] = [];
  for (let x = 0; x < town.width; x++) {
    for (let y = 0; y < town.height; y++) {
      const tile = town.tiles[x][y];
      if (!isRoad(tile.type)) continue;
      streets.push({
        ...getTileLayout(tile, origin, tileSize),
        kind: getStreetKind(tile.type),
        neighbors: getRoadNeighbors(town.tiles, x, y)
      });
    }
  }
  return streets;
}

function getTileLayout(tile: Tile, origin: [number, number], tileSize: number): VibeGameTownTile {
  return {
    x: tile.x,
    y: tile.y,
    type: tile.type,
    elevation: round(tile.elevation, 4),
    variation: round(tile.variation, 4),
    coordinate_center: gridToMap(tile.x + 0.5, tile.y + 0.5, origin, tileSize),
    road_connections: tile.roadConnections,
    building_id: tile.buildingId,
    doodad_id: tile.doodad?.id
  };
}

function getBuildingLayout(
  building: Building,
  origin: [number, number],
  tileSize: number,
  townSeed: number
): VibeGameTownBuilding {
  const x1 = building.x;
  const y1 = building.y;
  const x2 = building.x + building.width;
  const y2 = building.y + building.height;
  const doorGrid: [number, number] = [building.x + building.doorX, building.y + building.doorY];
  const floors = getBuildingFloors(building, origin, tileSize, townSeed);
  return {
    id: building.id,
    type: building.type,
    grid_rect: { x: building.x, y: building.y, width: building.width, height: building.height },
    coordinate_center: gridToMap(building.x + building.width / 2, building.y + building.height / 2, origin, tileSize),
    footprint: [
      gridToMap(x1, y1, origin, tileSize),
      gridToMap(x2, y1, origin, tileSize),
      gridToMap(x2, y2, origin, tileSize),
      gridToMap(x1, y2, origin, tileSize),
      gridToMap(x1, y1, origin, tileSize)
    ],
    door: {
      grid: doorGrid,
      coordinate: gridToMap(doorGrid[0] + 0.5, doorGrid[1] + 0.5, origin, tileSize)
    },
    color: building.color,
    roof_color: building.roofColor,
    roof_style: building.roofStyle,
    wall_texture: building.wallTexture,
    connected_buildings: [],
    interior: {
      floor_count: floors.length,
      floor_height_voxels: 4,
      wall_height_voxels: 3,
      has_stairs: floors.length > 1
    },
    floors
  };
}

function getBuildingFloors(
  building: Building,
  origin: [number, number],
  tileSize: number,
  townSeed: number
): VibeGameBuildingFloor[] {
  const floorCount = getBuildingFloorCount(building, townSeed);
  const stairsGrid = floorCount > 1 ? getStairsGrid(building) : null;
  const floors: VibeGameBuildingFloor[] = [];

  for (let level = 0; level < floorCount; level++) {
    const rooms = getBuildingRooms(building, level, origin, tileSize, townSeed, stairsGrid);
    const floor: VibeGameBuildingFloor = {
      level,
      elevation_voxels: level * 4,
      rooms
    };

    if (stairsGrid) {
      floor.stairs = {
        id: `${building.id}_stairs_${level}`,
        grid: stairsGrid,
        coordinate: gridToMap(stairsGrid[0] + 0.5, stairsGrid[1] + 0.5, origin, tileSize),
        connects_to_level: level + 1 < floorCount ? level + 1 : level > 0 ? level - 1 : null
      };
    }

    floors.push(floor);
  }

  return floors;
}

function getBuildingFloorCount(building: Building, townSeed: number): number {
  const rng = new RNG(hashSeed(`${townSeed}:${building.id}:floors`));
  const area = building.width * building.height;

  if (building.type === "TOWER") return area >= 6 ? rng.rangeInt(3, 4) : 3;
  if (building.type === "MANOR") return 2;
  if (building.type === "CHURCH" || building.type === "MARKET_STALL" || building.type === "FARM_HOUSE") return 1;
  if (building.type === "TAVERN") return area >= 9 || rng.chance(0.6) ? 2 : 1;
  if (building.type === "HOUSE_LARGE") return area >= 9 || rng.chance(0.45) ? 2 : 1;
  if (building.type === "BLACKSMITH") return rng.chance(0.35) ? 2 : 1;
  return 1;
}

function getBuildingRooms(
  building: Building,
  floor: number,
  origin: [number, number],
  tileSize: number,
  townSeed: number,
  stairsGrid: [number, number] | null
): VibeGameBuildingRoom[] {
  const rng = new RNG(hashSeed(`${townSeed}:${building.id}:rooms:${floor}`));
  const roomRects = partitionBuilding(building, floor, rng);
  const roomTypes = getRoomTypes(building, floor, roomRects.length);
  const rooms = roomRects.map((rect, index) => {
    const type = roomTypes[index] || roomTypes[roomTypes.length - 1] || "COMMON";
    return createRoomLayout(building, rect, type, floor, index, origin, tileSize, stairsGrid);
  });

  addInteriorDoors(rooms, origin, tileSize);
  return rooms;
}

function partitionBuilding(
  building: Building,
  floor: number,
  rng: RNG
): { x: number; y: number; width: number; height: number }[] {
  const rects = [{ x: building.x, y: building.y, width: building.width, height: building.height }];
  const area = building.width * building.height;
  const maxRooms = getMaxRooms(building, floor, area);

  while (rects.length < maxRooms) {
    const index = rects
      .map((rect, i) => ({ rect, i, area: rect.width * rect.height }))
      .sort((a, b) => b.area - a.area)[0].i;
    const rect = rects[index];
    const vertical = rect.width > rect.height || (rect.width === rect.height && rng.chance(0.5));
    const split = splitRect(rect, vertical);
    if (!split && vertical) {
      const fallback = splitRect(rect, false);
      if (!fallback) break;
      rects.splice(index, 1, ...fallback);
      continue;
    }
    if (!split) break;
    rects.splice(index, 1, ...split);
  }

  return rects.sort((a, b) => a.y - b.y || a.x - b.x);
}

function getMaxRooms(building: Building, floor: number, area: number): number {
  if (area <= 4 || building.type === "TOWER") return 1;
  if (building.type === "MARKET_STALL") return area >= 6 ? 2 : 1;
  if (building.type === "CHURCH") return area >= 9 ? 2 : 1;
  if (floor > 0 && area >= 9) return 2;
  if (area >= 12 && ["TAVERN", "MANOR", "BLACKSMITH"].includes(building.type)) return 3;
  return area >= 8 ? 2 : 1;
}

function splitRect(
  rect: { x: number; y: number; width: number; height: number },
  vertical: boolean
):
  | [{ x: number; y: number; width: number; height: number }, { x: number; y: number; width: number; height: number }]
  | null {
  if (vertical) {
    if (rect.width < 3) return null;
    const width = Math.floor(rect.width / 2);
    return [
      { x: rect.x, y: rect.y, width, height: rect.height },
      { x: rect.x + width, y: rect.y, width: rect.width - width, height: rect.height }
    ];
  }

  if (rect.height < 3) return null;
  const height = Math.floor(rect.height / 2);
  return [
    { x: rect.x, y: rect.y, width: rect.width, height },
    { x: rect.x, y: rect.y + height, width: rect.width, height: rect.height - height }
  ];
}

function getRoomTypes(building: Building, floor: number, roomCount: number): RoomType[] {
  const firstFloorTypes: Record<BuildingType, RoomType[]> = {
    HOUSE_SMALL: ["COMMON"],
    HOUSE_LARGE: ["COMMON", "KITCHEN", "STORAGE"],
    TAVERN: ["TAPROOM", "KITCHEN", "STORAGE"],
    BLACKSMITH: ["FORGE", "WORKSHOP", "STORAGE"],
    MARKET_STALL: ["SHOP", "STORAGE"],
    CHURCH: ["SANCTUARY", "CHANCEL", "STORAGE"],
    TOWER: ["TOWER_ROOM"],
    MANOR: ["MANOR_HALL", "KITCHEN", "STORAGE"],
    FARM_HOUSE: ["FARM_ROOM", "KITCHEN", "STORAGE"]
  };
  const upperFloorTypes: Record<BuildingType, RoomType[]> = {
    HOUSE_SMALL: ["BEDROOM"],
    HOUSE_LARGE: ["BEDROOM", "STUDY", "STORAGE"],
    TAVERN: ["GUEST_ROOM", "BEDROOM", "STORAGE"],
    BLACKSMITH: ["BEDROOM", "STORAGE"],
    MARKET_STALL: ["STORAGE"],
    CHURCH: ["STORAGE"],
    TOWER: ["TOWER_ROOM"],
    MANOR: ["BEDROOM", "STUDY", "STORAGE"],
    FARM_HOUSE: ["BEDROOM", "STORAGE"]
  };
  const types = floor ? upperFloorTypes[building.type] : firstFloorTypes[building.type];
  return Array.from({ length: roomCount }, (_, index) => types[index] || types[types.length - 1]);
}

function createRoomLayout(
  building: Building,
  rect: { x: number; y: number; width: number; height: number },
  type: RoomType,
  floor: number,
  index: number,
  origin: [number, number],
  tileSize: number,
  stairsGrid: [number, number] | null
): VibeGameBuildingRoom {
  const room: VibeGameBuildingRoom = {
    id: `${building.id}_f${floor}_r${index}`,
    type,
    name: getRoomName(type),
    floor,
    grid_rect: rect,
    coordinate_center: gridToMap(rect.x + rect.width / 2, rect.y + rect.height / 2, origin, tileSize),
    footprint: getRectFootprint(rect, origin, tileSize),
    tiles: getRoomTiles(rect),
    doors: []
  };

  if (floor === 0 && containsGrid(rect, building.x + building.doorX, building.y + building.doorY)) {
    const doorGrid: [number, number] = [building.x + building.doorX, building.y + building.doorY];
    room.doors.push({
      id: `${room.id}_door_exterior`,
      kind: "exterior",
      grid: doorGrid,
      coordinate: gridToMap(doorGrid[0] + 0.5, doorGrid[1] + 0.5, origin, tileSize)
    });
  }

  if (stairsGrid && containsGrid(rect, stairsGrid[0], stairsGrid[1])) {
    room.doors.push({
      id: `${room.id}_stairs`,
      kind: "stairs",
      grid: stairsGrid,
      coordinate: gridToMap(stairsGrid[0] + 0.5, stairsGrid[1] + 0.5, origin, tileSize),
      connects_to: `${building.id}_stairs_${floor}`
    });
  }

  return room;
}

function addInteriorDoors(rooms: VibeGameBuildingRoom[], origin: [number, number], tileSize: number): void {
  for (let i = 0; i < rooms.length; i++) {
    for (let j = i + 1; j < rooms.length; j++) {
      const doorGrid = getSharedDoorGrid(rooms[i].grid_rect, rooms[j].grid_rect);
      if (!doorGrid) continue;
      const doorA: VibeGameBuildingDoor = {
        id: `${rooms[i].id}_door_${rooms[j].id}`,
        kind: "interior",
        grid: doorGrid,
        coordinate: gridToMap(doorGrid[0] + 0.5, doorGrid[1] + 0.5, origin, tileSize),
        connects_to: rooms[j].id
      };
      const doorB: VibeGameBuildingDoor = {
        ...doorA,
        id: `${rooms[j].id}_door_${rooms[i].id}`,
        connects_to: rooms[i].id
      };
      rooms[i].doors.push(doorA);
      rooms[j].doors.push(doorB);
    }
  }
}

function getSharedDoorGrid(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
): [number, number] | null {
  const aRight = a.x + a.width;
  const bRight = b.x + b.width;
  const aBottom = a.y + a.height;
  const bBottom = b.y + b.height;

  if (aRight === b.x || bRight === a.x) {
    const y1 = Math.max(a.y, b.y);
    const y2 = Math.min(aBottom, bBottom);
    if (y1 >= y2) return null;
    return [aRight === b.x ? b.x : a.x, Math.floor((y1 + y2 - 1) / 2)];
  }

  if (aBottom === b.y || bBottom === a.y) {
    const x1 = Math.max(a.x, b.x);
    const x2 = Math.min(aRight, bRight);
    if (x1 >= x2) return null;
    return [Math.floor((x1 + x2 - 1) / 2), aBottom === b.y ? b.y : a.y];
  }

  return null;
}

function getStairsGrid(building: Building): [number, number] {
  const x = Math.min(building.x + building.width - 1, Math.max(building.x, building.x + building.doorX));
  const y = Math.min(building.y + building.height - 1, Math.max(building.y, building.y + building.doorY));
  return [x, y];
}

function getRoomTiles(rect: { x: number; y: number; width: number; height: number }): [number, number][] {
  const tiles: [number, number][] = [];
  for (let x = rect.x; x < rect.x + rect.width; x++) {
    for (let y = rect.y; y < rect.y + rect.height; y++) tiles.push([x, y]);
  }
  return tiles;
}

function getRectFootprint(
  rect: { x: number; y: number; width: number; height: number },
  origin: [number, number],
  tileSize: number
): [number, number][] {
  const x2 = rect.x + rect.width;
  const y2 = rect.y + rect.height;
  return [
    gridToMap(rect.x, rect.y, origin, tileSize),
    gridToMap(x2, rect.y, origin, tileSize),
    gridToMap(x2, y2, origin, tileSize),
    gridToMap(rect.x, y2, origin, tileSize),
    gridToMap(rect.x, rect.y, origin, tileSize)
  ];
}

function containsGrid(rect: { x: number; y: number; width: number; height: number }, x: number, y: number): boolean {
  return x >= rect.x && x < rect.x + rect.width && y >= rect.y && y < rect.y + rect.height;
}

function addConnectedTownBuildings(buildings: VibeGameTownBuilding[]): VibeGameTownBuilding[] {
  return buildings.map(building => ({
    ...building,
    connected_buildings: getConnectedBuildingRefs(building, buildings, candidate => candidate.id)
  }));
}

function addConnectedBuildingMatrices(
  buildings: VibeGameBuildingMatrix[],
  streetWidth?: number[][]
): VibeGameBuildingMatrix[] {
  return buildings.map(building => ({
    ...building,
    connected_buildings: getConnectedBuildingRefs(building, buildings, candidate => candidate.building_id, streetWidth)
  }));
}

function getConnectedBuildingRefs<T extends { grid_rect: { x: number; y: number; width: number; height: number } }>(
  building: T,
  buildings: T[],
  getId: (building: T) => string,
  streetWidth?: number[][]
): VibeGameConnectedBuilding[] {
  const connections: VibeGameConnectedBuilding[] = [];
  const buildingId = getId(building);

  for (const candidate of buildings) {
    const candidateId = getId(candidate);
    if (candidateId === buildingId) continue;
    const contact = getBuildingRectContact(building.grid_rect, candidate.grid_rect);
    if (!contact) continue;
    if (streetWidth && contact.contact_tiles.every(([x, y]) => streetWidth[y]?.[x] > 0)) continue;
    connections.push({
      building_id: candidateId,
      direction: contact.direction,
      contact_tiles: contact.contact_tiles,
      separated_by_road: false
    });
  }

  return connections.sort((a, b) => a.building_id.localeCompare(b.building_id));
}

function getBuildingRectContact(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
): { direction: Direction; contact_tiles: [number, number][] } | null {
  const aRight = a.x + a.width;
  const bRight = b.x + b.width;
  const aBottom = a.y + a.height;
  const bBottom = b.y + b.height;

  if (aRight === b.x || bRight === a.x) {
    const y1 = Math.max(a.y, b.y);
    const y2 = Math.min(aBottom, bBottom) - 1;
    if (y1 > y2) return null;
    const x = aRight === b.x ? aRight - 1 : a.x;
    return {
      direction: aRight === b.x ? "east" : "west",
      contact_tiles: rangePoints(y1, y2, y => [x, y])
    };
  }

  if (aBottom === b.y || bBottom === a.y) {
    const x1 = Math.max(a.x, b.x);
    const x2 = Math.min(aRight, bRight) - 1;
    if (x1 > x2) return null;
    const y = aBottom === b.y ? aBottom - 1 : a.y;
    return {
      direction: aBottom === b.y ? "south" : "north",
      contact_tiles: rangePoints(x1, x2, x => [x, y])
    };
  }

  const x1 = Math.max(a.x, b.x);
  const x2 = Math.min(aRight, bRight) - 1;
  const y1 = Math.max(a.y, b.y);
  const y2 = Math.min(aBottom, bBottom) - 1;
  if (x1 > x2 || y1 > y2) return null;

  const aCenterX = a.x + a.width / 2;
  const aCenterY = a.y + a.height / 2;
  const bCenterX = b.x + b.width / 2;
  const bCenterY = b.y + b.height / 2;
  const direction =
    Math.abs(bCenterX - aCenterX) >= Math.abs(bCenterY - aCenterY)
      ? bCenterX >= aCenterX
        ? "east"
        : "west"
      : bCenterY >= aCenterY
        ? "south"
        : "north";
  const contact_tiles: [number, number][] = [];
  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) contact_tiles.push([x, y]);
  }

  return { direction, contact_tiles };
}

function rangePoints(start: number, end: number, create: (value: number) => [number, number]): [number, number][] {
  const points: [number, number][] = [];
  for (let value = start; value <= end; value++) points.push(create(value));
  return points;
}

function getRoomName(type: RoomType): string {
  return type
    .toLowerCase()
    .split("_")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getDoodads(town: TownMap, origin: [number, number], tileSize: number): VibeGameTownDoodad[] {
  const doodads: VibeGameTownDoodad[] = [];
  for (let x = 0; x < town.width; x++) {
    for (let y = 0; y < town.height; y++) {
      const doodad = town.tiles[x][y].doodad;
      if (!doodad) continue;
      doodads.push({
        id: doodad.id,
        type: doodad.type,
        grid: [x, y],
        coordinate: gridToMap(x + 0.5 + doodad.offsetX, y + 0.5 + doodad.offsetY, origin, tileSize),
        offset: [round(doodad.offsetX, 3), round(doodad.offsetY, 3)]
      });
    }
  }
  return doodads;
}

function createTownMatrix(
  town: TownMap,
  buildings: VibeGameTownBuilding[],
  origin: [number, number],
  tileSize: number
): VibeGameTownMatrix {
  const cityWall = getCityWallMatrixData(town.tiles);
  const gates = new Set(cityWall.gates.map(([x, y]) => `${x},${y}`));
  const walkways = new Set(cityWall.walkway.map(([x, y]) => `${x},${y}`));

  const solidHeight = createRows(town.width, town.height, (x, y) => getSolidHeight(town.tiles[x][y]));
  const terrain = createRows(town.width, town.height, (x, y) =>
    getMatrixTerrainCode(town.tiles[x][y], x, y, gates, walkways)
  );
  const clearance = createRows(town.width, town.height, (x, y) =>
    canCharacterStand(town.tiles[x][y], solidHeight[y][x]) ? CHARACTER_HEIGHT_VOXELS : 0
  );
  const walkable = createRows(town.width, town.height, (x, y) =>
    canCharacterStand(town.tiles[x][y], solidHeight[y][x]) || walkways.has(`${x},${y}`) || gates.has(`${x},${y}`)
      ? 1
      : 0
  );
  const streetWidth = createRows(town.width, town.height, (x, y) =>
    getStreetWidth(town.tiles[x][y].type, gates, walkways, x, y)
  );

  return withVoxelTown({
    schema: "vibe-game-town-matrix",
    schema_version: 1,
    coordinate_space: "town-grid",
    block: {
      size_map_units: tileSize,
      origin,
      width: town.width,
      height: town.height
    },
    character: {
      width_blocks: 1,
      height_blocks: CHARACTER_HEIGHT_VOXELS,
      clearance_height_voxels: CHARACTER_HEIGHT_VOXELS
    },
    legend: {
      terrain: getTerrainLegend(),
      rooms: getRoomLegend()
    },
    terrain,
    solid_height_voxels: solidHeight,
    clearance_height_voxels: clearance,
    walkable,
    street_width_blocks: streetWidth,
    city_wall: cityWall,
    interiors: buildings.map(building => createBuildingMatrix(building))
  });
}

export function createVibeGameTownMatrixFromMfcgVector(
  vector: MfcgVectorData,
  options: MfcgMatrixOptions = {}
): VibeGameTownMatrix {
  const origin = options.origin || [0, 0];
  const tileSize = options.tileSize || 1;
  const layers = collectMfcgLayers(vector);
  const bounds = getMfcgBounds(layers);
  const buildingRings = layers.buildings.flatMap(feature => getPolygonRings(feature));
  const transform = getMfcgMatrixTransform(bounds, buildingRings, options);
  const { width, height } = transform;
  const buildingMask = createRows(width, height, () => 0);
  const terrain = createRows(width, height, () => TERRAIN_CODES.GRASS);
  const solidHeight = createRows(width, height, () => 0);
  const clearance = createRows(width, height, () => CHARACTER_HEIGHT_VOXELS);
  const walkable = createRows(width, height, () => 1);
  const streetWidth = createRows(width, height, () => 0);

  for (const ring of buildingRings) fillPolygonMatrix(ring, transform, (x, y) => (buildingMask[y][x] = 1));

  for (const feature of layers.water) {
    for (const ring of getPolygonRings(feature))
      fillPolygonMatrix(ring, transform, (x, y) => {
        terrain[y][x] = TERRAIN_CODES.WATER_SHALLOW;
        solidHeight[y][x] = CHARACTER_HEIGHT_VOXELS;
        clearance[y][x] = 0;
        walkable[y][x] = 0;
      });
  }

  for (const feature of [...layers.greens, ...layers.fields]) {
    const code = layers.fields.includes(feature) ? TERRAIN_CODES.FARM : TERRAIN_CODES.GRASS;
    for (const ring of getPolygonRings(feature))
      fillPolygonMatrix(ring, transform, (x, y) => {
        terrain[y][x] = code;
      });
  }

  for (const feature of layers.roads) {
    for (const line of getLineStrings(feature))
      rasterizeLineMatrix(line, transform, 1, (x, y) =>
        setRoadMatrixCell(x, y, buildingMask, terrain, solidHeight, clearance, walkable, streetWidth)
      );
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!buildingMask[y][x]) continue;
      terrain[y][x] = TERRAIN_CODES.BUILDING_FLOOR;
      solidHeight[y][x] = 0;
      clearance[y][x] = CHARACTER_HEIGHT_VOXELS;
      walkable[y][x] = 0;
      streetWidth[y][x] = 0;
    }
  }

  const wallPoints: [number, number][] = [];
  for (const feature of layers.walls) {
    for (const line of getLineStrings(feature))
      rasterizeLineMatrix(line, transform, 0, (x, y) => {
        terrain[y][x] = TERRAIN_CODES.WALL;
        solidHeight[y][x] = CITY_WALL_HEIGHT_VOXELS;
        clearance[y][x] = 0;
        walkable[y][x] = 0;
        wallPoints.push([x, y]);
      });
  }

  const gates = uniquePoints(wallPoints.filter(([x, y]) => hasNeighborValue(streetWidth, x, y, value => value >= 3)));
  const walkway = uniquePoints(getInnerWallWalkway(wallPoints, walkable));
  for (const [x, y] of gates) {
    terrain[y][x] = TERRAIN_CODES.GATE;
    solidHeight[y][x] = 0;
    clearance[y][x] = CHARACTER_HEIGHT_VOXELS;
    walkable[y][x] = 1;
    streetWidth[y][x] = 3;
  }
  for (const [x, y] of walkway) {
    if (walkable[y][x]) {
      terrain[y][x] = TERRAIN_CODES.WALL_WALKWAY;
      streetWidth[y][x] = Math.max(streetWidth[y][x], 1);
    }
  }
  return withVoxelTown({
    schema: "vibe-game-town-matrix",
    schema_version: 1,
    coordinate_space: "town-grid",
    block: {
      size_map_units: tileSize,
      origin,
      width,
      height
    },
    character: {
      width_blocks: 1,
      height_blocks: CHARACTER_HEIGHT_VOXELS,
      clearance_height_voxels: CHARACTER_HEIGHT_VOXELS
    },
    legend: {
      terrain: getTerrainLegend(),
      rooms: getRoomLegend()
    },
    terrain,
    solid_height_voxels: solidHeight,
    clearance_height_voxels: clearance,
    walkable,
    street_width_blocks: streetWidth,
    city_wall: {
      height_voxels: CITY_WALL_HEIGHT_VOXELS,
      walkway_width_blocks: 1,
      wall: uniquePoints(wallPoints),
      walkway,
      gates
    },
    interiors: addConnectedBuildingMatrices(createMfcgBuildingInteriors(buildingRings, transform), streetWidth)
  });
}

function setRoadMatrixCell(
  x: number,
  y: number,
  buildingMask: number[][],
  terrain: number[][],
  solidHeight: number[][],
  clearance: number[][],
  walkable: number[][],
  streetWidth: number[][]
): void {
  if (buildingMask[y][x]) {
    setRoadShoulderMatrixCell(x, y, buildingMask, terrain, solidHeight, clearance, walkable, streetWidth);
    return;
  }

  terrain[y][x] = TERRAIN_CODES.ROAD_MAIN;
  solidHeight[y][x] = 0;
  clearance[y][x] = CHARACTER_HEIGHT_VOXELS;
  walkable[y][x] = 1;
  streetWidth[y][x] = Math.max(streetWidth[y][x], 3);
}

function setRoadShoulderMatrixCell(
  x: number,
  y: number,
  buildingMask: number[][],
  terrain: number[][],
  solidHeight: number[][],
  clearance: number[][],
  walkable: number[][],
  streetWidth: number[][]
): void {
  for (const [dx, dy] of [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0]
  ] as [number, number][]) {
    const nx = x + dx;
    const ny = y + dy;
    if (ny < 0 || ny >= buildingMask.length || nx < 0 || nx >= buildingMask[ny].length || buildingMask[ny][nx])
      continue;
    setRoadMatrixCell(nx, ny, buildingMask, terrain, solidHeight, clearance, walkable, streetWidth);
    return;
  }
}

function withVoxelTown(matrix: VibeGameTownMatrixBase): VibeGameTownMatrix {
  return { ...matrix, voxel_town: createVibeGameVoxelTown(matrix) };
}

export function createVibeGameVoxelTown(matrix: VibeGameTownMatrixBase | VibeGameTownMatrix): VibeGameVoxelTown {
  const voxels: VibeGameVoxel[] = [];
  const terrainLegend = matrix.legend.terrain;
  const roomsLegend = matrix.legend.rooms;
  const addVoxel = (
    x: number,
    y: number,
    z: number,
    kind: VibeGameVoxelKind,
    solid: boolean,
    extra: Partial<VibeGameVoxel> = {}
  ): void => {
    voxels.push({
      x,
      y,
      z,
      material: VOXEL_MATERIAL_CODES[kind],
      kind,
      solid,
      ...extra
    });
  };

  for (let y = 0; y < matrix.block.height; y++) {
    for (let x = 0; x < matrix.block.width; x++) {
      const terrain = terrainLegend[matrix.terrain[y][x]];
      const solidHeight = matrix.solid_height_voxels[y][x];

      if (terrain === "EMPTY") continue;
      if (terrain === "WALL") {
        for (let z = 0; z < Math.max(1, solidHeight); z++) addVoxel(x, y, z, "city_wall", true);
        continue;
      }
      if (terrain === "WATER_DEEP" || terrain === "WATER_SHALLOW" || terrain === "LAVA" || terrain === "ICE") {
        addVoxel(x, y, 0, "water", false);
        continue;
      }
      if (terrain === "ROAD_MAIN" || terrain === "ROAD_DIRT" || terrain === "BRIDGE" || terrain === "DOCK") {
        addVoxel(x, y, 0, "road", false);
        continue;
      }
      if (terrain === "WALL_WALKWAY") {
        addVoxel(x, y, 0, "wall_walkway", false);
        continue;
      }
      if (terrain === "GATE") {
        addVoxel(x, y, 0, "gate", false);
        continue;
      }
      if (terrain === "BUILDING_FLOOR") {
        addVoxel(x, y, 0, "building_floor", false);
        continue;
      }

      addVoxel(x, y, 0, "ground", false);
      for (let z = 1; z < solidHeight; z++) addVoxel(x, y, z, "obstacle", true);
    }
  }

  for (const building of matrix.interiors) {
    for (const floor of building.floors) {
      const elevation = floor.elevation_voxels;
      const roofZ = elevation + building.floor_height_voxels;

      for (let y = 0; y < floor.height; y++) {
        for (let x = 0; x < floor.width; x++) {
          if (!floor.room[y][x]) continue;

          const worldX = building.grid_rect.x + x;
          const worldY = building.grid_rect.y + y;
          const room = roomsLegend[floor.room[y][x]];
          addVoxel(worldX, worldY, elevation, "building_floor", false, {
            building_id: building.building_id,
            floor: floor.level,
            room
          });
          if (floor.level === building.floors.length - 1)
            addVoxel(worldX, worldY, roofZ, "building_roof", true, {
              building_id: building.building_id,
              floor: floor.level,
              room
            });

          addDirectionalWallVoxels(
            floor.wall_north[y][x],
            worldX,
            worldY,
            elevation,
            "north",
            building,
            floor,
            addVoxel
          );
          addDirectionalWallVoxels(floor.wall_east[y][x], worldX, worldY, elevation, "east", building, floor, addVoxel);
          addDirectionalWallVoxels(
            floor.wall_south[y][x],
            worldX,
            worldY,
            elevation,
            "south",
            building,
            floor,
            addVoxel
          );
          addDirectionalWallVoxels(floor.wall_west[y][x], worldX, worldY, elevation, "west", building, floor, addVoxel);
        }
      }

      if (floor.stairs) {
        addVoxel(
          building.grid_rect.x + floor.stairs[0],
          building.grid_rect.y + floor.stairs[1],
          elevation + 1,
          "stairs",
          false,
          {
            building_id: building.building_id,
            floor: floor.level
          }
        );
      }
    }
  }

  const maxZ = voxels.reduce((max, voxel) => Math.max(max, voxel.z), 0);
  return {
    schema: "vibe-game-voxel-town",
    schema_version: 1,
    coordinate_space: "town-cubic-grid",
    cubic_grid: {
      origin: [matrix.block.origin[0], matrix.block.origin[1], 0],
      width: matrix.block.width,
      height: matrix.block.height,
      depth: maxZ + CHARACTER_HEIGHT_VOXELS + 1,
      voxel_size_blocks: 1,
      tile_size_map_units: matrix.block.size_map_units,
      axes: {
        x: "east",
        y: "south",
        z: "up"
      }
    },
    character: {
      width_voxels: 1,
      height_voxels: CHARACTER_HEIGHT_VOXELS,
      clearance_height_voxels: CHARACTER_HEIGHT_VOXELS
    },
    materials: getVoxelMaterialLegend(),
    voxels
  };
}

function addDirectionalWallVoxels(
  hasWall: number,
  x: number,
  y: number,
  elevation: number,
  face: Direction,
  building: VibeGameBuildingMatrix,
  floor: VibeGameBuildingFloorMatrix,
  addVoxel: (
    x: number,
    y: number,
    z: number,
    kind: VibeGameVoxelKind,
    solid: boolean,
    extra?: Partial<VibeGameVoxel>
  ) => void
): void {
  if (!hasWall) return;
  const isExterior =
    face === "north"
      ? y === building.grid_rect.y
      : face === "east"
        ? x === building.grid_rect.x + building.grid_rect.width - 1
        : face === "south"
          ? y === building.grid_rect.y + building.grid_rect.height - 1
          : x === building.grid_rect.x;
  const kind: VibeGameVoxelKind = isExterior ? "building_wall" : "interior_wall";
  for (let z = elevation + 1; z <= elevation + building.wall_height_voxels; z++) {
    addVoxel(x, y, z, kind, true, {
      face,
      building_id: building.building_id,
      floor: floor.level
    });
  }
}

function getCityWallMatrixData(tiles: Tile[][]): VibeGameTownMatrix["city_wall"] {
  const wall = getWallCells(tiles);
  const walkway: [number, number][] = [];
  const gates: [number, number][] = [];
  if (!wall.length) {
    return {
      height_voxels: CITY_WALL_HEIGHT_VOXELS,
      walkway_width_blocks: 1,
      wall,
      walkway,
      gates
    };
  }

  const bounds = wall.reduce(
    (result, [x, y]) => ({
      minX: Math.min(result.minX, x),
      maxX: Math.max(result.maxX, x),
      minY: Math.min(result.minY, y),
      maxY: Math.max(result.maxY, y)
    }),
    { minX: WIDTH, maxX: 0, minY: HEIGHT, maxY: 0 }
  );
  const addWalkway = (x: number, y: number): void => {
    if (!inBounds(x, y)) return;
    const tile = tiles[x][y];
    if (isWater(tile.type) || tile.type === "BUILDING_FLOOR" || tile.type === "WALL") return;
    walkway.push([x, y]);
  };

  for (const [x, y] of wall) {
    if (y === bounds.minY) addWalkway(x, y + 1);
    if (y === bounds.maxY) addWalkway(x, y - 1);
    if (x === bounds.minX) addWalkway(x + 1, y);
    if (x === bounds.maxX) addWalkway(x - 1, y);
  }

  for (let x = bounds.minX; x <= bounds.maxX; x++) {
    if (tiles[x][bounds.minY]?.type === "ROAD_MAIN") gates.push([x, bounds.minY]);
    if (tiles[x][bounds.maxY]?.type === "ROAD_MAIN") gates.push([x, bounds.maxY]);
  }
  for (let y = bounds.minY; y <= bounds.maxY; y++) {
    if (tiles[bounds.minX]?.[y]?.type === "ROAD_MAIN") gates.push([bounds.minX, y]);
    if (tiles[bounds.maxX]?.[y]?.type === "ROAD_MAIN") gates.push([bounds.maxX, y]);
  }

  return {
    height_voxels: CITY_WALL_HEIGHT_VOXELS,
    walkway_width_blocks: 1,
    wall,
    walkway: uniquePoints(walkway),
    gates: uniquePoints(gates)
  };
}

function collectMfcgLayers(vector: MfcgVectorData): MfcgLayers {
  const layers: MfcgLayers = {
    roads: [],
    walls: [],
    buildings: [],
    water: [],
    greens: [],
    fields: []
  };
  const visit = (feature: MfcgVectorFeature, inheritedName = ""): void => {
    const name = getMfcgFeatureName(feature) || inheritedName;
    const normalized = name.toLowerCase();
    const target =
      normalized.includes("road") || normalized.includes("arter")
        ? "roads"
        : normalized.includes("wall")
          ? "walls"
          : normalized.includes("building") || normalized.includes("prism")
            ? "buildings"
            : normalized.includes("water") || normalized.includes("river") || normalized.includes("canal")
              ? "water"
              : normalized.includes("green") || normalized.includes("square")
                ? "greens"
                : normalized.includes("field")
                  ? "fields"
                  : null;

    if (target && (feature.geometry || feature.geometries)) layers[target].push(feature);
    for (const item of getMfcgChildren(feature)) visit(item, name);
  };

  for (const feature of getMfcgRootFeatures(vector)) visit(feature);
  return layers;
}

function getMfcgRootFeatures(vector: MfcgVectorData): MfcgVectorFeature[] {
  return vector.features || vector.items || [];
}

function getMfcgChildren(feature: MfcgVectorFeature): MfcgVectorFeature[] {
  return feature.items || [];
}

function getMfcgFeatureName(feature: MfcgVectorFeature): string {
  const props = (feature.properties ||
    ("h" in (feature.props || {}) ? (feature.props as { h?: Record<string, unknown> }).h : feature.props) ||
    {}) as Record<string, unknown>;
  const name = feature.name || feature.id || props?.name || props?.id;
  return typeof name === "string" ? name : "";
}

function getMfcgGeometry(feature: MfcgVectorFeature): MfcgVectorGeometry[] {
  if (feature.geometry) return [feature.geometry];
  return feature.geometries || [];
}

function getMfcgBounds(layers: MfcgLayers): Bounds {
  const points = Object.values(layers).flatMap(features =>
    features.flatMap(feature => getGeometryPoints(getMfcgGeometry(feature)))
  );
  if (!points.length) return { minX: 0, maxX: WIDTH, minY: 0, maxY: HEIGHT };

  return points.reduce(
    (bounds, [x, y]) => ({
      minX: Math.min(bounds.minX, x),
      maxX: Math.max(bounds.maxX, x),
      minY: Math.min(bounds.minY, y),
      maxY: Math.max(bounds.maxY, y)
    }),
    { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
  );
}

function getGeometryPoints(geometries: MfcgVectorGeometry[]): [number, number][] {
  const points: [number, number][] = [];
  for (const geometry of geometries) {
    if (geometry.type === "GeometryCollection") points.push(...getGeometryPoints(geometry.geometries || []));
    else points.push(...getCoordinatePoints(geometry.coordinates));
  }
  return points;
}

function getCoordinatePoints(value: unknown): [number, number][] {
  if (!Array.isArray(value)) return [];
  if (typeof value[0] === "number" && typeof value[1] === "number") return [[value[0], value[1]]];
  return value.flatMap(item => getCoordinatePoints(item));
}

function getPolygonRings(feature: MfcgVectorFeature): [number, number][][] {
  return getMfcgGeometry(feature).flatMap(geometry => getGeometryPolygonRings(geometry));
}

function getGeometryPolygonRings(geometry: MfcgVectorGeometry): [number, number][][] {
  if (geometry.type === "GeometryCollection") return (geometry.geometries || []).flatMap(getGeometryPolygonRings);
  if (geometry.type === "Polygon") return getPolygonCoordinates(geometry.coordinates);
  if (geometry.type === "MultiPolygon") return getMultiPolygonCoordinates(geometry.coordinates);
  return [];
}

function getPolygonCoordinates(value: unknown): [number, number][][] {
  if (!Array.isArray(value)) return [];
  return value.map(ring => getCoordinatePoints(ring)).filter(ring => ring.length >= 3);
}

function getMultiPolygonCoordinates(value: unknown): [number, number][][] {
  if (!Array.isArray(value)) return [];
  return value.flatMap(polygon => getPolygonCoordinates(polygon));
}

function getLineStrings(feature: MfcgVectorFeature): [number, number][][] {
  return getMfcgGeometry(feature).flatMap(geometry => getGeometryLineStrings(geometry));
}

function getGeometryLineStrings(geometry: MfcgVectorGeometry): [number, number][][] {
  if (geometry.type === "GeometryCollection") return (geometry.geometries || []).flatMap(getGeometryLineStrings);
  if (geometry.type === "LineString") {
    const line = getCoordinatePoints(geometry.coordinates);
    return line.length >= 2 ? [line] : [];
  }
  if (geometry.type === "MultiLineString" && Array.isArray(geometry.coordinates)) {
    return geometry.coordinates.map(line => getCoordinatePoints(line)).filter(line => line.length >= 2);
  }
  if (geometry.type === "Polygon") return getPolygonCoordinates(geometry.coordinates);
  if (geometry.type === "MultiPolygon") return getMultiPolygonCoordinates(geometry.coordinates);
  return [];
}

function getMfcgMatrixTransform(
  bounds: Bounds,
  buildingRings: [number, number][][],
  options: MfcgMatrixOptions
): MatrixTransform {
  let scale = computeUniformTownScale(bounds, buildingRings);
  const requestedWidth = options.width ? Math.max(1, options.width) : null;
  const requestedHeight = options.height ? Math.max(1, options.height) : null;

  if (requestedWidth || requestedHeight) {
    const dx = getBoundsWidth(bounds);
    const dy = getBoundsHeight(bounds);
    const maxScaleX = requestedWidth ? Math.max(1, requestedWidth - MATRIX_MARGIN - 1) / dx : Infinity;
    const maxScaleY = requestedHeight ? Math.max(1, requestedHeight - MATRIX_MARGIN - 1) / dy : Infinity;
    scale = Math.min(scale, maxScaleX, maxScaleY);
  }

  const dimensions = deriveMatrixDimensions(bounds, scale);
  return {
    ...bounds,
    scale,
    margin: dimensions.margin,
    width: requestedWidth || dimensions.width,
    height: requestedHeight || dimensions.height
  };
}

function computeUniformTownScale(bounds: Bounds, buildingRings: [number, number][][]): number {
  const areas = buildingRings.map(ring => Math.abs(getRingArea(ring))).filter(area => area > 0);
  const medianArea = getMedian(areas) || MIN_BUILDING_CELLS;
  const buildingScale = Math.sqrt(MIN_BUILDING_CELLS / medianArea);
  const maxBounds = Math.max(getBoundsWidth(bounds), getBoundsHeight(bounds));
  const maxTownScale = (MAX_TOWN_DIM - 2 * MATRIX_MARGIN) / maxBounds;
  return Math.max(0.01, Math.min(buildingScale, maxTownScale));
}

function deriveMatrixDimensions(bounds: Bounds, scale: number): { width: number; height: number; margin: number } {
  return {
    width: Math.max(1, Math.ceil(getBoundsWidth(bounds) * scale) + 2 * MATRIX_MARGIN),
    height: Math.max(1, Math.ceil(getBoundsHeight(bounds) * scale) + 2 * MATRIX_MARGIN),
    margin: MATRIX_MARGIN
  };
}

function getRingArea(ring: [number, number][]): number {
  let area = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    area += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
  }
  return area / 2;
}

function getMedian(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function getBoundsWidth(bounds: Bounds): number {
  return Math.max(1, bounds.maxX - bounds.minX);
}

function getBoundsHeight(bounds: Bounds): number {
  return Math.max(1, bounds.maxY - bounds.minY);
}

function fillPolygonMatrix(
  ring: [number, number][],
  transform: MatrixTransform,
  apply: (x: number, y: number) => void
): void {
  const matrixRing = ring.map(point => vectorPointToMatrixUniform(point, transform));
  const xs = matrixRing.map(([x]) => x);
  const ys = matrixRing.map(([, y]) => y);
  const minX = Math.max(0, Math.min(...xs));
  const maxX = Math.min(transform.width - 1, Math.max(...xs));
  const minY = Math.max(0, Math.min(...ys));
  const maxY = Math.min(transform.height - 1, Math.max(...ys));

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (isPointInPolygon(x + 0.5, y + 0.5, matrixRing)) apply(x, y);
    }
  }
}

function rasterizeLineMatrix(
  line: [number, number][],
  transform: MatrixTransform,
  radius: number,
  apply: (x: number, y: number) => void
): void {
  for (let i = 1; i < line.length; i++) {
    const [x0, y0] = vectorPointToMatrixUniform(line[i - 1], transform);
    const [x1, y1] = vectorPointToMatrixUniform(line[i], transform);
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let step = 0; step <= steps; step++) {
      const x = Math.round(x0 + ((x1 - x0) * step) / steps);
      const y = Math.round(y0 + ((y1 - y0) * step) / steps);
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < transform.width && ny >= 0 && ny < transform.height) apply(nx, ny);
        }
      }
    }
  }
}

function vectorPointToMatrixUniform([x, y]: [number, number], transform: MatrixTransform): [number, number] {
  return [
    clamp(Math.round((x - transform.minX) * transform.scale) + transform.margin, 0, transform.width - 1),
    clamp(Math.round((y - transform.minY) * transform.scale) + transform.margin, 0, transform.height - 1)
  ];
}

function isPointInPolygon(x: number, y: number, ring: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi || 1) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function hasNeighborValue(matrix: number[][], x: number, y: number, predicate: (value: number) => boolean): boolean {
  for (const [dx, dy] of [
    [0, 0],
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0]
  ] as [number, number][]) {
    const nx = x + dx;
    const ny = y + dy;
    if (ny >= 0 && ny < matrix.length && nx >= 0 && nx < matrix[ny].length && predicate(matrix[ny][nx])) return true;
  }
  return false;
}

function getInnerWallWalkway(wall: [number, number][], walkable: number[][]): [number, number][] {
  const center: [number, number] = [
    wall.reduce((total, [x]) => total + x, 0) / Math.max(wall.length, 1),
    wall.reduce((total, [, y]) => total + y, 0) / Math.max(wall.length, 1)
  ];
  const walkway: [number, number][] = [];
  for (const [x, y] of wall) {
    const dx = Math.sign(center[0] - x);
    const dy = Math.sign(center[1] - y);
    const candidates: [number, number][] =
      Math.abs(center[0] - x) > Math.abs(center[1] - y) ? [[x + dx, y]] : [[x, y + dy]];
    for (const [wx, wy] of candidates) {
      if (wy >= 0 && wy < walkable.length && wx >= 0 && wx < walkable[wy].length && walkable[wy][wx])
        walkway.push([wx, wy]);
    }
  }
  return walkway;
}

function createMfcgBuildingInteriors(
  rings: [number, number][][],
  transform: MatrixTransform
): VibeGameBuildingMatrix[] {
  return rings
    .map((ring, index) => createMfcgBuildingInterior(ring, index, transform))
    .filter((building): building is VibeGameBuildingMatrix => Boolean(building));
}

function createMfcgBuildingInterior(
  ring: [number, number][],
  index: number,
  transform: MatrixTransform
): VibeGameBuildingMatrix | null {
  const footprint: [number, number][] = [];
  fillPolygonMatrix(ring, transform, (x, y) => footprint.push([x, y]));
  if (!footprint.length) return null;

  const xs = footprint.map(([x]) => x);
  const ys = footprint.map(([, y]) => y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const width = Math.max(1, maxX - minX + 1);
  const height = Math.max(1, maxY - minY + 1);
  if (width < 2 || height < 2) return null;

  const room = createRows(width, height, () => ROOM_CODES.COMMON);
  const walkable = createRows(width, height, () => 1);
  const wallNorth = createRows(width, height, (_x, y) => Number(y === 0));
  const wallEast = createRows(width, height, x => Number(x === width - 1));
  const wallSouth = createRows(width, height, (_x, y) => Number(y === height - 1));
  const wallWest = createRows(width, height, x => Number(x === 0));
  const doorLocal: [number, number] = [Math.floor(width / 2), height - 1];
  wallSouth[doorLocal[1]][doorLocal[0]] = 0;

  return {
    building_id: `mfcg_building_${index + 1}`,
    type: "HOUSE_SMALL",
    grid_rect: { x: minX, y: minY, width, height },
    connected_buildings: [],
    wall_height_voxels: 3,
    floor_height_voxels: 4,
    floors: [
      {
        level: 0,
        elevation_voxels: 0,
        width,
        height,
        room,
        walkable,
        wall_north: wallNorth,
        wall_east: wallEast,
        wall_south: wallSouth,
        wall_west: wallWest,
        doors: [
          {
            kind: "exterior",
            floor: 0,
            grid: [minX + doorLocal[0], minY + doorLocal[1]],
            local: doorLocal,
            direction: "south"
          }
        ],
        stairs: null
      }
    ]
  };
}

function getWallCells(tiles: Tile[][]): [number, number][] {
  const wall: [number, number][] = [];
  for (let x = 0; x < WIDTH; x++) {
    for (let y = 0; y < HEIGHT; y++) {
      if (tiles[x][y].type === "WALL") wall.push([x, y]);
    }
  }
  return wall;
}

function getMatrixTerrainCode(tile: Tile, x: number, y: number, gates: Set<string>, walkways: Set<string>): number {
  const key = `${x},${y}`;
  if (gates.has(key)) return TERRAIN_CODES.GATE;
  if (walkways.has(key) && !isRoad(tile.type)) return TERRAIN_CODES.WALL_WALKWAY;
  return TERRAIN_CODES[tile.type];
}

function getSolidHeight(tile: Tile): number {
  if (tile.type === "WALL") return CITY_WALL_HEIGHT_VOXELS;
  if (tile.doodad && tile.type !== "ROAD_MAIN" && tile.type !== "ROAD_DIRT") return DOODAD_HEIGHT_VOXELS;
  if (tile.type === "WATER_DEEP" || tile.type === "WATER_SHALLOW" || tile.type === "LAVA")
    return CHARACTER_HEIGHT_VOXELS;
  return 0;
}

function canCharacterStand(tile: Tile, solidHeight: number): boolean {
  if (solidHeight >= CHARACTER_HEIGHT_VOXELS) return false;
  if (tile.type === "EMPTY" || isWater(tile.type) || tile.type === "LAVA" || tile.type === "WALL") return false;
  return true;
}

function getStreetWidth(type: TileType, gates: Set<string>, walkways: Set<string>, x: number, y: number): number {
  const key = `${x},${y}`;
  if (gates.has(key)) return 3;
  if (walkways.has(key)) return 1;
  if (type === "ROAD_MAIN") return 3;
  if (type === "BRIDGE" || type === "DOCK") return 2;
  if (type === "ROAD_DIRT") return 1;
  return 0;
}

function createBuildingMatrix(building: VibeGameTownBuilding): VibeGameBuildingMatrix {
  return {
    building_id: building.id,
    type: building.type,
    grid_rect: building.grid_rect,
    connected_buildings: building.connected_buildings,
    wall_height_voxels: building.interior.wall_height_voxels,
    floor_height_voxels: building.interior.floor_height_voxels,
    floors: building.floors.map(floor => createBuildingFloorMatrix(building, floor))
  };
}

function createBuildingFloorMatrix(
  building: VibeGameTownBuilding,
  floor: VibeGameBuildingFloor
): VibeGameBuildingFloorMatrix {
  const { width, height } = building.grid_rect;
  const room = createRows(width, height, () => 0);
  const walkable = createRows(width, height, () => 0);
  const wallNorth = createRows(width, height, () => 0);
  const wallEast = createRows(width, height, () => 0);
  const wallSouth = createRows(width, height, () => 0);
  const wallWest = createRows(width, height, () => 0);

  for (const buildingRoom of floor.rooms) {
    const code = ROOM_CODES[buildingRoom.type];
    for (const [x, y] of buildingRoom.tiles) {
      const lx = x - building.grid_rect.x;
      const ly = y - building.grid_rect.y;
      if (!inLocalBounds(lx, ly, width, height)) continue;
      room[ly][lx] = code;
      walkable[ly][lx] = 1;
    }
  }

  addBuildingBoundaryWalls(room, wallNorth, wallEast, wallSouth, wallWest);
  addRoomPartitionWalls(room, wallNorth, wallEast, wallSouth, wallWest);
  const doors = floor.rooms
    .flatMap(buildingRoom =>
      buildingRoom.doors.map(door =>
        getBuildingMatrixDoor(building, door, floor.level, room, wallNorth, wallEast, wallSouth, wallWest)
      )
    )
    .filter(door => door.kind !== "exterior" || door.floor === 0);

  if (floor.stairs) {
    const [sx, sy] = toLocal(floor.stairs.grid, building.grid_rect);
    if (inLocalBounds(sx, sy, width, height)) room[sy][sx] = ROOM_CODES.STAIRS;
  }

  return {
    level: floor.level,
    elevation_voxels: floor.elevation_voxels,
    width,
    height,
    room,
    walkable,
    wall_north: wallNorth,
    wall_east: wallEast,
    wall_south: wallSouth,
    wall_west: wallWest,
    doors,
    stairs: floor.stairs ? toLocal(floor.stairs.grid, building.grid_rect) : null
  };
}

function addBuildingBoundaryWalls(
  room: number[][],
  wallNorth: number[][],
  wallEast: number[][],
  wallSouth: number[][],
  wallWest: number[][]
): void {
  const height = room.length;
  const width = room[0]?.length || 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!room[y][x]) continue;
      if (y === 0 || !room[y - 1][x]) wallNorth[y][x] = 1;
      if (x === width - 1 || !room[y][x + 1]) wallEast[y][x] = 1;
      if (y === height - 1 || !room[y + 1][x]) wallSouth[y][x] = 1;
      if (x === 0 || !room[y][x - 1]) wallWest[y][x] = 1;
    }
  }
}

function addRoomPartitionWalls(
  room: number[][],
  wallNorth: number[][],
  wallEast: number[][],
  wallSouth: number[][],
  wallWest: number[][]
): void {
  const height = room.length;
  const width = room[0]?.length || 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!room[y][x]) continue;
      if (x < width - 1 && room[y][x + 1] && room[y][x] !== room[y][x + 1]) {
        wallEast[y][x] = 1;
        wallWest[y][x + 1] = 1;
      }
      if (y < height - 1 && room[y + 1][x] && room[y][x] !== room[y + 1][x]) {
        wallSouth[y][x] = 1;
        wallNorth[y + 1][x] = 1;
      }
    }
  }
}

function getBuildingMatrixDoor(
  building: VibeGameTownBuilding,
  door: VibeGameBuildingDoor,
  floor: number,
  room: number[][],
  wallNorth: number[][],
  wallEast: number[][],
  wallSouth: number[][],
  wallWest: number[][]
): VibeGameBuildingMatrixDoor {
  const local = toLocal(door.grid, building.grid_rect);
  const direction =
    door.kind === "stairs" ? null : openDoorInWalls(local, room, wallNorth, wallEast, wallSouth, wallWest);
  return {
    kind: door.kind,
    floor,
    grid: door.grid,
    local,
    direction: door.kind === "stairs" ? "up" : direction,
    connects_to: door.connects_to
  };
}

function openDoorInWalls(
  local: [number, number],
  room: number[][],
  wallNorth: number[][],
  wallEast: number[][],
  wallSouth: number[][],
  wallWest: number[][]
): Direction | null {
  const [x, y] = local;
  const height = room.length;
  const width = room[0]?.length || 0;
  if (!inLocalBounds(x, y, width, height)) return null;

  if (y === 0 && wallNorth[y][x]) {
    wallNorth[y][x] = 0;
    return "north";
  }
  if (x === width - 1 && wallEast[y][x]) {
    wallEast[y][x] = 0;
    return "east";
  }
  if (y === height - 1 && wallSouth[y][x]) {
    wallSouth[y][x] = 0;
    return "south";
  }
  if (x === 0 && wallWest[y][x]) {
    wallWest[y][x] = 0;
    return "west";
  }
  if (x > 0 && room[y][x - 1] && room[y][x - 1] !== room[y][x]) {
    wallWest[y][x] = 0;
    wallEast[y][x - 1] = 0;
    return "west";
  }
  if (x < width - 1 && room[y][x + 1] && room[y][x + 1] !== room[y][x]) {
    wallEast[y][x] = 0;
    wallWest[y][x + 1] = 0;
    return "east";
  }
  if (y > 0 && room[y - 1][x] && room[y - 1][x] !== room[y][x]) {
    wallNorth[y][x] = 0;
    wallSouth[y - 1][x] = 0;
    return "north";
  }
  if (y < height - 1 && room[y + 1][x] && room[y + 1][x] !== room[y][x]) {
    wallSouth[y][x] = 0;
    wallNorth[y + 1][x] = 0;
    return "south";
  }
  return null;
}

function toLocal(point: [number, number], rect: { x: number; y: number }): [number, number] {
  return [point[0] - rect.x, point[1] - rect.y];
}

function inLocalBounds(x: number, y: number, width: number, height: number): boolean {
  return x >= 0 && x < width && y >= 0 && y < height;
}

function createRows(width: number, height: number, getValue: (x: number, y: number) => number): number[][] {
  return Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_value, x) => getValue(x, y)));
}

function uniquePoints(points: [number, number][]): [number, number][] {
  const seen = new Set<string>();
  return points.filter(([x, y]) => {
    const key = `${x},${y}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getTerrainLegend(): Record<number, string> {
  return Object.fromEntries(Object.entries(TERRAIN_CODES).map(([name, code]) => [code, name])) as Record<
    number,
    string
  >;
}

function getRoomLegend(): Record<number, RoomType> {
  return Object.fromEntries(Object.entries(ROOM_CODES).map(([name, code]) => [code, name])) as Record<number, RoomType>;
}

function getVoxelMaterialLegend(): Record<number, VibeGameVoxelKind> {
  return Object.fromEntries(Object.entries(VOXEL_MATERIAL_CODES).map(([name, code]) => [code, name])) as Record<
    number,
    VibeGameVoxelKind
  >;
}

function gridToMap(x: number, y: number, origin: [number, number], tileSize: number): [number, number] {
  return [round(origin[0] + x * tileSize), round(origin[1] + y * tileSize)];
}

function getStreetKind(type: TileType): VibeGameTownStreetTile["kind"] {
  if (type === "ROAD_MAIN") return "main";
  if (type === "ROAD_DIRT") return "dirt";
  if (type === "BRIDGE") return "bridge";
  return "dock";
}

function getRoadNeighbors(tiles: Tile[][], x: number, y: number): [number, number][] {
  const neighbors: [number, number][] = [];
  for (const [dx, dy] of [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0]
  ] as [number, number][]) {
    const nx = x + dx;
    const ny = y + dy;
    if (inBounds(nx, ny) && isRoad(tiles[nx][ny].type)) neighbors.push([nx, ny]);
  }
  return neighbors;
}

function countRoadNeighbors(tiles: Tile[][], x: number, y: number): number {
  return getRoadNeighbors(tiles, x, y).length;
}

function getTownGeneratorSearchParams(input: string): URLSearchParams {
  const value = input.trim();
  if (!value) return new URLSearchParams();
  if (value.startsWith("?")) return new URLSearchParams(value);

  const questionMark = value.indexOf("?");
  if (questionMark >= 0) return new URLSearchParams(value.slice(questionMark));

  return new URLSearchParams(value);
}

function parseIntegerParam(value: string | null): number | null {
  if (value === null) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function hashSeed(value: string): number {
  let state = 2166136261;
  for (let i = 0; i < value.length; i++) {
    state ^= value.charCodeAt(i);
    state = Math.imul(state, 16777619);
  }
  return state >>> 0;
}

function shuffle<T>(array: T[], rng: RNG): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function isWater(type: TileType): boolean {
  return WATER_TYPES.includes(type);
}

function isRoad(type: TileType): boolean {
  return ROAD_TYPES.includes(type);
}

function inBounds(x: number, y: number): boolean {
  return x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT;
}

function inInnerBounds(x: number, y: number): boolean {
  return x >= 1 && x < WIDTH - 1 && y >= 1 && y < HEIGHT - 1;
}

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(t: number, a: number, b: number): number {
  return a + t * (b - a);
}

function grad(hash: number, x: number, y: number): number {
  const h = hash & 15;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

function round(value: number, digits = 2): number {
  return Number(value.toFixed(digits));
}
