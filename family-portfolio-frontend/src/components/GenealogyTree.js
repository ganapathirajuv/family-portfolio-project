import React, { useState, useCallback, useMemo } from 'react';

// Tree-style layout: group labels act as parent nodes, children are rendered
// horizontally under each parent with simple connectors to suggest branches.
export default function GenealogyTree({ members = [], onSelect = () => {} }) {
  const [expanded, setExpanded] = useState(() => new Set());

  const toggle = useCallback((key) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  // Build a lookup map by id and attach children for parentId relationships
  const { treeRoots, hasParentLinks } = useMemo(() => {
    const byId = new Map();
    members.forEach(m => byId.set(m.id, { ...m, children: [] }));

    let hasLinks = false;
    const roots = [];

    byId.forEach(node => {
      const pid = node.parentId ?? null;
      if (pid && byId.has(pid)) {
        hasLinks = true;
        byId.get(pid).children.push(node);
      } else {
        roots.push(node);
      }
    });

    // If no explicit parent links exist, group by lastName and create synthetic roots
    if (!hasLinks) {
      const groups = {};
      byId.forEach(node => {
        const key = (node.lastName || 'Unknown').trim() || 'Unknown';
        if (!groups[key]) groups[key] = [];
        groups[key].push(node);
      });

      const syntheticRoots = Object.keys(groups).map((key, idx) => ({
        id: `group-${idx}-${key}`,
        fullName: key === 'Unknown' ? 'Unknown / Single name' : key,
        photoUrl: null,
        birthDate: null,
        biography: null,
        children: groups[key]
      }));

      return { treeRoots: syntheticRoots, hasParentLinks: false };
    }

    return { treeRoots: roots, hasParentLinks: true };
  }, [members]);
  // (no early return before hooks) — now safe to short-circuit after hooks
  if (!members || members.length === 0) {
    return <div className="p-6 text-center text-gray-500">No family members to display</div>;
  }

  function renderNode(node, depth = 0) {
    const isExpanded = expanded.has(node.id);
    // Parent card centered above children row
    return (
      <div key={node.id} className="w-full">
        <div className={`flex justify-center ${depth > 0 ? 'mt-6' : 'mt-2'}`}>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => toggle(node.id)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
              aria-expanded={isExpanded}
            >
              {isExpanded ? '−' : (node.children && node.children.length ? '+' : '•')}
            </button>

            <div
              role="button"
              tabIndex={0}
              onClick={() => onSelect(node)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(node); }}
              className="min-w-[12rem] max-w-xs p-3 rounded-lg border bg-white/90 shadow-sm cursor-pointer text-left"
            >
              <div className="flex items-start gap-3">
                {node.photoUrl && (
                  <img src={node.photoUrl} alt={node.fullName} className="w-12 h-12 object-cover rounded-md" />
                )}
                <div>
                  <div className="font-semibold">{node.fullName}</div>
                  <div className="text-xs text-gray-500">{node.birthDate || '—'}</div>
                </div>
              </div>
              {node.biography && <div className="mt-2 text-sm text-gray-600 line-clamp-3">{node.biography}</div>}
            </div>
          </div>
        </div>

        {/* children connectors and row */}
        {node.children && node.children.length > 0 && isExpanded && (
          <div className="w-full flex flex-col items-center">
            <div className="relative w-full flex justify-center mt-2">
              {/* connector area: vertical from parent to horizontal, horizontal line, and verticals to children */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-4 bg-gray-300" />
              <div className="absolute top-4 left-0 right-0 flex justify-center">
                <div className="relative w-full max-w-[80%] h-px bg-gray-300">
                  {/* per-child vertical connectors positioned by index */}
                  {node.children.map((child, idx) => (
                    <div
                      key={child.id}
                      style={{ left: `${(idx + 0.5) * (100 / node.children.length)}%` }}
                      className="absolute -top-3 w-px h-3 bg-gray-300 transform -translate-x-1/2"
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-6 flex-wrap">
              {node.children.map(child => (
                <div key={child.id} className="flex flex-col items-center">
                  {renderNode(child, depth + 1)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // If no parent links exist, fall back to last-name grouping (previous behavior)
  if (!hasParentLinks) {
    const groups = {};
    members.forEach(m => {
      const key = (m.lastName || 'Unknown').trim() || 'Unknown';
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    });

    return (
      <div className="space-y-6">
        {Object.keys(groups).map((key) => {
          const children = groups[key];
          const isExpanded = expanded.has(key);

          return (
            <div key={key} className="bg-transparent p-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => toggle(key)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                  aria-expanded={isExpanded}
                >
                  {isExpanded ? '−' : '+'}
                </button>

                <div>
                  <div className="font-bold text-lg">{key === 'Unknown' ? 'Unknown / Single name' : key}</div>
                  <div className="text-sm text-gray-500">{children.length} member{children.length !== 1 ? 's' : ''}</div>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4">
                  <div className="relative">
                    {/* vertical connector */}
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />

                    <div className="flex gap-4 pt-6 overflow-auto">
                      {children.map(child => (
                        <div
                          key={child.id}
                          className="relative cursor-pointer"
                          role="button"
                          tabIndex={0}
                          onClick={() => onSelect(child)}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(child); }}
                        >
                          {/* horizontal connector */}
                          <div className="absolute -top-6 left-6 h-px w-6 bg-gray-200" />

                          <div className="w-64 p-4 rounded-lg border bg-white/80 shadow-sm">
                            <div className="flex items-start gap-3">
                              {child.photoUrl && (
                                <img src={child.photoUrl} alt={child.fullName} className="w-12 h-12 object-cover rounded-md" />
                              )}
                              <div>
                                <div className="font-semibold">{child.fullName}</div>
                                <div className="text-xs text-gray-500">{child.birthDate || '—'}</div>
                              </div>
                            </div>
                            {child.biography && <div className="mt-2 text-sm text-gray-600">{child.biography}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {treeRoots.map(root => renderNode(root))}
    </div>
  );
}
