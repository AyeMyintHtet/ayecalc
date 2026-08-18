"use client";

import {
  useMemo,
  useRef,
  useState,
  type DragEvent,
} from "react";
import CopyOutputButton from "@/components/copy-output-button";
import styles from "@/components/tailwind-grid-builder.module.css";

const breakpoints = [
  { id: "base", label: "Base / XS", prefix: "", minWidth: "0px", viewport: "< 640px" },
  { id: "sm", label: "sm", prefix: "sm:", minWidth: "640px", viewport: "≥ 640px" },
  { id: "md", label: "md", prefix: "md:", minWidth: "768px", viewport: "≥ 768px" },
  { id: "lg", label: "lg", prefix: "lg:", minWidth: "1024px", viewport: "≥ 1024px" },
  { id: "xl", label: "xl", prefix: "xl:", minWidth: "1280px", viewport: "≥ 1280px" },
  { id: "2xl", label: "2xl", prefix: "2xl:", minWidth: "1536px", viewport: "≥ 1536px" },
] as const;

type BreakpointId = (typeof breakpoints)[number]["id"];
type ElementTag = "div" | "section" | "article" | "header" | "aside" | "main" | "footer";
type ToneId = "mint" | "blue" | "yellow" | "coral" | "paper";

type GridSetting = {
  columns: number;
  gap: string;
};

type BlockLayout = {
  colSpan: number;
  rowSpan: number;
};

type GridBlock = {
  id: string;
  title: string;
  body: string;
  tag: ElementTag;
  tone: ToneId;
  layouts: Record<BreakpointId, BlockLayout>;
};

const gapOptions = ["0", "1", "2", "3", "4", "5", "6", "8", "10", "12"];
const rowSpanOptions = [1, 2, 3, 4, 5, 6];
const elementOptions: ElementTag[] = [
  "div",
  "section",
  "article",
  "header",
  "aside",
  "main",
  "footer",
];

const tones: Array<{
  id: ToneId;
  label: string;
  classNames: string;
}> = [
  {
    id: "mint",
    label: "Mint",
    classNames: "border-emerald-200 bg-emerald-50 text-emerald-950",
  },
  {
    id: "blue",
    label: "Blue",
    classNames: "border-sky-200 bg-sky-50 text-sky-950",
  },
  {
    id: "yellow",
    label: "Yellow",
    classNames: "border-amber-200 bg-amber-50 text-amber-950",
  },
  {
    id: "coral",
    label: "Coral",
    classNames: "border-rose-200 bg-rose-50 text-rose-950",
  },
  {
    id: "paper",
    label: "Paper",
    classNames: "border-slate-200 bg-white text-slate-950",
  },
];

const initialGridSettings: Record<BreakpointId, GridSetting> = {
  base: { columns: 1, gap: "4" },
  sm: { columns: 2, gap: "4" },
  md: { columns: 4, gap: "4" },
  lg: { columns: 6, gap: "5" },
  xl: { columns: 8, gap: "6" },
  "2xl": { columns: 12, gap: "6" },
};

function createLayouts(
  spans: Record<BreakpointId, number>,
  rowSpan = 1,
): Record<BreakpointId, BlockLayout> {
  return Object.fromEntries(
    breakpoints.map(({ id }) => [
      id,
      { colSpan: spans[id], rowSpan },
    ]),
  ) as Record<BreakpointId, BlockLayout>;
}

const initialBlocks: GridBlock[] = [
  {
    id: "block-1",
    title: "Header",
    body: "Brand, navigation, and primary actions.",
    tag: "header",
    tone: "mint",
    layouts: createLayouts({ base: 1, sm: 2, md: 4, lg: 6, xl: 8, "2xl": 12 }),
  },
  {
    id: "block-2",
    title: "Sidebar",
    body: "Filters, links, or supporting navigation.",
    tag: "aside",
    tone: "yellow",
    layouts: createLayouts({ base: 1, sm: 1, md: 1, lg: 2, xl: 2, "2xl": 3 }, 2),
  },
  {
    id: "block-3",
    title: "Main content",
    body: "The primary content area for this layout.",
    tag: "main",
    tone: "blue",
    layouts: createLayouts({ base: 1, sm: 1, md: 3, lg: 4, xl: 6, "2xl": 9 }, 2),
  },
  {
    id: "block-4",
    title: "Footer",
    body: "Secondary links and page information.",
    tag: "footer",
    tone: "coral",
    layouts: createLayouts({ base: 1, sm: 2, md: 4, lg: 6, xl: 8, "2xl": 12 }),
  },
];

