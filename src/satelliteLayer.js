import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export const SATELLITE_SERVICE_URL =
  'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer';
export const SATELLITE_INFO_URL =
  'https://goto.arcgisonline.com/maps/World_Imagery';

const FALLBACK_ATTRIBUTION =
  'Esri, Vantor, Earthstar Geographics, and the GIS User Community';
const TILE_TIMEOUT_MS = 12000;

const limite = (valor, minimo, maximo) => Math.min(maximo, Math.max(minimo, valor));

export function tilesParaVista({ projection, largura, altura, vista, escala }) {
  const extent = projection?.type === 'web-mercator'
    ? projection.normalizedExtent
    : null;
  if (
    !extent
    || ![extent.xMin, extent.yMin, extent.xMax, extent.yMax, largura, altura]
      .every(Number.isFinite)
    || extent.xMax <= extent.xMin
    || extent.yMax <= extent.yMin
  ) {
    return { key: 'sem-projecao', level: null, tiles: [] };
  }

  const level = limite(8 + Math.round(Math.log2(Math.max(1, escala || 1))), 8, 18);
  const grade = 2 ** level;
  const janela = vista || { x: 0, y: 0, w: largura, h: altura };
  const normX = (x) => extent.xMin + (x / largura) * (extent.xMax - extent.xMin);
  const normY = (y) => extent.yMin + (y / altura) * (extent.yMax - extent.yMin);
  const esquerda = limite(Math.floor(normX(janela.x) * grade), 0, grade - 1);
  const direita = limite(
    Math.floor((normX(janela.x + janela.w) - Number.EPSILON) * grade),
    0,
    grade - 1,
  );
  const topo = limite(Math.floor(normY(janela.y) * grade), 0, grade - 1);
  const base = limite(
    Math.floor((normY(janela.y + janela.h) - Number.EPSILON) * grade),
    0,
    grade - 1,
  );
  const passoX = largura / ((extent.xMax - extent.xMin) * grade);
  const passoY = altura / ((extent.yMax - extent.yMin) * grade);
  const tiles = [];

  for (let row = topo; row <= base; row += 1) {
    for (let col = esquerda; col <= direita; col += 1) {
      tiles.push({
        id: `${level}/${row}/${col}`,
        x: (col / grade - extent.xMin) * largura / (extent.xMax - extent.xMin),
        y: (row / grade - extent.yMin) * altura / (extent.yMax - extent.yMin),
        width: passoX,
        height: passoY,
        href: `${SATELLITE_SERVICE_URL}/tile/${level}/${row}/${col}`,
      });
    }
  }

  return {
    key: `${level}:${esquerda}:${direita}:${topo}:${base}`,
    level,
    tiles,
  };
}

function useOnlineStatus() {
  const [online, setOnline] = useState(
    () => typeof navigator === 'undefined' || navigator.onLine !== false,
  );

  useEffect(() => {
    const atualizar = () => setOnline(navigator.onLine !== false);
    window.addEventListener('online', atualizar);
    window.addEventListener('offline', atualizar);
    return () => {
      window.removeEventListener('online', atualizar);
      window.removeEventListener('offline', atualizar);
    };
  }, []);

  return online;
}

export function useSatelliteLayer({ active, projection, largura, altura, vista, escala }) {
  const online = useOnlineStatus();
  const [retryKey, setRetryKey] = useState(0);
  const [attribution, setAttribution] = useState(FALLBACK_ATTRIBUTION);
  const [timedOut, setTimedOut] = useState(false);
  const [tileState, setTileState] = useState({
    loaded: new Set(),
    failed: new Set(),
  });
  const previousOnlineRef = useRef(online);
  const grid = useMemo(
    () => tilesParaVista({ projection, largura, altura, vista, escala }),
    [projection, largura, altura, vista, escala],
  );
  const currentTileKeys = useMemo(
    () => grid.tiles.map((tile) => `${tile.id}:${retryKey}`),
    [grid.tiles, retryKey],
  );
  const currentTileKeysRef = useRef(new Set(currentTileKeys));
  currentTileKeysRef.current = new Set(currentTileKeys);

  useEffect(() => {
    if (previousOnlineRef.current === false && online === true) {
      setTileState({ loaded: new Set(), failed: new Set() });
      setTimedOut(false);
      setRetryKey((value) => value + 1);
    }
    previousOnlineRef.current = online;
  }, [online]);

  useEffect(() => {
    if (!active || !online) return undefined;
    const controller = new AbortController();
    fetch(`${SATELLITE_SERVICE_URL}?f=pjson`, {
      credentials: 'omit',
      mode: 'cors',
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((metadata) => {
        const value = String(metadata?.copyrightText || '')
          .replace(/^(?:Source|Sources):\s*/i, '')
          .trim();
        if (value) setAttribution(value);
      })
      .catch((error) => {
        if (error?.name !== 'AbortError') setAttribution(FALLBACK_ATTRIBUTION);
      });
    return () => controller.abort();
  }, [active, online, retryKey]);

  useEffect(() => {
    setTimedOut(false);
    if (!active || !online || !grid.tiles.length) return undefined;
    const timeout = window.setTimeout(() => setTimedOut(true), TILE_TIMEOUT_MS);
    return () => window.clearTimeout(timeout);
  }, [active, online, grid.key, grid.tiles.length, retryKey]);

  const registrar = useCallback((kind, tileKey) => {
    if (!currentTileKeysRef.current.has(tileKey)) return;
    setTileState((previous) => {
      const loaded = new Set(previous.loaded);
      const failed = new Set(previous.failed);
      if (kind === 'loaded') {
        loaded.add(tileKey);
        failed.delete(tileKey);
      } else {
        failed.add(tileKey);
        loaded.delete(tileKey);
      }
      return {
        loaded,
        failed,
      };
    });
  }, []);

  const loadedCount = currentTileKeys.filter((key) => tileState.loaded.has(key)).length;
  const failedCount = currentTileKeys.filter((key) => tileState.failed.has(key)).length;
  const settledCount = loadedCount + failedCount;
  const hasLoadedTile = loadedCount > 0;
  const allTilesFailed = currentTileKeys.length > 0 && failedCount === currentTileKeys.length;
  const partial = hasLoadedTile
    && (failedCount > 0 || (timedOut && settledCount < currentTileKeys.length));
  let status = 'idle';
  if (active && !projection?.normalizedExtent) status = 'error';
  else if (active && !online) status = 'offline';
  else if (active && !grid.tiles.length) status = 'error';
  else if (active && allTilesFailed) status = 'error';
  else if (active && partial) status = 'partial';
  else if (active && hasLoadedTile) status = 'ready';
  else if (active && timedOut) status = 'error';
  else if (active) status = 'loading';

  return {
    attribution,
    currentTileKeys,
    grid,
    online,
    registrar,
    retry: () => {
      setTileState({ loaded: new Set(), failed: new Set() });
      setTimedOut(false);
      setRetryKey((value) => value + 1);
    },
    retryKey,
    status,
  };
}
