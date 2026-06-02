'use client'
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import * as echarts from 'echarts';
import { X, Move, Maximize2, Minimize2, Download, Loader2, HelpCircle, Info } from 'lucide-react';
import { 
  FaNetworkWired, 
  FaAward, 
  FaHandshake, 
  FaChartLine, 
  FaUsers, 
  FaLink, 
  FaChartPie,
  FaSitemap,
  FaCrosshairs,
  FaFileExcel,
  FaFileCsv,
  FaFileCode,
  FaImage,
  FaFilePdf,
  FaSearch,
  FaFilter,
  FaEye,
  FaEyeSlash,
  FaExpand,
  FaCompress,
  FaPlay,
  FaStop,
  FaRedo,
  FaTrash,
  FaInfoCircle,
  FaQuestionCircle,
  FaCog,
  FaDatabase,
  FaChartBar,
  FaProjectDiagram,
  FaBuilding,
  FaUniversity,
  FaIndustry,
  FaHandsHelping,
  FaLightbulb,
  FaBullseye,
  FaRocket,
  FaDownload
} from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

// === Componente HelpTooltip ===
interface HelpTooltipProps {
  content: string;
  title?: string;
  className?: string;
}

const HelpTooltip = ({ content, title, className = "" }: HelpTooltipProps) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button 
        variant="ghost" 
        size="sm" 
        className={`h-5 w-5 p-0 text-muted-foreground hover:text-foreground ${className}`}
        title="Más información"
      >
        <Info className="h-3 w-3" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-80" align="start">
      {title && <div className="font-semibold mb-2">{title}</div>}
      <div className="text-sm text-muted-foreground">{content}</div>
    </PopoverContent>
  </Popover>
);

// === Constantes con explicaciones para las métricas ===
const METRIC_EXPLANATIONS = {
  nodes: {
    title: "Nodos (Organizaciones)",
    content: "Representa el número total de organizaciones en la red actual. Cada nodo es una entidad única que participa en las relaciones analizadas."
  },
  edges: {
    title: "Aristas (Conexiones)",
    content: "Número total de conexiones entre organizaciones. Cada arista representa una relación específica según la capa seleccionada (relacionamiento, reconocimiento o recomendación)."
  },
  density: {
    title: "Densidad de la Red",
    content: "Mide qué tan conectada está la red. Va de 0 (sin conexiones) a 1 (totalmente conectada). Una densidad alta indica que las organizaciones están muy interconectadas."
  },
  cohesion: {
    title: "Cohesión",
    content: "Porcentaje de organizaciones que pertenecen al componente principal de la red. Una cohesión de 1.0 significa que todas las organizaciones están conectadas entre sí."
  },
  centrality: {
    title: "Centralidad Promedio",
    content: "Promedio de conexiones por organización. En reconocimiento/recomendación mide conexiones entrantes; en relacionamiento mide conexiones totales."
  }
};

const LAYER_EXPLANATIONS = {
  relacionamiento: {
    title: "Red de Relacionamiento",
    content: "Analiza las relaciones de colaboración entre organizaciones: intercambio de información, proyectos conjuntos y labores de incidencia."
  },
  reconocimiento: {
    title: "Red de Reconocimiento", 
    content: "Muestra qué organizaciones son reconocidas por otras como referentes o expertas en sus áreas de trabajo."
  },
  recomendacion: {
    title: "Red de Recomendación",
    content: "Identifica qué organizaciones son recomendadas por otras para colaboraciones futuras, según diferentes propósitos específicos."
  }
};

const TOP_EXPLANATIONS = {
  centrales: {
    title: "Organizaciones Centrales",
    content: "Organizaciones que reciben el mayor número de conexiones directas. Son actores clave por su alta conectividad en la red."
  },
  influyentes: {
    title: "Organizaciones Influyentes", 
    content: "Calculado con PageRank, identifica organizaciones que no solo tienen muchas conexiones, sino que están conectadas con otros actores importantes."
  },
  facilitadoras: {
    title: "Organizaciones Facilitadoras",
    content: "Usando centralidad de intermediación, encuentra organizaciones que actúan como puentes entre diferentes grupos o sectores de la red."
  }
};


// === Helpers de formateo de métricas ===
type MetricKind = 'degree_in' | 'pagerank' | 'betweenness';

const cleanDegree = (x: number) => {
  // Si viene escalado (32 000 = 32 * 1000), lo desescalamos.
  if (Number.isFinite(x) && x >= 1000 && x <= 1000000 && x % 1000 === 0) {
    return x / 1000;
  }
  return x;
};

export const formatMetric = (x: number | null | undefined, kind: MetricKind) => {
  if (x == null || Number.isNaN(Number(x))) return '—';
  const v = Number(x);
  if (kind === 'degree_in') {
    return Math.round(cleanDegree(v)).toLocaleString(); // 32 000 -> 32
  }
  // pagerank / betweenness → porcentaje
  return `${(v * 100).toFixed(1)}%`;
};

export const MetricBar = ({ value, max }: { value: number; max: number }) => {
  const w = !max || !Number.isFinite(max) ? 0 : Math.max(2, (value / max) * 100);
  return (
    <div className="h-2 w-full bg-muted rounded">
      <div className="h-2 rounded bg-primary" style={{ width: `${w}%` }} />
    </div>
  );
};

// === Utilidades para exportación ===
const nowStamp = () => new Date().toISOString().replace(/[:.]/g, '-');

const dl = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const dataURLtoBlob = (dataURL: string) => {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], { type: mime });
};

interface GraphNode {
  id: string;
  label?: string;
  name?: string;
}

interface GraphLink {
  source: string;
  target: string;
  types_present?: number[];
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
  diagnostics?: {
    types_meta?: Record<string, string>;
    types_filter_available?: number[];
    recommendation_edges?: any[];
  };
}

