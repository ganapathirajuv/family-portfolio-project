import React, { useState, useCallback, useMemo } from 'react';

// Traditional family tree with proper hierarchical representation
export default function GenealogyTree({ treeData = [], members = [], onSelect = () => {} }) {
  const [expanded, setExpanded] = useState(() => new Set(['all'])); // Start with tree expanded

  const toggle = useCallback((key) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  // Helper function to count total descendants
  const countDescendants = useCallback((node) => {
    let count = 1; // Count the node itself
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        count += countDescendants(child);
      });
    }
    return count;
  }, []);

  // Use treeData if provided (proper hierarchical structure from /tree endpoint)
  // Otherwise fall back to building tree from flat members list
  const displayData = useMemo(() => {
    if (treeData && treeData.length > 0) {
      return { treeRoots: treeData, hasParentLinks: true, useHierarchical: true };
    }

    // Fallback: build tree from flat members list
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

      return { treeRoots: syntheticRoots, hasParentLinks: false, useHierarchical: false };
    }

    return { treeRoots: roots, hasParentLinks: true, useHierarchical: false };
  }, [treeData, members]);
  // Early return if no data
  if ((!treeData || treeData.length === 0) && (!members || members.length === 0)) {
    return <div className="p-6 text-center text-gray-500">No family members to display</div>;
  }

  // Render family member card
  function renderMemberCard(node, isRoot = false) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(node)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(node); }}
        className={`
          relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
          ${isRoot 
            ? 'bg-gradient-to-br from-blue-50 to-indigo-100 border-indigo-300 shadow-lg hover:shadow-xl' 
            : 'bg-white border-gray-200 shadow-md hover:shadow-lg hover:border-indigo-200'
          }
          min-w-[200px] max-w-[250px]
        `}
      >
        <div className="flex items-center gap-3">
          {node.photoUrl && (
            <img 
              src={node.photoUrl} 
              alt={node.fullName} 
              className="w-14 h-14 object-cover rounded-full border-2 border-white shadow-sm" 
            />
          )}
          <div className="flex-1 min-w-0">
            <div className={`font-bold truncate ${isRoot ? 'text-indigo-900 text-lg' : 'text-gray-800'}`}>
              {node.fullName}
            </div>
            <div className="text-xs text-gray-600">
              {node.birthDate && node.deathDate ? `${node.birthDate} - ${node.deathDate}` : 
               node.birthDate ? `Born ${node.birthDate}` : 
               node.deathDate ? `Died ${node.deathDate}` : '—'}
            </div>
            {node.occupation && (
              <div className="text-xs text-indigo-600 mt-1 font-medium">{node.occupation}</div>
            )}
          </div>
        </div>
        {node.biography && (
          <div className="mt-3 text-sm text-gray-600 line-clamp-2 border-t border-gray-100 pt-2">
            {node.biography}
          </div>
        )}
      </div>
    );
  }

  // Render hierarchical tree structure
  function renderTreeNode(node, depth = 0, isRoot = false) {
    const isExpanded = expanded.has(node.id) || expanded.has('all');
    const hasChildren = node.children && node.children.length > 0;
    
    return (
      <div key={node.id} className="flex flex-col items-center">
        {/* Member Card */}
        {renderMemberCard(node, isRoot)}
        
        {/* Children Section */}
        {hasChildren && isExpanded && (
          <div className="mt-8 flex flex-col items-center">
            {/* Vertical connector from parent */}
            <div className="w-px h-6 bg-gradient-to-b from-indigo-300 to-gray-300"></div>
            
            {/* Horizontal line connecting to children */}
            {node.children.length > 1 && (
              <div className="relative w-full max-w-4xl">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-3/4"></div>
                {/* Vertical connectors to each child */}
                <div className="flex justify-center">
                  {node.children.map((_, index) => {
                    const childCount = node.children.length;
                    const spacing = 100 / (childCount + 1);
                    const leftPos = (index + 1) * spacing;
                    return (
                      <div
                        key={index}
                        className="absolute w-px h-6 bg-gray-300"
                        style={{ left: `${leftPos}%` }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Single child vertical connector */}
            {node.children.length === 1 && (
              <div className="w-px h-6 bg-gray-300"></div>
            )}
            
            {/* Children in horizontal layout */}
            <div className="flex flex-wrap justify-center gap-8 mt-6">
              {node.children.map((child) => (
                <div key={child.id} className="flex flex-col items-center">
                  {renderTreeNode(child, depth + 1, false)}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Expand/Collapse Button */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggle(node.id);
            }}
            className="mt-4 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors shadow-sm"
            aria-expanded={isExpanded}
          >
            {isExpanded ? '−' : '+'}
          </button>
        )}
      </div>
    );
  }



  const { treeRoots, hasParentLinks, useHierarchical } = displayData;

  // Use hierarchical layout for proper tree data
  if (useHierarchical || hasParentLinks) {
    return (
      <div className="w-full overflow-x-auto py-8">
        <div className="min-w-fit flex flex-col items-center space-y-12">
          {/* Global toggle button */}
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => toggle('all')}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
            >
              {expanded.has('all') ? 'Collapse All' : 'Expand All'}
            </button>
            <div className="text-sm text-gray-600">
              {treeRoots.length} family {treeRoots.length === 1 ? 'tree' : 'trees'}
            </div>
          </div>
          
          {/* Family Trees */}
          {treeRoots.map((root, index) => (
            <div key={root.id} className="w-full flex flex-col items-center">
              {index > 0 && <div className="w-full h-px bg-gray-200 my-8"></div>}
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8 shadow-lg border border-slate-200 min-w-fit">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-1">
                    {root.fullName ? `${root.fullName} Family Tree` : 'Family Tree'}
                  </h3>
                  <div className="text-sm text-slate-600">
                    Generation {index + 1} • {countDescendants(root)} total members
                  </div>
                </div>
                {renderTreeNode(root, 0, true)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Fallback to last-name grouping for flat data without parent relationships
  const groups = {};
  members.forEach(m => {
    const key = (m.lastName || 'Unknown').trim() || 'Unknown';
    if (!groups[key]) groups[key] = [];
    groups[key].push(m);
  });

  return (
    <div className="w-full overflow-x-auto py-8">
      <div className="min-w-fit flex flex-col items-center space-y-8">
        <div className="text-center">
          <h3 className="text-xl font-bold text-slate-800 mb-2">Family Members</h3>
          <div className="text-sm text-slate-600">Grouped by family name</div>
        </div>
        
        {Object.keys(groups).map((key) => {
          const children = groups[key];
          const isExpanded = expanded.has(key) || expanded.has('all');

          return (
            <div key={key} className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 shadow-lg border border-slate-200">
              <div className="flex items-center justify-center gap-4 mb-6">
                <button
                  onClick={() => toggle(key)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
                  aria-expanded={isExpanded}
                >
                  {isExpanded ? '−' : '+'}
                </button>
                <div className="text-center">
                  <div className="font-bold text-lg text-slate-800">
                    {key === 'Unknown' ? 'Unknown Family' : `${key} Family`}
                  </div>
                  <div className="text-sm text-slate-600">
                    {children.length} member{children.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="flex flex-wrap justify-center gap-6">
                  {children.map(child => (
                    <div key={child.id} className="flex flex-col items-center">
                      {renderMemberCard(child, false)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
