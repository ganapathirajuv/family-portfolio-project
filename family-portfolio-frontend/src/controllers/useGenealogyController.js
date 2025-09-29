import { useState, useEffect, useCallback } from 'react';
import { getFamilyMembers, getFamilyTree } from '../services/familyService';

// Controller hook: encapsulates data loading and actions for the genealogy page
export default function useGenealogyController() {
  const [members, setMembers] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    // Try to load tree data first, fall back to flat members list
    getFamilyTree()
      .then(data => {
        if (!mounted) return;
        setTreeData(data);
        
        // Also get flat members list for count and fallback
        return getFamilyMembers({ limit: 100 });
      })
      .then(membersData => {
        if (!mounted) return;
        setMembers(membersData);
      })
      .catch(err => {
        console.error('Failed to load family data:', err);
        if (!mounted) return;
        
        // If tree loading fails, try to load flat members list as fallback
        getFamilyMembers({ limit: 100 })
          .then(data => {
            if (!mounted) return;
            setMembers(data);
            setTreeData([]); // Clear tree data to use flat fallback
          })
          .catch(fallbackErr => {
            console.error('Failed to load family members as fallback:', fallbackErr);
            if (!mounted) return;
            setError(fallbackErr.message || 'Failed to load family data');
          })
          .finally(() => {
            if (!mounted) return;
            setLoading(false);
          });
        return; // Skip the outer finally
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  const handleSelect = useCallback((member) => {
    setSelectedMember(member);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setSelectedMember(null);
  }, []);

  const handleEdit = useCallback((member, navigateFn) => {
    // If a navigate function is provided, use it; otherwise consumer can dispatch
    if (typeof navigateFn === 'function') navigateFn(member?.id);
  }, []);

  return {
    members,
    treeData,
    loading,
    error,
    selectedMember,
    handleSelect,
    handleCloseDrawer,
    handleEdit
  };
}
