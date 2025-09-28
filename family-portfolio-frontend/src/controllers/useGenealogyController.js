import { useState, useEffect, useCallback } from 'react';
import { getFamilyMembers } from '../services/familyService';

// Controller hook: encapsulates data loading and actions for the genealogy page
export default function useGenealogyController() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    getFamilyMembers({ limit: 100 })
      .then(data => {
        if (!mounted) return;
        setMembers(data);
      })
      .catch(err => {
        console.error('Failed to load family members:', err);
        if (!mounted) return;
        setError(err.message || 'Failed to load family members');
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
    loading,
    error,
    selectedMember,
    handleSelect,
    handleCloseDrawer,
    handleEdit
  };
}
