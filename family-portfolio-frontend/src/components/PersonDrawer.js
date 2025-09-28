import React from 'react';

export default function PersonDrawer({ member, onClose = () => {}, onEdit = () => {} }) {
  if (!member) return null;

  return (
    <aside
      aria-labelledby="person-drawer-title"
      className="fixed right-0 top-0 h-screen w-80 bg-white shadow-2xl p-5 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 id="person-drawer-title" className="text-lg font-semibold">{member.fullName}</h3>
          <p className="text-sm text-gray-500">{member.birthDate ?? '—'}</p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onClose} className="text-sm text-gray-600 hover:text-gray-900">Close</button>
          <button onClick={() => onEdit(member)} className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700">Edit</button>
        </div>
      </div>

      {member.photoUrl && (
        <div className="mb-4">
          <img src={member.photoUrl} alt={member.fullName} className="w-full h-44 object-cover rounded-lg" />
        </div>
      )}

      <div className="text-sm text-gray-700 space-y-3">
        <div><span className="font-medium">Born:</span> {member.birthDate ?? 'Unknown'}</div>
        {member.deathDate && <div><span className="font-medium">Died:</span> {member.deathDate}</div>}
        <div><span className="font-medium">Location:</span> {member.birthLocation || 'Unknown'}</div>
        <div><span className="font-medium">Occupation:</span> {member.occupation || '—'}</div>
        <div>
          <div className="font-medium mt-2">Bio:</div>
          <p className="whitespace-pre-wrap text-gray-600">{member.biography || 'No biography provided.'}</p>
        </div>
      </div>
    </aside>
  );
}
