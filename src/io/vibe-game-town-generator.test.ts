import { describe, expect, it } from "vitest";
import {
  createVibeGameTownLayout,
  createVibeGameTownMatrixFromMfcgVector,
  parseTownGeneratorUrlState
} from "./vibe-game-town-generator";

describe("createVibeGameTownLayout matrix export", () => {
  it("exports a character-aware town and interior matrix", () => {
    const town = createVibeGameTownLayout({
      burgId: 1,
      name: "Matrixburg",
      seed: "matrix-test",
      center: [100, 120],
      population: 260,
      biomeName: "grassland",
      capital: true,
      port: false,
      walls: true,
      temple: true,
      plaza: true,
      connections: { north: true, south: true }
    });

    expect(town.matrix.schema).toBe("vibe-game-town-matrix");
    expect(town.matrix.character).toEqual({
      width_blocks: 1,
      height_blocks: 2,
      clearance_height_voxels: 2
    });
    expect(town.matrix.terrain).toHaveLength(town.grid.height);
    expect(town.matrix.terrain[0]).toHaveLength(town.grid.width);
    expect(town.matrix.walkable[0]).toHaveLength(town.grid.width);
    expect(town.matrix.solid_height_voxels[0]).toHaveLength(town.grid.width);
    expect(town.matrix.voxel_town.schema).toBe("vibe-game-voxel-town");
    expect(town.matrix.voxel_town.cubic_grid).toMatchObject({
      width: town.grid.width,
      height: town.grid.height,
      voxel_size_blocks: 1
    });

    const mainStreet = town.streets.find(street => street.kind === "main");
    expect(mainStreet).toBeDefined();
    expect(town.matrix.street_width_blocks[mainStreet!.y][mainStreet!.x]).toBe(3);
    expect(town.matrix.voxel_town.voxels.some(voxel => voxel.kind === "road")).toBe(true);

    const dirtStreet = town.streets.find(street => street.kind === "dirt");
    if (dirtStreet) expect(town.matrix.street_width_blocks[dirtStreet.y][dirtStreet.x]).toBe(1);

    const building = town.matrix.interiors[0];
    expect(building).toBeDefined();
    expect(building.grid_rect.width).toBeGreaterThanOrEqual(6);
    expect(building.grid_rect.height).toBeGreaterThanOrEqual(6);
    expect(building.floors[0].room).toHaveLength(building.grid_rect.height);
    expect(building.floors[0].room[0]).toHaveLength(building.grid_rect.width);
    expect(building.floors[0].walkable.flat().some(Boolean)).toBe(true);
    expect(building.floors[0].wall_north.flat().some(Boolean)).toBe(true);
    expect(building.floors[0].doors.some(door => door.kind === "exterior")).toBe(true);
    for (const floor of building.floors) {
      for (const door of floor.doors.filter(door => door.kind === "exterior")) {
        expect(door.floor).toBe(0);
        expect(
          door.local[0] === 0 ||
            door.local[1] === 0 ||
            door.local[0] === floor.width - 1 ||
            door.local[1] === floor.height - 1
        ).toBe(true);
      }
    }
    expect(town.matrix.voxel_town.voxels.some(voxel => voxel.kind === "building_roof")).toBe(true);
    expect(town.matrix.voxel_town.voxels.some(voxel => voxel.kind === "building_wall")).toBe(true);
    expect(town.matrix.voxel_town.voxels.some(voxel => voxel.kind === "ground")).toBe(true);

    const stairBuilding = town.matrix.interiors.find(building =>
      building.floors.some(floor => floor.level > 0 && floor.stairs)
    );
    expect(stairBuilding).toBeDefined();
    const upperStairFloor = stairBuilding!.floors.find(floor => floor.level > 0 && floor.stairs)!;
    const [sx, sy] = upperStairFloor.stairs!;
    const stairBoundaryWalls = [
      sy === 0 ? upperStairFloor.wall_north[sy][sx] : 0,
      sx === upperStairFloor.width - 1 ? upperStairFloor.wall_east[sy][sx] : 0,
      sy === upperStairFloor.height - 1 ? upperStairFloor.wall_south[sy][sx] : 0,
      sx === 0 ? upperStairFloor.wall_west[sy][sx] : 0
    ];
    expect(stairBoundaryWalls.some(Boolean)).toBe(true);
    expect(town.matrix.voxel_town.voxels.some(voxel => voxel.kind === "stairs")).toBe(true);
    const zOneStair = town.matrix.voxel_town.voxels.find(voxel => voxel.kind === "stairs" && voxel.z === 1);
    expect(zOneStair).toBeDefined();
  });
});

