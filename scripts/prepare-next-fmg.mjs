import {cp, rm} from "node:fs/promises";
import {resolve} from "node:path";

const mode = process.argv[2];
const root = resolve(import.meta.dirname, "..");
const distDir = resolve(root, "dist");
const nextCacheDir = resolve(root, ".next");
const nextPublicDir = resolve(root, "public/fmg");

if (mode === "clean") {
  await rm(nextCacheDir, {force: true, recursive: true});
  await rm(nextPublicDir, {force: true, recursive: true});
} else if (mode === "sync") {
  await rm(nextPublicDir, {force: true, recursive: true});
  await cp(distDir, nextPublicDir, {recursive: true});
} else {
  throw new Error("Usage: node scripts/prepare-next-fmg.mjs <clean|sync>");
}
