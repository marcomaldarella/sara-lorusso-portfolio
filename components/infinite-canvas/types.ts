import type * as THREE from "three";

export type MediaItem = {
  url: string;
  width: number;
  height: number;
};

// Stato del movimento per coordinazione con blur field
export type MotionState = {
  velocityX: number;
  velocityY: number;
  velocityZ: number;
  speed: number;
  isDragging: boolean;
  mouseX: number;
  mouseY: number;
};

export type InfiniteCanvasProps = {
  media: MediaItem[];
  onTextureProgress?: (progress: number) => void;
  onMotion?: (motion: MotionState) => void;
  showFps?: boolean;
  showControls?: boolean;
  cameraFov?: number;
  cameraNear?: number;
  cameraFar?: number;
  fogNear?: number;
  fogFar?: number;
  backgroundColor?: string;
  fogColor?: string;
};

export type ChunkData = {
  key: string;
  cx: number;
  cy: number;
  cz: number;
};

export type PlaneData = {
  id: string;
  position: THREE.Vector3;
  scale: THREE.Vector3;
  mediaIndex: number;
};