export default function Grafos() {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  // Ajusta zoom y centra el grafo para que quepa con un margen
  const fitGraphToViewport = () => {
    const chart = chartInstance.current as any;
    if (!chart?.getModel) return;

    // Tomar layouts de los nodos
    const series = chart.getModel().getSeriesByIndex(0);
    const data = series?.getData?.();
    if (!data) return;

    const pts: [number, number][] = [];
    data.each((idx: number) => {
      const p = data.getItemLayout(idx) as [number, number] | undefined;
      if (p && isFinite(p[0]) && isFinite(p[1])) pts.push(p);
    });
    if (!pts.length) return;

    const xs = pts.map(p => p[0]);
    const ys = pts.map(p => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);

    const gw = Math.max(1, maxX - minX);
    const gh = Math.max(1, maxY - minY);

    const pad = 60; // margen más grande para nodos pequeños
    const vw = chart.getWidth() - pad * 2;
    const vh = chart.getHeight() - pad * 2;
    const targetZoom = Math.max(0.05, Math.min(1, Math.min(vw / gw, vh / gh) * 0.9));

    // Partimos de zoom 1; 'graphRoam.zoom' es multiplicativo
    chart.dispatchAction({ type: 'graphRoam', zoom: targetZoom });

    // Centrar
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const viewCx = chart.getWidth() / 2;
    const viewCy = chart.getHeight() / 2;

    chart.dispatchAction({
      type: 'graphRoam',
      moveX: viewCx - cx * targetZoom,
      moveY: viewCy - cy * targetZoom,
    });
  };

  // Ejecutar una sola vez cuando el render termina
  const fitOnFinishedOnce = () => {
    const chart = chartInstance.current;
    if (!chart) return;
    const handler = () => { 
      chart.off('finished', handler as any); 
      // Solo hacer fit si no hay interacción previa del usuario
      setTimeout(() => {
        fitGraphToViewport();
      }, 100);
    };
    chart.on('finished', handler as any);
  };
  
  
  const [rawData, setRawData] = useState<GraphData>({ nodes: [], links: [] });
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [viewData, setViewData] = useState<GraphData>({ nodes: [], links: [] });
  
  
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  
  // --- Estados de capa: UI (borrador) y aplicado ---
  const [pendingLayer, setPendingLayer] = useState<string>(''); // lo que elige el usuario
  const [appliedLayer, setAppliedLayer] = useState<string>(''); // lo que ya aplicaste y estás mostrando
  const [hasApplied, setHasApplied] = useState<boolean>(false); // para controlar "No hay datos"

  const [activeRecSelected, setActiveRecSelected] = useState<Set<number>>(new Set()); // propósitos aplicados
  const [draftRecSelected, setDraftRecSelected] = useState<Set<number>>(new Set());   // propósitos en el UI

  // Recomendación: propósito único obligatorio (1|2|3)
  const [recPurpose, setRecPurpose] = useState<number | null>(null);

  // Relacionamiento: selector de tipo (todos o 1|2|3)
  const [relTipo, setRelTipo] = useState<number | 'all'>('all');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const [topN, setTopN] = useState<number>(5);
  const [selectedTypes, setSelectedTypes] = useState<Set<number>>(new Set());
  const [includeUntyped, setIncludeUntyped] = useState<boolean>(true);
  const [availableTypes, setAvailableTypes] = useState<number[]>([]);
  const [typesMeta, setTypesMeta] = useState<Record<string, string>>({});
  const [egoCenterId, setEgoCenterId] = useState<string | null>(null);
  const [topMode, setTopMode] = useState<'none' | 'best' | 'worst'>('none');
  const [metrics, setMetrics] = useState({
    nodes: 0,
    edges: 0,
    density: 0,
    centrality: 0,   // grado promedio como centralidad
    cohesion: 0,     // Cohesión (GCC / n)
    avgDegree: 0,    // grado promedio mostrado como número
    components: 0,   // número de componentes
    isolated: 0,     // número de nodos aislados
    gcc: 0          // tamaño del mayor componente
  });

  // Estados para modo presentación
  const [presentMode, setPresentMode] = useState(false);
  const [panelPos, setPanelPos] = useState<{x:number;y:number}>({ x: 24, y: 24 });
  const panelRef = useRef<HTMLDivElement|null>(null);

  // Estados para exportación
  const [exportFormat, setExportFormat] = useState<'json'|'csv'|'xlsx'|'png'|'pdf'>('xlsx');
  const [isExporting, setIsExporting] = useState(false);

  // === Componentes de Estado y Resumen ===
  const NetworkStatusIndicator = () => {
    const getStatusColor = () => {
      if (!hasApplied) return 'bg-gray-500';
      if (!viewData.nodes.length) return 'bg-yellow-500';
      return 'bg-green-500';
    };

    const getStatusText = () => {
      if (!hasApplied) return 'Red no seleccionada';
      if (!viewData.nodes.length) return 'Sin datos disponibles';
      return `${appliedLayer} - ${viewData.nodes.length} org. activas`;
    };

    return (
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
        <span className="text-muted-foreground">{getStatusText()}</span>
      </div>
    );
  };


  const LoadingSpinner = ({ message = "Cargando red..." }: { message?: string }) => (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div>
          <p className="text-lg font-medium text-foreground">{message}</p>
          <p className="text-sm text-gray-500">Analizando relaciones organizacionales...</p>
        </div>
      </div>
    </div>
  );

  // Manejo de tecla Escape para salir del modo presentación
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPresentMode(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const chart = chartInstance.current;
    if (!chart) return;

    // bloquear/desbloquear scroll
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = presentMode ? 'hidden' : (prevOverflow || '');

    // cuando cambia a presentación, fuerza resize, resetea el roam y ajusta a pantalla
    const r0 = requestAnimationFrame(() => {
      chart.resize();
      chart.dispatchAction({ type: 'restore' });     // 🔹 borra zoom/traslación previos
      // espera un tick para que ECharts estabilice el tamaño y luego centra
      setTimeout(() => {
        fitGraphToViewport();                         // 🔹 calcula bbox y centra/escala
      }, 0);
    });

    return () => {
      cancelAnimationFrame(r0);
      document.documentElement.style.overflow = prevOverflow || '';
    };
  }, [presentMode]);

  // Función para arrastrar el panel flotante
  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX, startY = e.clientY;
    const rect = panelRef.current?.getBoundingClientRect();
    const baseX = rect?.left ?? panelPos.x;
    const baseY = rect?.top ?? panelPos.y;

    const onMove = (ev: MouseEvent) => {
      setPanelPos({
        x: Math.max(8, Math.min(window.innerWidth - 320, baseX + (ev.clientX - startX))),
        y: Math.max(8, Math.min(window.innerHeight - 80, baseY + (ev.clientY - startY))),
      });
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  // Estado derivado: ¿hay propósitos etiquetados?
  const recTypesAvailable = React.useMemo(() => {
    if (appliedLayer !== 'recomendacion') return false;
    const links = rawData?.links || [];
    return links.some((e: any) => Array.isArray(e?.types_present) && e.types_present.some((t: any) => [1,2,3].includes(Number(t))));
  }, [rawData, appliedLayer]);

  const REC_OPTIONS = [
    { id: 1, label: 'Obtener e intercambiar información' },
    { id: 2, label: 'Desarrollar proyectos conjuntamente' },
    { id: 3, label: 'Realizar labores de incidencia' },
  ];

  
  const ALLOWED_API_HOSTS = [
    'andesai-graph-api-production.up.railway.app',
    'andesai-graph-api.onrender.com',
  ];

  const getApiUrl = (layer?: string) => {
    const params = new URLSearchParams(window.location.search);
    let apiBase = (import.meta.env.VITE_API_BASE_URL || 'https://andesai-graph-api.onrender.com').replace(/\/+$/, '');
    const requested = params.get('api');
    if (requested) {
      try {
        const url = new URL(requested);
        if (ALLOWED_API_HOSTS.includes(url.hostname)) {
          apiBase = requested.replace(/\/+$/, '');
        }
      } catch {}
    }
    const L = (layer ?? appliedLayer)?.trim();
    return L ? `${apiBase}/graph?layer=${encodeURIComponent(L)}` : `${apiBase}/graph`;
  };

  
  const DEFAULT_TYPES_META = {
    1: 'Intercambio de información',
    2: 'Realizan proyectos conjuntamente',
    3: 'Realizan labores de incidencia'
  };

  // Paleta de colores fuertes y vibrantes
  const STRONG_COLORS = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FF8000', '#8000FF',
    '#00FF80', '#FF0080', '#80FF00', '#0080FF', '#FF4000', '#4000FF', '#00FF40', '#FF0040',
    '#FF6000', '#6000FF', '#00FF60', '#FF0060', '#FF2000', '#2000FF', '#00FF20', '#FF0020',
    '#FFA000', '#A000FF', '#00FFA0', '#FF00A0', '#FFC000', '#C000FF', '#00FFC0', '#FF00C0',
    '#FF1A00', '#1AFF00', '#001AFF', '#FFFF1A', '#FF1AFF', '#1AFFFF', '#FF8A1A', '#8A1AFF',
    '#1AFF8A', '#FF1A8A', '#8AFF1A', '#1A8AFF', '#FF4A1A', '#4A1AFF', '#1AFF4A', '#FF1A4A'
  ];

  // Referencias persistentes para colores
  const usedColorsRef = useRef<Set<string>>(new Set());
  const nodeColorMapRef = useRef<Map<string, string>>(new Map());

  const getRandomStrongColor = (nodeId: string): string => {
    // Si ya tiene color asignado, devolverlo
    if (nodeColorMapRef.current.has(nodeId)) {
      return nodeColorMapRef.current.get(nodeId)!;
    }

    // Obtener colores disponibles (no usados)
    const availableColors = STRONG_COLORS.filter(color => !usedColorsRef.current.has(color));
    
    let selectedColor: string;
    
    if (availableColors.length > 0) {
      // Si hay colores disponibles, elegir uno aleatorio
      const randomIndex = Math.floor(Math.random() * availableColors.length);
      selectedColor = availableColors[randomIndex];
    } else {
      // Si todos los colores están usados, resetear y empezar de nuevo
      usedColorsRef.current.clear();
      selectedColor = STRONG_COLORS[Math.floor(Math.random() * STRONG_COLORS.length)];
    }

    // Marcar color como usado y asignar al nodo
    usedColorsRef.current.add(selectedColor);
    nodeColorMapRef.current.set(nodeId, selectedColor);
    
    return selectedColor;
  };

  // nodos con mayor contraste: los grandes resaltan más
  const MIN = 12, MAX = 35;  // nodos más visibles en presentación

  const nodeScoreByLayer = (outDeg: number, inDeg: number) => {
    if (appliedLayer === 'reconocimiento') return inDeg;            // más reconocidos
    if (appliedLayer === 'recomendacion')  return inDeg;            // más recomendaciones recibidas
    return outDeg + inDeg;                                          // relacionamiento: total
  };

  const sizeFromScore = (score: number, maxScore: number) => {
    if (maxScore <= 0) return MIN;
    const ratio = Math.sqrt(score / maxScore); // suaviza picos
    return Math.max(MIN, Math.min(MIN + ratio * (MAX - MIN), MAX));
  };

  const topScoreByLayer = (outDeg: number, inDeg: number) => {
    if (appliedLayer === 'reconocimiento') return inDeg;            // más reconocidos
    if (appliedLayer === 'recomendacion')  return inDeg;            // más recomendaciones recibidas
    return outDeg + inDeg;                                          // quién más relaciones totales
  };

  
  const loadGraph = async () => {
    const doFetch = async (url: string) => {
      const r = await fetch(url, {
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });
      try {
        return unwrapGraph(await r.json());
      } catch {
        const txt = await r.text();
        throw new Error(`Upstream no JSON (status ${r.status}). Preview: ${txt.slice(0, 200)}`);
      }
    };

    try {
      const url = getApiUrl();                // <-- sin excepciones por recomendación
      let data = await doFetch(url);

      // fallback por si el backend no tiene inferencia (mantén por seguridad)
      if (appliedLayer !== 'all' && data.nodes.length === 0 && data.links.length === 0) {
        const baseUrl = url.replace(/\?.*$/, '');
        data = await doFetch(baseUrl);
      }

      setRawData(data);

      const diagnostics = data.diagnostics || {};
      const meta = { ...DEFAULT_TYPES_META, ...(diagnostics.types_meta || {}) };
      setTypesMeta(meta);

      if (appliedLayer === 'relacionamiento') {
        // marcar 1–3 o lo que venga en diagnostics
        const seen = (data.diagnostics?.types_filter_available?.map(Number)) ??
                     Array.from(new Set((data.links || []).flatMap(l => (l.types_present || [])).map(Number)));
        const onlyRel = seen.length ? seen.filter(t => [1,2,3].includes(Number(t))) : [1,2,3];

        setAvailableTypes(onlyRel);
        setSelectedTypes(new Set(onlyRel));
      } else if (appliedLayer === 'recomendacion') {
        setAvailableTypes([]);               // no mostramos lista de tipos aquí
        setSelectedTypes(new Set());
      } else if (appliedLayer === 'reconocimiento') {
        setAvailableTypes([]);               // sin tipos
        setSelectedTypes(new Set());
      }

      setEgoCenterId(null);
      setTopMode('none');

      toast.success('Grafo cargado', {
        description: `${data.nodes.length} nodos y ${data.links.length} aristas`,
      });
    } catch (err) {
      console.error('Error cargando grafo:', err);
      toast.error('Error', { description: 'No se pudo cargar el grafo' });
    }
  };

  const unwrapGraph = (raw: any): GraphData => {
    if (raw && Array.isArray(raw.nodes) && Array.isArray(raw.links)) return raw;
    if (raw && raw.graph && Array.isArray(raw.graph.nodes)) return raw.graph;
    if (Array.isArray(raw) && raw[0] && raw[0].json && raw[0].json.nodes) return raw[0].json;
    throw new Error("Respuesta sin nodes/links");
  };

  const buildTypesFromLinks = (links: GraphLink[]): number[] => {
    const types = new Set<number>();
    links.forEach(link => {
      (link.types_present || []).forEach(type => types.add(Number(type)));
    });
    return Array.from(types).sort((a, b) => a - b);
  };

  type AnyLink = Record<string, any>;



  
  const applyGlobalFilters = () => {
    if (!hasApplied) {
      setGraphData({ nodes: [], links: [], diagnostics: rawData.diagnostics });
      return;
    }

    const BASE: GraphData = { nodes: rawData.nodes, links: rawData.links, diagnostics: rawData.diagnostics };
    let filteredLinks = BASE.links;

    if (appliedLayer === 'recomendacion') {
      let filtered = BASE.links;

      if (recPurpose) {
        filtered = BASE.links.filter((e: any) => {
          const arr: number[] = Array.isArray(e.types_present) ? e.types_present : [];
          return arr.includes(Number(recPurpose));
        });
      }

      const keep = new Set<string>();
      filtered.forEach(e => { keep.add(String(e.source)); keep.add(String(e.target)); });
      const filteredNodes = BASE.nodes.filter(n => keep.has(n.id));
      setGraphData({ nodes: filteredNodes, links: filtered });
      return;
    }

    if (appliedLayer === 'relacionamiento') {
      let filtered = BASE.links;
      if (relTipo !== 'all') {
        filtered = BASE.links.filter((link: any) => {
          const lt = (link.types_present || []).map(Number);
          return lt.length === 1 && lt[0] === Number(relTipo);
        });
      }
      const keep = new Set<string>();
      filtered.forEach(e => { keep.add(String(e.source)); keep.add(String(e.target)); });
      const filteredNodes = BASE.nodes.filter(n => keep.has(n.id));
      setGraphData({ nodes: filteredNodes, links: filtered });
      return;
    }

    if (appliedLayer === 'reconocimiento') {
      // Ignora tipos; nodos incidentes a las aristas
      const keep = new Set<string>();
      BASE.links.forEach(e => { keep.add(String(e.source)); keep.add(String(e.target)); });
      const filteredNodes = BASE.nodes.filter(n => keep.has(n.id));
      setGraphData({ nodes: filteredNodes, links: BASE.links });
      return;
    }

    // Fallback (por si usas "all")
    const keep = new Set<string>();
    filteredLinks.forEach(e => { keep.add(String(e.source)); keep.add(String(e.target)); });
    const filteredNodes = BASE.nodes.filter(n => keep.has(n.id));
    setGraphData({ nodes: filteredNodes, links: filteredLinks });
  };

  useEffect(() => {
    applyGlobalFilters();
  }, [rawData, appliedLayer, recPurpose, relTipo, hasApplied]);

  const applyView = () => {
    let data = { ...graphData };
    
    // ⭐️ si hay ego-center, usamos vista estrella
    if (egoCenterId) {
      data = egoStar(egoCenterId, data.nodes, data.links);
    }
    
    if (topMode !== 'none') {
      data = subgraphTop(data.nodes, data.links, topMode, topN);
    }
    
    setViewData(data);
    calculateMetrics(data);
  };

  // === Subgrafo estrella: solo centro + sus aristas incidentes (sin enlaces entre vecinos)
  const egoStar = (centerId: string, nodes: GraphNode[], links: GraphLink[]) => {
    const keep = new Set([centerId]);
    const starEdges: GraphLink[] = [];

    links.forEach(e => {
      if (e.source === centerId || e.target === centerId) {
        keep.add(e.source);
        keep.add(e.target);
        starEdges.push(e);
      }
    });

    const subNodes = nodes.filter(n => keep.has(n.id));
    return { nodes: subNodes, links: starEdges };
  };

  const subgraphTop = (nodes: GraphNode[], links: GraphLink[], mode: 'best' | 'worst', n: number) => {
    const { outDegrees, inDegrees } = computeDegrees(nodes, links);

    const nodeScores = nodes.map(node => {
      const out = outDegrees.get(node.id) || 0;
      const inn = inDegrees.get(node.id) || 0;
      return { id: node.id, label: node.label || node.name || node.id, score: topScoreByLayer(out, inn) };
    });

    nodeScores.sort((a, b) =>
      mode === 'best'
        ? (b.score - a.score) || a.label.localeCompare(b.label)
        : (a.score - b.score) || a.label.localeCompare(b.label)
    );

    const topNodeIds = new Set(nodeScores.slice(0, Math.max(1, n)).map(x => x.id));

    return {
      nodes: nodes.filter(node => topNodeIds.has(node.id)),
      links: links.filter(link => topNodeIds.has(link.source) && topNodeIds.has(link.target))
    };
  };

  const computeDegrees = (nodes: GraphNode[], links: GraphLink[]) => {
    const outDegrees = new Map<string, number>();
    const inDegrees = new Map<string, number>();
    
    nodes.forEach(node => {
      outDegrees.set(node.id, 0);
      inDegrees.set(node.id, 0);
    });
    
    links.forEach(link => {
      outDegrees.set(link.source, (outDegrees.get(link.source) || 0) + 1);
      inDegrees.set(link.target, (inDegrees.get(link.target) || 0) + 1);
    });
    
    return { outDegrees, inDegrees };
  };

  // --- Eigenvector centrality (power iteration) ---
  // mode = 'in'  → importancia por predecesores (A^T x)
  // mode = 'out' → importancia por sucesores   (A x)
  // mode = 'undirected' → usa grafo no dirigido (A + A^T)
  const computeEigenvector = (
    nodes: GraphNode[],
    links: GraphLink[],
    mode: 'in' | 'out' | 'undirected' = 'in',
    maxIter = 100,
    tol = 1e-8
  ) => {
    const N = nodes.length;
    if (N === 0) return new Map<string, number>();

    const ids = nodes.map(n => n.id);
    const idIndex = new Map<string, number>(ids.map((id, i) => [id, i]));

    // Listas de vecinos según el modo
    const inNbrs: number[][]  = Array.from({ length: N }, () => []);
    const outNbrs: number[][] = Array.from({ length: N }, () => []);

    for (const e of links) {
      const u = idIndex.get(String(e.source));
      const v = idIndex.get(String(e.target));
      if (u == null || v == null) continue;
      outNbrs[u].push(v);
      inNbrs[v].push(u);
    }

    // Vector inicial uniformemente normalizado (norma L2 = 1)
    let x = new Array<number>(N).fill(1 / Math.sqrt(N));
    let y = new Array<number>(N).fill(0);

    const l2norm = (arr: number[]) => Math.sqrt(arr.reduce((s, a) => s + a * a, 0));

    for (let it = 0; it < maxIter; it++) {
      // y = A x (según el modo)
      y.fill(0);

      if (mode === 'out') {
        // (A x)_i = sum_j A_ij x_j  → sucesores de i (salidas)
        for (let i = 0; i < N; i++) {
          for (const j of outNbrs[i]) y[i] += x[j];
        }
      } else if (mode === 'in') {
        // (A^T x)_i = sum_j A_ji x_j → predecesores de i (entradas)
        for (let i = 0; i < N; i++) {
          for (const j of inNbrs[i]) y[i] += x[j];
        }
      } else {
        // undirected: (A + A^T) x → vecinos no dirigidos
        for (let i = 0; i < N; i++) {
          // sucesores
          for (const j of outNbrs[i]) y[i] += x[j];
          // predecesores (suma adicional si no está ya)
          for (const j of inNbrs[i]) y[i] += x[j];
        }
      }

      // Normalizar y chequear convergencia
      const norm = l2norm(y);
      if (norm === 0) break; // grafo vacío/desconectado sin señales
      for (let i = 0; i < N; i++) y[i] /= norm;

      // diferencia L1
      let diff = 0;
      for (let i = 0; i < N; i++) diff += Math.abs(y[i] - x[i]);

      x = y.slice();
      if (diff < tol) break;
    }

    // Opcional: reescalar a suma = 1 (como PageRank) para mostrar en %
    const sum = x.reduce((s, a) => s + Math.abs(a), 0) || 1;
    const out = new Map<string, number>();
    for (let i = 0; i < N; i++) out.set(ids[i], x[i] / sum);
    return out;
  };


  // --- PageRank (dirigido) ---
  const computePageRank = (
    nodes: GraphNode[],
    links: GraphLink[],
    d = 0.85,
    maxIter = 40,
    tol = 1e-6
  ) => {
    const N = nodes.length;
    const ids = nodes.map(n => n.id);
    const idIndex = new Map(ids.map((id, i) => [id, i]));
    const outNeighbors: number[][] = Array.from({ length: N }, () => []);
    const outDeg = new Array(N).fill(0);

    for (const e of links) {
      const u = idIndex.get(e.source);
      const v = idIndex.get(e.target);
      if (u === undefined || v === undefined) continue;
      outNeighbors[u].push(v);
      outDeg[u]++;
    }

    let pr = new Array(N).fill(1 / N);
    let tmp = new Array(N).fill(0);

    for (let it = 0; it < maxIter; it++) {
      tmp.fill((1 - d) / N);
      // masa de nodos colgantes (sin salidas)
      let dangling = 0;
      for (let u = 0; u < N; u++) if (outDeg[u] === 0) dangling += pr[u];
      const addDangling = d * dangling / N;
      for (let u = 0; u < N; u++) {
        const share = outDeg[u] ? (d * pr[u] / outDeg[u]) : 0;
        for (const v of outNeighbors[u]) tmp[v] += share;
      }
      for (let i = 0; i < N; i++) tmp[i] += addDangling;

      // check convergencia
      let diff = 0;
      for (let i = 0; i < N; i++) diff += Math.abs(tmp[i] - pr[i]);
      pr = tmp.slice();
      if (diff < tol) break;
    }

    const out = new Map<string, number>();
    for (let i = 0; i < N; i++) out.set(ids[i], pr[i]);
    return out;
  };

  // --- Betweenness centrality (Brandes) en NO dirigido ---
  const computeBetweenness = (nodes: GraphNode[], links: GraphLink[]) => {
    const N = nodes.length;
    const ids = nodes.map(n => n.id);
    const idIndex = new Map(ids.map((id, i) => [id, i]));
    const adj: number[][] = Array.from({ length: N }, () => []);
    for (const e of links) {
      const u = idIndex.get(e.source);
      const v = idIndex.get(e.target);
      if (u === undefined || v === undefined) continue;
      adj[u].push(v);
      adj[v].push(u); // NO dirigido
    }

    const CB = new Array(N).fill(0);

    for (let s = 0; s < N; s++) {
      const S: number[] = [];
      const P: number[][] = Array.from({ length: N }, () => []);
      const sigma = new Array(N).fill(0); sigma[s] = 1;
      const dist = new Array(N).fill(-1); dist[s] = 0;

      const Q: number[] = [s];
      while (Q.length) {
        const v = Q.shift()!;
        S.push(v);
        for (const w of adj[v]) {
          if (dist[w] < 0) { dist[w] = dist[v] + 1; Q.push(w); }
          if (dist[w] === dist[v] + 1) { sigma[w] += sigma[v]; P[w].push(v); }
        }
      }

      const delta = new Array(N).fill(0);
      while (S.length) {
        const w = S.pop()!;
        for (const v of P[w]) {
          delta[v] += (sigma[v] / sigma[w]) * (1 + delta[w]);
        }
        if (w !== s) CB[w] += delta[w];
      }
    }

    // normalización opcional: divide por ((N-1)*(N-2)/2) para no dirigidos
    const norm = (N > 2) ? (1 / ((N - 1) * (N - 2) / 2)) : 1;
    const out = new Map<string, number>();
    for (let i = 0; i < N; i++) out.set(ids[i], CB[i] * norm);
    return out;
  };

  // helpers para ordenar y armar top-N desde Map<string,number>
  const topFromScoreMap = (m: Map<string, number>, n = 5, nameOfFn: (id: string)=>string) =>
    Array.from(m.entries())
      .sort((a,b) => b[1] - a[1] || nameOfFn(a[0]).localeCompare(nameOfFn(b[0])))
      .slice(0, n)
      .map(([id, score]) => ({ id, name: nameOfFn(id), score }));

  // Construye tablas basadas en la VISTA ACTUAL (viewData)
  const buildExportTables = () => {
    const nodes = viewData.nodes || [];
    const links = viewData.links || [];

    const { outDegrees, inDegrees } = computeDegrees(nodes, links);
    const prMap = computePageRank(nodes, links);
    const btwMap = computeBetweenness(nodes, links);

    const nodeRows = nodes.map(n => {
      const displayName = n.label || n.name || n.id;
      const info = sectorInfoFor(displayName);
      return {
        id: n.id,
        nombre: displayName,
        sector: info.sector,         // extraído dinámicamente
        grado_entrada: inDegrees.get(n.id) || 0,
        grado_salida:  outDegrees.get(n.id) || 0,
        pagerank: prMap.get(n.id) || 0,
        betweenness: btwMap.get(n.id) || 0,
        capa: appliedLayer || ''
      };
    });

    // Unificar aristas para evitar duplicados y organizar mejor la información
    const edgeMap = new Map<string, {
      source_id: string;
      source_nombre: string;
      target_ids: string[];
      target_nombres: string[];
      su_pyeudes: string;
      capa: string;
    }>();

    (viewData.links || []).forEach((e: any) => {
      const sourceId = e.source;
      const sourceNombre = rawData.nodes.find(n => n.id === e.source)?.label || e.source;
      const targetId = e.target;
      const targetNombre = rawData.nodes.find(n => n.id === e.target)?.label || e.target;
      const suPyeudes = e.su_pyeudes || e.types_present_labels?.join(', ') || '';
      
      if (edgeMap.has(sourceId)) {
        // Si ya existe, agregar el target a la lista
        const existing = edgeMap.get(sourceId)!;
        existing.target_ids.push(targetId);
        existing.target_nombres.push(targetNombre);
      } else {
        // Crear nueva entrada
        edgeMap.set(sourceId, {
          source_id: sourceId,
          source_nombre: sourceNombre,
          target_ids: [targetId],
          target_nombres: [targetNombre],
          su_pyeudes: suPyeudes,
          capa: appliedLayer || ''
        });
      }
    });

    const edgeRows = Array.from(edgeMap.values()).map(edge => ({
      source_id: edge.source_id,
      source_nombre: edge.source_nombre,
      target_ids: edge.target_ids.join('; '),
      target_nombres: edge.target_nombres.join('; '),
      su_pyeudes: edge.su_pyeudes,
      capa: edge.capa
    }));

    return { nodeRows, edgeRows };
  };

  // Estadísticas de conectividad débil (incluye aislados)
  const weakConnectivityStats = (nodes: GraphNode[], links: GraphLink[]) => {
    const N = nodes.length;
    
    if (N === 0) {
      return { gcc: 0, components: 0, isolated: 0 };
    }

    if (N === 1) {
      return { 
        gcc: 1, 
        components: 1, 
        isolated: links.length === 0 ? 1 : 0 
      };
    }

    // Crear mapeo robusto de ID a índice
    const idToIndex = new Map<string, number>();
    nodes.forEach((node, idx) => {
      idToIndex.set(String(node.id), idx);
    });

    // Lista de adyacencia para grafo NO DIRIGIDO
    const adj: number[][] = Array.from({ length: N }, () => []);
    
    // Procesar aristas y construir grafo no dirigido
    for (const edge of links) {
      const sourceId = String(edge.source);
      const targetId = String(edge.target);
      const u = idToIndex.get(sourceId);
      const v = idToIndex.get(targetId);
      
      // Validar que ambos nodos existen y no es self-loop
      if (u !== undefined && v !== undefined && u !== v) {
        adj[u].push(v);
        adj[v].push(u); // Tratar como no dirigido para conectividad
      }
    }

    // DFS para encontrar componentes conexas
    const visited = new Array<boolean>(N).fill(false);
    let gcc = 0;          // Giant Connected Component
    let components = 0;   // Número total de componentes
    let isolated = 0;     // Nodos completamente aislados

    for (let start = 0; start < N; start++) {
      if (visited[start]) continue;
      
      // Nuevo componente encontrado
      components++;
      let componentSize = 0;
      
      // DFS iterativo (más eficiente que recursivo)
      const stack = [start];
      visited[start] = true;
      
      while (stack.length > 0) {
        const node = stack.pop()!;
        componentSize++;
        
        // Explorar vecinos
        for (const neighbor of adj[node]) {
          if (!visited[neighbor]) {
            visited[neighbor] = true;
            stack.push(neighbor);
          }
        }
      }
      
      // Detectar nodos aislados (componente de tamaño 1 sin vecinos)
      if (componentSize === 1 && adj[start].length === 0) {
        isolated++;
      }
      
      // Actualizar componente gigante
      gcc = Math.max(gcc, componentSize);
    }

    return { gcc, components, isolated };
  };

  // === Helpers de ranking ===

  // nombre mostrable de un nodo
  const nameOf = (id: string) => {
    const n = rawData.nodes.find(x => x.id === id);
    return (n?.label || n?.name || id);
  };

  // topN a partir de un Map<id, count>
  const topNFromCounts = (m: Map<string, number>, n = 5) =>
    Array.from(m.entries())
      .sort((a,b) => b[1] - a[1] || nameOf(a[0]).localeCompare(nameOf(b[0])))
      .slice(0, n)
      .map(([id, count]) => ({ id, name: nameOf(id), count }));

  // === Colores por defecto / normalizador mejorado
  const DEFAULT_NODE_COLOR = '#94A3B8'; // gris por si no hay mapeo
  
  // Normalizador robusto que maneja acentos, puntuación, mayúsculas y variaciones
  const norm = (s: string) =>
    (s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // quita acentos
      .replace(/[^\w\s]/g, ' ') // reemplaza puntuación con espacios
      .replace(/\s+/g, ' ') // normaliza espacios múltiples
      .trim();

  // === Sector → color (según guía XLSX)
  const SECTOR_COLOR: Record<string, string> = {
    'Académico': '#1F77B4',
    'Empresarial': '#2CA02C',
    'Público': '#9467BD',
    'Gremio Empresarial': '#98DF8A',
    'Mixto': '#D62728',
    'Fundaciones y Corporaciones de la Sociedad Civil': '#FFCC00',
    'Redes y Plataformas Multiactor': '#E377C2',
  };

  // === Nombre normalizado → { sector, color }
  const NAME_TO_SECTOR_COLOR: Record<string, { sector: string; color: string }> = {
    'academia nacional de aprendizaje, andap': { sector: 'Académico', color: '#1F77B4' },
    'aguas de manizales': { sector: 'Empresarial', color: '#2CA02C' },
    'alcaldia de manizales': { sector: 'Público', color: '#9467BD' },
    'andi seccional caldas': { sector: 'Gremio Empresarial', color: '#98DF8A' },
    'asociacion educativa ae s.a.s': { sector: 'Académico', color: '#1F77B4' },
    'camara de comercio de manizales por caldas': { sector: 'Mixto', color: '#D62728' },
    'ceder': { sector: 'Fundaciones y Corporaciones de la Sociedad Civil', color: '#FFCC00' },
    'centro colombo americano': { sector: 'Académico', color: '#1F77B4' },
    'chec grupo epm': { sector: 'Empresarial', color: '#2CA02C' },
    'cinde': { sector: 'Académico', color: '#1F77B4' },
    'colegiatura del cafe s.a.s.': { sector: 'Académico', color: '#1F77B4' },
    'comite de cafeteros de caldas': { sector: 'Gremio Empresarial', color: '#98DF8A' },
    'comite intergremial de caldas': { sector: 'Gremio Empresarial', color: '#98DF8A' },
    'confa': { sector: 'Mixto', color: '#D62728' },
    'corporacion para el desarrollo de caldas': { sector: 'Fundaciones y Corporaciones de la Sociedad Civil', color: '#FFCC00' },
    'cruz roja': { sector: 'Fundaciones y Corporaciones de la Sociedad Civil', color: '#FFCC00' },
    'emas': { sector: 'Empresarial', color: '#2CA02C' },
    'federacion de ong de caldas': { sector: 'Fundaciones y Corporaciones de la Sociedad Civil', color: '#FFCC00' },
    'fundacion luker': { sector: 'Fundaciones y Corporaciones de la Sociedad Civil', color: '#FFCC00' },
    'grupo adri': { sector: 'Empresarial', color: '#2CA02C' },
    'icdp instituto caldense para el liderazgo y el desarrollo': { sector: 'Académico', color: '#1F77B4' },
    'impronta verde': { sector: 'Fundaciones y Corporaciones de la Sociedad Civil', color: '#FFCC00' },
    'manizales como vamos': { sector: 'Redes y Plataformas Multiactor', color: '#E377C2' },
    'manizales campus universitario': { sector: 'Redes y Plataformas Multiactor', color: '#E377C2' },
    'ministerio tic': { sector: 'Público', color: '#9467BD' },
    'municipio de neira': { sector: 'Público', color: '#9467BD' },
    'parque de la familia': { sector: 'Público', color: '#9467BD' },
    'programa ondas': { sector: 'Público', color: '#9467BD' },
    'secretaria de educacion de manizales': { sector: 'Público', color: '#9467BD' },
    'ses hospital de caldas': { sector: 'Fundaciones y Corporaciones de la Sociedad Civil', color: '#FFCC00' },
    'serviciudad e.s.p': { sector: 'Mixto', color: '#D62728' },
    'sideral': { sector: 'Empresarial', color: '#2CA02C' },
    'uam': { sector: 'Académico', color: '#1F77B4' },
    'ucm': { sector: 'Académico', color: '#1F77B4' },
    'unal manizales': { sector: 'Académico', color: '#1F77B4' },
    'upb manizales': { sector: 'Académico', color: '#1F77B4' },
    'vicerrectoria de investigacion y posgrados uam': { sector: 'Académico', color: '#1F77B4' },
    'agencia de desarrollo local, adel manizales': { sector: 'Redes y Plataformas Multiactor', color: '#E377C2' },
    'aiesec manizales': { sector: 'Redes y Plataformas Multiactor', color: '#E377C2' },
    'alianza por el emprendimiento e innovacion de caldas, alpec': { sector: 'Redes y Plataformas Multiactor', color: '#E377C2' },
    'alianza universitaria por el desarrollo de manizales, audem': { sector: 'Redes y Plataformas Multiactor', color: '#E377C2' },
    'cumbre de industrias creativas': { sector: 'Redes y Plataformas Multiactor', color: '#E377C2' },
    'jovenes creadores de caldas': { sector: 'Fundaciones y Corporaciones de la Sociedad Civil', color: '#FFCC00' },
    'manizales mas': { sector: 'Redes y Plataformas Multiactor', color: '#E377C2' },
    'sistema universitario de manizales - suma': { sector: 'Redes y Plataformas Multiactor', color: '#E377C2' },
    'stakeholders futuros': { sector: 'Redes y Plataformas Multiactor', color: '#E377C2' },
    'startup mas': { sector: 'Redes y Plataformas Multiactor', color: '#E377C2' },
    'suyusama': { sector: 'Fundaciones y Corporaciones de la Sociedad Civil', color: '#FFCC00' },
    'tec al centro': { sector: 'Redes y Plataformas Multiactor', color: '#E377C2' },
    'ulsa': { sector: 'Académico', color: '#1F77B4' },
    // Organizaciones adicionales encontradas en la consola
    'finanfuturo': { sector: 'Empresarial', color: '#2CA02C' },
    'icbf': { sector: 'Público', color: '#9467BD' },
    'incubar': { sector: 'Empresarial', color: '#2CA02C' },
    'procaldas': { sector: 'Fundaciones y Corporaciones de la Sociedad Civil', color: '#FFCC00' },
    'sena': { sector: 'Académico', color: '#1F77B4' },
    'universidad catolica luis amigo': { sector: 'Académico', color: '#1F77B4' },
  };

  // Aliases para manejar variaciones de nombres
  const ORG_ALIASES: Record<string, string> = {
    // CHEC Grupo EPM
    'chec': 'chec grupo epm',
    'chec grupo': 'chec grupo epm',
    'grupo epm': 'chec grupo epm',
    'epm': 'chec grupo epm',
    
    // ANDAP
    'andap': 'academia nacional de aprendizaje, andap',
    'academia nacional de aprendizaje': 'academia nacional de aprendizaje, andap',
    'academia nacional': 'academia nacional de aprendizaje, andap',
    
    // Universidades
    'u de caldas': 'ucm',
    'universidad de caldas': 'ucm',
    'ucm': 'ucm',
    'uam': 'uam',
    'universidad de manizales': 'uam',
    'u nacional': 'unal manizales',
    'universidad nacional': 'unal manizales',
    'unal': 'unal manizales',
    'universidad nacional de colombia': 'unal manizales',
    'upb': 'upb manizales',
    'universidad pontificia bolivariana': 'upb manizales',
    'ulsa': 'ulsa',
    'universidad libre': 'ulsa',
    
    // Cámara de Comercio
    'camara de comercio': 'camara de comercio de manizales por caldas',
    'camara de comercio de manizales': 'camara de comercio de manizales por caldas',
    'camara de comercio por caldas': 'camara de comercio de manizales por caldas',
    
    // Comité de Cafeteros
    'comite de cafeteros': 'comite de cafeteros de caldas',
    'comite cafeteros': 'comite de cafeteros de caldas',
    'cafeteros de caldas': 'comite de cafeteros de caldas',
    
    // Fundación Luker
    'fundacion luker': 'fundacion luker',
    'luker': 'fundacion luker',
    
    // Colegiatura
    'colegiatura': 'colegiatura del cafe s.a.s.',
    'colegiatura del cafe': 'colegiatura del cafe s.a.s.',
    'colegiatura cafe': 'colegiatura del cafe s.a.s.',
    
    // SENA
    'servicio nacional de aprendizaje': 'sena',
    
    // Ministerio TIC
    'ministerio de tic': 'ministerio tic',
    'ministerio tic': 'ministerio tic',
    'mintic': 'ministerio tic',
    
    // Secretaría de Educación
    'secretaria de educacion': 'secretaria de educacion de manizales',
    'secretaria educacion': 'secretaria de educacion de manizales',
    'educacion manizales': 'secretaria de educacion de manizales',
    
    // Alcaldía
    'alcaldia': 'alcaldia de manizales',
    'alcaldia de manizales': 'alcaldia de manizales',
    'municipio de manizales': 'alcaldia de manizales',
    
    // Municipio de Neira
    'municipio de neira': 'municipio de neira',
    'neira': 'municipio de neira',
    
    // Parque de la Familia
    'parque de la familia': 'parque de la familia',
    'parque familia': 'parque de la familia',
    
    // Programa Ondas
    'programa ondas': 'programa ondas',
    'ondas': 'programa ondas',
    
    // Serviciudad
    'serviciudad': 'serviciudad e.s.p',
    'serviciudad esp': 'serviciudad e.s.p',
    'serviciudad empresa': 'serviciudad e.s.p',
    
    // ADEL
    'agencia de desarrollo local': 'agencia de desarrollo local, adel manizales',
    'adel': 'agencia de desarrollo local, adel manizales',
    'adel manizales': 'agencia de desarrollo local, adel manizales',
    
    // AIESEC
    'aiesec': 'aiesec manizales',
    'aiesec manizales': 'aiesec manizales',
    
    // ALPEC
    'alpec': 'alianza por el emprendimiento e innovacion de caldas, alpec',
    'alianza emprendimiento': 'alianza por el emprendimiento e innovacion de caldas, alpec',
    'alianza emprendimiento caldas': 'alianza por el emprendimiento e innovacion de caldas, alpec',
    
    // AUDEM
    'audem': 'alianza universitaria por el desarrollo de manizales, audem',
    'alianza universitaria': 'alianza universitaria por el desarrollo de manizales, audem',
    'alianza universitaria manizales': 'alianza universitaria por el desarrollo de manizales, audem',
    
    // SUMA
    'suma': 'sistema universitario de manizales - suma',
    'sistema universitario': 'sistema universitario de manizales - suma',
    'sistema universitario manizales': 'sistema universitario de manizales - suma',
    
    // Startup Más
    'startup mas': 'startup mas',
    'startup': 'startup mas',
    
    // Manizales Más
    'manizales mas': 'manizales mas',
    
    // Tec al Centro
    'tec al centro': 'tec al centro',
    'tec centro': 'tec al centro',
    
    // Jóvenes Creadores
    'jovenes creadores': 'jovenes creadores de caldas',
    'jovenes creadores caldas': 'jovenes creadores de caldas',
    
    // Cumbre de Industrias Creativas
    'cumbre de industrias creativas': 'cumbre de industrias creativas',
    'cumbre industrias creativas': 'cumbre de industrias creativas',
    'industrias creativas': 'cumbre de industrias creativas',
    
    // Stakeholders Futuros
    'stakeholders futuros': 'stakeholders futuros',
    'stakeholders': 'stakeholders futuros',
    
    // Suyusama
    'suyusama': 'suyusama',
    
    // Impronta Verde
    'impronta verde': 'impronta verde',
    'impronta': 'impronta verde',
    
    // Corporación para el Desarrollo
    'corporacion para el desarrollo': 'corporacion para el desarrollo de caldas',
    'corporacion desarrollo': 'corporacion para el desarrollo de caldas',
    'corporacion desarrollo caldas': 'corporacion para el desarrollo de caldas',
    
    // Grupo ADRI
    'grupo adri': 'grupo adri',
    'adri': 'grupo adri',
    
    // Sideral
    'sideral': 'sideral',
    
    // EMAS
    'emas': 'emas',
    
    // CEDER
    'ceder': 'ceder',
    
    // Aguas de Manizales
    'aguas de manizales': 'aguas de manizales',
    'aguas manizales': 'aguas de manizales',
    
    // ANDI
    'andi': 'andi seccional caldas',
    'andi seccional': 'andi seccional caldas',
    'asociacion nacional de industriales': 'andi seccional caldas',
    
    // Asociación Educativa AE
    'asociacion educativa': 'asociacion educativa ae s.a.s',
    'asociacion educativa ae': 'asociacion educativa ae s.a.s',
    'ae sas': 'asociacion educativa ae s.a.s',
    
    // Centro Colombo Americano
    'centro colombo americano': 'centro colombo americano',
    'colombo americano': 'centro colombo americano',
    
    // CINDE
    'cinde': 'cinde',
    
    // CONFA
    'confa': 'confa',
    'caja de compensacion familiar': 'confa',
    
    // ICDP
    'icdp': 'icdp instituto caldense para el liderazgo y el desarrollo',
    'instituto caldense': 'icdp instituto caldense para el liderazgo y el desarrollo',
    'instituto caldense liderazgo': 'icdp instituto caldense para el liderazgo y el desarrollo',
    
    // Manizales Cómo Vamos
    'manizales como vamos': 'manizales como vamos',
    'como vamos': 'manizales como vamos',
    
    // Vicerrectoría de Investigación UAM
    'vicerrectoria de investigacion': 'vicerrectoria de investigacion y posgrados uam',
    'vicerrectoria investigacion': 'vicerrectoria de investigacion y posgrados uam',
    'vicerrectoria uam': 'vicerrectoria de investigacion y posgrados uam',
    
    // Organizaciones adicionales
    'finanfuturo': 'finanfuturo',
    'icbf': 'icbf',
    'instituto colombiano de bienestar familiar': 'icbf',
    'incubar': 'incubar',
    'procaldas': 'procaldas',
    'programa caldas': 'procaldas',
    'universidad catolica luis amigo': 'universidad catolica luis amigo',
    'universidad catolica': 'universidad catolica luis amigo',
    'luis amigo': 'universidad catolica luis amigo',
    'catolica luis amigo': 'universidad catolica luis amigo'
  };

  // Dado un displayName, devuelve { sector, color }
  const sectorInfoFor = (displayName: string) => {
    const normalized = norm(displayName);
    
    // 1. Buscar match directo
    let match = NAME_TO_SECTOR_COLOR[normalized];
    if (match) return match;
    
    // 2. Buscar por alias (coincidencia exacta o parcial)
    for (const [alias, canonical] of Object.entries(ORG_ALIASES)) {
      if (normalized === alias || normalized.includes(alias) || alias.includes(normalized)) {
        const canonicalMatch = NAME_TO_SECTOR_COLOR[canonical];
        if (canonicalMatch) return canonicalMatch;
      }
    }
    
    // 3. Buscar por coincidencia parcial en el mapeo principal
    for (const [key, value] of Object.entries(NAME_TO_SECTOR_COLOR)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return value;
      }
    }
    
    // 4. Buscar por palabras clave (último recurso)
    const words = normalized.split(' ').filter(w => w.length > 2);
    for (const word of words) {
      for (const [key, value] of Object.entries(NAME_TO_SECTOR_COLOR)) {
        if (key.includes(word) || word.includes(key)) {
          return value;
        }
      }
    }
    
    return { sector: 'Sin sector (no mapeado)', color: DEFAULT_NODE_COLOR };
  };

  // cuenta por destino (in-degree) con filtro de links
  const countByTarget = (links: GraphLink[], pred: (e: GraphLink) => boolean) => {
    const acc = new Map<string, number>();
    for (const e of links) {
      if (!pred(e)) continue;
      const t = String(e.target);
      acc.set(t, (acc.get(t) || 0) + 1);
    }
    return acc;
  };

  // === Tops dinámicos por red ===
  const tops = React.useMemo(() => {
    // trabajemos SIEMPRE sobre lo filtrado (graphData)
    const nodes = graphData.nodes || [];
    const links = graphData.links || [];

    const pack = {
      relacionamiento: {
        centrales: [] as any[],
        influyentes: [] as any[],
        facilitadoras: [] as any[],
      },
      reconocimiento: {
        centrales: [] as any[],
        influyentes: [] as any[],
        facilitadoras: [] as any[],
      },
      recomendacion: { '1': [] as any[], '2': [] as any[], '3': [] as any[] },
    };

    // helpers comunes
    const { inDegrees } = computeDegrees(nodes, links);
    const inMap = new Map<string, number>();
    nodes.forEach(n => inMap.set(n.id, inDegrees.get(n.id) || 0));

    if (appliedLayer === 'relacionamiento' || appliedLayer === 'reconocimiento') {
      // 1) Centrales = in-degree
      const centrales = topFromScoreMap(inMap, 5, nameOf);

      // 2) PageRank (dirigido)
      const pr = computePageRank(nodes, links);
      const influyentes = topFromScoreMap(pr, 5, nameOf);

      // 3) Betweenness (no dirigido)
      const btw = computeBetweenness(nodes, links);
      const facilitadoras = topFromScoreMap(btw, 5, nameOf);

      if (appliedLayer === 'relacionamiento') {
        pack.relacionamiento.centrales = centrales;
        pack.relacionamiento.influyentes = influyentes;
        pack.relacionamiento.facilitadoras = facilitadoras;
      } else {
        pack.reconocimiento.centrales = centrales;
        pack.reconocimiento.influyentes = influyentes;
        pack.reconocimiento.facilitadoras = facilitadoras;
      }
    }

    if (appliedLayer === 'recomendacion') {
      // top por propósito (1/2/3) → in-degree de aristas con ese propósito
      const byTarget = (pred: (e: GraphLink)=>boolean) => {
        const m = new Map<string, number>();
        for (const e of links) {
          if (!pred(e)) continue;
          const t = String(e.target);
          m.set(t, (m.get(t) || 0) + 1);
        }
        return m;
      };
      [1,2,3].forEach(p => {
        const m = byTarget(e => Array.isArray(e.types_present) && e.types_present.map(Number).includes(p));
        pack.recomendacion[String(p) as '1'|'2'|'3'] =
          Array.from(m.entries())
            .sort((a,b)=> b[1]-a[1] || nameOf(a[0]).localeCompare(nameOf(b[0])))
            .slice(0,5)
            .map(([id,count]) => ({ id, name: nameOf(id), count }));
      });
    }

    return pack;
  }, [graphData, appliedLayer]);

  // Contador por sector para la leyenda (nodos visibles)
  const sectorCounts = React.useMemo(() => {
    const acc: Record<string, number> = {};
    (viewData.nodes || []).forEach(n => {
      const displayName = n.label || n.name || n.id;
      const { sector } = sectorInfoFor(displayName);
      acc[sector] = (acc[sector] || 0) + 1;
    });
    return acc;
  }, [viewData]);

  // Totales globales por sector (sin filtros)
  const sectorTotals = React.useMemo(() => {
    const acc: Record<string, number> = {};
    (rawData.nodes || []).forEach(n => {
      const displayName = n.label || n.name || n.id;
      const { sector } = sectorInfoFor(displayName);
      acc[sector] = (acc[sector] || 0) + 1;
    });
    return acc;
  }, [rawData]);

  // Log de verificación - mostrar organizaciones sin mapeo
  React.useEffect(() => {
    if (!viewData?.nodes?.length) return;
    const missing = viewData.nodes
      .map(n => n.label || n.name || n.id)
      .filter(name => {
        const { sector } = sectorInfoFor(name);
        return sector === 'Sin sector (no mapeado)';
      })
      .sort((a, b) => a.localeCompare(b));
    
    if (missing.length) {
      console.groupCollapsed("⚠️ Organizaciones sin sector (complete NAME_TO_SECTOR_COLOR):");
      missing.forEach(x => console.log("•", x));
      console.groupEnd();
    }
  }, [viewData.nodes]);

  const calculateMetrics = (data: GraphData) => {
    const n = data.nodes.length;
    const m = data.links.length;

    // CASO 1: Sin nodos
    if (n === 0) {
      setMetrics({
        nodes: 0,
        edges: 0,
        density: 0,
        centrality: 0,
        cohesion: 0,
        avgDegree: 0,
        components: 0,
        isolated: 0,
        gcc: 0
      });
      return;
    }

    // CASO 2: Solo un nodo
    if (n === 1) {
      setMetrics({
        nodes: 1,
        edges: m,
        density: 0, // No puede haber densidad con un solo nodo
        centrality: 0,
        cohesion: 1, // Un nodo es 100% cohesivo consigo mismo
        avgDegree: 0,
        components: 1,
        isolated: m === 0 ? 1 : 0, // Es aislado solo si no tiene aristas
        gcc: 1
      });
      return;
    }

    // CÁLCULOS PRINCIPALES (n >= 2)

    // 1. DENSIDAD para grafo DIRIGIDO sin self-loops
    // Densidad = aristas_actuales / aristas_máximas_posibles
    // Para dirigido: máximo = n × (n-1)
    const maxPossibleEdges = n * (n - 1);
    const density = maxPossibleEdges > 0 ? m / maxPossibleEdges : 0;

    // 2. GRADOS PROMEDIO
    // En dirigido: suma_in_degrees = suma_out_degrees = m
    const avgInDegree = m / n;   // Promedio de conexiones entrantes
    const avgOutDegree = m / n;  // Promedio de conexiones salientes
    
    // Para métricas de "grado total" (tratando como no dirigido)
    // Cada arista contribuye 2 al grado total (1 a cada extremo)
    const avgTotalDegree = (2 * m) / n;

    // 3. CENTRALIDAD según la capa aplicada
    let centralityValue: number;
    if (appliedLayer === 'reconocimiento' || appliedLayer === 'recomendacion') {
      // Para estas capas: importa quién RECIBE más (in-degree)
      centralityValue = avgInDegree;
    } else {
      // Para relacionamiento: importa conectividad total
      centralityValue = avgTotalDegree;
    }

    // 4. CONECTIVIDAD Y COHESIÓN
    // Analizar la estructura de componentes conexas
    const { gcc, components, isolated } = weakConnectivityStats(data.nodes, data.links);
    
    // Cohesión = tamaño_componente_gigante / total_nodos
    const cohesion = gcc / n;

    // VALIDACIONES FINALES
    setMetrics({
      nodes: n,
      edges: m,
      density: Math.max(0, Math.min(1, density)), // Forzar rango [0,1]
      centrality: Math.max(0, centralityValue),   // No negativo
      cohesion: Math.max(0, Math.min(1, cohesion)), // Forzar rango [0,1]
      avgDegree: Math.max(0, centralityValue),    // Consistente con centralidad
      components: Math.max(1, components),        // Mínimo 1 componente
      isolated: Math.max(0, isolated),           // No negativo
      gcc: Math.max(0, Math.min(n, gcc))         // Entre 0 y n
    });
  };

  
  const renderChart = () => {
    if (!chartInstance.current) return;

    const nlist = viewData.nodes || [];
    const elist = viewData.links || [];

    if (!nlist.length) {
      chartInstance.current.clear();
      return;
    }

    // Colores oficiales por sector (según tu card)
    const SECTOR_COLOR: Record<string, string> = {
      'Académico': '#2E6EB5',                          // azul
      'Empresarial': '#2E9E44',                        // verde
      'Público': '#8E44AD',                            // púrpura
      'Gremio Empresarial': '#9AD97A',                 // verde claro
      'Mixto': '#E53935',                              // rojo
      'Fundaciones y Corporaciones de la Sociedad Civil': '#F6C10E', // amarillo
      'Redes y Plataformas Multiactor': '#E91E63',     // rosado
      'Sin sector (no mapeado)': '#7B8BA5'             // gris azulado
    };

     // Calcular grados para tamaño dinámico
     const degree = new Map<string, number>();
     elist.forEach(e => {
       degree.set(e.source, (degree.get(e.source) || 0) + 1);
       degree.set(e.target, (degree.get(e.target) || 0) + 1);
     });

     // Encontrar rango de grados para normalización
     const degrees = Array.from(degree.values());
     const maxDegree = Math.max(...degrees, 1);
     const minDegree = Math.min(...degrees, 1);
     const degreeRange = maxDegree - minDegree || 1;

     const minSize = 8, maxSize = 35;

     const nodes = nlist.map(n => {
       const displayName = n.label || n.name || n.id;
       const { sector } = sectorInfoFor(displayName);
       const d = degree.get(n.id) || 1;
       
       // Normalizar grado entre 0 y 1, luego aplicar a tamaño
       const normalizedDegree = degreeRange > 0 ? (d - minDegree) / degreeRange : 0.5;
       const size = minSize + (normalizedDegree * normalizedDegree) * (maxSize - minSize);
      return {
        id: n.id,
        name: displayName,
        category: sector,
        symbolSize: size,
        itemStyle: { color: SECTOR_COLOR[sector] || SECTOR_COLOR['Sin sector (no mapeado)'] },
        draggable: true
      };
    });

    const links = elist.map(e => ({ source: e.source, target: e.target }));

    // Option de ECharts: sin legend y con más separación
    const option = {
      tooltip: {
        show: true,
        confine: true,
        borderRadius: 6,
        padding: 8,
        formatter: (params: any) => {
          if (params?.dataType === 'node') {
            const name = params.data?.name ?? '';
            const sector = params.data?.category ?? 'Sin sector (no mapeado)';
            
            return `${params.marker} <b>${name}</b><br/>Sector: ${sector}`;
          }
          // Para edges (aristas), no mostramos nada
          if (params.dataType === 'edge') return '';
          return '';
        }
      },
      legend: { show: false }, // ← oculta esa franja de categorías

      series: [{
        type: 'graph',
        layout: 'force',
        data: nodes,
        links,
        // Puedes seguir usando categories si quieres (no se verán, pero mantiene consistencia interna)
        categories: Array.from(new Set(nodes.map(n => n.category))).map(name => ({
          name,
          itemStyle: { color: SECTOR_COLOR[name] || SECTOR_COLOR['Sin sector (no mapeado)'] }
        })),

        roam: true,
        force: {
          repulsion: 1200,     // más separación (súbelo si aún está denso)
          gravity: 0.02,       // menos atracción al centro
          edgeLength: [90, 220],
          friction: 0.2,
          layoutAnimation: true
        },
        lineStyle: { width: 1, opacity: 0.4 },
        label: { show: true, position: 'bottom', fontSize: 10, overflow: 'truncate' },
        emphasis: { focus: 'adjacency', lineStyle: { width: 2, opacity: 0.8 } },
        progressive: 3000,
        progressiveThreshold: 2000
      }],
      animationDurationUpdate: 600
    };

    chartInstance.current.setOption(option, true);
  };

  
  useEffect(() => {
    if (!chartRef.current) return;

    // Inicialización básica
    chartInstance.current = echarts.init(chartRef.current);

    // Solo resize básico
    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener('resize', handleResize);

    // Click básico
    chartInstance.current.on('click', (params: any) => {
      if (params?.dataType === 'node' && params?.data?.id) {
        const id = String(params.data.id);
        setEgoCenterId((prev) => (prev === id ? null : id));
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, []);




  useEffect(() => {
    applyView();
  }, [graphData, egoCenterId, topMode, topN]);

  useEffect(() => {
    renderChart();
  }, [viewData]);


  useEffect(() => {
    if (pendingLayer === 'recomendacion') {
      setDraftRecSelected(new Set()); // obliga a elegir propósito
    }
  }, [pendingLayer]);

  useEffect(() => {
    if (appliedLayer !== 'recomendacion') {
      setActiveRecSelected(new Set()); // sin propósito aplicado fuera de recomendación
    }
  }, [appliedLayer]);


  
  const handleShowNetwork = () => {
    if (selectedOrg) {
      setEgoCenterId(selectedOrg);
      setTopMode('none');
    }
  };

  const handleReset = () => {
    setSelectedOrg('');
    setEgoCenterId(null);
    setTopMode('none');
  };


  const handleTopBest = () => {
    setTopMode('best');
    setEgoCenterId(null);
  };

  const handleTopWorst = () => {
    setTopMode('worst');
    setEgoCenterId(null);
  };

  const handleTopClear = () => {
    setTopMode('none');
    setEgoCenterId(null);
  };

  const handleAutoFit = () => {
    const chart = chartInstance.current;
    if (!chart) return;
    chart.dispatchAction({ type: 'restore' });
    fitGraphToViewport();
  };

  const handleTypeChange = (type: number, checked: boolean) => {
    const newTypes = new Set(selectedTypes);
    if (checked) {
      newTypes.add(type);
    } else {
      newTypes.delete(type);
    }
    setSelectedTypes(newTypes);
  };

  const handleExport = () => {
    try {
      const blob = new Blob([JSON.stringify(viewData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'subgrafo.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      toast.error('No se pudo exportar la vista');
    }
  };

  // === Handlers de exportación ===
  // CSV helpers
  const toCSV = (rows: any[]) => {
    if (!rows.length) return 'id\n';
    const headers = Object.keys(rows[0]);
    const esc = (v:any) => {
      const s = String(v ?? '');
      return /[",\n;]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
    };
    const lines = [headers.join(','), ...rows.map(r => headers.map(h => esc(r[h])).join(','))];
    return lines.join('\n');
  };

  const exportJSON = () => {
    const payload = {
      layer: appliedLayer,
      nodes: viewData.nodes,
      links: viewData.links,
      generated_at: new Date().toISOString()
    };
    dl(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }),
       `grafo_${appliedLayer || 'vista'}_${nowStamp()}.json`);
  };

  const exportCSV = () => {
    const { nodeRows, edgeRows } = buildExportTables();
    dl(new Blob([toCSV(nodeRows)], { type: 'text/csv;charset=utf-8' }),
       `nodos_${appliedLayer || 'vista'}_${nowStamp()}.csv`);
    dl(new Blob([toCSV(edgeRows)], { type: 'text/csv;charset=utf-8' }),
       `aristas_${appliedLayer || 'vista'}_${nowStamp()}.csv`);
  };

  const exportXLSX = () => {
    const { nodeRows, edgeRows } = buildExportTables();
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(nodeRows), 'Nodos');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(edgeRows), 'Aristas');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    dl(new Blob([wbout], { type: 'application/octet-stream' }),
       `grafo_${appliedLayer || 'vista'}_${nowStamp()}.xlsx`);
  };

  const exportPNG = () => {
    if (!chartInstance.current) return;
    
    // Obtener las dimensiones originales del canvas
    const canvas = chartInstance.current.getDom().querySelector('canvas');
    if (!canvas) return;
    
    // Crear un canvas temporal con el tamaño completo del grafo
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    
    // Configurar el canvas temporal con alta resolución
    const pixelRatio = 3;
    tempCanvas.width = canvas.width * pixelRatio;
    tempCanvas.height = canvas.height * pixelRatio;
    tempCtx.scale(pixelRatio, pixelRatio);
    
    // Fondo blanco
    tempCtx.fillStyle = '#ffffff';
    tempCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Copiar el contenido del canvas original
    tempCtx.drawImage(canvas, 0, 0);
    
    // Exportar el canvas temporal
    const dataURL = tempCanvas.toDataURL('image/png', 1.0);
    dl(dataURLtoBlob(dataURL), `grafo_${appliedLayer || 'vista'}_${nowStamp()}.png`);
  };

  const exportPDF = () => {
    if (!chartInstance.current) return;
    
    // Obtener las dimensiones originales del canvas
    const canvas = chartInstance.current.getDom().querySelector('canvas');
    if (!canvas) return;
    
    // Crear un canvas temporal con el tamaño completo del grafo
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    
    // Configurar el canvas temporal con alta resolución
    const pixelRatio = 3;
    tempCanvas.width = canvas.width * pixelRatio;
    tempCanvas.height = canvas.height * pixelRatio;
    tempCtx.scale(pixelRatio, pixelRatio);
    
    // Fondo blanco
    tempCtx.fillStyle = '#ffffff';
    tempCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Copiar el contenido del canvas original
    tempCtx.drawImage(canvas, 0, 0);
    
    // Obtener la imagen del canvas temporal
    const dataURL = tempCanvas.toDataURL('image/png', 1.0);

    // A4 apaisado en puntos (pt)
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    // Usar las dimensiones del canvas temporal (grafo completo)
    const imgW = canvas.width;
    const imgH = canvas.height;

    // encaje manteniendo aspecto con márgenes
    const margin = 24;
    const maxW = pageW - margin * 2;
    const maxH = pageH - margin * 2;
    const scale = Math.min(maxW / imgW, maxH / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const x = (pageW - drawW) / 2;
    const y = (pageH - drawH) / 2;

    pdf.addImage(dataURL, 'PNG', x, y, drawW, drawH);
    pdf.save(`grafo_${appliedLayer || 'vista'}_${nowStamp()}.pdf`);
  };

  const handleExportUnified = async () => {
    try {
      setIsExporting(true);
      if (!viewData?.nodes?.length) {
        toast.message('No hay datos para exportar');
        return;
      }
      switch (exportFormat) {
        case 'json': exportJSON(); break;
        case 'csv':  exportCSV(); break;
        case 'xlsx': exportXLSX(); break;
        case 'png':  exportPNG(); break;
        case 'pdf':  exportPDF(); break;
      }
      toast.success('Exportación lista');
    } catch (e) {
      console.error(e);
      toast.error('Error al exportar');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar - oculto en modo presentación */}
      {!presentMode && (
        <div className="w-80 border-r bg-card/50 p-6 space-y-6 overflow-y-auto">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Análisis de Redes y Relaciones</h1>
            <p className="text-sm text-muted-foreground">
              Analiza patrones de interacción y conexiones organizacionales para comprender la estructura de la red
            </p>
          </div>

          <Separator />

            {/* Red Selection with Enhanced UI */}
            <div className="space-y-3 p-3 bg-card/30 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-green-500/20 rounded-md">
                    <FaNetworkWired className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground">Red</h3>
                </div>
              <HelpTooltip 
                title="Tipos de Red Disponibles"
                content="Cada tipo de red revela diferentes aspectos de las relaciones organizacionales. Seleccione el tipo que mejor se adapte a su análisis."
              />
            </div>
            
            <div className="space-y-2">
              <Select value={pendingLayer} onValueChange={setPendingLayer}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Seleccione el tipo de análisis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relacionamiento">Relacionamiento</SelectItem>
                  <SelectItem value="reconocimiento">Reconocimiento</SelectItem>
                  <SelectItem value="recomendacion">Recomendación</SelectItem>
                </SelectContent>
              </Select>
              
            </div>
          </div>

          <div className="flex gap-2">
              <Button
                className="flex-1 h-11 bg-green-600 hover:bg-green-700 text-white"
                onClick={async () => {
                try {
                  if (!pendingLayer) {
                    toast.message('Selecciona un tipo de red primero');
                    return;
                  }

                  // Validación por capa
                  if (pendingLayer === 'recomendacion') {
                    if (recTypesAvailable && !recPurpose) {
                      toast.message('Selecciona un propósito específico.');
                      return;
                    }
                  }

                  const url = getApiUrl(pendingLayer);
                  const r = await fetch(url, {
                    mode: 'cors',
                    cache: 'no-cache',
                    headers: {
                      'Accept': 'application/json',
                      'ngrok-skip-browser-warning': 'true'
                    }
                  });

                  let data;
                  try {
                    data = await r.json();
                  } catch {
                    const txt = await r.text();
                    throw new Error(`Error del servidor (${r.status}). Vista previa: ${txt.slice(0, 200)}`);
                  }

                  const unwrapped = unwrapGraph(data);

                  setRawData(unwrapped);
                  setAppliedLayer(pendingLayer);
                  setHasApplied(true);

                  // reset de vista
                  setEgoCenterId(null);
                  setTopMode('none');

                  toast.success('Red cargada exitosamente', {
                    description: `${unwrapped.nodes.length} organizaciones y ${unwrapped.links.length} conexiones`,
                  });
                } catch (e) {
                  console.error(e);
                  toast.error('No se pudo cargar la red', {
                    description: 'Verifique su conexión e intente nuevamente'
                  });
                }
              }}
            >
              Cargar Red
            </Button>

              <Button
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                onClick={() => {
                setSelectedOrg('');
                setEgoCenterId(null);
                setTopMode('none');
                setViewData({ nodes: [], links: [], diagnostics: rawData.diagnostics });
                setGraphData({ nodes: [], links: [], diagnostics: rawData.diagnostics });
                setAppliedLayer('');
                setHasApplied(false);
              }}
            >
              Limpiar
            </Button>
          </div>

          <Separator />

            {/* Recomendación: ¿para qué? */}
            {pendingLayer === 'recomendacion' && (
              <div className="space-y-3 p-3 bg-blue-500/10 rounded-lg border">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-500/20 rounded-md">
                    <FaHandshake className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground">Recomendación: ¿para qué?</h3>
                </div>
              <Select
                disabled={!recTypesAvailable}
                value={recTypesAvailable ? (recPurpose ? String(recPurpose) : '') : ''}
                onValueChange={(v) => setRecPurpose(v ? Number(v) : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={recTypesAvailable ? "Selecciona un propósito" : "No hay propósitos etiquetados"} />
                </SelectTrigger>
                <SelectContent>
                  {REC_OPTIONS.map(o => (
                    <SelectItem key={o.id} value={String(o.id)}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!recTypesAvailable && (
                <p className="text-xs text-muted-foreground">
                  Tu dataset de recomendación no trae etiquetas 1/2/3 por arista. Se mostrará la red completa de recomendación sin filtrar por propósito.
                </p>
              )}
            </div>
          )}

            {/* Relacionamiento: Tipo de relación */}
            {pendingLayer === 'relacionamiento' && (
              <div className="space-y-3 p-3 bg-purple-500/10 rounded-lg border">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-500/20 rounded-md">
                    <FaLink className="h-3.5 w-3.5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground">Tipo de relación</h3>
                </div>
              <Select
                value={String(relTipo)}
                onValueChange={(v) => setRelTipo(v === 'all' ? 'all' : Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="1">Intercambio de información</SelectItem>
                  <SelectItem value="2">Realizan proyectos conjuntamente</SelectItem>
                  <SelectItem value="3">Realizan labores de incidencia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Separator />

            {/* Enhanced Organization Search */}
            <div className="space-y-3 p-3 bg-orange-500/10 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-orange-500/20 rounded-md">
                    <FaBuilding className="h-3.5 w-3.5 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground">Buscar por Organización</h3>
                </div>
              <HelpTooltip 
                title="Vista de Organización Específica"
                content="Seleccione una organización para ver únicamente sus conexiones directas. Útil para análisis detallados de actores específicos."
              />
            </div>
            
            <Select value={selectedOrg} onValueChange={setSelectedOrg}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Buscar organización..." />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {graphData.nodes
                  .sort((a, b) => (a.label || a.name || a.id).localeCompare(b.label || b.name || b.id))
                  .map(node => (
                    <SelectItem key={node.id} value={node.id}>
                      {node.label || node.name || node.id}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            
            <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={handleShowNetwork} 
                  disabled={!selectedOrg}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  variant={selectedOrg ? "default" : "secondary"}
                >
                  <FaEye className="mr-2 h-3 w-3" />
                  Mostrar Red
                </Button>
                <Button 
                  onClick={handleReset} 
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <FaExpand className="mr-2 h-3 w-3" />
                  Ver Todo
                </Button>
            </div>
            
            <Button 
              onClick={handleAutoFit} 
              className="w-full bg-orange-600 hover:bg-orange-700 text-white" 
              size="sm"
            >
              <FaCompress className="mr-2 h-3 w-3" />
              Ajustar Vista
            </Button>
          </div>

          <Separator />

            {/* Enhanced Export Section */}
            <div className="space-y-3 p-3 bg-emerald-500/10 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-500/20 rounded-md">
                    <FaDownload className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground">Exportar</h3>
                </div>
              <HelpTooltip 
                title="Opciones de Exportación"
                content="Exporte los datos de la red actual para análisis externos o presentaciones. Incluye métricas calculadas y información de sectores."
              />
            </div>


            {/* Selector de formato mejorado */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Formato de exportación</label>
              <Select value={exportFormat} onValueChange={(v:any)=>setExportFormat(v)}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xlsx">
                    <div className="flex items-center gap-2">
                      <FaFileExcel className="h-4 w-4 text-green-600" />
                      <span>Excel (.xlsx)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <FaFileCsv className="h-4 w-4 text-blue-600" />
                      <span>CSV</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="json">
                    <div className="flex items-center gap-2">
                      <FaFileCode className="h-4 w-4 text-purple-600" />
                      <span>JSON</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="png">
                    <div className="flex items-center gap-2">
                      <FaImage className="h-4 w-4 text-orange-600" />
                      <span>PNG</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <FaFilePdf className="h-4 w-4 text-red-600" />
                      <span>PDF</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>


            {/* Botón de exportación con estado mejorado */}
              <Button 
                onClick={handleExportUnified} 
                disabled={isExporting || !viewData.nodes.length} 
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
                variant={viewData.nodes.length > 0 ? "default" : "secondary"}
              >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando {exportFormat.toUpperCase()}...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar {exportFormat.toUpperCase()}
                </>
              )}
            </Button>

            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Incluye:</span> Vista actual con filtros aplicados, 
              métricas de centralidad y clasificación por sectores
            </div>
          </div>

          <Separator />
        </div>
      )}

      {/* Contenido Principal */}
        <div className="flex-1 flex flex-col relative">
          {/* Botones en esquina superior derecha */}
          <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" title="¿Qué significa cada color?">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-2">
                  <div className="font-semibold">¿Qué significa cada color?</div>
                  <div className="text-xs text-muted-foreground">
                    Colores asignados por <b>sector</b>.
                  </div>

                  <div className="mt-2 space-y-2">
                    {Object.entries(SECTOR_COLOR).map(([sector, color]) => (
                      <div key={sector} className="flex items-center gap-2 text-sm">
                        <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: color }} />
                        <span>{sector}</span>
                      </div>
                    ))}

                    {/* Sin mapeo */}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: DEFAULT_NODE_COLOR }} />
                      <span>Sin sector (no mapeado)</span>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Botón de presentación */}
            <Button variant="outline" onClick={() => setPresentMode(v => !v)} className="gap-2 shadow-lg">
              {presentMode ? (<><Minimize2 className="h-4 w-4" /> Salir</>) : (<><Maximize2 className="h-4 w-4" /> Presentar</>)}
            </Button>
          </div>
          {!hasApplied && (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div className="max-w-md space-y-6">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-3">
                    Análisis de Redes y Relaciones
                  </h2>
                  <p className="text-lg text-gray-600 mb-4">
                    Comience seleccionando un tipo de red para explorar las relaciones entre organizaciones
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                    <h4 className="font-semibold text-blue-800 mb-2">¿Qué puede analizar?</h4>
                    <ul className="text-blue-700 space-y-1 text-left">
                      <li>• <strong>Relacionamiento:</strong> Colaboraciones actuales</li>
                      <li>• <strong>Reconocimiento:</strong> Organizaciones referentes</li>
                      <li>• <strong>Recomendación:</strong> Socios potenciales</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          {hasApplied && (!viewData.nodes.length || !viewData.links.length) && (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div className="max-w-md space-y-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    No se encontraron datos
                  </h2>
                  
                  {appliedLayer === 'recomendacion' ? (
                    <div className="space-y-3">
                      <p className="text-gray-600 mb-3">
                        No hay datos de recomendación para los filtros seleccionados
                      </p>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                        <h4 className="font-semibold text-amber-800 mb-1">Sugerencias:</h4>
                        <ul className="text-amber-700 space-y-1 text-left">
                          <li>• Seleccione un propósito específico</li>
                          <li>• Verifique que existan recomendaciones en el dataset</li>
                          <li>• Pruebe con otra organización</li>
                        </ul>
                      </div>
                    </div>
                  ) : appliedLayer === 'relacionamiento' ? (
                    <div className="space-y-3">
                      <p className="text-gray-600 mb-3">
                        No hay relaciones para los filtros aplicados
                      </p>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                        <h4 className="font-semibold text-amber-800 mb-1">Sugerencias:</h4>
                        <ul className="text-amber-700 space-y-1 text-left">
                          <li>• Cambie el tipo de relación a "Todos"</li>
                          <li>• Seleccione otra organización</li>
                          <li>• Verifique la disponibilidad de datos</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-gray-600 mb-3">
                        No se encontraron datos de reconocimiento
                      </p>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                        <h4 className="font-semibold text-amber-800 mb-1">Sugerencias:</h4>
                        <ul className="text-amber-700 space-y-1 text-left">
                          <li>• Verifique que existan datos de reconocimiento</li>
                          <li>• Pruebe con otra organización</li>
                          <li>• Consulte la documentación del dataset</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        <div 
          ref={chartRef} 
          className={presentMode ? "fixed inset-0 z-30 bg-background" : "flex-1 bg-background"} 
          style={presentMode ? { width: '100vw', height: '100vh', margin: 0, padding: 0 } : { minHeight: '70vh' }} 
        />
        
        {/* Panel flotante para modo presentación */}
        {presentMode && (
          <div
            ref={panelRef}
            className="fixed z-40 w-96 max-h-[90vh] select-none"
            style={{ left: panelPos.x, top: panelPos.y }}
          >
            <Card className="shadow-2xl max-h-full flex flex-col">
              <CardHeader
                onMouseDown={startDrag}
                className="cursor-move pb-2 flex flex-row items-center justify-between space-y-0 flex-shrink-0"
              >
                <div className="flex items-center gap-2">
                  <Move className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-sm">Análisis de Redes</CardTitle>
                </div>
                <Button size="icon" variant="ghost" onClick={() => setPresentMode(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>

              <CardContent className="space-y-3 flex-1 overflow-y-auto p-4 max-h-[calc(90vh-80px)]">
                {/* --- Red --- */}
                <div className="space-y-3 p-3 bg-card/30 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-green-500/20 rounded-md">
                      <FaNetworkWired className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-sm text-foreground">Red</h3>
                  </div>
                  <Select value={pendingLayer} onValueChange={setPendingLayer}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Seleccione capa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relacionamiento">Relacionamiento</SelectItem>
                      <SelectItem value="reconocimiento">Reconocimiento</SelectItem>
                      <SelectItem value="recomendacion">Recomendación</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="text-sm h-8 bg-green-600 hover:bg-green-700 text-white"
                      onClick={async () => {
                        try {
                          if (!pendingLayer) { toast.message('Selecciona una capa primero'); return; }
                          if (pendingLayer === 'recomendacion' && recTypesAvailable && !recPurpose) {
                            toast.message('Selecciona un propósito (1/2/3).'); return;
                          }
                          const url = getApiUrl(pendingLayer);
                          const r = await fetch(url, {
                            mode: 'cors',
                            cache: 'no-cache',
                            headers: { 'Accept': 'application/json', 'ngrok-skip-browser-warning':'true' }
                          });
                          let data;
                          try { data = await r.json(); }
                          catch { throw new Error(`Upstream no JSON (status ${r.status})`); }
                          const unwrapped = unwrapGraph(data);
                          setRawData(unwrapped);
                          setAppliedLayer(pendingLayer);
                          setHasApplied(true);
                          setEgoCenterId(null);
                          setTopMode('none');
                          toast.success('Grafo cargado', {
                            description: `${unwrapped.nodes.length} nodos y ${unwrapped.links.length} aristas`,
                          });
                        } catch (e) {
                          console.error(e);
                          toast.error('No se pudo cargar la red con los filtros');
                        }
                      }}
                    >
                      Aplicar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-sm h-8 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                      onClick={() => {
                        setSelectedOrg('');
                        setEgoCenterId(null);
                        setTopMode('none');
                        setViewData({ nodes: [], links: [], diagnostics: rawData.diagnostics });
                        setGraphData({ nodes: [], links: [], diagnostics: rawData.diagnostics });
                        setAppliedLayer('');
                        setHasApplied(false);
                      }}
                    >
                      Limpiar
                    </Button>
                  </div>
                </div>

                {/* --- Recomendación: ¿para qué? --- */}
                {pendingLayer === 'recomendacion' && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Recomendación: ¿para qué?</h3>
                    <Select
                      disabled={!recTypesAvailable}
                      value={recTypesAvailable ? (recPurpose ? String(recPurpose) : '') : ''}
                      onValueChange={(v) => setRecPurpose(v ? Number(v) : null)}
                    >
                      <SelectTrigger><SelectValue placeholder={recTypesAvailable ? "Selecciona un propósito" : "No hay propósitos etiquetados"} /></SelectTrigger>
                      <SelectContent>
                        {REC_OPTIONS.map(o => <SelectItem key={o.id} value={String(o.id)}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* --- Relacionamiento: Tipo de relación --- */}
                {pendingLayer === 'relacionamiento' && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Tipo de relación</h3>
                    <Select value={String(relTipo)} onValueChange={(v) => setRelTipo(v === 'all' ? 'all' : Number(v))}>
                      <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="1">Intercambio de información</SelectItem>
                        <SelectItem value="2">Realizan proyectos conjuntamente</SelectItem>
                        <SelectItem value="3">Realizan labores de incidencia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* --- Buscar por Organización --- */}
                <div className="space-y-3 p-3 bg-orange-500/10 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-orange-500/20 rounded-md">
                      <FaBuilding className="h-3.5 w-3.5 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-sm text-foreground">Buscar por Organización</h3>
                  </div>
                  <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar organización" /></SelectTrigger>
                    <SelectContent>
                      {graphData.nodes
                        .sort((a, b) => (a.label || a.name || a.id).localeCompare(b.label || b.name || b.id))
                        .map(node => (
                          <SelectItem key={node.id} value={node.id}>
                            {node.label || node.name || node.id}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      size="sm" 
                      className="text-sm h-8 bg-orange-600 hover:bg-orange-700 text-white" 
                      onClick={handleShowNetwork} 
                      disabled={!selectedOrg}
                    >
                      <FaEye className="mr-2 h-3 w-3" />
                      Mostrar Red
                    </Button>
                    <Button 
                      size="sm" 
                      className="text-sm h-8 bg-orange-600 hover:bg-orange-700 text-white" 
                      onClick={handleReset}
                    >
                      <FaExpand className="mr-2 h-3 w-3" />
                      Ver Todo
                    </Button>
                  </div>
                  <Button 
                    size="sm" 
                    className="text-sm h-8 w-full bg-orange-600 hover:bg-orange-700 text-white" 
                    onClick={handleAutoFit}
                  >
                    <FaCompress className="mr-2 h-3 w-3" />
                    Ajustar a pantalla
                  </Button>
                </div>

                <Separator />

                {/* --- Exportar --- */}
                <div className="space-y-3 p-3 bg-emerald-500/10 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-500/20 rounded-md">
                      <FaDownload className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                    <h3 className="font-semibold text-sm text-foreground">Exportar</h3>
                  </div>

                  {/* Selector de formato */}
                  <Select value={exportFormat} onValueChange={(v:any)=>setExportFormat(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Elegir formato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xlsx">XLSX</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Botón único con animación */}
                  <Button 
                    size="sm" 
                    className="text-sm h-8 w-full bg-emerald-600 hover:bg-emerald-700 text-white" 
                    onClick={handleExportUnified} 
                    disabled={isExporting || !viewData.nodes.length}
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando…
                      </>
                    ) : (
                      <>
                        <FaDownload className="mr-2 h-3 w-3" /> Exportar
                      </>
                    )}
                  </Button>

                </div>

              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Footer con métricas y tops - solo en modo normal */}
        {!presentMode && (
          <>
        <div className="border-t bg-card/30 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Métricas de la Red</h3>
            <HelpTooltip 
              title="Interpretación de Métricas"
              content="Estas métricas ayudan a entender la estructura y conectividad de la red organizacional. Use los íconos (i) para obtener detalles específicos de cada métrica."
            />
          </div>
          
          <div className="grid grid-cols-5 gap-4">
            <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <FaNetworkWired className="h-4 w-4 text-blue-600" />
                      </div>
                      <CardDescription className="text-xs font-medium">Nodos</CardDescription>
                    </div>
                    <HelpTooltip {...METRIC_EXPLANATIONS.nodes} />
                  </div>
                </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{metrics.nodes}</div>
                <div className="text-xs text-muted-foreground mt-1">organizaciones</div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                        <FaProjectDiagram className="h-4 w-4 text-green-600" />
                      </div>
                      <CardDescription className="text-xs font-medium">Aristas</CardDescription>
                    </div>
                    <HelpTooltip {...METRIC_EXPLANATIONS.edges} />
                  </div>
                </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{metrics.edges}</div>
                <div className="text-xs text-muted-foreground mt-1">conexiones</div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <FaChartLine className="h-4 w-4 text-purple-600" />
                      </div>
                      <CardDescription className="text-xs font-medium">Densidad</CardDescription>
                    </div>
                    <HelpTooltip {...METRIC_EXPLANATIONS.density} />
                  </div>
                </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {metrics.density.toFixed(3)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                        <FaHandshake className="h-4 w-4 text-orange-600" />
                      </div>
                      <CardDescription className="text-xs font-medium">Cohesión</CardDescription>
                    </div>
                    <HelpTooltip {...METRIC_EXPLANATIONS.cohesion} />
                  </div>
                </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {metrics.cohesion.toFixed(1)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                        <FaAward className="h-4 w-4 text-red-600" />
                      </div>
                      <CardDescription className="text-xs font-medium">Centralidad</CardDescription>
                    </div>
                    <HelpTooltip {...METRIC_EXPLANATIONS.centrality} />
                  </div>
                </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {metrics.avgDegree.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  promedio por org.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sección de Rankings Mejorada */}
        <div className="border-t bg-muted/10 p-6 space-y-6">
          {(appliedLayer === 'relacionamiento' || appliedLayer === 'reconocimiento') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Rankings por Rol — {appliedLayer === 'relacionamiento' ? 'Relacionamiento' : 'Reconocimiento'}
                </h3>
                <HelpTooltip 
                  title="Interpretación de Rankings"
                  content="Estos rankings identifican organizaciones clave según diferentes métricas de análisis de redes. Cada métrica revela un tipo distinto de importancia organizacional."
                />
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                {/* Centrales */}
                <Card className="border-t-4 border-t-blue-500">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base text-blue-700">Centrales</CardTitle>
                      <HelpTooltip {...TOP_EXPLANATIONS.centrales} />
                    </div>
                    <CardDescription className="text-xs">
                      Por número de conexiones directas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <table className="w-full text-sm">
                      <tbody>
                        {(() => {
                          const centrales = appliedLayer === 'relacionamiento' ? tops.relacionamiento.centrales : tops.reconocimiento.centrales;
                          const maxCentrales = Math.max(1, ...centrales.map(x => cleanDegree(x.score)));
                          return centrales.map((r:any, i:number) => {
                            const val = cleanDegree(r.score);
                            return (
                              <tr key={r.id} className="border-b last:border-0 hover:bg-muted/20">
                                <td className="py-2 pr-2 w-8">
                                  <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                                    {i+1}
                                  </Badge>
                                </td>
                                <td className="py-2 font-medium">{r.name}</td>
                                <td className="py-2 text-right w-24">
                                  <div className="text-right font-semibold text-blue-600">
                                    {formatMetric(val, 'degree_in')}
                                  </div>
                                  <MetricBar value={val} max={maxCentrales} />
                                </td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>

                {/* Influyentes */}
                <Card className="border-t-4 border-t-green-500">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base text-green-700">Influyentes</CardTitle>
                      <HelpTooltip {...TOP_EXPLANATIONS.influyentes} />
                    </div>
                    <CardDescription className="text-xs">
                      Por algoritmo PageRank
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <table className="w-full text-sm">
                      <tbody>
                        {(() => {
                          const influyentes = appliedLayer === 'relacionamiento' ? tops.relacionamiento.influyentes : tops.reconocimiento.influyentes;
                          const maxInfluyentes = Math.max(1, ...influyentes.map(x => x.score));
                          return influyentes.map((r:any, i:number) => (
                            <tr key={r.id} className="border-b last:border-0 hover:bg-muted/20">
                              <td className="py-2 pr-2 w-8">
                                <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                                  {i+1}
                                </Badge>
                              </td>
                              <td className="py-2 font-medium">{r.name}</td>
                              <td className="py-2 text-right w-24">
                                <div className="text-right font-semibold text-green-600">
                                  {formatMetric(r.score, 'pagerank')}
                                </div>
                                <MetricBar value={r.score} max={maxInfluyentes} />
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>

                {/* Facilitadoras */}
                <Card className="border-t-4 border-t-purple-500">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base text-purple-700">Facilitadoras</CardTitle>
                      <HelpTooltip {...TOP_EXPLANATIONS.facilitadoras} />
                    </div>
                    <CardDescription className="text-xs">
                      Por centralidad de intermediación
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <table className="w-full text-sm">
                      <tbody>
                        {(() => {
                          const facilitadoras = appliedLayer === 'relacionamiento' ? tops.relacionamiento.facilitadoras : tops.reconocimiento.facilitadoras;
                          const maxFacilitadoras = Math.max(1, ...facilitadoras.map(x => x.score));
                          return facilitadoras.map((r:any, i:number) => (
                            <tr key={r.id} className="border-b last:border-0 hover:bg-muted/20">
                              <td className="py-2 pr-2 w-8">
                                <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                                  {i+1}
                                </Badge>
                              </td>
                              <td className="py-2 font-medium">{r.name}</td>
                              <td className="py-2 text-right w-24">
                                <div className="text-right font-semibold text-purple-600">
                                  {formatMetric(r.score, 'betweenness')}
                                </div>
                                <MetricBar value={r.score} max={maxFacilitadoras} />
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {appliedLayer === 'recomendacion' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Rankings por Propósito de Recomendación</h3>
                <HelpTooltip 
                  title="Propósitos de Recomendación"
                  content="Estas listas muestran qué organizaciones son más recomendadas para cada tipo específico de colaboración futura."
                />
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                {([
                  ['1','Intercambio de Información', 'border-t-blue-500', 'text-blue-700'],
                  ['2','Proyectos Conjuntos', 'border-t-green-500', 'text-green-700'],
                  ['3','Labores de Incidencia', 'border-t-orange-500', 'text-orange-700']
                ] as const).map(([k, title, borderClass, textClass])=>(
                  <Card key={k} className={`border-t-4 ${borderClass}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className={`text-base ${textClass}`}>{title}</CardTitle>
                      <CardDescription className="text-xs">
                        Organizaciones más recomendadas
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <table className="w-full text-sm">
                        <tbody>
                          {(() => {
                            const recData = tops.recomendacion[k];
                            return recData.length > 0 ? recData.map((r:any, i:number) => {
                              const val = cleanDegree(r.count);
                              return (
                                <tr key={r.id} className="border-b last:border-0 hover:bg-muted/20">
                                  <td className="py-2 pr-2 w-8">
                                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                                      {i+1}
                                    </Badge>
                                  </td>
                                  <td className="py-2 font-medium">{r.name}</td>
                                  <td className="py-2 text-right font-semibold">{formatMetric(val, 'degree_in')}</td>
                                </tr>
                              );
                            }) : (
                              <tr>
                                <td colSpan={3} className="py-4 text-center text-muted-foreground text-xs">
                                  No hay datos para este propósito
                                </td>
                              </tr>
                            );
                          })()}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
          </>
        )}
      </div>
    </div>
  );
}
