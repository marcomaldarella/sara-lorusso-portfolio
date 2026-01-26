import * as THREE from "three";
import { CHUNK_SIZE } from "./constants";
import type { PlaneData } from "./types";

export const run = <T>(fn: () => T): T => fn();

export const clamp = (v: number, min: number, max: number): number => Math.max(min, Math.min(max, v));

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const seededRandom = (seed: number): number => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

export const hashString = (str: string): number => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
};

const MAX_PLANE_CACHE = 256;
const planeCache = new Map<string, PlaneData[]>();

const touchPlaneCache = (key: string) => {
  const v = planeCache.get(key);
  if (!v) {
    return;
  }

  planeCache.delete(key);
  planeCache.set(key, v);
};

const evictPlaneCache = () => {
  while (planeCache.size > MAX_PLANE_CACHE) {
    const firstKey = planeCache.keys().next().value as string | undefined;
    if (!firstKey) break;
    planeCache.delete(firstKey);
  }
};

export const getChunkUpdateThrottleMs = (isZooming: boolean, zoomSpeed: number): number => {
  if (zoomSpeed > 1.0) {
    return 500;
  }

  if (isZooming) {
    return 400;
  }

  return 100;
};

export const generateChunkPlanes = (cx: number, cy: number, cz: number): PlaneData[] => {
  const planes: PlaneData[] = [];
  const seed = hashString(`${cx},${cy},${cz}`);

  // Solo 3 immagini per chunk (meno foto alla volta)
  for (let i = 0; i < 3; i++) {
    const s = seed + i * 1000;
    const r = (n: number) => seededRandom(s + n);
    
    // Genera dimensioni più varie per evitare stretch
    const baseSize = 6 + r(4) * 26;
    
    // Varia l'aspect ratio: alcune orizzontali, alcune verticali, alcune quadrate
    const aspectVariations = [
      { x: 1, y: 1 },      // quadrata
      { x: 1.33, y: 1 },   // orizzontale 4:3
      { x: 1.5, y: 1 },    // orizzontale 3:2
      { x: 1, y: 1.33 },   // verticale 3:4
      { x: 1, y: 1.5 },    // verticale 2:3
    ];
    
    const aspectChoice = Math.floor(r(6) * aspectVariations.length);
    const aspect = aspectVariations[aspectChoice];

    planes.push({
      id: `${cx}-${cy}-${cz}-${i}`,
      position: new THREE.Vector3(
        cx * CHUNK_SIZE + r(0) * CHUNK_SIZE,
        cy * CHUNK_SIZE + r(1) * CHUNK_SIZE,
        cz * CHUNK_SIZE + r(2) * CHUNK_SIZE
      ),
      scale: new THREE.Vector3(baseSize * aspect.x, baseSize * aspect.y, 1),
      mediaIndex: Math.floor(r(5) * 1_000_000),
    });
  }

  return planes;
};

export const generateChunkPlanesCached = (cx: number, cy: number, cz: number): PlaneData[] => {
  const key = `${cx},${cy},${cz}`;
  const cached = planeCache.get(key);
  if (cached) {
    touchPlaneCache(key);
    return cached;
  }

  const planes = generateChunkPlanes(cx, cy, cz);
  planeCache.set(key, planes);
  evictPlaneCache();
  return planes;
};

export const shouldThrottleUpdate = (lastUpdateTime: number, throttleMs: number, currentTime: number): boolean => {
  return currentTime - lastUpdateTime >= throttleMs;
};
