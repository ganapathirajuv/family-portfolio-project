import React, { memo } from 'react';

const DocumentArchiveView = memo(function DocumentArchiveView({ theme, controller }) {
  const {
    selectedCategory,
    setSelectedCategory,
    showPrintModal,
    setShowPrintModal,
    printOptions,
    setPrintOptions,
    categories,
    sampleDocuments,
    filteredDocuments,
    handlePrintDocument,
    handlePrintAll,
    executePrint,
    downloadDocumentList
  } = controller;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Document Archive</h1>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Important family records and historical documents</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={downloadDocumentList} className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center space-x-2"><span>📊</span><span>Export CSV</span></button>
          <button onClick={handlePrintAll} className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center space-x-2"><span>🖨️</span><span>Print All</span></button>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-4 mb-12">
        <button onClick={() => setSelectedCategory('all')} className={`p-6 rounded-2xl text-center transition-all duration-200 ${selectedCategory === 'all' ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl transform scale-105' : 'bg-white hover:shadow-lg'}`}>
          <div className="text-3xl mb-3">📁</div>
          <h3 className="font-bold">All Documents</h3>
          <p className="text-sm mt-1 opacity-70">{sampleDocuments.length} total</p>
        </button>
        {categories.map((category) => (
          <button key={category.id} onClick={() => setSelectedCategory(category.id)} className={`p-6 rounded-2xl text-center transition-all duration-200 ${selectedCategory === category.id ? `bg-gradient-to-br ${category.color} text-white shadow-xl transform scale-105` : 'bg-white hover:shadow-lg'}`}>
            <div className="text-3xl mb-3">{category.icon}</div>
            <h3 className="font-bold text-sm">{category.name}</h3>
            <p className="text-xs mt-1 opacity-70">{sampleDocuments.filter(doc => doc.category === category.id).length} docs</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{selectedCategory === 'all' ? 'All Documents' : categories.find(c => c.id === selectedCategory)?.name}</h2>
            <p className="text-gray-600 mt-1">{filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} • {filteredDocuments.reduce((sum, doc) => sum + doc.pages, 0)} total pages</p>
          </div>
          {filteredDocuments.length > 0 && (
            <button onClick={handlePrintAll} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"><span>🖨️</span><span>Print Category</span></button>
          )}
        </div>

        <div className="divide-y divide-gray-200">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center mr-4"><span className="text-white text-xl">📄</span></div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">{doc.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600"><span>📅 {doc.date}</span><span>📍 {doc.location}</span><span>📎 {doc.type}</span><span>📏 {doc.pages} page{doc.pages !== 1 ? 's' : ''}</span></div>
                    {doc.description && <p className="text-sm text-gray-600 mt-2 italic">{doc.description}</p>}
                    {doc.tags && <div className="flex flex-wrap gap-2 mt-2">{doc.tags.map((tag, index) => (<span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">{tag}</span>))}</div>}
                  </div>
                </div>
                <div className="flex items-center space-x-3 ml-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${categories.find(c => c.id === doc.category)?.color || 'from-gray-400 to-gray-600'}`}>{doc.category}</span>
                  <button onClick={() => handlePrintDocument(doc)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Print Document">🖨️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Print Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Print Options</h3>
              <button onClick={() => setShowPrintModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Print Format</label>
                <select value={printOptions.format} onChange={(e) => setPrintOptions(prev => ({ ...prev, format: e.target.value }))} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="detailed">Detailed Report</option>
                  <option value="summary">Summary Report</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Paper Size</label>
                <select value={printOptions.paperSize} onChange={(e) => setPrintOptions(prev => ({ ...prev, paperSize: e.target.value }))} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="A4">A4</option>
                  <option value="Letter">Letter</option>
                  <option value="Legal">Legal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Orientation</label>
                <select value={printOptions.orientation} onChange={(e) => setPrintOptions(prev => ({ ...prev, orientation: e.target.value }))} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center"><input type="checkbox" checked={printOptions.includeMetadata} onChange={(e) => setPrintOptions(prev => ({ ...prev, includeMetadata: e.target.checked }))} className="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" /> <span className="text-sm text-gray-700">Include metadata (date, location, etc.)</span></label>
                <label className="flex items-center"><input type="checkbox" checked={printOptions.includeTags} onChange={(e) => setPrintOptions(prev => ({ ...prev, includeTags: e.target.checked }))} className="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" /> <span className="text-sm text-gray-700">Include tags</span></label>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button onClick={() => setShowPrintModal(false)} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={executePrint} className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"> <span>🖨️</span> <span>Print</span></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default DocumentArchiveView;
