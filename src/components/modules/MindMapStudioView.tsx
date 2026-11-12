"use client";

import React, { useRef, useState } from "react";
import { ZoomIn, ZoomOut, Plus, Download, Sparkles, ChevronDown, ChevronRight } from "lucide-react";
import { INITIAL_MIND_MAPS, type MindMapNodeData } from "@/data/bams-ecosystem-data";

export function MindMapStudioView() {
  const [tree, setTree] = useState<MindMapNodeData>(INITIAL_MIND_MAPS.tridosha);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("mm-root");
  const [collapsedIds, setCollapsedIds] = useState<Record<string, boolean>>({});
  const [zoom, setZoom] = useState(1);
  const [newNodeLabel, setNewNodeLabel] = useState("");
  const [aiTopic, setAiTopic] = useState("Sapta Dhatu");
  const [aiLoading, setAiLoading] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const toggleCollapse = (id: string) => {
    setCollapsedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const addChildNode = (parentId: string, label: string) => {
    if (!label.trim()) return;
    const insert = (node: MindMapNodeData): MindMapNodeData => {
      if (node.id === parentId) {
        return {
          ...node,
          children: [
            ...(node.children || []),
            {
              id: `mm-custom-${Date.now()}`,
              label: label.trim(),
              description: "Custom student branch",
              color: "#27C68B",
            },
          ],
        };
      }
      return {
        ...node,
        children: node.children?.map(insert),
      };
    };
    setTree((prev) => insert(prev));
    setNewNodeLabel("");
  };

  const handleAiMindMap = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "mindmap",
          prompt: `Generate a structured BAMS mind map JSON for the topic: ${aiTopic}.`,
        }),
      });
      const data = await res.json();
      if (data.configured && data.text) {
        setTree(JSON.parse(data.text));
      }
    } catch {
      // keep existing tree if API key not configured
    } finally {
      setAiLoading(false);
    }
  };

  const exportSvg = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgRef.current);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tree.label.toLowerCase().replace(/\s+/g, "-")}-mindmap.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const branches = collapsedIds[tree.id] ? [] : tree.children || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Interactive Mind Map Studio</h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Expand/collapse Ayurvedic concepts, zoom, edit branches, or generate new maps with Gemini.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
            placeholder="Topic (e.g., Agni, Srotas)"
            className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-1.5 text-xs"
          />
          <button
            onClick={handleAiMindMap}
            disabled={aiLoading}
            className="flex items-center gap-1.5 rounded-xl bg-[var(--accent-primary)] px-3.5 py-1.5 text-xs font-semibold text-[#080E0C]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {aiLoading ? "Generating..." : "AI Mind Map"}
          </button>
          <button
            onClick={exportSvg}
            className="flex items-center gap-1 rounded-xl border border-[var(--border-subtle)] px-3 py-1.5 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Interactive SVG Graph Canvas */}
        <div className="card-surface relative overflow-hidden rounded-3xl p-4 lg:col-span-8">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--accent-gold)]">
              {tree.label} {tree.sanskritTerm ? `(${tree.sanskritTerm})` : ""}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
                className="rounded-lg p-1.5 hover:bg-white/5"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                onClick={() => setZoom((z) => Math.min(1.6, z + 0.15))}
                className="rounded-lg p-1.5 hover:bg-white/5"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="h-[440px] w-full overflow-auto rounded-2xl bg-[var(--bg-secondary)]">
            <svg
              ref={svgRef}
              width={760 * zoom}
              height={460 * zoom}
              viewBox="0 0 760 460"
              className="mx-auto"
            >
              {/* Root Node */}
              <g
                onClick={() => setSelectedNodeId(tree.id)}
                className="cursor-pointer"
              >
                <rect
                  x={30}
                  y={195}
                  width={175}
                  height={64}
                  rx={16}
                  fill="#15231D"
                  stroke={tree.color}
                  strokeWidth={2.5}
                />
                <text x={117} y={222} textAnchor="middle" fill="#F4F7F4" fontSize="13" fontWeight="700">
                  {tree.label}
                </text>
                {tree.sanskritTerm && (
                  <text x={117} y={242} textAnchor="middle" fill="#D6B66F" fontSize="11">
                    {tree.sanskritTerm}
                  </text>
                )}
              </g>

              {/* Branches */}
              {branches.map((branch, bIdx) => {
                const y = 70 + bIdx * 150;
                const isCollapsed = collapsedIds[branch.id];
                const subNodes = isCollapsed ? [] : branch.children || [];
                return (
                  <g key={branch.id}>
                    <path
                      d={`M 205 227 C 250 227, 240 ${y + 24}, 280 ${y + 24}`}
                      fill="none"
                      stroke={branch.color}
                      strokeWidth={2}
                      strokeOpacity={0.7}
                    />
                    <g
                      onClick={() => {
                        setSelectedNodeId(branch.id);
                        toggleCollapse(branch.id);
                      }}
                      className="cursor-pointer"
                    >
                      <rect
                        x={280}
                        y={y}
                        width={175}
                        height={50}
                        rx={14}
                        fill="#15231D"
                        stroke={branch.color}
                        strokeWidth={2}
                      />
                      <text x={367} y={y + 22} textAnchor="middle" fill="#F4F7F4" fontSize="12" fontWeight="600">
                        {branch.label}
                      </text>
                      <text x={367} y={y + 39} textAnchor="middle" fill="#9BAAA2" fontSize="9.5">
                        {branch.sanskritTerm || "Click to toggle"}
                      </text>
                    </g>

                    {subNodes.map((leaf, lIdx) => {
                      const ly = y - 35 + lIdx * 30;
                      return (
                        <g key={leaf.id} onClick={() => setSelectedNodeId(leaf.id)} className="cursor-pointer">
                          <path
                            d={`M 455 ${y + 25} C 490 ${y + 25}, 490 ${ly + 12}, 520 ${ly + 12}`}
                            fill="none"
                            stroke={leaf.color}
                            strokeWidth={1.5}
                            strokeOpacity={0.6}
                          />
                          <rect
                            x={520}
                            y={ly}
                            width={215}
                            height={24}
                            rx={8}
                            fill="#080E0C"
                            stroke={leaf.color}
                            strokeWidth={1.2}
                          />
                          <text x={530} y={ly + 15} fill="#F4F7F4" fontSize="10.5">
                            {leaf.label}: {leaf.description.slice(0, 26)}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Node Inspector & Editor */}
        <div className="card-surface space-y-4 rounded-3xl p-5 lg:col-span-4">
          <h2 className="text-sm font-semibold">Branch Editor & Hierarchy</h2>
          <div className="flex gap-2">
            <input
              value={newNodeLabel}
              onChange={(e) => setNewNodeLabel(e.target.value)}
              placeholder="New sub-concept..."
              className="flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-xs"
            />
            <button
              onClick={() => addChildNode(selectedNodeId, newNodeLabel)}
              className="flex items-center gap-1 rounded-xl bg-[var(--accent-primary)] px-3 py-2 text-xs font-semibold text-[#080E0C]"
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <button
              onClick={() => toggleCollapse(tree.id)}
              className="flex w-full items-center gap-2 rounded-xl bg-[var(--bg-secondary)] px-3 py-2 font-semibold"
            >
              {collapsedIds[tree.id] ? (
                <ChevronRight className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
              {tree.label}
            </button>
            {(tree.children || []).map((b) => (
              <div key={b.id} className="ml-3 rounded-xl border border-[var(--border-subtle)] p-2.5">
                <p className="font-semibold" style={{ color: b.color }}>
                  {b.label}
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
                  {b.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
