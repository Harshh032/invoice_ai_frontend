import React, { useState } from 'react';
import { Eye } from 'lucide-react';

interface InvoiceValidationTableProps {
  invoices: any[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  setSelectedInvoice: (inv: any) => void;
  setShowPreviewModal: (show: boolean) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
}

const InvoiceValidationTable: React.FC<InvoiceValidationTableProps> = ({
  invoices,
  loading,
  error,
  searchQuery,
  setSearchQuery,
  setSelectedInvoice,
  setShowPreviewModal,
  selectedStatus,
  setSelectedStatus,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(filteredInvoices.map((inv: any) => inv.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const getStatusProgress = (status: string): number => {
    switch (status) {
      case 'Approved':
        return 100;
      case 'Needs Review':
        return 50;
      case 'Pending':
        return 25;
      case 'Error':
        return 10;
      default:
        return 0;
    }
  };

  // Filtered invoices for select all
  const filteredInvoices = invoices
    .filter(invoice => {
      if (selectedStatus === 'All') return true;
      if (selectedStatus === 'Review') return invoice.status === 'Needs Review';
      if (selectedStatus === 'Approved') return invoice.status === 'Approved';
      return true;
    })
    .filter((invoice) =>
      invoice.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.po_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (invoice.vendor_info?.Name || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const statusOrder = {
        Approved: 1,
        'Needs Review': 2,
        Pending: 2,
        Loading: 3,
        'In Progress': 3,
        Error: 4,
      };
      return (statusOrder[a.status as keyof typeof statusOrder] || 5) - (statusOrder[b.status as keyof typeof statusOrder] || 5);
    });

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Invoice Processing</h2>
          <div></div>
        </div>
        {/* Status Filter Options */}
        <div className="flex space-x-4 mb-4">
          {['All', 'Review', 'Approved'].map(option => (
            <button
              key={option}
              className={`text-lg font-semibold text-black cursor-pointer focus:outline-none transition-colors duration-150 ${selectedStatus === option ? 'underline' : ''}`}
              style={{ background: 'none', border: 'none', borderRadius: 0, padding: 0 }}
              onClick={() => setSelectedStatus(option)}
            >
              {option}
            </button>
          ))}
        </div>
        <hr className="border-b border-gray-200 mb-4" />
        {/* Search and Filter Row */}
        <div className="flex flex-wrap items-center gap-4 mb-6 justify-start">
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
          />
          <select className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-200 focus:border-blue-400">
            <option value="" className="font-bold text-black">Period</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="custom">Custom</option>
          </select>
          <select className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-200 focus:border-blue-400">
            <option value="" className="font-bold text-black">Vendor</option>
            <option value="vendor1">Vendor 1</option>
            <option value="vendor2">Vendor 2</option>
          </select>
          <select className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-200 focus:border-blue-400">
            <option value="" className="font-bold text-black">Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="needs_review">Needs Review</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-600 font-medium">Loading invoices...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 font-medium">{error}</div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-4">
                  <input
                    type="checkbox"
                    className="h-5 w-5"
                    checked={selectedRows.length === filteredInvoices.length && filteredInvoices.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vendor</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredInvoices
                .map((invoice) => {
                  let pdfName = invoice.pdf_path ? invoice.pdf_path.split('/').pop() : '';
                  pdfName = decodeURIComponent(pdfName || '');
                  let formattedPdfName = pdfName;
                  if (pdfName) {
                    const match = pdfName.match(/^(.*?_\d+)(?:_|\.).*?\.pdf$/i);
                    if (match) {
                      formattedPdfName = match[1] + '.PDF';
                    } else {
                      formattedPdfName = pdfName.replace(/\.pdf$/i, '.PDF');
                    }
                  }
                  const shortPdfName = formattedPdfName.split('_')[0];
                  let date = invoice.uploaded_at ? new Date(invoice.uploaded_at).toISOString().slice(0, 10) : '';

                  const progress = getStatusProgress(invoice.status);

                  return (
                    <tr key={invoice.id} className="hover:bg-gray-50 cursor-pointer transition-all duration-200" onClick={() => setSelectedInvoice(invoice)}>
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          className="h-5 w-5"
                          checked={selectedRows.includes(invoice.id)}
                          onChange={e => {
                            e.stopPropagation();
                            handleSelectRow(invoice.id);
                          }}
                          onClick={e => e.stopPropagation()}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span className="cursor-pointer" title={formattedPdfName}>{shortPdfName}</span>
                      </td>
                      <td className="px-6 py-4">{date}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{invoice.vendor_info?.Name}</div>
                        <div className="text-xs text-gray-500">{invoice.vendor_info?.Address}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                progress === 100
                                  ? 'bg-green-500'
                                  : progress >= 50
                                  ? 'bg-yellow-500'
                                  : progress >= 25
                                  ? 'bg-blue-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-600 font-medium">
                            {invoice.status}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 font-medium px-3 py-1 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInvoice(invoice);
                            setShowPreviewModal(true);
                          }}
                          disabled={!invoice.pdf_path}
                          type="button"
                        >
                          <Eye size={16} />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default InvoiceValidationTable;