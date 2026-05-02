import React, { useEffect, useState } from 'react';
import enterpriseService from '../services/enterpriseService';
import { toast } from '../../components/Toast/toastEvent';

const AdminAuditLogs: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [keyword, setKeyword] = useState('');
  const [severity, setSeverity] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await enterpriseService.getAuditLogs({ 
        keyword: keyword || undefined, 
        severity: severity || undefined, 
        from: from || undefined,
        to: to || undefined,
        limit: 200 
      });
      setRows(res.data || []);
    } catch (err: any) {
      toast.error(err?.message || 'Không tải được audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [severity, from, to]);

  const handleFilter = () => loadData();

  const getSeverityBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SUCCESS': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">SUCCESS</span>;
      case 'FAILURE': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">FAILURE</span>;
      case 'SUSPICIOUS': return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-bold">SUSPICIOUS</span>;
      default: return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-bold">{status || 'INFO'}</span>;
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900">Audit Logs</h1>
        <div className="flex gap-2 items-center">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
          <span>-</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
          
          <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="px-3 py-2 border rounded-lg text-sm bg-white">
            <option value="">Tất cả mức độ</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILURE">Failure</option>
            <option value="SUSPICIOUS">Suspicious</option>
            <option value="INFO">Info</option>
          </select>

          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm kiếm..." className="px-3 py-2 border rounded-lg text-sm" />
          <button onClick={handleFilter} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold">Lọc</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-3 text-left">Thời gian</th>
              <th className="p-3 text-left">Action</th>
              <th className="p-3 text-left">Severity</th>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">IP / Request ID</th>
              <th className="p-3 text-left">Message</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any) => (
              <tr key={String(row._id)} className="border-t">
                <td className="p-3 text-slate-500">{row.created_at ? new Date(row.created_at).toLocaleString('vi-VN') : '-'}</td>
                <td className="p-3 font-semibold text-slate-800">{row.action}</td>
                <td className="p-3">{getSeverityBadge(row.details?.status)}</td>
                <td className="p-3">{row.user_name || row.user_id || 'System'}</td>
                <td className="p-3">
                  <div className="font-mono text-xs">{row.details?.ip || row.ip || '-'}</div>
                  <div className="font-mono text-[10px] text-slate-400">{row.details?.requestId || '-'}</div>
                </td>
                <td className="p-3 text-slate-600 max-w-xs truncate" title={row.details?.message || row.entity || ''}>
                  {row.details?.message || row.entity || '-'}
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-slate-500">Không có dữ liệu</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAuditLogs;
