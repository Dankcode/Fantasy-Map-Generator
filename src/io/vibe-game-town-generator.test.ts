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
    expect(building.floors[0].room).toHaveLength(building.grid_rect.height);
    expect(building.floors[0].room[0]).toHaveLength(building.grid_rect.width);
    expect(building.floors[0].walkable.flat().some(Boolean)).toBe(true);
    expect(building.floors[0].wall_north.flat().some(Boolean)).toBe(true);
    expect(building.floors[0].doors.some(door => door.kind === "exterior")).toBe(true);
    expect(town.matrix.voxel_town.voxels.some(voxel => voxel.kind === "building_roof")).toBe(true);
    expect(town.matrix.voxel_town.voxels.some(voxel => voxel.kind === "building_wall")).toBe(true);
  });
});

describe("createVibeGameTownMatrixFromMfcgVector", () => {
  it("converts MFCG vector layers into a vibe-game matrix", () => {
    const matrix = createVibeGameTownMatrixFromMfcgVector(
      {
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
                    [35, 35],
                    [45, 35],
                    [45, 45],
                    [35, 45],
                    [35, 35]
                  ]
                ]
              ]
            }
          }
        ]
      },
      { width: 32, height: 32 }
    );

    expect(matrix.terrain).toHaveLength(32);
    expect(matrix.terrain[0]).toHaveLength(32);
    expect(matrix.street_width_blocks.some(row => row.some(value => value === 3))).toBe(true);
    expect(matrix.city_wall.wall.length).toBeGreaterThan(0);
    expect(matrix.city_wall.gates.length).toBeGreaterThan(0);
    expect(matrix.interiors).toHaveLength(1);
    expect(matrix.interiors[0].floors[0].doors[0].kind).toBe("exterior");
    expect(matrix.voxel_town.cubic_grid.width).toBe(32);
    expect(matrix.voxel_town.voxels.some(voxel => voxel.kind === "city_wall")).toBe(true);
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