const gapPixels: Record<string, number> = {
  "0": 0,
  "1": 4,
  "2": 8,
  "3": 12,
  "4": 16,
  "5": 20,
  "6": 24,
  "8": 32,
  "10": 40,
  "12": 48,
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getGridClasses(settings: Record<BreakpointId, GridSetting>) {
  return [
    "grid",
    ...breakpoints.flatMap(({ id, prefix }) => [
      `${prefix}grid-cols-${settings[id].columns}`,
      `${prefix}gap-${settings[id].gap}`,
    ]),
  ].join(" ");
}

function getBlockClasses(block: GridBlock) {
  const placement = breakpoints.flatMap(({ id, prefix }) => [
    `${prefix}col-span-${block.layouts[id].colSpan}`,
    `${prefix}row-span-${block.layouts[id].rowSpan}`,
  ]);
  const tone = tones.find((item) => item.id === block.tone) ?? tones[0];

  return [...placement, "rounded-xl", "border", "p-4", tone.classNames].join(" ");
}

function createMarkup(
  settings: Record<BreakpointId, GridSetting>,
  blocks: GridBlock[],
) {
  const blockMarkup = blocks
    .map((block) => {
      const tag = block.tag;
      return [
        `  <${tag} class="${getBlockClasses(block)}">`,
        `    <h2 class="text-lg font-semibold">${escapeHtml(block.title)}</h2>`,
        `    <p class="mt-2 text-sm opacity-75">${escapeHtml(block.body)}</p>`,
        `  </${tag}>`,
      ].join("\n");
    })
    .join("\n");

  return `<div class="${getGridClasses(settings)}">\n${blockMarkup}\n</div>`;
}

function cloneInitialBlocks() {
  return initialBlocks.map((block) => ({
    ...block,
    layouts: Object.fromEntries(
      breakpoints.map(({ id }) => [id, { ...block.layouts[id] }]),
    ) as Record<BreakpointId, BlockLayout>,
  }));
}

export default function TailwindGridBuilder() {
  const [activeBreakpoint, setActiveBreakpoint] = useState<BreakpointId>("md");
  const [gridSettings, setGridSettings] = useState(initialGridSettings);
  const [blocks, setBlocks] = useState<GridBlock[]>(cloneInitialBlocks);
  const [selectedId, setSelectedId] = useState(initialBlocks[2].id);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const nextId = useRef(initialBlocks.length + 1);

  const selectedBlock =
    blocks.find((block) => block.id === selectedId) ?? blocks[0];
  const activeInfo = breakpoints.find(({ id }) => id === activeBreakpoint)!;
  const currentGrid = gridSettings[activeBreakpoint];
  const markup = useMemo(
    () => createMarkup(gridSettings, blocks),
    [blocks, gridSettings],
  );

  function updateGridSetting(key: keyof GridSetting, value: string | number) {
    setGridSettings((current) => ({
      ...current,
      [activeBreakpoint]: {
        ...current[activeBreakpoint],
        [key]: value,
      },
    }));

    if (key === "columns") {
      const columns = Number(value);
      setBlocks((current) =>
        current.map((block) => ({
          ...block,
          layouts: {
            ...block.layouts,
            [activeBreakpoint]: {
              ...block.layouts[activeBreakpoint],
              colSpan: Math.min(block.layouts[activeBreakpoint].colSpan, columns),
            },
          },
        })),
      );
    }
  }

  function updateBlock(updates: Partial<Pick<GridBlock, "title" | "body" | "tag" | "tone">>) {
    setBlocks((current) =>
      current.map((block) =>
        block.id === selectedId ? { ...block, ...updates } : block,
      ),
    );
  }

  function updateBlockLayout(key: keyof BlockLayout, value: number) {
    setBlocks((current) =>
      current.map((block) =>
        block.id === selectedId
          ? {
              ...block,
              layouts: {
                ...block.layouts,
                [activeBreakpoint]: {
                  ...block.layouts[activeBreakpoint],
                  [key]: value,
                },
              },
            }
          : block,
      ),
    );
  }

  function addBlock() {
    const id = `block-${nextId.current++}`;
    const layouts = Object.fromEntries(
      breakpoints.map(({ id: breakpoint }) => [
        breakpoint,
        { colSpan: 1, rowSpan: 1 },
      ]),
    ) as Record<BreakpointId, BlockLayout>;

    setBlocks((current) => [
      ...current,
      {
        id,
        title: `Content block ${current.length + 1}`,
        body: "Edit this content from the inspector.",
        tag: "section",
        tone: tones[current.length % tones.length].id,
        layouts,
      },
    ]);
    setSelectedId(id);
  }

  function deleteBlock(id: string) {
    if (blocks.length === 1) return;

    const index = blocks.findIndex((block) => block.id === id);
    const remaining = blocks.filter((block) => block.id !== id);
    setBlocks(remaining);
    setSelectedId(remaining[Math.min(index, remaining.length - 1)].id);
  }

  function moveBlock(id: string, direction: -1 | 1) {
    setBlocks((current) => {
      const index = current.findIndex((block) => block.id === id);
      const destination = index + direction;
      if (index < 0 || destination < 0 || destination >= current.length) return current;

      const next = [...current];
      const [block] = next.splice(index, 1);
      next.splice(destination, 0, block);
      return next;
    });
  }

  function handleDragStart(event: DragEvent<HTMLElement>, id: string) {
    setDraggingId(id);
    setSelectedId(id);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
  }

  function handleDrop(event: DragEvent<HTMLElement>, targetId: string) {
    event.preventDefault();
    const sourceId = draggingId ?? event.dataTransfer.getData("text/plain");
    if (!sourceId || sourceId === targetId) {
      setDropTargetId(null);
      return;
    }

    setBlocks((current) => {
      const sourceIndex = current.findIndex((block) => block.id === sourceId);
      const targetIndex = current.findIndex((block) => block.id === targetId);
      if (sourceIndex < 0 || targetIndex < 0) return current;

      const next = [...current];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setDraggingId(null);
    setDropTargetId(null);
  }

  function resetBuilder() {
    setGridSettings(initialGridSettings);
    setBlocks(cloneInitialBlocks());
    setSelectedId(initialBlocks[2].id);
    setActiveBreakpoint("md");
    nextId.current = initialBlocks.length + 1;
  }

  return (
    <div className={styles.builderShell}>
      <div className={styles.builderHeader}>
        <div>
          <span>Responsive Tailwind CSS workspace</span>
          <h2>Build your grid visually</h2>
          <p>Drag cards, edit their content, and tune every breakpoint.</p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.secondaryButton} onClick={resetBuilder}>
            Reset
          </button>
          <button type="button" className={styles.primaryButton} onClick={addBlock}>
            <span aria-hidden="true">+</span> Add block
          </button>
        </div>
      </div>

      <div className={styles.breakpointSection}>
        <div className={styles.breakpointLabel}>
          <span>Preview breakpoint</span>
          <small>Base is Tailwind’s unprefixed mobile / XS layout.</small>
        </div>
        <div className={styles.breakpointTabs} role="tablist" aria-label="Responsive breakpoints">
          {breakpoints.map((breakpoint) => (
            <button
              type="button"
              role="tab"
              aria-selected={activeBreakpoint === breakpoint.id}
              className={activeBreakpoint === breakpoint.id ? styles.activeBreakpoint : ""}
              onClick={() => setActiveBreakpoint(breakpoint.id)}
              key={breakpoint.id}
            >
              <strong>{breakpoint.label}</strong>
              <small>{breakpoint.minWidth}</small>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.workspace}>
        <div className={styles.canvasColumn}>
          <div className={styles.canvasToolbar}>
            <div className={styles.viewportTitle}>
              <span className={styles.statusDot} aria-hidden="true" />
              <div>
                <strong>{activeInfo.label} canvas</strong>
                <small>{activeInfo.viewport}</small>
              </div>
            </div>
            <div className={styles.gridControls}>
              <label>
                <span>Columns</span>
                <select
                  value={currentGrid.columns}
                  onChange={(event) => updateGridSetting("columns", Number(event.target.value))}
                >
                  {Array.from({ length: 12 }, (_, index) => index + 1).map((columns) => (
                    <option value={columns} key={columns}>{columns}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Gap</span>
                <select
                  value={currentGrid.gap}
                  onChange={(event) => updateGridSetting("gap", event.target.value)}
                >
                  {gapOptions.map((gap) => (
                    <option value={gap} key={gap}>gap-{gap}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <section className={styles.canvasFrame} aria-label={`${activeInfo.label} grid preview`}>
            <div
              className={styles.liveGrid}
              style={{
                gridTemplateColumns: `repeat(${currentGrid.columns}, minmax(0, 1fr))`,
                gap: gapPixels[currentGrid.gap],
              }}
            >
              {blocks.map((block, index) => {
                const layout = block.layouts[activeBreakpoint];
                const isSelected = block.id === selectedId;
                return (
                  <article
                    draggable
                    tabIndex={0}
                    aria-label={`${block.title}, grid block ${index + 1} of ${blocks.length}`}
                    className={`${styles.previewBlock} ${isSelected ? styles.selectedBlock : ""} ${dropTargetId === block.id ? styles.dropTarget : ""}`}
                    data-tone={block.tone}
                    style={{
                      gridColumn: `span ${Math.min(layout.colSpan, currentGrid.columns)}`,
                      gridRow: `span ${layout.rowSpan}`,
                    }}
                    onClick={() => setSelectedId(block.id)}
                    onFocus={() => setSelectedId(block.id)}
                    onDragStart={(event) => handleDragStart(event, block.id)}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                      setDropTargetId(block.id);
                    }}
                    onDragLeave={() => setDropTargetId(null)}
                    onDrop={(event) => handleDrop(event, block.id)}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setDropTargetId(null);
                    }}
                    key={block.id}
                  >
                    <div className={styles.blockTopline}>
                      <span className={styles.dragHandle} aria-hidden="true">⠿</span>
                      <code>{layout.colSpan} × {layout.rowSpan}</code>
                      <span>{`<${block.tag}>`}</span>
                    </div>
                    <strong>{block.title || "Untitled block"}</strong>
                    <p>{block.body || "Add supporting content from the inspector."}</p>
                    <div className={styles.blockActions}>
                      <button
                        type="button"
                        aria-label={`Move ${block.title} backward`}
                        disabled={index === 0}
                        onClick={(event) => {
                          event.stopPropagation();
                          moveBlock(block.id, -1);
                        }}
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        aria-label={`Move ${block.title} forward`}
                        disabled={index === blocks.length - 1}
                        onClick={(event) => {
                          event.stopPropagation();
                          moveBlock(block.id, 1);
                        }}
                      >
                        →
                      </button>
                      <button
                        type="button"
                        className={styles.blockDelete}
                        aria-label={`Delete ${block.title}`}
                        disabled={blocks.length === 1}
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteBlock(block.id);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <div className={styles.canvasFooter}>
            <span>Drag blocks to reorder</span>
            <code>{`${activeInfo.prefix}grid-cols-${currentGrid.columns} ${activeInfo.prefix}gap-${currentGrid.gap}`}</code>
          </div>
        </div>

        <aside className={styles.inspector} aria-label="Grid block inspector">
          {selectedBlock && (
            <div className={styles.inspectorSection}>
              <div className={styles.panelHeading}>
                <div>
                  <span>Selected block</span>
                  <strong>{selectedBlock.title || "Untitled block"}</strong>
                </div>
                <code>#{blocks.findIndex((block) => block.id === selectedBlock.id) + 1}</code>
              </div>

              <div className={styles.fieldStack}>
                <label className={styles.field}>
                  <span>Heading</span>
                  <input
                    type="text"
                    value={selectedBlock.title}
                    maxLength={80}
                    onChange={(event) => updateBlock({ title: event.target.value })}
                  />
                </label>
                <label className={styles.field}>
                  <span>Content</span>
                  <textarea
                    value={selectedBlock.body}
                    maxLength={240}
                    rows={3}
                    onChange={(event) => updateBlock({ body: event.target.value })}
                  />
                </label>
                <div className={styles.fieldPair}>
                  <label className={styles.field}>
                    <span>HTML element</span>
                    <select
                      value={selectedBlock.tag}
                      onChange={(event) => updateBlock({ tag: event.target.value as ElementTag })}
                    >
                      {elementOptions.map((tag) => (
                        <option value={tag} key={tag}>{tag}</option>
                      ))}
                    </select>
                  </label>
                  <label className={styles.field}>
                    <span>Column span · {activeInfo.label}</span>
                    <select
                      value={selectedBlock.layouts[activeBreakpoint].colSpan}
                      onChange={(event) => updateBlockLayout("colSpan", Number(event.target.value))}
                    >
                      {Array.from({ length: currentGrid.columns }, (_, index) => index + 1).map((span) => (
                        <option value={span} key={span}>{span} of {currentGrid.columns}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className={styles.field}>
                  <span>Row span · {activeInfo.label}</span>
                  <select
                    value={selectedBlock.layouts[activeBreakpoint].rowSpan}
                    onChange={(event) => updateBlockLayout("rowSpan", Number(event.target.value))}
                  >
                    {rowSpanOptions.map((span) => (
                      <option value={span} key={span}>{span}</option>
                    ))}
                  </select>
                </label>
              </div>

              <fieldset className={styles.tonePicker}>
                <legend>Block tone</legend>
                <div>
                  {tones.map((tone) => (
                    <button
                      type="button"
                      aria-label={tone.label}
                      aria-pressed={selectedBlock.tone === tone.id}
                      data-tone={tone.id}
                      onClick={() => updateBlock({ tone: tone.id })}
                      key={tone.id}
                    >
                      <span aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
          )}

          <div className={styles.codePanel}>
            <div className={styles.codeHeader}>
              <div>
                <span>Live Tailwind markup</span>
                <strong>{blocks.length} blocks · 6 layouts</strong>
              </div>
              <CopyOutputButton value={markup} label="Copy code" />
            </div>
            <pre><code>{markup}</code></pre>
          </div>
        </aside>
      </div>
    </div>
  );
}
