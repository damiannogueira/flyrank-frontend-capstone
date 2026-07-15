import { useState } from "react";
import { Link2, Plus, X, BookMarked } from "lucide-react";

const CATEGORIES = [
  { id: "read", label: "Reading", color: "#3F6B6A" },
  { id: "watch", label: "Watching", color: "#A63A2E" },
  { id: "tool", label: "Tool", color: "#C9992B" },
  { id: "ref", label: "Reference", color: "#6B4A6E" },
];

const TOKENS = {
  page: "#EDE3C8",
  card: "#F7F1DE",
  ink: "#263440",
  inkSoft: "#5B6B78",
  rule: "#C9BB93",
  stamp: "#A63A2E",
};

function parseUrl(raw) {
  const value = raw.trim();
  if (!value) return null;
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const u = new URL(withProtocol);
    if (!u.hostname.includes(".")) return null;
    return { full: withProtocol, hostname: u.hostname.replace(/^www\./, "") };
  } catch {
    return null;
  }
}

function guessTitle(hostname) {
  const base = hostname.split(".")[0];
  return base
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function todayStamp() {
  return new Date()
    .toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();
}

function CatalogCard({ data, onDelete, empty }) {
  const category = CATEGORIES.find((c) => c.id === data?.categoryId) || CATEGORIES[0];

  if (empty) {
    return (
      <div
        style={{
          background: "transparent",
          border: `1.5px dashed ${TOKENS.rule}`,
          borderRadius: "2px",
          minHeight: "220px",
        }}
        className="flex flex-col items-center justify-center gap-2 px-6 text-center"
      >
        <BookMarked size={22} color={TOKENS.rule} strokeWidth={1.5} />
        <p style={{ color: TOKENS.inkSoft, fontFamily: "'IBM Plex Mono', monospace" }} className="text-xs tracking-wide">
          Paste a link to see it here
        </p>
      </div>
    );
  }

  const CardInner = (
    <div
      className="catalog-card relative"
      style={{
        background: TOKENS.card,
        border: `1px solid ${TOKENS.ink}22`,
        borderRadius: "2px",
        boxShadow: "0 1px 0 rgba(38,52,64,0.08), 0 8px 16px -12px rgba(38,52,64,0.35)",
        overflow: "hidden",
      }}
    >
      {/* Category tab */}
      <div
        style={{
          background: category.color,
          color: "#F7F1DE",
          fontFamily: "'IBM Plex Mono', monospace",
        }}
        className="text-[10px] tracking-[0.15em] uppercase px-3 py-1 inline-block"
      >
        {category.label}
      </div>

      {/* Punch holes */}
      <div style={{ position: "absolute", top: "8px", right: "14px", display: "flex", gap: "6px" }}>
        <span style={punchHoleStyle()} />
        <span style={punchHoleStyle()} />
      </div>

      {data && onDelete && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(data.id);
          }}
          className="card-delete"
          aria-label="Remove card from archive"
          style={{
            position: "absolute",
            top: "6px",
            right: "6px",
            background: TOKENS.card,
            border: `1px solid ${TOKENS.ink}33`,
            borderRadius: "50%",
            width: "22px",
            height: "22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0,
            transition: "opacity 120ms ease",
            cursor: "pointer",
          }}
        >
          <X size={12} color={TOKENS.ink} />
        </button>
      )}

      <div className="px-4 pt-3 pb-2">
        {/* Call number row */}
        <div className="flex items-center gap-2 mb-2">
          <span
            style={{
              width: "20px",
              height: "20px",
              border: `1px solid ${TOKENS.rule}`,
              borderRadius: "3px",
              overflow: "hidden",
              flexShrink: 0,
              background: "#fff",
            }}
            className="flex items-center justify-center"
          >
            {data?.favicon ? (
              <img src={data.favicon} alt="" width={14} height={14} style={{ display: "block" }} />
            ) : (
              <Link2 size={11} color={TOKENS.inkSoft} />
            )}
          </span>
          <span
            style={{ color: TOKENS.inkSoft, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.04em" }}
            className="text-[11px] truncate"
          >
            {data?.hostname || "—"}
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            color: TOKENS.ink,
            fontFamily: "'Source Serif 4', serif",
            lineHeight: 1.25,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
          className="text-lg font-semibold mb-1.5"
        >
          {data?.title || "Untitled entry"}
        </h3>

        {/* Description */}
        {data?.description ? (
          <p
            style={{
              color: TOKENS.inkSoft,
              fontFamily: "'Source Serif 4', serif",
              lineHeight: 1.45,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
            className="text-[13px] mb-2"
          >
            {data.description}
          </p>
        ) : null}
      </div>

      {/* Stamp footer */}
      <div
        style={{ borderTop: `1px dashed ${TOKENS.rule}` }}
        className="flex items-center justify-between px-4 py-2"
      >
        <span
          style={{ color: TOKENS.stamp, fontFamily: "'IBM Plex Mono', monospace" }}
          className="text-[10px] tracking-widest uppercase"
        >
          Added {data?.date}
        </span>
        <span style={{ color: TOKENS.inkSoft, fontFamily: "'IBM Plex Mono', monospace" }} className="text-[10px]">
          No. {String(data?.accessionNo ?? 0).padStart(3, "0")}
        </span>
      </div>

      {/* Perforated edge */}
      <div
        style={{
          height: "9px",
          backgroundImage: `linear-gradient(135deg, ${TOKENS.page} 50%, transparent 50%), linear-gradient(45deg, ${TOKENS.page} 50%, transparent 50%)`,
          backgroundSize: "9px 9px",
          backgroundPosition: "0 0, 0 0",
        }}
      />
    </div>
  );

  if (data?.url) {
    return (
      <a href={data.url} target="_blank" rel="noopener noreferrer" className="block no-underline">
        {CardInner}
      </a>
    );
  }
  return CardInner;
}

function punchHoleStyle() {
  return {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#EDE3C8",
    boxShadow: "inset 0 1px 2px rgba(38,52,64,0.35)",
    display: "block",
  };
}

export default function URLArchive() {
  const [cards, setCards] = useState([]);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(CATEGORIES[0].id);
  const [touchedTitle, setTouchedTitle] = useState(false);

  const parsed = parseUrl(url);

  const handleUrlBlur = () => {
    if (parsed && !touchedTitle && !title) {
      setTitle(guessTitle(parsed.hostname));
    }
  };

  const previewData = parsed
    ? {
        url: parsed.full,
        hostname: parsed.hostname,
        favicon: `https://www.google.com/s2/favicons?sz=64&domain=${parsed.hostname}`,
        title: title || guessTitle(parsed.hostname),
        description,
        categoryId,
        accessionNo: cards.length + 1,
        date: todayStamp(),
      }
    : null;

  const addCard = () => {
    if (!previewData) return;
    setCards((prev) => [...prev, { ...previewData, id: crypto.randomUUID() }]);
    setUrl("");
    setTitle("");
    setDescription("");
    setTouchedTitle(false);
  };

  const removeCard = (id) => setCards((prev) => prev.filter((c) => c.id !== id));

  return (
    <div style={{ background: TOKENS.page, minHeight: "100%" }} className="w-full">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        .catalog-card:hover .card-delete { opacity: 1; }
        .tab-btn { transition: transform 100ms ease, box-shadow 100ms ease; }
        .tab-btn:hover { transform: translateY(-1px); }
        .field-input:focus, .field-textarea:focus, .tab-btn:focus-visible, .add-btn:focus-visible {
          outline: 2px solid #263340;
          outline-offset: 2px;
        }
        @media (prefers-reduced-motion: reduce) {
          .tab-btn { transition: none; }
        }
      `}</style>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8 border-b pb-5" style={{ borderColor: TOKENS.rule }}>
          <div className="flex items-center gap-2 mb-1">
            <BookMarked size={18} color={TOKENS.stamp} strokeWidth={1.75} />
            <span
              style={{ color: TOKENS.stamp, fontFamily: "'IBM Plex Mono', monospace" }}
              className="text-[11px] tracking-[0.2em] uppercase"
            >
              Link Catalog
            </span>
          </div>
          <h1 style={{ color: TOKENS.ink, fontFamily: "'Source Serif 4', serif" }} className="text-3xl font-semibold">
            Turn any link into a card
          </h1>
          <p style={{ color: TOKENS.inkSoft, fontFamily: "'Source Serif 4', serif" }} className="text-[15px] mt-1">
            Paste a URL, describe it in your own words, and file it in the archive.
          </p>
        </div>

        {/* Form + Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Form */}
          <div>
            <label
              style={{ color: TOKENS.inkSoft, fontFamily: "'IBM Plex Mono', monospace" }}
              className="text-[11px] tracking-widest uppercase block mb-1.5"
            >
              URL
            </label>
            <div
              className="flex items-center gap-2 px-3 py-2 mb-4"
              style={{ background: "#fff", border: `1px solid ${TOKENS.rule}`, borderRadius: "3px" }}
            >
              <Link2 size={15} color={TOKENS.inkSoft} />
              <input
                className="field-input flex-1 bg-transparent outline-none text-sm"
                style={{ color: TOKENS.ink, fontFamily: "'IBM Plex Mono', monospace" }}
                placeholder="example.com/article"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={handleUrlBlur}
                onKeyDown={(e) => e.key === "Enter" && addCard()}
              />
            </div>

            <label
              style={{ color: TOKENS.inkSoft, fontFamily: "'IBM Plex Mono', monospace" }}
              className="text-[11px] tracking-widest uppercase block mb-1.5"
            >
              Title
            </label>
            <input
              className="field-input w-full px-3 py-2 mb-4 text-sm"
              style={{
                background: "#fff",
                border: `1px solid ${TOKENS.rule}`,
                borderRadius: "3px",
                color: TOKENS.ink,
                fontFamily: "'Source Serif 4', serif",
              }}
              placeholder="What is this page called?"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setTouchedTitle(true);
              }}
            />

            <label
              style={{ color: TOKENS.inkSoft, fontFamily: "'IBM Plex Mono', monospace" }}
              className="text-[11px] tracking-widest uppercase block mb-1.5"
            >
              Description
            </label>
            <textarea
              className="field-textarea w-full px-3 py-2 mb-4 text-sm resize-none"
              style={{
                background: "#fff",
                border: `1px solid ${TOKENS.rule}`,
                borderRadius: "3px",
                color: TOKENS.ink,
                fontFamily: "'Source Serif 4', serif",
              }}
              rows={3}
              placeholder="A line or two, in your own words"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <label
              style={{ color: TOKENS.inkSoft, fontFamily: "'IBM Plex Mono', monospace" }}
              className="text-[11px] tracking-widest uppercase block mb-1.5"
            >
              Category
            </label>
            <div className="flex flex-wrap gap-2 mb-6">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  className="tab-btn flex items-center gap-1.5 px-2.5 py-1 text-xs"
                  style={{
                    borderRadius: "3px",
                    border: `1px solid ${categoryId === c.id ? c.color : TOKENS.rule}`,
                    background: categoryId === c.id ? `${c.color}1A` : "#fff",
                    color: TOKENS.ink,
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}
                  onClick={() => setCategoryId(c.id)}
                >
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: c.color }} />
                  {c.label}
                </button>
              ))}
            </div>

            <button
              className="add-btn flex items-center gap-2 px-4 py-2 text-sm"
              disabled={!previewData}
              style={{
                background: previewData ? TOKENS.ink : `${TOKENS.ink}55`,
                color: "#F7F1DE",
                borderRadius: "3px",
                fontFamily: "'IBM Plex Mono', monospace",
                cursor: previewData ? "pointer" : "not-allowed",
              }}
              onClick={addCard}
            >
              <Plus size={15} />
              File in archive
            </button>
          </div>

          {/* Preview */}
          <div>
            <label
              style={{ color: TOKENS.inkSoft, fontFamily: "'IBM Plex Mono', monospace" }}
              className="text-[11px] tracking-widest uppercase block mb-1.5"
            >
              Preview
            </label>
            <div style={{ maxWidth: "340px" }}>
              <CatalogCard data={previewData} empty={!previewData} />
            </div>
          </div>
        </div>

        {/* Archive grid */}
        <div>
          <div className="flex items-baseline justify-between mb-4">
            <h2
              style={{ color: TOKENS.ink, fontFamily: "'Source Serif 4', serif" }}
              className="text-xl font-semibold"
            >
              The archive
            </h2>
            <span style={{ color: TOKENS.inkSoft, fontFamily: "'IBM Plex Mono', monospace" }} className="text-xs">
              {cards.length} {cards.length === 1 ? "entry" : "entries"}
            </span>
          </div>

          {cards.length === 0 ? (
            <div
              style={{ border: `1.5px dashed ${TOKENS.rule}`, borderRadius: "2px" }}
              className="py-14 text-center"
            >
              <p style={{ color: TOKENS.inkSoft, fontFamily: "'Source Serif 4', serif" }} className="text-[15px]">
                Your archive is empty. File your first link above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {cards.map((c) => (
                <CatalogCard key={c.id} data={c} onDelete={removeCard} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
