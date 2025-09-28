import React, { memo } from 'react';
import GenealogyTree from '../components/GenealogyTree';
import PersonDrawer from '../components/PersonDrawer';

const GenealogyView = memo(function GenealogyView({ theme, members, loading, error, selectedMember, onSelect, onCloseDrawer, onEdit }) {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className={`rounded-3xl p-8 ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/70'} backdrop-blur-sm border ${theme === 'dark' ? 'border-gray-700/50' : 'border-white/60'} shadow-2xl`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Interactive Family Tree</h2>
            <p className={`text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Members: {members.length}</p>
          </div>
          <div className="text-6xl">🌳</div>
        </div>

        {loading && <div className="py-8 text-center">Loading family members...</div>}
        {error && <div className="py-8 text-center text-red-500">{error}</div>}

        {!loading && !error && (
          <div>
            <GenealogyTree members={members} onSelect={onSelect} />
          </div>
        )}
      </div>

      <PersonDrawer member={selectedMember} onClose={onCloseDrawer} onEdit={onEdit} />
    </div>
  );
});

export default GenealogyView;
