export interface Transaction {
  transaction_uuid: string;
  transaction_id: string;
  reference_number: string;
  amount: string;
  currency: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  created_at: string;
  cashierId?: string;
  branchId?: string;
}

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    transaction_uuid: '1',
    transaction_id: 'TXN-1001',
    reference_number: 'REF-001',
    amount: '1500.00',
    currency: 'LKR',
    status: 'SUCCESS',
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    cashierId: 'c1',
    branchId: 'b1',
  },
  {
    transaction_uuid: '2',
    transaction_id: 'TXN-1002',
    reference_number: 'REF-002',
    amount: '250.50',
    currency: 'LKR',
    status: 'SUCCESS',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    cashierId: 'c1',
    branchId: 'b1',
  },
  {
    transaction_uuid: '3',
    transaction_id: 'TXN-1003',
    reference_number: 'REF-003',
    amount: '4200.00',
    currency: 'LKR',
    status: 'PENDING',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    cashierId: 'c2',
    branchId: 'b1',
  },
  {
    transaction_uuid: '4',
    transaction_id: 'TXN-1004',
    reference_number: 'REF-004',
    amount: '95.00',
    currency: 'LKR',
    status: 'FAILED',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    cashierId: 'c1',
    branchId: 'b2',
  },
  {
    transaction_uuid: '5',
    transaction_id: 'TXN-1005',
    reference_number: 'REF-005',
    amount: '12000.00',
    currency: 'LKR',
    status: 'SUCCESS',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 1 week ago
    cashierId: 'c3',
    branchId: 'b2',
  },
  {
    transaction_uuid: '6',
    transaction_id: 'TXN-1006',
    reference_number: 'REF-006',
    amount: '500.00',
    currency: 'LKR',
    status: 'SUCCESS',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 1 month ago
  },
];

export const MOCK_BRANCHES = [
  { id: 'b1', name: 'Main Branch', slug: 'main' },
  { id: 'b2', name: 'Kandy Outlet', slug: 'kandy' },
];

export const MOCK_CASHIERS = [
  { id: 'c1', displayName: 'John Doe', username: 'john' },
  { id: 'c2', displayName: 'Jane Smith', username: 'jane' },
  { id: 'c3', displayName: 'Cashier 03', username: 'user3' },
];
