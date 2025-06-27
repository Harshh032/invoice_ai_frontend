export interface Invoice {
  id: string;
  vendor: string;
  amount: string;
  date: string;
  status: 'Ready' | 'Needs Review' | 'Error' | 'Pending' | 'Approved' | 'Loading' | 'In Progress';
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  // Optional fields for API/modal compatibility
  pdf_path?: string;
  vendor_info?: {
    Name?: string;
    Address?: string;
    [key: string]: any;
  };
  invoice_number?: string;
  uploaded_at?: string;
  nda_number?: string;
  po_number?: string;
  items?: { name: string; quantity: string; value: string }[];
  freight?: string;
  total?: string;
}

export interface User {
  name: string;
  avatar: string;
  role: string;
} 