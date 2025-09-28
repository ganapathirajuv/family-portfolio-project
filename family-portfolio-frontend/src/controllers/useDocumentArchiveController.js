import { useState, useMemo, useCallback } from 'react';

export default function useDocumentArchiveController() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printOptions, setPrintOptions] = useState({
    format: 'detailed',
    includeMetadata: true,
    includeTags: true,
    paperSize: 'A4',
    orientation: 'portrait'
  });

  const categories = useMemo(() => [
    { id: 'legal', name: 'Legal Documents', icon: '⚖️', color: 'from-red-400 to-pink-600' },
    { id: 'military', name: 'Military Records', icon: '🎖️', color: 'from-green-400 to-emerald-600' },
    { id: 'immigration', name: 'Immigration Papers', icon: '🛳️', color: 'from-blue-400 to-indigo-600' },
    { id: 'personal', name: 'Personal Letters', icon: '✉️', color: 'from-purple-400 to-violet-600' }
  ], []);

  const sampleDocuments = useMemo(() => [
    { id: 1, title: 'Birth Certificate - John Smith', category: 'legal', date: '1925-03-15', location: 'New York', description: 'Official birth certificate from New York State Department of Health', tags: ['birth', 'official', 'nyc'], fileSize: '2.3', pages: 1, type: 'PDF' },
    { id: 2, title: 'Marriage License - John & Mary', category: 'legal', date: '1952-06-20', location: 'Chicago', description: 'Marriage certificate and license documentation', tags: ['marriage', 'license', 'chicago'], fileSize: '1.8', pages: 2, type: 'PDF' },
    { id: 3, title: 'Military Discharge Papers', category: 'military', date: '1947-12-10', location: 'Washington DC', description: 'Honorable discharge from U.S. Army service', tags: ['military', 'discharge', 'army'], fileSize: '3.1', pages: 3, type: 'PDF' },
    { id: 4, title: 'Immigration Document - Ellis Island', category: 'immigration', date: '1920-05-03', location: 'New York', description: 'Ship manifest and immigration records from Ellis Island', tags: ['immigration', 'ellis-island', 'manifest'], fileSize: '4.2', pages: 2, type: 'PDF' },
    { id: 5, title: 'Letter from Grandmother', category: 'personal', date: '1960-12-25', location: 'Boston', description: 'Handwritten letter from grandmother during Christmas 1960', tags: ['personal', 'letter', 'christmas'], fileSize: '1.2', pages: 4, type: 'PDF' }
  ], []);

  const filteredDocuments = useMemo(() => {
    return selectedCategory === 'all' ? sampleDocuments : sampleDocuments.filter(doc => doc.category === selectedCategory);
  }, [selectedCategory, sampleDocuments]);

  const handlePrintDocument = useCallback((document) => {
    setSelectedDocument(document);
    setShowPrintModal(true);
  }, []);

  const handlePrintAll = useCallback(() => {
    setSelectedDocument(null);
    setShowPrintModal(true);
  }, []);

  const generatePrintContent = useCallback(() => {
    const documentsToPrint = selectedDocument ? [selectedDocument] : filteredDocuments;
    const currentDate = new Date().toLocaleDateString();

    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Family Document Archive - Print</title><style>
      @page{size:${printOptions.paperSize} ${printOptions.orientation};margin:1in}
      body{font-family:Georgia,serif;line-height:1.6;color:#333;background:white}
      .print-header{text-align:center;border-bottom:3px solid #4F46E5;padding-bottom:20px;margin-bottom:30px}
      .document-entry{page-break-inside:avoid;margin-bottom:40px;border:1px solid #E5E7EB;border-radius:8px;padding:20px;background:#FAFAFA}
      .tag{display:inline-block;background:#4F46E5;color:white;padding:4px 8px;border-radius:12px;font-size:12px;margin-right:8px;margin-bottom:5px}
      .print-footer{position:fixed;bottom:0;left:0;right:0;text-align:center;font-size:12px;color:#6B7280;border-top:1px solid #E5E7EB;padding:10px;background:white}
      @media print{.document-entry{break-inside:avoid}.print-footer{position:fixed;bottom:0}}
    </style></head><body>
      <div class="print-header"><h1>📚 Family Document Archive</h1><div class="subtitle">${selectedDocument ? 'Document Details' : 'Complete Archive Report'} • Generated on ${currentDate} • ${documentsToPrint.length} document${documentsToPrint.length !== 1 ? 's' : ''}</div></div>
      ${documentsToPrint.map(doc => `<div class="document-entry"><div class="document-title">${doc.title}</div>${printOptions.includeMetadata ? `<div class="document-meta">Date: ${doc.date} • Location: ${doc.location} • Type: ${doc.type} • Size: ${doc.fileSize} MB (${doc.pages} page${doc.pages !== 1 ? 's' : ''})</div>` : ''}${printOptions.includeTags && doc.tags ? `<div class="document-tags">${doc.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>` : ''}</div>`).join('')}
      <div class="print-footer">Family Heritage Archive • Printed ${new Date().toLocaleDateString()} • ${printOptions.format === 'detailed' ? 'Detailed Report' : 'Summary Report'}</div>
    </body></html>`;
  }, [selectedDocument, filteredDocuments, printOptions]);

  const executePrint = useCallback(() => {
    const printWindow = window.open('', '_blank');
    const printContent = generatePrintContent();
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
    };
    setShowPrintModal(false);
  }, [generatePrintContent]);

  const downloadDocumentList = useCallback(() => {
    const csvContent = [
      ['Title', 'Category', 'Date', 'Location', 'Type', 'Size', 'Pages', 'Tags'].join(','),
      ...filteredDocuments.map(doc => [
        `"${doc.title}"`, doc.category, doc.date, `"${doc.location}"`, doc.type, `${doc.fileSize} MB`, doc.pages, `"${doc.tags?.join('; ') || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `family-documents-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }, [filteredDocuments]);

  return {
    selectedCategory,
    setSelectedCategory,
    selectedDocument,
    setSelectedDocument,
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
    generatePrintContent,
    downloadDocumentList
  };
}
