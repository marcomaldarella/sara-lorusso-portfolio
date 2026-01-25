import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as React from "react";
import * as THREE from "three";
import { useIsTouchDevice } from "./use-is-touch-device";
import { clamp, lerp } from "./utils";
import {
  CHUNK_FADE_MARGIN,
  CHUNK_OFFSETS,
  CHUNK_SIZE,
  DEPTH_FADE_END,
  DEPTH_FADE_START,
  INITIAL_CAMERA_Z,
  INVIS_THRESHOLD,
  KEYBOARD_SPEED,
  MAX_VELOCITY,
  RENDER_DISTANCE,
  VELOCITY_DECAY,
  VELOCITY_LERP,
} from "./constants";
import styles from "./style.module.css";
import { getTexture } from "./texture-manager";
import type { ChunkData, InfiniteCanvasProps, MediaItem, PlaneData } from "./types";
import { generateChunkPlanesCached, getChunkUpdateThrottleMs, shouldThrottleUpdate } from "./utils";

const PLANE_GEOMETRY = new THREE.PlaneGeometry(1, 1);

const KEYBOARD_MAP = [
  { name: "forward", keys: ["w", "W", "ArrowUp"] },
  { name: "backward", keys: ["s", "S", "ArrowDown"] },
  { name: "left", keys: ["a", "A", "ArrowLeft"] },
  { name: "right", keys: ["d", "D", "ArrowRight"] },
  { name: "up", keys: ["e", "E"] },
  { name: "down", keys: ["q", "Q"] },
];

const IDLE_ZOOM_SPEED = -0.02;

type KeyboardKeys = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
};

const KEY_MAP: Record<string, keyof KeyboardKeys> = KEYBOARD_MAP.reduce(
  (acc, entry) => {
    entry.keys.forEach((key) => {
      acc[key] = entry.name as keyof KeyboardKeys;
    });
    return acc;
  },
  {} as Record<string, keyof KeyboardKeys>
);

