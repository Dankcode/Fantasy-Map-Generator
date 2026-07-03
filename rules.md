# Project Rules

## Vibe-game Town Export

- Burg town exports must remain deterministic from the same FMG burg seed, burg id, and town URL/state inputs.
- Town data must be readable as both a 2D `vibe-game-town-matrix` and a 3D `vibe-game-voxel-town`.
- Town generation should use deterministic road parcel placement: choose a density-based target building count, score
  road tiles by centrality/noise, then place road-facing building parcels until the target is reached.
- Exterior doors must be on ground-floor perimeter cells. Upper floors should only expose stairs or interior doors.
- Stair links are not wall openings. Stairs may have solid adjacent wall blocks, and stair export must not punch holes in
  boundary or partition walls.
- Matrix exports should keep geometry-oriented data: terrain, solid height, clearance, walkable, street width, city walls,
  gates, walkways, building interiors, and voxel-town geometry.
