import React, { useState, useEffect } from 'react';
import { Upload, FileText, User as UserIcon, Calendar, DollarSign, CheckCircle, AlertCircle, Clock, Settings, LogOut, Search, Filter, Download, Eye, Edit3, Trash2, Plus, Menu, X } from 'lucide-react';
import { Invoice, User } from './types';
import { getStatusColor, getPriorityColor, getStatusIcon } from './utils';
import profileImage from "C:/Users/Vinayak/Desktop/profile_image.jpg";
import logo from "C:/Users/Vinayak/Pictures/Screenshots/Screenshot (50).png";
import InvoiceValidationTable from './InvoiceValidationTable';
import UserProfile from './UserProfile';

const BASE_API_URL = 'https://dcm8mspr-8000.inc1.devtunnels.ms';

function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [validationInvoices, setValidationInvoices] = useState<any[]>([]);
  const [validationLoading, setValidationLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [invoiceCount, setInvoiceCount] = useState<number | null>(null);
  const [invoiceCountLoading, setInvoiceCountLoading] = useState(false);
  const [invoiceCountError, setInvoiceCountError] = useState<string | null>(null);
  const [approvedCount, setApprovedCount] = useState<number | null>(null);
  const [approvedCountLoading, setApprovedCountLoading] = useState(false);
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [pendingCountLoading, setPendingCountLoading] = useState(false);
  const [errorCount, setErrorCount] = useState<number | null>(null);
  const [errorCountLoading, setErrorCountLoading] = useState(false);
  const statusOptions = ['Pending', 'Needs Review', 'Approved', 'Error'];
  const [statusUpdating, setStatusUpdating] = useState<{[pdfPath: string]: boolean}>({});
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [profileHover, setProfileHover] = useState(false);

  const user: User = {
    name: 'Sarah Johnson',
    avatar: profileImage,
    role: 'Finance Manager'
  };

  const invoices: Invoice[] = [
    {
      id: 'INV-2024-001',
      vendor: 'Tech Solutions Inc.',
      amount: '$1,250.00',
      date: '2024-01-15',
      status: 'Ready',
      category: 'Software',
      priority: 'High'
    },
    {
      id: 'INV-2024-002',
      vendor: 'Office Supplies Co.',
      amount: '$375.40',
      date: '2024-01-16',
      status: 'Needs Review',
      category: 'Office',
      priority: 'Medium'
    },
    {
      id: 'INV-2024-003',
      vendor: 'Marketing Agency Ltd.',
      amount: '$2,500.00',
      date: '2024-01-17',
      status: 'Ready',
      category: 'Marketing',
      priority: 'High'
    },
    {
      id: 'INV-2024-004',
      vendor: 'Software Dev LLC',
      amount: '$890.75',
      date: '2024-01-18',
      status: 'Error',
      category: 'Development',
      priority: 'Low'
    },
    {
      id: 'INV-2024-005',
      vendor: 'Consulting Group',
      amount: '$1,500.00',
      date: '2024-01-19',
      status: 'Ready',
      category: 'Consulting',
      priority: 'Medium'
    }
  ];

  const navItems = ['Dashboard'];

  useEffect(() => {
    if (activeTab === 'Validation Queue' || activeTab === 'Dashboard') {
      setValidationLoading(true);
      setValidationError(null);
      fetchJson(`${BASE_API_URL}/api/v1/invoices`)
        .then((data) => {
          setValidationInvoices(data);
        })
        .catch((err) => {
          setValidationError(err.message || 'Unknown error');
        })
        .finally(() => setValidationLoading(false));
    }
  }, [activeTab]);

  useEffect(() => {
    setInvoiceCountLoading(true);
    setInvoiceCountError(null);
    fetchJson(`${BASE_API_URL}/api/v1/invoices/count`)
      .then((data) => {
        setInvoiceCount(data.count);
      })
      .catch((err) => {
        setInvoiceCountError(err.message || 'Unknown error');
        setInvoiceCount(0);
      })
      .finally(() => setInvoiceCountLoading(false));
  }, []);

  useEffect(() => {
    setApprovedCountLoading(true);
    fetchJson(`${BASE_API_URL}/api/v1/invoices/count/approved`)
      .then((data) => setApprovedCount(data.count))
      .catch(() => setApprovedCount(0))
      .finally(() => setApprovedCountLoading(false));

    setPendingCountLoading(true);
    fetchJson(`${BASE_API_URL}/api/v1/invoices/count/pending`)
      .then((data) => setPendingCount(data.count))
      .catch(() => setPendingCount(0))
      .finally(() => setPendingCountLoading(false));

    setErrorCountLoading(true);
    fetchJson(`${BASE_API_URL}/api/v1/invoices/count/error`)
      .then((data) => setErrorCount(data.count))
      .catch(() => setErrorCount(0))
      .finally(() => setErrorCountLoading(false));
  }, []);

  useEffect(() => {
    if (showPreviewModal && selectedInvoice && (!selectedInvoice.items || selectedInvoice.items.length === 0)) {
      setSelectedInvoice({
        ...selectedInvoice,
        items: [
          { name: '', quantity: '', value: '' },
          { name: '', quantity: '', value: '' },
          { name: '', quantity: '', value: '' },
        ],
      });
    }
    // Only run when modal opens
    // eslint-disable-next-line
  }, [showPreviewModal]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    setUploadResult(null);
    const file = files[0]; // Only handle the first file for now
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch(`${BASE_API_URL}/api/v1/invoices/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to upload file');
      }
      const data = await response.json();
      setUploadResult(data);
    } catch (error: any) {
      setUploadError(error.message || 'Unknown error');
    } finally {
      setUploading(false);
    }
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-black to-gray-800 rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white mb-1">Total Invoices</p>
              <p className="text-3xl font-bold text-white">
                {invoiceCountLoading ? '...' : invoiceCount !== null ? invoiceCount : 0}
              </p>
            </div>
            <div className="bg-black rounded-xl p-3">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-black to-gray-700 rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white mb-1">Approved</p>
              <p className="text-3xl font-bold text-white">
                {approvedCountLoading ? '...' : approvedCount !== null ? approvedCount : 0}
              </p>
            </div>
            <div className="bg-gray-800 rounded-xl p-3">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-black to-gray-600 rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white mb-1">Pending Review</p>
              <p className="text-3xl font-bold text-white">
                {pendingCountLoading ? '...' : pendingCount !== null ? pendingCount : 0}
              </p>
            </div>
            <div className="bg-gray-700 rounded-xl p-3">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-black to-gray-900 rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white mb-1">Errors</p>
              <p className="text-3xl font-bold text-white">
                {errorCountLoading ? '...' : errorCount !== null ? errorCount : 0}
              </p>
            </div>
            <div className="bg-gray-900 rounded-xl p-3">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Invoice</h2>
            <p className="text-gray-600">Drag and drop your PDF files or click to browse</p>
          </div>
          <div className="bg-gradient-to-r from-black to-gray-800 rounded-2xl p-4">
            <Upload className="h-8 w-8 text-white" />
          </div>
        </div>
        <div
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
            dragActive
              ? 'border-gray-800 bg-gray-50 scale-105'
              : 'border-gray-300 hover:border-gray-800 hover:bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-black to-gray-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
              <Upload className="h-10 w-10 text-gray-600" />
            </div>
            <div className="space-y-2">
              <p className="text-xl font-semibold text-gray-900">
                Drop your PDF files here, or{' '}
                <label className="text-gray-600 hover:text-gray-700 cursor-pointer underline underline-offset-2 transition-colors">
                  browse
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    multiple
                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                  />
                </label>
              </p>
              <p className="text-gray-500">
                Supports PDF files up to 10MB each • Multiple files supported
              </p>
              {uploading && <div className="text-gray-600 font-medium mt-2">Uploading...</div>}
              {uploadError && <div className="text-red-600 font-medium mt-2">{uploadError}</div>}
              {uploadResult && uploadResult.extracted_data && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 mt-4 shadow-md text-left max-w-md mx-auto">
                  <div className="text-gray-700 font-bold text-lg mb-2 flex items-center">
                    <CheckCircle className="inline-block mr-2 text-gray-600" size={22} />
                    Upload Success!
                  </div>
                  <div className="text-gray-800 font-semibold mb-1">{uploadResult.message}</div>
                  <div className="mt-4 space-y-2">
                    <div><span className="font-medium text-gray-600">Invoice Number:</span> {uploadResult.extracted_data.invoice_number}</div>
                    <div><span className="font-medium text-gray-600">PO Number:</span> {uploadResult.extracted_data.po_number}</div>
                    <div><span className="font-medium text-gray-600">Subtotal:</span> ${uploadResult.extracted_data.subtotal}</div>
                    <div><span className="font-medium text-gray-600">Taxes:</span> ${uploadResult.extracted_data.taxes}</div>
                    <div><span className="font-medium text-gray-600">Total:</span> <span className="font-bold text-gray-700">${uploadResult.extracted_data.total}</span></div>
                  </div>
                  <div className="mt-4">
                    <div className="font-medium text-gray-600 mb-1">Vendor Info:</div>
                    <div className="pl-2 text-gray-700">
                      <div><span className="font-medium">Name:</span> {uploadResult.extracted_data.vendor_info?.Name}</div>
                      <div><span className="font-medium">Address:</span> {uploadResult.extracted_data.vendor_info?.Address}</div>
                      <div><span className="font-medium">Contact Info:</span> {uploadResult.extracted_data.vendor_info?.['Contact Info']}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Validation Table (reuse renderValidationQueue) */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {validationLoading ? (
            <div className="p-8 text-center text-gray-600 font-medium">Loading invoices...</div>
          ) : validationError ? (
            <div className="p-8 text-center text-red-600 font-medium">{validationError}</div>
          ) : (
            <InvoiceValidationTable
              invoices={validationInvoices}
              loading={validationLoading}
              error={validationError}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setSelectedInvoice={setSelectedInvoice}
              setShowPreviewModal={setShowPreviewModal}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
            />
          )}
        </div>
      </div>
    </div>
  );

  const renderValidationQueue = () => (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* Invoice List */}
      <div className="xl:col-span-2">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Invoice Validation Interface</h2>
              <div className="flex items-center space-x-3">
                <button className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2">
                  <Plus size={16} />
                  <span>New Invoice</span>
                </button>
              </div>
            </div>
            
            {/* Search and Filter */}
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                />
              </div>
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2">
                <Filter size={16} />
                <span>Filter</span>
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {validationLoading ? (
              <div className="p-8 text-center text-gray-600 font-medium">Loading invoices...</div>
            ) : validationError ? (
              <div className="p-8 text-center text-red-600 font-medium">{validationError}</div>
            ) : (
              <InvoiceValidationTable
                invoices={validationInvoices}
                loading={validationLoading}
                error={validationError}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                setSelectedInvoice={setSelectedInvoice}
                setShowPreviewModal={setShowPreviewModal}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Defensive fetch utility
  const fetchJson = async (url: string, options?: RequestInit) => {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type');
    if (!res.ok) throw new Error('Failed to fetch: ' + url);
    if (contentType && contentType.includes('application/json')) {
      return res.json();
    } else {
      throw new Error('Server did not return JSON. Check API URL and backend status.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <img src={logo} alt="Logo" className="h-12 w-auto rounded-xl object-contain" />
              </div>
            </div>

            {/* Navigation - Single Line */}
            <nav className="hidden lg:flex items-center space-x-2">
              {navItems.map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveTab(item)}
                  className={`px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === item
                      ? 'text-white bg-gradient-to-r from-black to-gray-800 shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item}
                </button>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <button
                className="bg-black hover:bg-gray-800 text-white font-semibold px-4 py-2 rounded-xl transition-colors shadow"
                onClick={() => window.open('https://your-erp-url.com', '_blank', 'noopener,noreferrer')}
                type="button"
              >
                Go to ERP
              </button>
              <div className="flex items-center space-x-3 bg-white rounded-2xl px-4 py-2 shadow-md border border-gray-100 relative"
                onMouseEnter={() => setProfileHover(true)}
                onMouseLeave={() => setProfileHover(false)}
              >
                <UserProfile src={user.avatar} alt={user.name} />
                {profileHover && (
                  <div className="absolute left-1/2 top-full -translate-x-1/2 mt-3 bg-white border border-gray-200 rounded-xl shadow-lg px-8 py-4 flex flex-col items-center space-y-3 z-50 min-w-[220px]">
                    <UserProfile src={user.avatar} alt={user.name} />
                    <div className="flex flex-row items-center justify-between w-full">
                      <span className="font-semibold text-gray-900 whitespace-nowrap">{user.name}</span>
                      <button className="text-gray-500 hover:text-red-600 p-2 rounded-full transition-colors ml-4" title="Logout">
                        <LogOut size={22} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button 
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setActiveTab(item);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === item
                      ? 'text-gray-600 bg-gray-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'Dashboard' && renderDashboard()}
        {(activeTab === 'Validation Queue' || activeTab === 'Invoices') && renderValidationQueue()}
        {activeTab === 'Logs' && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="text-center py-16">
              <div className="bg-gradient-to-br from-gray-100 to-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Settings className="h-10 w-10 text-gray-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">System Logs</h2>
              <p className="text-gray-500">Advanced logging functionality coming soon...</p>
            </div>
          </div>
        )}
        {activeTab === 'Settings' && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="text-center py-16">
              <div className="bg-gradient-to-br from-gray-100 to-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Settings className="h-10 w-10 text-gray-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
              <p className="text-gray-500">Configuration panel coming soon...</p>
            </div>
          </div>
        )}
        {showPreviewModal && selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-end justify-end bg-black bg-opacity-50">
            <div className="bg-gray-50 rounded-l-2xl shadow-2xl w-full max-w-2xl h-full p-8 relative animate-slide-in-right flex flex-col" style={{ right: 0 }}>
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
                onClick={() => setShowPreviewModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Invoice Preview</h3>
              <div className="flex-1 overflow-y-auto pr-2">
                {selectedInvoice.pdf_path && (
                  <div className="mb-6">
                    <iframe
                      src={selectedInvoice.pdf_path}
                      title="Invoice PDF Preview"
                      className="w-full h-[38rem] rounded-xl border border-gray-200"
                      style={{ minHeight: '38rem', background: 'white' }}
                    />
                  </div>
                )}
                {/* Details Section as a simple list */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Details</h4>
                  <div className="divide-y divide-gray-200">
                    <div className="py-2 flex items-center">
                      <label className="text-sm text-blue-600 font-medium w-1/3">Vendor Name</label>
                      <input
                        className="font-semibold text-base text-gray-900 w-2/3 bg-gray-100 rounded border-none focus:border focus:border-gray-300 focus:outline-none focus:ring-0 p-0 py-2"
                        value={selectedInvoice.vendor_info?.Name || ''}
                        onChange={e => setSelectedInvoice({
                          ...selectedInvoice,
                          vendor_info: { ...selectedInvoice.vendor_info, Name: e.target.value }
                        })}
                      />
                    </div>
                    <div className="py-2 flex items-center">
                      <label className="text-sm text-blue-600 font-medium w-1/3">Invoice #</label>
                      <input
                        className="font-semibold text-base text-gray-900 w-2/3 bg-gray-100 rounded border-none focus:border focus:border-gray-300 focus:outline-none focus:ring-0 p-0 py-2"
                        value={selectedInvoice.invoice_number || ''}
                        onChange={e => setSelectedInvoice({ ...selectedInvoice, invoice_number: e.target.value })}
                      />
                    </div>
                    <div className="py-2 flex items-center">
                      <label className="text-sm text-blue-600 font-medium w-1/3">Date</label>
                      <input
                        type="date"
                        className="font-semibold text-base text-gray-900 w-2/3 bg-gray-100 rounded border-none focus:border focus:border-gray-300 focus:outline-none focus:ring-0 p-0 py-2"
                        value={selectedInvoice.uploaded_at ? new Date(selectedInvoice.uploaded_at).toISOString().slice(0, 10) : ''}
                        onChange={e => setSelectedInvoice({ ...selectedInvoice, uploaded_at: e.target.value })}
                      />
                    </div>
                    <div className="py-2 flex items-center">
                      <label className="text-sm text-blue-600 font-medium w-1/3">NDA #</label>
                      <input
                        className="font-semibold text-base text-gray-900 w-2/3 bg-gray-100 rounded border-none focus:border focus:border-gray-300 focus:outline-none focus:ring-0 p-0 py-2"
                        value={selectedInvoice.nda_number || ''}
                        onChange={e => setSelectedInvoice({ ...selectedInvoice, nda_number: e.target.value })}
                        placeholder="Missing field"
                      />
                    </div>
                    <div className="py-2 flex items-center">
                      <label className="text-sm text-blue-600 font-medium w-1/3">Purchase Order #</label>
                      <input
                        className="font-semibold text-base text-gray-900 w-2/3 bg-gray-100 rounded border-none focus:border focus:border-gray-300 focus:outline-none focus:ring-0 p-0 py-2"
                        value={selectedInvoice.po_number || ''}
                        onChange={e => setSelectedInvoice({ ...selectedInvoice, po_number: e.target.value })}
                      />
                    </div>
                    <hr className="my-2 border-t border-gray-200" />
                  </div>
                </div>
                {/* Items Section */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Items</h4>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="grid grid-cols-12 gap-2 font-semibold text-gray-700 bg-white py-2 px-2">
                      <div className="col-span-6">Item</div>
                      <div className="col-span-3">Quantity</div>
                      <div className="col-span-3.5">Value ($)</div>
                    </div>
                    {(selectedInvoice.items || [{ name: '', quantity: '', value: '' }]).map((item: any, idx: number) => (
                      <div className={`grid grid-cols-12 gap-2 px-2 my-3${idx < (selectedInvoice.items?.length || 1) - 1 ? ' border-b border-gray-200' : ''}`} key={idx} style={{ alignItems: 'center', minHeight: '3rem' }}>
                        <div className="col-span-6 flex items-center">
                          <input
                            className="w-full bg-white border border-gray-300 rounded px-2 py-2 font-semibold text-base text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-0"
                            value={item.name}
                            placeholder={`Item ${idx + 1}`}
                            onChange={e => {
                              const newItems = (selectedInvoice.items ? [...selectedInvoice.items] : []);
                              newItems[idx] = { ...item, name: e.target.value };
                              setSelectedInvoice({ ...selectedInvoice, items: newItems });
                            }}
                          />
                        </div>
                        <div className="col-span-2 flex items-center">
                          <input
                            className="w-full bg-white border border-gray-300 rounded px-2 py-2 font-semibold text-base text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-0"
                            type="number"
                            min="0"
                            value={item.quantity}
                            placeholder="Qty"
                            onChange={e => {
                              const newItems = (selectedInvoice.items ? [...selectedInvoice.items] : []);
                              newItems[idx] = { ...item, quantity: e.target.value };
                              setSelectedInvoice({ ...selectedInvoice, items: newItems });
                            }}
                          />
                        </div>
                        <div className="col-span-4 flex items-center">
                          <input
                            className="w-full bg-white border border-gray-300 rounded px-2 py-2 font-semibold text-base text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-0"
                            type="number"
                            min="0"
                            value={item.value}
                            placeholder="Value ($)"
                            onChange={e => {
                              const newItems = (selectedInvoice.items ? [...selectedInvoice.items] : []);
                              newItems[idx] = { ...item, value: e.target.value };
                              setSelectedInvoice({ ...selectedInvoice, items: newItems });
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    {/* Freight row */}
                    <div className="grid grid-cols-12 gap-2 px-2 my-3">
                      <div className="col-span-6 flex items-center">
                        <span className="text-blue-600 font-medium">Freight</span>
                      </div>
                      <div className="col-span-2"></div>
                      <div className="col-span-4 flex items-center">
                        <input
                          className="w-full bg-white border border-gray-300 rounded px-2 py-2 font-semibold text-base text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-0"
                          type="number"
                          min="0"
                          value={selectedInvoice.freight || ''}
                          placeholder="Freight ($)"
                          onChange={e => setSelectedInvoice({ ...selectedInvoice, freight: e.target.value })}
                        />
                      </div>
                    </div>
                    {/* Divider before Total row */}
                    <hr className="my-2 border-t border-gray-300" />
                    {/* Total row */}
                    <div className="grid grid-cols-12 gap-2 px-2 my-3">
                      <div className="col-span-6 flex items-center">
                        <span className="text-black font-semibold">Total</span>
                      </div>
                      <div className="col-span-2"></div>
                      <div className="col-span-4 flex items-center">
                        <input
                          className="w-full bg-white border border-gray-300 rounded px-2 py-2 font-semibold text-base text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-0"
                          type="number"
                          min="0"
                          value={selectedInvoice.total || ''}
                          placeholder="Total ($)"
                          onChange={e => setSelectedInvoice({ ...selectedInvoice, total: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Notes section */}
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Notes</h4>
                  <p className="text-gray-600 text-base bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    Please review all invoice details carefully before approval. If you have any questions or require further clarification, contact the finance department. This is a placeholder note for demonstration purposes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <footer className="w-full py-6 text-center text-gray-400 text-base font-semibold border-t border-gray-100 mt-8">
        @2024 InvoicePro All Rights Reserved
      </footer>
    </div>
  );
}

export default App;