describe("createVibeGameTownMatrixFromMfcgVector", () => {
  it("converts MFCG vector layers into a vibe-game matrix", () => {
    const matrix = createVibeGameTownMatrixFromMfcgVector({
      type: "FeatureCollection",
      features: [
        {
          id: "roads",
          geometry: {
            type: "GeometryCollection",
            geometries: [
              {
                type: "LineString",
                coordinates: [
                  [0, 50],
                  [100, 50]
                ]
              }
            ]
          }
        },
        {
          id: "walls",
          geometry: {
            type: "GeometryCollection",
            geometries: [
              {
                type: "LineString",
                coordinates: [
                  [10, 10],
                  [90, 10],
                  [90, 90],
                  [10, 90],
                  [10, 10]
                ]
              }
            ]
          }
        },
        {
          id: "buildings",
          geometry: {
            type: "MultiPolygon",
            coordinates: [
              [
                [
                  [35, 65],
                  [45, 65],
                  [45, 75],
                  [35, 75],
                  [35, 65]
                ]
              ],
              [
                [
                  [45, 65],
                  [55, 65],
                  [55, 75],
                  [45, 75],
                  [45, 65]
                ]
              ]
            ]
          }
        }
      ]
    });

    expect(matrix.block.width).toBe(38);
    expect(matrix.block.height).toBe(32);
    expect(matrix.terrain).toHaveLength(matrix.block.height);
    expect(matrix.terrain[0]).toHaveLength(matrix.block.width);
    expect(matrix.street_width_blocks.some(row => row.some(value => value === 3))).toBe(true);
    expect(matrix.city_wall.wall.length).toBeGreaterThan(0);
    expect(matrix.city_wall.gates.length).toBeGreaterThan(0);
    expect(matrix.interiors).toHaveLength(2);
    expect(matrix.interiors[0].grid_rect.width).toBeGreaterThanOrEqual(3);
    expect(matrix.interiors[0].connected_buildings).toEqual([
      expect.objectContaining({
        building_id: "mfcg_building_2",
        separated_by_road: false
      })
    ]);
    expect(matrix.interiors[0].connected_buildings[0].contact_tiles.length).toBeGreaterThan(0);
    expect(matrix.interiors[0].floors[0].doors[0].kind).toBe("exterior");
    expect(matrix.interiors[0].floors[0].doors[0].floor).toBe(0);
    const buildingFloorCode = Number(
      Object.entries(matrix.legend.terrain).find(([, name]) => name === "BUILDING_FLOOR")?.[0]
    );
    for (const interior of matrix.interiors) {
      for (let y = interior.grid_rect.y; y < interior.grid_rect.y + interior.grid_rect.height; y++) {
        for (let x = interior.grid_rect.x; x < interior.grid_rect.x + interior.grid_rect.width; x++) {
          expect(matrix.terrain[y][x]).toBe(buildingFloorCode);
        }
      }
    }
    expect(matrix.voxel_town.cubic_grid.width).toBe(matrix.block.width);
    expect(matrix.voxel_town.voxels.some(voxel => voxel.kind === "city_wall")).toBe(true);
    const zOneWall = matrix.voxel_town.voxels.find(voxel => voxel.kind === "city_wall" && voxel.z === 1);
    expect(zOneWall).toBeDefined();
    expect(matrix.voxel_town.voxels.some(voxel => voxel.kind === "gate")).toBe(true);
    expect(matrix.voxel_town.voxels.some(voxel => voxel.kind === "building_roof")).toBe(true);
  });
});

describe("parseTownGeneratorUrlState", () => {
  it("mirrors TownGeneratorOS StateManager size and seed normalization", () => {
    expect(parseTownGeneratorUrlState("").canonical_search).toBe("?size=15&seed=-1");
    expect(parseTownGeneratorUrlState("?size=2&seed=0")).toMatchObject({ size: 6, seed: -1 });
    expect(parseTownGeneratorUrlState("?size=100&seed=-5")).toMatchObject({ size: 40, seed: -1 });
  });

  it("preserves modern FMG burg link parameters around the canonical state", () => {
    const state = parseTownGeneratorUrlState(
      "https://watabou.github.io/city-generator/?size=6&seed=4242420041&name=Chemoshev&population=89&river=1&walls=0"
    );

    expect(state).toMatchObject({
      source: "TownGeneratorOS.StateManager",
      size: 6,
      seed: 4242420041,
      canonical_search: "?size=6&seed=4242420041"
    });
    expect(state.parameters).toMatchObject({
      name: "Chemoshev",
      population: "89",
      river: "1",
      walls: "0"
    });
  });
});
