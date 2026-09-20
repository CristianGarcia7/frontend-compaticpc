"use client";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Cpu,
  FileDown,
  History,
  Info,
  Layers,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  Monitor,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import type {
  Analysis,
  Component,
  Config,
  Equipment,
  User,
} from "../lib/types";
import { Badge, Brand, Button, Field } from "./ui";
const categories = [
  "RAM",
  "Almacenamiento",
  "Procesador",
  "Tarjeta gráfica",
  "Fuente de poder",
];
const verdicts = {
  compatible: "Compatible",
  conditional: "Por verificar",
  incompatible: "Incompatible",
};
const date = (value: string) =>
  new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
export default function App() {
  const pathname = usePathname(),
    router = useRouter();
  const routes: Record<string, string> = {
    dashboard: "/dashboard",
    equipment: "/equipment",
    history: "/analyses",
    catalog: "/catalog",
    query: "/consultation",
  };
  const initialView = pathname.startsWith("/analyses/")
    ? "result"
    : Object.keys(routes).find((k) => routes[k] === pathname) || "dashboard";
  const [user, setUser] = useState<User | null>(null),
    [loading, setLoading] = useState(true),
    [view, setView] = useState(initialView),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [mobile, setMobile] = useState(false);
  const [config, setConfig] = useState<Config>({
    geminiConfigured: false,
    demoEnabled: false,
    model: "",
  });
  const [equipment, setEquipment] = useState<Equipment[]>([]),
    [components, setComponents] = useState<Component[]>([]),
    [analyses, setAnalyses] = useState<Analysis[]>([]),
    [stats, setStats] = useState({
      equipment: 0,
      analyses: 0,
      recent: [] as Analysis[],
    });
  const [selected, setSelected] = useState<Analysis | null>(null),
    [search, setSearch] = useState(""),
    [authMode, setAuthMode] = useState<"login" | "register">("register"),
    [equipmentForm, setEquipmentForm] = useState(false),
    [componentEdit, setComponentEdit] = useState<Component | null>(null),
    [componentForm, setComponentForm] = useState(false);
  const [mode, setMode] = useState("demo"),
    [queryEquipment, setQueryEquipment] = useState(""),
    [category, setCategory] = useState("RAM"),
    [reference, setReference] = useState(""),
    [specifications, setSpecifications] = useState("");
  useEffect(() => {
    const saved = sessionStorage.getItem("compatipc-query");
    if (saved && pathname === "/consultation") {
      try {
        const draft = JSON.parse(saved);
        setQueryEquipment(draft.equipmentId || "");
        setCategory(draft.category || "RAM");
        setReference(draft.reference || "");
        setSpecifications(draft.specifications || "");
      } catch {}
      sessionStorage.removeItem("compatipc-query");
    }
  }, [pathname]);
  useEffect(() => {
    if (user && pathname.startsWith("/analyses/"))
      api<Analysis>(`/analyses/${pathname.split("/")[2]}`)
        .then(setSelected)
        .catch((e) => setError(e.message));
  }, [user, pathname]);
  async function refresh() {
    const [e, c, a, s] = await Promise.all([
      api<Equipment[]>("/equipment"),
      api<Component[]>("/components"),
      api<Analysis[]>("/analyses"),
      api<typeof stats>("/dashboard"),
    ]);
    setEquipment(e);
    setComponents(c);
    setAnalyses(a);
    setStats(s);
  }
  useEffect(() => {
    Promise.all([
      api<Config>("/config").then((c) => {
        setConfig(c);
        setMode(
          c.geminiConfigured ? "gemini" : c.demoEnabled ? "demo" : "gemini",
        );
      }),
      api<User>("/auth/me")
        .then(setUser)
        .catch(() => {}),
    ])
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (!loading && !user && pathname !== "/login") router.replace("/login");
    if (!loading && user && pathname === "/login") router.replace("/dashboard");
  }, [loading, user, pathname, router]);
  useEffect(() => {
    if (user) refresh().catch((e) => setError(e.message));
  }, [user]);
  async function action(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado.");
    } finally {
      setBusy(false);
    }
  }
  function navigate(next: string) {
    if (routes[next] && pathname !== routes[next]) router.push(routes[next]);
    setView(next);
    setSelected(null);
    setSearch("");
    setError("");
    setNotice("");
    setMobile(false);
  }
  async function authenticate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    await action(async () => {
      const data = {
        email: f.get("email"),
        password: f.get("password"),
        ...(authMode === "register" ? { name: f.get("name") } : {}),
      };
      setUser(
        await api<User>(`/auth/${authMode}`, {
          method: "POST",
          body: JSON.stringify(data),
        }),
      );
      router.push("/dashboard");
    });
  }
  async function createEquipment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    await action(async () => {
      await api("/equipment", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      await refresh();
      setEquipmentForm(false);
      setNotice("Equipo registrado. Ya puede realizar una consulta.");
    });
  }
  async function createAnalysis(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await action(async () => {
      const row = await api<Analysis>("/analyses", {
        method: "POST",
        body: JSON.stringify({
          equipmentId: queryEquipment,
          category,
          reference,
          specifications,
          mode,
        }),
      });
      await refresh();
      setSelected(row);
      setView("result");
      router.push(`/analyses/${row.id}`);
    });
  }
  async function saveComponent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    await action(async () => {
      await api(`/components${componentEdit ? `/${componentEdit.id}` : ""}`, {
        method: componentEdit ? "PATCH" : "POST",
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      await refresh();
      setComponentForm(false);
      setComponentEdit(null);
      setNotice("Catálogo actualizado.");
    });
  }
  function openAnalysis(row: Analysis) {
    router.push(`/analyses/${row.id}`);
    setSelected(row);
    setView("result");
    setError("");
    setNotice("");
  }
  function rows(items: Analysis[]) {
    return items.length ? (
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Componente / equipo</th>
              <th>Resultado</th>
              <th>Origen</th>
              <th>Fecha</th>
              <th>
                <span className="sr-only">Abrir</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id}>
                <td>
                  <button
                    className="table-link"
                    onClick={() => openAnalysis(row)}
                  >
                    {row.reference}
                    <small>
                      {row.equipment.brand} {row.equipment.model} ·{" "}
                      {row.category}
                    </small>
                  </button>
                </td>
                <td>
                  <Badge value={row.result.verdict} />
                </td>
                <td>
                  <span className={`provider ${row.provider}`}>
                    {row.provider === "demo" ? "DEMOSTRACIÓN" : "Gemini"}
                  </span>
                </td>
                <td className="date">{date(row.createdAt)}</td>
                <td>
                  <button
                    className="icon-button"
                    aria-label={`Ver ${row.reference}`}
                    onClick={() => openAnalysis(row)}
                  >
                    <ChevronRight size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="empty">
        <span className="empty-icon">
          <Search size={28} />
        </span>
        <h3>Aquí comienza su próximo diagnóstico</h3>
        <p>
          Registre un equipo y realice su primera consulta.
          <br />
          Cada resultado quedará guardado en este espacio.
        </p>
        <Button
          onClick={() => navigate(equipment.length ? "query" : "equipment")}
        >
          {equipment.length ? "Realizar consulta" : "Registrar un equipo"}
          <ArrowRight size={16} />
        </Button>
      </div>
    );
  }
  if (loading)
    return (
      <div className="loading">
        <Cpu size={40} />
        <LoaderCircle className="spin" />
        <p>Preparando su espacio de trabajo…</p>
      </div>
    );
  if (!user)
    return (
      <div className="auth-page">
        <section className="auth-story">
          <Brand />
          <div className="auth-copy">
            <span className="eyebrow light">
              MENOS DUDAS. MEJORES DECISIONES.
            </span>
            <h1>
              Antes de instalar,
              <br />
              asegúrese de que
              <br />
              <em>todo encaje.</em>
            </h1>
            <p>
              Su asistente para evaluar compatibilidad, identificar riesgos y
              respaldar cada recomendación técnica.
            </p>
            <div className="hardware-art" aria-hidden="true">
              <div className="art-grid" />
              <div className="chip">
                <Cpu size={65} />
                <span>
                  COMPATIBILIDAD
                  <br />
                  CON CRITERIO
                </span>
              </div>
              <span className="art-label label-one">
                <Check size={15} /> Interfaz
              </span>
              <span className="art-label label-two">
                <Check size={15} /> Especificaciones
              </span>
              <span className="art-label label-three">
                <ShieldCheck size={15} /> Verificación
              </span>
            </div>
          </div>
          <div className="auth-footer">
            <ShieldCheck size={18} /> La IA orienta. El criterio técnico decide.
          </div>
        </section>
        <section className="auth-form-side">
          <div className="auth-top">
            PROTOTIPO ACADÉMICO <span>v1.0</span>
          </div>
          <div className="auth-card">
            <span className="eyebrow">SU TALLER, MÁS CONECTADO</span>
            <h2>
              {authMode === "register"
                ? "Un buen diagnóstico empieza aquí."
                : "Qué bueno tenerle de vuelta."}
            </h2>
            <p>
              {authMode === "register"
                ? "Cree su cuenta y organice sus decisiones técnicas en un solo lugar."
                : "Ingrese a su espacio de trabajo CompatiPC."}
            </p>
            <div className="tabs">
              <button
                onClick={() => {
                  setAuthMode("register");
                  setError("");
                }}
                className={authMode === "register" ? "active" : ""}
              >
                Crear cuenta
              </button>
              <button
                onClick={() => {
                  setAuthMode("login");
                  setError("");
                }}
                className={authMode === "login" ? "active" : ""}
              >
                Iniciar sesión
              </button>
            </div>
            {error && (
              <div role="alert" className="alert error">
                {error}
              </div>
            )}
            <form onSubmit={authenticate}>
              {authMode === "register" && (
                <Field label="Nombre completo">
                  <input
                    name="name"
                    autoComplete="name"
                    placeholder="Su nombre"
                    maxLength={80}
                    required
                  />
                </Field>
              )}
              <Field label="Correo electrónico">
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="nombre@taller.com"
                  maxLength={254}
                  required
                />
              </Field>
              <Field label="Contraseña">
                <input
                  name="password"
                  type="password"
                  minLength={10}
                  maxLength={128}
                  autoComplete={
                    authMode === "register"
                      ? "new-password"
                      : "current-password"
                  }
                  placeholder="Mínimo 10 caracteres"
                  required
                />
              </Field>
              <Button disabled={busy} className="full">
                {busy ? (
                  <LoaderCircle className="spin" size={18} />
                ) : authMode === "register" ? (
                  "Crear mi espacio de trabajo"
                ) : (
                  "Entrar a mi espacio"
                )}
                <ArrowRight size={18} />
              </Button>
            </form>
            <p className="auth-note">
              <Info size={16} /> No necesita una clave de IA para explorar el
              modo demostración. No ingrese información sensible de clientes.
            </p>
          </div>
          <p className="copyright">
            CompatiPC · Tecnología que ayuda a decidir.
          </p>
        </section>
      </div>
    );
  const nav = [
    { id: "dashboard", label: "Vista general", icon: LayoutDashboard },
    { id: "query", label: "Nueva consulta", icon: Search },
    { id: "equipment", label: "Mis equipos", icon: Monitor },
    { id: "history", label: "Historial", icon: History },
    { id: "catalog", label: "Catálogo de referencia", icon: Layers },
  ];
  const titles: Record<string, [string, string]> = {
    dashboard: [
      "Su centro de diagnóstico",
      "Una visión clara para tomar mejores decisiones.",
    ],
    query: [
      "Compruebe antes de instalar",
      "Cruce los datos del equipo con el componente que necesita.",
    ],
    equipment: [
      "Sus equipos, organizados",
      "El punto de partida de cada diagnóstico.",
    ],
    history: [
      "Decisiones con respaldo",
      "Consulte, revise y comparta su historial técnico.",
    ],
    catalog: [
      "Una referencia para empezar",
      "Ejemplos ilustrativos. Siempre verifique el manual del fabricante.",
    ],
    result: [
      "El detalle hace la diferencia",
      "Una recomendación documentada, no una certificación.",
    ],
  };
  return (
    <div className="app-shell">
      <button
        className="mobile-toggle icon-button"
        aria-label="Abrir navegación"
        onClick={() => setMobile(!mobile)}
      >
        {mobile ? <X /> : <Menu />}
      </button>
      {mobile && (
        <div className="nav-overlay" onClick={() => setMobile(false)} />
      )}
      <aside className={`sidebar ${mobile ? "open" : ""}`}>
        <Brand />
        <div className="workspace-label">ESPACIO DE TRABAJO</div>
        <nav aria-label="Navegación principal">
          {nav.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={view === item.id ? "active" : ""}
            >
              <item.icon size={19} />
              {item.label}
              {item.id === "query" && <span className="nav-plus">+</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <span className="mini-icon">
              <Sparkles size={18} />
            </span>
            <h4>
              La precisión empieza
              <br />
              con buenos datos.
            </h4>
            <p>Use el modelo exacto y las especificaciones del fabricante.</p>
            <button onClick={() => navigate("query")}>
              Hacer una consulta <ArrowUpRight size={15} />
            </button>
          </div>
          <div className="user-row">
            <span className="avatar">{user.name.charAt(0).toUpperCase()}</span>
            <div>
              <strong>{user.name}</strong>
              <small>
                {user.role === "admin" ? "Administrador" : "Técnico"}
              </small>
            </div>
            <button
              className="icon-button"
              aria-label="Cerrar sesión"
              disabled={busy}
              onClick={() =>
                action(async () => {
                  await api("/auth/logout", { method: "POST" });
                  setUser(null);
                  router.push("/login");
                  setEquipment([]);
                  setAnalyses([]);
                  setSelected(null);
                  setView("dashboard");
                })
              }
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            Espacio de trabajo <ChevronRight size={13} />
            <strong>
              {nav.find((n) => n.id === view)?.label || "Resultado"}
            </strong>
          </div>
          <div className="top-status">
            <span
              className={`status-dot ${config.geminiConfigured ? "online" : ""}`}
            />
            {config.geminiConfigured
              ? "Gemini configurado"
              : "Modo demostración disponible"}
            <span className="top-divider" />
            <span className="top-avatar">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                COMPATIPC /{" "}
                {view === "dashboard" ? "PANEL DE CONTROL" : "ESPACIO TÉCNICO"}
              </div>
              <h1>{titles[view][0]}</h1>
              <p>{titles[view][1]}</p>
            </div>
            {view === "dashboard" && (
              <Button onClick={() => navigate("query")}>
                <Plus size={18} /> Nueva consulta
              </Button>
            )}
            {view === "equipment" && (
              <Button onClick={() => setEquipmentForm(!equipmentForm)}>
                <Plus size={18} /> Registrar equipo
              </Button>
            )}
            {view === "catalog" && user.role === "admin" && (
              <Button
                onClick={() => {
                  setComponentEdit(null);
                  setComponentForm(!componentForm);
                }}
              >
                <Plus size={18} /> Agregar componente
              </Button>
            )}
          </div>
          {error && (
            <div className="alert error" role="alert">
              <TriangleAlert size={18} />
              {error}
            </div>
          )}
          {notice && (
            <div className="alert success" role="status">
              <Check size={18} />
              {notice}
            </div>
          )}
          {view === "dashboard" && (
            <>
              <section className="hero">
                <div className="hero-copy">
                  <span className="hero-kicker">
                    <span /> SU PRÓXIMA DECISIÓN, CON MÁS CLARIDAD
                  </span>
                  <h2>
                    Que la compatibilidad
                    <br />
                    no sea una suposición.
                  </h2>
                  <p>
                    Revise componentes, detecte posibles riesgos y guarde
                    <br className="desktop" /> el respaldo de cada
                    recomendación.
                  </p>
                  <button onClick={() => navigate("query")}>
                    Iniciar un diagnóstico <ArrowRight size={17} />
                  </button>
                </div>
                <div className="hero-visual" aria-hidden="true">
                  <div className="orbit orbit-one" />
                  <div className="orbit orbit-two" />
                  <div className="hero-chip">
                    <Cpu size={72} />
                  </div>
                  <span className="floating-card card-a">
                    <CheckCircle2 size={20} />
                    <span>
                      Más contexto<strong>Mejores decisiones</strong>
                    </span>
                  </span>
                  <span className="floating-card card-b">
                    <Layers size={19} />
                    <span>Equipo + componente</span>
                  </span>
                </div>
              </section>
              <section className="stats-grid">
                <div className="stat-card">
                  <span className="stat-icon">
                    <Monitor size={20} />
                  </span>
                  <span>Equipos registrados</span>
                  <strong>{stats.equipment.toString().padStart(2, "0")}</strong>
                  <small>
                    Su inventario de trabajo{" "}
                    <button
                      aria-label="Ver equipos"
                      onClick={() => navigate("equipment")}
                    >
                      <ArrowUpRight size={16} />
                    </button>
                  </small>
                </div>
                <div className="stat-card">
                  <span className="stat-icon blue">
                    <Search size={20} />
                  </span>
                  <span>Consultas realizadas</span>
                  <strong>{stats.analyses.toString().padStart(2, "0")}</strong>
                  <small>
                    Diagnósticos documentados{" "}
                    <button
                      aria-label="Ver historial"
                      onClick={() => navigate("history")}
                    >
                      <ArrowUpRight size={16} />
                    </button>
                  </small>
                </div>
                <div className="stat-card">
                  <span className="stat-icon amber">
                    <Layers size={20} />
                  </span>
                  <span>Referencias del catálogo</span>
                  <strong>
                    {components.length.toString().padStart(2, "0")}
                  </strong>
                  <small>
                    Ejemplos no verificados{" "}
                    <button
                      aria-label="Ver catálogo"
                      onClick={() => navigate("catalog")}
                    >
                      <ArrowUpRight size={16} />
                    </button>
                  </small>
                </div>
              </section>
              <div className="dashboard-grid">
                <section className="panel recent">
                  <div className="panel-heading">
                    <div>
                      <h3>Actividad reciente</h3>
                      <p>Sus últimas consultas, siempre a mano.</p>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => navigate("history")}
                    >
                      Ver historial <ArrowUpRight size={15} />
                    </button>
                  </div>
                  {rows(stats.recent)}
                </section>
                <section className="guide-card">
                  <span className="eyebrow">UN BUEN PUNTO DE PARTIDA</span>
                  <h3>Del dato a la decisión.</h3>
                  {[
                    [
                      "01",
                      "Registre el equipo",
                      "Modelo y placa base exactos.",
                    ],
                    [
                      "02",
                      "Describa el componente",
                      "Referencia y especificaciones.",
                    ],
                    [
                      "03",
                      "Revise y documente",
                      "Valide riesgos y exporte el informe.",
                    ],
                  ].map(([n, title, desc]) => (
                    <div className="guide-step" key={n}>
                      <span>{n}</span>
                      <div>
                        <strong>{title}</strong>
                        <p>{desc}</p>
                      </div>
                    </div>
                  ))}
                  <div className="guide-note">
                    <ShieldCheck size={19} />
                    <p>
                      La IA es un apoyo. Verifique la documentación oficial
                      antes de instalar.
                    </p>
                  </div>
                </section>
              </div>
              <div className="bottom-note">
                <Info size={16} />
                {config.geminiConfigured
                  ? "Las respuestas de Gemini pueden contener errores. La configuración no garantiza disponibilidad o cuota."
                  : "Gemini aún no está configurado. Las consultas de demostración son locales y se identifican claramente."}
              </div>
            </>
          )}
          {view === "equipment" && (
            <>
              {equipmentForm && (
                <section className="panel form-panel">
                  <div className="panel-heading">
                    <h3>Registrar un equipo</h3>
                    <button
                      className="icon-button"
                      aria-label="Cerrar formulario"
                      onClick={() => setEquipmentForm(false)}
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <form onSubmit={createEquipment}>
                    <div className="form-grid">
                      <Field label="Marca">
                        <input
                          name="brand"
                          placeholder="Ej. Lenovo"
                          maxLength={60}
                          required
                        />
                      </Field>
                      <Field label="Modelo exacto">
                        <input
                          name="model"
                          placeholder="Ej. ThinkPad T480"
                          maxLength={120}
                          required
                        />
                      </Field>
                      <Field label="Placa base / especificaciones conocidas">
                        <input
                          name="board"
                          placeholder="Referencia, revisión y tipo de memoria"
                          maxLength={240}
                          required
                        />
                      </Field>
                      <Field label="Número de serie (opcional, no se envía a la IA)">
                        <input
                          name="serial"
                          maxLength={100}
                          placeholder="Identificador interno"
                        />
                      </Field>
                    </div>
                    <Button disabled={busy}>
                      {busy ? "Guardando…" : "Guardar equipo"}
                      <Check size={17} />
                    </Button>
                  </form>
                </section>
              )}
              {equipment.length ? (
                <div className="equipment-grid">
                  {equipment.map((e) => (
                    <article className="panel equipment-card" key={e.id}>
                      <div className="equipment-card-top">
                        <span className="equipment-icon">
                          <Monitor size={28} />
                        </span>
                        <button
                          className="icon-button"
                          aria-label={`Eliminar ${e.model}`}
                          disabled={busy}
                          onClick={() => {
                            if (
                              confirm(
                                "¿Eliminar este equipo? Los informes históricos se conservarán.",
                              )
                            )
                              action(async () => {
                                await api(`/equipment/${e.id}`, {
                                  method: "DELETE",
                                });
                                await refresh();
                              });
                          }}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                      <span className="eyebrow">{e.brand}</span>
                      <h3>{e.model}</h3>
                      <p>{e.board}</p>
                      <div className="equipment-meta">
                        Serie: {e.serial || "No registrada"}
                      </div>
                      <button
                        className="text-button"
                        onClick={() => {
                          sessionStorage.setItem(
                            "compatipc-query",
                            JSON.stringify({ equipmentId: e.id }),
                          );
                          setQueryEquipment(e.id);
                          navigate("query");
                        }}
                      >
                        Consultar compatibilidad <ArrowUpRight size={16} />
                      </button>
                    </article>
                  ))}
                </div>
              ) : (
                <section className="panel">
                  <div className="empty">
                    <span className="empty-icon">
                      <Monitor size={30} />
                    </span>
                    <h3>Su inventario empieza con un equipo</h3>
                    <p>
                      Registre los datos técnicos para contextualizar sus
                      consultas.
                    </p>
                    <Button onClick={() => setEquipmentForm(true)}>
                      <Plus size={16} /> Registrar primer equipo
                    </Button>
                  </div>
                </section>
              )}
            </>
          )}
          {view === "query" && (
            <div className="query-grid">
              <section className="panel form-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Nueva consulta de compatibilidad</h3>
                    <p>
                      La calidad del resultado depende de los datos que aporte.
                    </p>
                  </div>
                  <Search size={23} />
                </div>
                {!equipment.length ? (
                  <div className="empty">
                    <Monitor size={32} />
                    <h3>Primero, registre un equipo</h3>
                    <p>
                      Necesitamos conocer el equipo para contextualizar el
                      análisis.
                    </p>
                    <Button onClick={() => navigate("equipment")}>
                      Ir a mis equipos <ArrowRight size={16} />
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={createAnalysis}>
                    <div className="section-label">
                      <span>01</span> El equipo
                    </div>
                    <Field label="Equipo que desea evaluar">
                      <select
                        value={queryEquipment}
                        onChange={(e) => setQueryEquipment(e.target.value)}
                        required
                      >
                        <option value="">Seleccione un equipo</option>
                        {equipment.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.brand} {e.model}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <div className="section-label">
                      <span>02</span> El componente
                    </div>
                    <div className="form-grid">
                      <Field label="Categoría">
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                        >
                          {categories.map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Referencia exacta">
                        <input
                          value={reference}
                          onChange={(e) => setReference(e.target.value)}
                          maxLength={160}
                          placeholder="Ej. Kingston KVR…"
                          required
                        />
                      </Field>
                    </div>
                    <Field label="Especificaciones y datos verificables">
                      <textarea
                        rows={5}
                        value={specifications}
                        onChange={(e) => setSpecifications(e.target.value)}
                        maxLength={3000}
                        placeholder="Interfaz, capacidad, voltaje, formato, dimensiones… Incluya los datos del manual que haya comprobado. No incluya datos de clientes."
                        required
                      />
                    </Field>
                    <span className="input-hint">
                      {specifications.length}/3000 · No incluya información
                      personal.
                    </span>
                    <div className="section-label">
                      <span>03</span> El tipo de análisis
                    </div>
                    <div className="mode-switch">
                      <label className={mode === "demo" ? "selected" : ""}>
                        <input
                          type="radio"
                          name="mode"
                          value="demo"
                          checked={mode === "demo"}
                          onChange={() => setMode("demo")}
                          disabled={!config.demoEnabled}
                        />
                        <div>
                          <strong>Demostración</strong>
                          <span>Respuesta local · No utiliza Gemini</span>
                        </div>
                      </label>
                      <label className={mode === "gemini" ? "selected" : ""}>
                        <input
                          type="radio"
                          name="mode"
                          value="gemini"
                          checked={mode === "gemini"}
                          onChange={() => setMode("gemini")}
                        />
                        <div>
                          <strong>Analizar con Gemini</strong>
                          <span>
                            {config.geminiConfigured
                              ? "IA configurada en el servidor"
                              : "Requiere configurar la clave"}
                          </span>
                        </div>
                      </label>
                    </div>
                    {mode === "demo" ? (
                      <div className="alert warning">
                        <Info size={18} />
                        DEMOSTRACIÓN: caso didáctico no verificado, no generado
                        por IA. No lo utilice para autorizar una instalación.
                      </div>
                    ) : (
                      <div className="alert info">
                        <ShieldCheck size={18} />
                        Se enviarán a Google la marca, modelo, placa y datos del
                        componente, sin su número de serie. No envíe datos
                        sensibles.
                      </div>
                    )}
                    <Button
                      disabled={
                        busy || (mode === "demo" && !config.demoEnabled)
                      }
                      className="full"
                    >
                      {busy ? (
                        <>
                          <LoaderCircle className="spin" size={18} /> Analizando
                          los datos…
                        </>
                      ) : (
                        <>
                          <Sparkles size={18} />
                          {mode === "demo"
                            ? "Generar demostración"
                            : "Consultar a Gemini"}
                          <ArrowRight size={17} />
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </section>
              <aside className="query-aside">
                <section className="guide-card">
                  <span className="mini-icon">
                    <SlidersHorizontal size={20} />
                  </span>
                  <h3>La referencia exacta importa.</h3>
                  <p>
                    Dos equipos con el mismo nombre comercial pueden tener
                    placas, ranuras o límites de capacidad diferentes.
                  </p>
                  <ul className="check-list">
                    <li>
                      <Check size={16} /> Modelo y revisión del equipo
                    </li>
                    <li>
                      <Check size={16} /> Interfaz y formato físico
                    </li>
                    <li>
                      <Check size={16} /> Voltaje y alimentación
                    </li>
                    <li>
                      <Check size={16} /> Límites y versión de BIOS
                    </li>
                  </ul>
                </section>
                <section className="panel helper-panel">
                  <h4>¿Quiere explorar un ejemplo?</h4>
                  <p>
                    Utilice una referencia ilustrativa del catálogo como punto
                    de partida.
                  </p>
                  <button
                    className="text-button"
                    onClick={() => navigate("catalog")}
                  >
                    Explorar catálogo <ArrowUpRight size={15} />
                  </button>
                </section>
              </aside>
            </div>
          )}
          {view === "history" && (
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h3>Historial de consultas</h3>
                  <p>
                    Se muestran las 100 consultas más recientes. Use la búsqueda
                    para encontrar anteriores.
                  </p>
                </div>
                <form
                  className="search-box"
                  onSubmit={(e) => {
                    e.preventDefault();
                    action(async () =>
                      setAnalyses(
                        await api<Analysis[]>(
                          `/analyses?search=${encodeURIComponent(search)}`,
                        ),
                      ),
                    );
                  }}
                >
                  <Search size={17} />
                  <input
                    aria-label="Buscar por referencia o categoría"
                    placeholder="Buscar referencia o categoría"
                    value={search}
                    maxLength={120}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button type="submit" disabled={busy}>
                    Buscar
                  </button>
                </form>
              </div>
              {rows(analyses)}
            </section>
          )}
          {view === "catalog" && (
            <>
              <div className="alert warning">
                <TriangleAlert size={18} />
                Catálogo ilustrativo: no contiene especificaciones verificadas
                por fabricantes ni precios. No es una lista certificada de
                compatibilidad.
              </div>
              {componentForm && user.role === "admin" && (
                <section className="panel form-panel">
                  <h3>
                    {componentEdit ? "Editar componente" : "Nuevo componente"}
                  </h3>
                  <form
                    key={componentEdit?.id || "new"}
                    onSubmit={saveComponent}
                  >
                    <div className="form-grid">
                      <Field label="Nombre">
                        <input
                          name="name"
                          defaultValue={componentEdit?.name}
                          maxLength={160}
                          required
                        />
                      </Field>
                      <Field label="Categoría">
                        <select
                          name="category"
                          defaultValue={componentEdit?.category}
                        >
                          {categories.map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <Field label="Especificaciones">
                      <textarea
                        name="specifications"
                        defaultValue={componentEdit?.specifications}
                        maxLength={3000}
                        required
                      />
                    </Field>
                    <Field label="Origen y nivel de verificación">
                      <input
                        name="source"
                        defaultValue={
                          componentEdit?.source ||
                          "DEMOSTRACIÓN · especificaciones no verificadas por el fabricante"
                        }
                        maxLength={400}
                        required
                      />
                    </Field>
                    <div className="button-row">
                      <Button disabled={busy}>Guardar referencia</Button>
                      <Button
                        type="button"
                        className="secondary"
                        onClick={() => setComponentForm(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </section>
              )}
              <div className="catalog-grid">
                {components.map((c) => (
                  <article className="panel catalog-card" key={c.id}>
                    <div className="catalog-top">
                      <span className="stat-icon">
                        <Cpu size={23} />
                      </span>
                      <span className="category-tag">{c.category}</span>
                    </div>
                    <h3>{c.name}</h3>
                    <p>{c.specifications}</p>
                    <div className="source-note">
                      <Info size={14} />
                      {c.source}
                    </div>
                    <div className="catalog-actions">
                      <button
                        className="text-button"
                        onClick={() => {
                          sessionStorage.setItem(
                            "compatipc-query",
                            JSON.stringify({
                              category: c.category,
                              reference: c.name,
                              specifications: c.specifications,
                            }),
                          );
                          setCategory(c.category);
                          setReference(c.name);
                          setSpecifications(c.specifications);
                          navigate("query");
                        }}
                      >
                        Usar como referencia <ArrowUpRight size={15} />
                      </button>
                      {user.role === "admin" && (
                        <div>
                          <button
                            aria-label={`Editar ${c.name}`}
                            className="icon-button"
                            onClick={() => {
                              setComponentEdit(c);
                              setComponentForm(true);
                            }}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            aria-label={`Eliminar ${c.name}`}
                            className="icon-button"
                            disabled={busy}
                            onClick={() => {
                              if (
                                confirm(
                                  "¿Eliminar esta referencia del catálogo?",
                                )
                              )
                                action(async () => {
                                  await api(`/components/${c.id}`, {
                                    method: "DELETE",
                                  });
                                  await refresh();
                                });
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
          {view === "result" && selected && (
            <>
              <div className="result-toolbar">
                <button
                  className="text-button"
                  onClick={() => navigate("history")}
                >
                  ← Volver al historial
                </button>
                <a
                  className="button secondary"
                  href={`/api/analyses/${selected.id}/pdf`}
                >
                  <FileDown size={17} /> Descargar informe PDF
                </a>
              </div>
              {selected.provider === "demo" && (
                <div className="alert warning">
                  <TriangleAlert size={20} />
                  <strong>DEMOSTRACIÓN / NO GEMINI.</strong> Resultado didáctico
                  local. Especificaciones no verificadas.
                </div>
              )}
              <div className="result-grid">
                <section className="panel result-main">
                  <div className="result-head">
                    <span
                      className={`result-symbol ${selected.result.verdict}`}
                    >
                      {selected.result.verdict === "compatible" ? (
                        <CheckCircle2 size={28} />
                      ) : (
                        <TriangleAlert size={28} />
                      )}
                    </span>
                    <div>
                      <span className="eyebrow">RESULTADO DEL ANÁLISIS</span>
                      <h2>{verdicts[selected.result.verdict]}</h2>
                    </div>
                    <Badge value={selected.result.verdict} />
                  </div>
                  <p className="result-summary">{selected.result.summary}</p>
                  {(
                    [
                      ["checks", "Comprobaciones técnicas", ShieldCheck],
                      ["risks", "Riesgos y precauciones", TriangleAlert],
                      [
                        "alternatives",
                        "Alternativas y siguientes pasos",
                        Layers,
                      ],
                    ] as const
                  ).map(([key, title, Icon]) => (
                    <section className="result-section" key={key}>
                      <h3>
                        <Icon size={19} />
                        {title}
                      </h3>
                      <ul>
                        {selected.result[key].length ? (
                          selected.result[key].map((s, i) => (
                            <li key={i}>{s}</li>
                          ))
                        ) : (
                          <li>
                            No se detallaron elementos adicionales; esto no
                            garantiza ausencia de riesgos.
                          </li>
                        )}
                      </ul>
                    </section>
                  ))}
                  <div className="feedback">
                    <div>
                      <strong>¿Le resultó útil esta orientación?</strong>
                      <p>Su respuesta queda asociada a esta consulta.</p>
                    </div>
                    <div className="button-row">
                      {(["useful", "not-useful"] as const).map((value, i) => (
                        <button
                          key={value}
                          disabled={busy}
                          aria-pressed={selected.feedback === value}
                          className={`button secondary ${selected.feedback === value ? "chosen" : ""}`}
                          onClick={() =>
                            action(async () => {
                              const updated = await api<Analysis>(
                                `/analyses/${selected.id}/feedback`,
                                {
                                  method: "PATCH",
                                  body: JSON.stringify({ feedback: value }),
                                },
                              );
                              setSelected(updated);
                              setNotice("Gracias. Su opinión fue guardada.");
                            })
                          }
                        >
                          {i ? (
                            <ThumbsDown size={16} />
                          ) : (
                            <ThumbsUp size={16} />
                          )}{" "}
                          {i ? "No" : "Sí"}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
                <aside>
                  <section className="panel detail-card">
                    <h3>Contexto de la consulta</h3>
                    <dl>
                      <dt>Equipo</dt>
                      <dd>
                        {selected.equipment.brand} {selected.equipment.model}
                      </dd>
                      <dt>Placa / especificaciones</dt>
                      <dd>{selected.equipment.board}</dd>
                      <dt>Componente</dt>
                      <dd>{selected.reference}</dd>
                      <dt>Categoría</dt>
                      <dd>{selected.category}</dd>
                      <dt>Fecha</dt>
                      <dd>{date(selected.createdAt)}</dd>
                      <dt>Origen</dt>
                      <dd>
                        {selected.provider === "demo"
                          ? "Demostración local · NO GEMINI"
                          : `Gemini · ${selected.model}`}
                      </dd>
                    </dl>
                  </section>
                  <div className="advisory">
                    <ShieldCheck size={22} />
                    <h4>Verifique antes de actuar.</h4>
                    <p>
                      Este informe es orientativo. Confirme las especificaciones
                      oficiales antes de comprar, modificar o instalar un
                      componente.
                    </p>
                  </div>
                </aside>
              </div>
            </>
          )}
          <footer className="workspace-footer">
            <span>
              CompatiPC <span>·</span> Compatibilidad con criterio.
            </span>
            <span>Prototipo académico · v1.0</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