const getTouchDistance = (touches: Touch[]) => {
  if (touches.length < 2) {
    return 0;
  }

  const [t1, t2] = touches;
  const dx = t1.clientX - t2.clientX;
  const dy = t1.clientY - t2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

type CameraGridState = {
  cx: number;
  cy: number;
  cz: number;
  camZ: number;
};

function MediaPlane({
  position,
  scale,
  media,
  chunkCx,
  chunkCy,
  chunkCz,
  cameraGridRef,
  mouseRef,
}: {
  position: THREE.Vector3;
  scale: THREE.Vector3;
  media: MediaItem;
  chunkCx: number;
  chunkCy: number;
  chunkCz: number;
  cameraGridRef: React.RefObject<CameraGridState>;
  mouseRef: React.RefObject<{ x: number; y: number }>;
}) {
  const meshRef = React.useRef<THREE.Mesh>(null);
  const materialRef = React.useRef<THREE.MeshBasicMaterial>(null);
  const localState = React.useRef({ 
    opacity: 0, 
    frame: 0, 
    ready: false,
    // Stato per effetto finestra/parallasse
    offsetX: 0,
    offsetY: 0,
    textureOffsetX: 0,
    textureOffsetY: 0,
  });

  const [texture, setTexture] = React.useState<THREE.Texture | null>(null);
  const [isReady, setIsReady] = React.useState(false);

  // Effetto finestra con parallasse interno
  useFrame(() => {
    const material = materialRef.current;
    const mesh = meshRef.current;
    const state = localState.current;
    const mouse = mouseRef.current;
    if (!material || !mesh) return;
    
    state.frame = (state.frame + 1) & 1;
    if (state.opacity < INVIS_THRESHOLD && !mesh.visible && state.frame === 0) return;
    
    const cam = cameraGridRef.current;
    const dist = Math.max(Math.abs(chunkCx - cam.cx), Math.abs(chunkCy - cam.cy), Math.abs(chunkCz - cam.cz));
    const absDepth = Math.abs(position.z - cam.camZ);
    
    if (absDepth > DEPTH_FADE_END + 50) {
      state.opacity = 0;
      material.opacity = 0;
      material.depthWrite = false;
      mesh.visible = false;
      return;
    }
    
    const gridFade = dist <= RENDER_DISTANCE ? 1 : Math.max(0, 1 - (dist - RENDER_DISTANCE) / Math.max(CHUNK_FADE_MARGIN, 0.0001));
    const depthFade = absDepth <= DEPTH_FADE_START ? 1 : Math.max(0, 1 - (absDepth - DEPTH_FADE_START) / Math.max(DEPTH_FADE_END - DEPTH_FADE_START, 0.0001));
    const target = Math.min(gridFade, depthFade * depthFade);
    
    // Aggiorna opacity smoothly
    state.opacity = target < INVIS_THRESHOLD && state.opacity < INVIS_THRESHOLD ? 0 : lerp(state.opacity, target, 0.12);
    
    // Effetto pop/zoom in
    const progress = Math.min(1, state.opacity);
    const popScale = 1 + 0.15 * (1 - progress);
    
    // === EFFETTO FINESTRA ===
    // Parallasse del contenitore (la mesh si muove leggermente)
    const depthFactor = clamp(1 - absDepth / DEPTH_FADE_END, 0, 1);
    const containerParallax = 0.8 * depthFactor; // Più vicino = più parallasse
    
    state.offsetX = lerp(state.offsetX, mouse.x * containerParallax, 0.06);
    state.offsetY = lerp(state.offsetY, mouse.y * containerParallax, 0.06);
    
    // Applica offset alla mesh (contenitore)
    mesh.position.set(
      position.x + state.offsetX,
      position.y + state.offsetY,
      position.z
    );
    
    // Parallasse interno della texture (opposto al contenitore per effetto finestra)
    if (material.map) {
      const textureParallax = 0.02 * depthFactor;
      state.textureOffsetX = lerp(state.textureOffsetX, -mouse.x * textureParallax, 0.04);
      state.textureOffsetY = lerp(state.textureOffsetY, mouse.y * textureParallax, 0.04);
      
      material.map.offset.set(
        0.5 + state.textureOffsetX - 0.5,
        0.5 + state.textureOffsetY - 0.5
      );
    }
    
    mesh.scale.set(displayScale.x * popScale, displayScale.y * popScale, displayScale.z);
    material.opacity = state.opacity > 0.99 ? 1 : state.opacity;
    material.depthWrite = state.opacity > 0.99;
    mesh.visible = state.opacity > INVIS_THRESHOLD;
  });

  // Calculate display scale from media dimensions (from manifest)
  const displayScale = React.useMemo(() => {
    if (media.width && media.height) {
      const aspect = media.width / media.height;
      return new THREE.Vector3(scale.y * aspect, scale.y, 1);
    }

    return scale;
  }, [media.width, media.height, scale]);

  // Load texture with onLoad callback
  React.useEffect(() => {
    const state = localState.current;
    state.ready = false;
    state.opacity = 0;
    setIsReady(false);

    const material = materialRef.current;

    if (material) {
      material.opacity = 0;
      material.depthWrite = false;
      material.map = null;
    }

    const tex = getTexture(media, () => {
      state.ready = true;
      setIsReady(true);
    });

    setTexture(tex);
  }, [media]);

  // Apply texture when ready
  React.useEffect(() => {
    const material = materialRef.current;
    const mesh = meshRef.current;
    const state = localState.current;

    if (!material || !mesh || !texture || !isReady || !state.ready) {
      return;
    }

    material.map = texture;
    material.opacity = state.opacity;
    material.depthWrite = state.opacity >= 1;
    mesh.scale.copy(displayScale);
  }, [displayScale, texture, isReady]);

  if (!texture || !isReady) {
    return null;
  }

  return (
    <mesh ref={meshRef} position={position} scale={displayScale} visible={false} geometry={PLANE_GEOMETRY}>
      <meshBasicMaterial ref={materialRef} transparent opacity={0} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Chunk({
  cx,
  cy,
  cz,
  media,
  cameraGridRef,
  mouseRef,
}: {
  cx: number;
  cy: number;
  cz: number;
  media: MediaItem[];
  cameraGridRef: React.RefObject<CameraGridState>;
  mouseRef: React.RefObject<{ x: number; y: number }>;
}) {
  const [planes, setPlanes] = React.useState<PlaneData[] | null>(null);

  React.useEffect(() => {
    let canceled = false;
    const run = () => !canceled && setPlanes(generateChunkPlanesCached(cx, cy, cz));

    if (typeof requestIdleCallback !== "undefined") {
      const id = requestIdleCallback(run, { timeout: 100 });

      return () => {
        canceled = true;
        cancelIdleCallback(id);
      };
    }

    const id = setTimeout(run, 0);
    return () => {
      canceled = true;
      clearTimeout(id);
    };
  }, [cx, cy, cz]);

  if (!planes) {
    return null;
  }

  return (
    <group>
      {planes.map((plane) => {
        const mediaItem = media[plane.mediaIndex % media.length];

        if (!mediaItem) {
          return null;
        }

        return (
          <MediaPlane
            key={plane.id}
            position={plane.position}
            scale={plane.scale}
            media={mediaItem}
            chunkCx={cx}
            chunkCy={cy}
            chunkCz={cz}
            cameraGridRef={cameraGridRef}
            mouseRef={mouseRef}
          />
        );
      })}
    </group>
  );
}

type ControllerState = {
  velocity: { x: number; y: number; z: number };
  targetVel: { x: number; y: number; z: number };
  basePos: { x: number; y: number; z: number };
  drift: { x: number; y: number };
  mouse: { x: number; y: number };
  lastMouse: { x: number; y: number };
  scrollAccum: number;
  isDragging: boolean;
  lastTouches: Touch[];
  lastTouchDist: number;
  lastChunkKey: string;
  lastChunkUpdate: number;
  pendingChunk: { cx: number; cy: number; cz: number } | null;
};

const createInitialState = (camZ: number): ControllerState => ({
  velocity: { x: 0, y: 0, z: 0 },
  targetVel: { x: 0, y: 0, z: 0 },
  basePos: { x: 0, y: 0, z: camZ },
  drift: { x: 0, y: 0 },
  mouse: { x: 0, y: 0 },
  lastMouse: { x: 0, y: 0 },
  scrollAccum: 0,
  isDragging: false,
  lastTouches: [],
  lastTouchDist: 0,
  lastChunkKey: "",
  lastChunkUpdate: 0,
  pendingChunk: null,
});

function SceneController({ media, onTextureProgress, onMotion }: { media: MediaItem[]; onTextureProgress?: (progress: number) => void; onMotion?: (motion: import('./types').MotionState) => void }) {
  const { camera, gl } = useThree();
  const isTouchDevice = useIsTouchDevice();
  const keysRef = React.useRef<KeyboardKeys>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
  });

  const state = React.useRef<ControllerState>(createInitialState(INITIAL_CAMERA_Z));
  const cameraGridRef = React.useRef<CameraGridState>({ cx: 0, cy: 0, cz: 0, camZ: camera.position.z });
  // Ref per la posizione del mouse condivisa con MediaPlane per effetto finestra
  const mouseRef = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [chunks, setChunks] = React.useState<ChunkData[]>([]);

  React.useEffect(() => {
    if (onTextureProgress) {
      onTextureProgress(100);
    }
  }, [onTextureProgress]);

  React.useEffect(() => {
    const canvas = gl.domElement;
    const s = state.current;
    canvas.style.cursor = "default";

    // Navigazione via mouse movement (non drag)
    // Il mouse controlla direttamente la posizione della camera
    const onMouseMove = (e: MouseEvent) => {
      // Posizione normalizzata -1 a 1
      const mx = (e.clientX / window.innerWidth) * 2 - 1;
      const my = -(e.clientY / window.innerHeight) * 2 + 1;
      
      s.mouse = { x: mx, y: my };
      // Aggiorna mouseRef per effetto finestra nelle MediaPlane
      mouseRef.current = { x: mx, y: my };
      
      // Navigazione continua basata sulla posizione del mouse
      // Più il mouse è lontano dal centro, più veloce la navigazione
      const mouseForceX = mx * 0.08;
      const mouseForceY = my * 0.08;
      
      s.targetVel.x += mouseForceX;
      s.targetVel.y += mouseForceY;
    };

    const onMouseLeave = () => {
      s.mouse = { x: 0, y: 0 };
      mouseRef.current = { x: 0, y: 0 };
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      s.scrollAccum += e.deltaY * 0.006;
    };

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      s.lastTouches = Array.from(e.touches) as Touch[];
      s.lastTouchDist = getTouchDistance(s.lastTouches);
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touches = Array.from(e.touches) as Touch[];

      if (touches.length === 1 && s.lastTouches.length >= 1) {
        const [touch] = touches;
        const [last] = s.lastTouches;

        if (touch && last) {
          // Touch continua a funzionare con drag per mobile
          s.targetVel.x -= (touch.clientX - last.clientX) * 0.02;
          s.targetVel.y += (touch.clientY - last.clientY) * 0.02;
        }
      } else if (touches.length === 2 && s.lastTouchDist > 0) {
        const dist = getTouchDistance(touches);
        s.scrollAccum += (s.lastTouchDist - dist) * 0.006;
        s.lastTouchDist = dist;
      }

      s.lastTouches = touches;
    };

    const onTouchEnd = (e: TouchEvent) => {
      s.lastTouches = Array.from(e.touches) as Touch[];
      s.lastTouchDist = getTouchDistance(s.lastTouches);
    };

    // Solo mouse move, no drag
    window.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd, { passive: false });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, [gl]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = KEY_MAP[event.key];
      if (key) {
        keysRef.current[key] = true;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = KEY_MAP[event.key];
      if (key) {
        keysRef.current[key] = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame(() => {
    const s = state.current;
    const now = performance.now();

    const { forward, backward, left, right, up, down } = keysRef.current;
    if (forward) s.targetVel.z -= KEYBOARD_SPEED;
    if (backward) s.targetVel.z += KEYBOARD_SPEED;
    if (left) s.targetVel.x -= KEYBOARD_SPEED;
    if (right) s.targetVel.x += KEYBOARD_SPEED;
    if (down) s.targetVel.y -= KEYBOARD_SPEED;
    if (up) s.targetVel.y += KEYBOARD_SPEED;

    const isZooming = Math.abs(s.velocity.z) > 0.05;
    const zoomFactor = clamp(s.basePos.z / 50, 0.3, 2.0);
    
    // Drift più fluido e responsivo al mouse
    const driftAmount = 12.0 * zoomFactor;
    const driftLerp = isZooming ? 0.15 : 0.08;

    if (isTouchDevice) {
      s.drift.x = lerp(s.drift.x, 0, driftLerp);
      s.drift.y = lerp(s.drift.y, 0, driftLerp);
    } else {
      // Drift segue il mouse per effetto "finestra"
      s.drift.x = lerp(s.drift.x, s.mouse.x * driftAmount, driftLerp);
      s.drift.y = lerp(s.drift.y, s.mouse.y * driftAmount, driftLerp);
    }

    s.targetVel.z += s.scrollAccum + IDLE_ZOOM_SPEED;
    s.scrollAccum *= 0.8;

    s.targetVel.x = clamp(s.targetVel.x, -MAX_VELOCITY, MAX_VELOCITY);
    s.targetVel.y = clamp(s.targetVel.y, -MAX_VELOCITY, MAX_VELOCITY);
    s.targetVel.z = clamp(s.targetVel.z, -MAX_VELOCITY, MAX_VELOCITY);

    // Lerp più morbido per sensazione fisica
    s.velocity.x = lerp(s.velocity.x, s.targetVel.x, VELOCITY_LERP * 0.8);
    s.velocity.y = lerp(s.velocity.y, s.targetVel.y, VELOCITY_LERP * 0.8);
    s.velocity.z = lerp(s.velocity.z, s.targetVel.z, VELOCITY_LERP);

    s.basePos.x += s.velocity.x;
    s.basePos.y += s.velocity.y;
    s.basePos.z += s.velocity.z;

    camera.position.set(s.basePos.x + s.drift.x, s.basePos.y + s.drift.y, s.basePos.z);

    // Decay più lento per inerzia
    s.targetVel.x *= VELOCITY_DECAY * 0.98;
    s.targetVel.y *= VELOCITY_DECAY * 0.98;
    s.targetVel.z *= VELOCITY_DECAY;

    const cx = Math.floor(s.basePos.x / CHUNK_SIZE);
    const cy = Math.floor(s.basePos.y / CHUNK_SIZE);
    const cz = Math.floor(s.basePos.z / CHUNK_SIZE);

    cameraGridRef.current = { cx, cy, cz, camZ: s.basePos.z };

    const key = `${cx},${cy},${cz}`;
    if (key !== s.lastChunkKey) {
      s.pendingChunk = { cx, cy, cz };
      s.lastChunkKey = key;
    }

    // Trasmetti stato movimento per coordinazione blur field
    if (onMotion) {
      const speed = Math.sqrt(s.velocity.x * s.velocity.x + s.velocity.y * s.velocity.y + s.velocity.z * s.velocity.z);
      onMotion({
        velocityX: s.velocity.x,
        velocityY: s.velocity.y,
        velocityZ: s.velocity.z,
        speed,
        isDragging: false, // Non più drag-based
        mouseX: s.mouse.x,
        mouseY: s.mouse.y,
      });
    }

    const throttleMs = getChunkUpdateThrottleMs(isZooming, Math.abs(s.velocity.z));

    if (s.pendingChunk && shouldThrottleUpdate(s.lastChunkUpdate, throttleMs, now)) {
      const { cx: ucx, cy: ucy, cz: ucz } = s.pendingChunk;
      s.pendingChunk = null;
      s.lastChunkUpdate = now;

      setChunks(
        CHUNK_OFFSETS.map((o) => ({
          key: `${ucx + o.dx},${ucy + o.dy},${ucz + o.dz}`,
          cx: ucx + o.dx,
          cy: ucy + o.dy,
          cz: ucz + o.dz,
        }))
      );
    }
  });

  React.useEffect(() => {
    const s = state.current;
    s.basePos = { x: camera.position.x, y: camera.position.y, z: camera.position.z };

    setChunks(
      CHUNK_OFFSETS.map((o) => ({
        key: `${o.dx},${o.dy},${o.dz}`,
        cx: o.dx,
        cy: o.dy,
        cz: o.dz,
      }))
    );
  }, [camera]);

  return (
    <>
      {chunks.map((chunk) => (
        <Chunk key={chunk.key} cx={chunk.cx} cy={chunk.cy} cz={chunk.cz} media={media} cameraGridRef={cameraGridRef} mouseRef={mouseRef} />
      ))}
    </>
  );
}

export function InfiniteCanvasScene({
  media,
  onTextureProgress,
  onMotion,
  showControls = false,
  cameraFov = 60,
  cameraNear = 1,
  cameraFar = 500,
  fogNear = 120,
  fogFar = 320,
  backgroundColor = "#ffffff",
  fogColor = "#ffffff",
}: InfiniteCanvasProps) {
  const isTouchDevice = useIsTouchDevice();
  const dpr = Math.min(window.devicePixelRatio || 1, isTouchDevice ? 1.25 : 1.5);

  if (!media.length) {
    return null;
  }

  return (
    <div className={styles.container}>
      <Canvas
        camera={{ position: [0, 0, INITIAL_CAMERA_Z], fov: cameraFov, near: cameraNear, far: cameraFar }}
        dpr={dpr}
        flat
        gl={{ antialias: false, powerPreference: "high-performance" }}
        className={styles.canvas}
      >
        <color attach="background" args={[backgroundColor]} />
        <fog attach="fog" args={[fogColor, fogNear, fogFar]} />
        <SceneController media={media} onTextureProgress={onTextureProgress} onMotion={onMotion} />
      </Canvas>

      {showControls && (
        <div className={styles.controlsPanel}>
          {isTouchDevice ? (
            <>
              <b>Drag</b> Pan · <b>Pinch</b> Zoom
            </>
          ) : (
            <>
              <b>WASD</b> Move · <b>QE</b> Up/Down · <b>Scroll</b> Zoom
            </>
          )}
        </div>
      )}
    </div>
  );
}
