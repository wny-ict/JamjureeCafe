import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, ArrowUpDown, Filter, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

// ตัวช่วยแปลงวันที่สากล YYYY-MM-DD เป็น วัน เดือน (ย่อ) ปีพุทธศักราช (พ.ศ.)
export const formatThaiDate = (dateStr) => {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    const thaiMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    const thaiYear = y + 543;
    return `${d} ${thaiMonths[m - 1]} ${thaiYear}`;
  }
  return dateStr;
};

export default function Transactions({ transactions, onAdd, onEdit, onDelete, role, onSyncLegacy }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'income' | 'expense'
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'
  const itemsPerPage = 10;

  // 1. ค้นหาและกรองข้อมูลธุรกรรม
  const filteredTransactions = transactions
    .filter(t => {
      // ตัวกรองคำค้นหา (ชื่อรายการ, หมายเหตุ, รหัส ID)
      const query = searchTerm.toLowerCase();
      const matchSearch = 
        t.description.toLowerCase().includes(query) || 
        t.note.toLowerCase().includes(query) || 
        t.id.toLowerCase().includes(query);
      
      // ตัวกรองประเภทธุรกรรม
      const matchType = typeFilter === 'all' || t.type === typeFilter;
      
      return matchSearch && matchType;
    })
    .sort((a, b) => {
      // การเรียงลำดับตามวันที่
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  // 2. การคำนวณแบ่งหน้า (Pagination)
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="table-container">
      {/* ส่วนควบคุมและกรองข้อมูล */}
      <div className="table-controls">
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', flexGrow: 1 }}>
          {/* ช่องค้นหา */}
          <div className="search-input-wrapper">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="ค้นหาตามรายการ หรือหมายเหตุ..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>

          {/* ตัวเลือกกรองประเภท */}
          <div className="filter-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <Filter size={14} />
              <span>ประเภท:</span>
            </div>
            <select
              className="filter-select"
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">ทั้งหมด</option>
              <option value="income">รายรับ (Income)</option>
              <option value="expense">รายจ่าย (Expense)</option>
            </select>
          </div>

          {/* ตัวเลือกเรียงลำดับ */}
          <div className="filter-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <ArrowUpDown size={14} />
              <span>เรียงตามวันที่:</span>
            </div>
            <select
              className="filter-select"
              value={sortOrder}
              onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }}
            >
              <option value="newest">ล่าสุดไปอดีต</option>
              <option value="oldest">อดีตไปล่าสุด</option>
            </select>
          </div>
        </div>

        {/* ปุ่มคำสั่งต่างๆ */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {/* ปุ่มดึงข้อมูลรายเดือนจาก Excel/ชีตจริง */}
          <button 
            className="btn btn-secondary" 
            onClick={onSyncLegacy} 
            title="คำนวณยอดเงินคงเหลือและดึงข้อมูลจริงจากชีตรายเดือน May-Dec"
          >
            <RefreshCw size={15} />
            <span>ซิงค์ข้อมูลรายเดือน</span>
          </button>
          
          {/* ปุ่มสำหรับเพิ่มธุรกรรมใหม่ */}
          <button className="btn btn-primary" onClick={onAdd}>
            <Plus size={15} />
            <span>บันทึกธุรกรรมใหม่</span>
          </button>
        </div>
      </div>

      {/* ตารางแสดงข้อมูล */}
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>วันที่ทำรายการ</th>
              <th>ประเภท</th>
              <th>รายการ/คำอธิบาย</th>
              <th style={{ textAlign: 'right' }}>จำนวนเงิน (บาท)</th>
              <th>ผู้บันทึก</th>
              <th>หมายเหตุ</th>
              <th style={{ width: '100px', textAlign: 'center' }}>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan="7" className="table-empty">
                  📭 ไม่พบข้อมูลรายการที่ค้นหาตามเงื่อนไขดังกล่าว
                </td>
              </tr>
            ) : (
              currentItems.map((t) => (
                <tr key={t.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {formatThaiDate(t.date)}
                  </td>
                  <td>
                    <span className={`badge ${t.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                      {t.type === 'income' ? 'รายรับ' : 'รายจ่าย'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500, color: 'var(--primary-dark)' }}>
                    {t.description}
                  </td>
                  <td style={{ textAlign: 'right' }} className={`amount-text ${t.type === 'income' ? 'income' : 'expense'}`}>
                    {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {t.created_by}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.note}>
                    {t.note || '-'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="table-actions" style={{ justifyContent: 'center' }}>
                      <button 
                        className="action-btn" 
                        onClick={() => onEdit(t)}
                        title="แก้ไขรายการนี้"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button 
                        className="action-btn delete" 
                        onClick={() => onDelete(t.id)}
                        title="ลบรายการนี้"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ส่วนควบคุมเปลี่ยนหน้า (Pagination controls) */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            แสดงผล {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, totalItems)} จากทั้งหมด {totalItems} รายการ
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className="action-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{ opacity: currentPage === 1 ? 0.35 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              <ChevronLeft size={16} />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .map((p, i, arr) => {
                const showEllipsis = i > 0 && p - arr[i - 1] > 1;
                return (
                  <React.Fragment key={p}>
                    {showEllipsis && <span style={{ color: 'var(--text-muted)' }}>...</span>}
                    <button
                      className="action-btn"
                      onClick={() => handlePageChange(p)}
                      style={{
                        backgroundColor: currentPage === p ? 'var(--primary-brown)' : 'transparent',
                        color: currentPage === p ? 'white' : 'var(--text-main)',
                        fontWeight: currentPage === p ? 'bold' : 'normal',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%'
                      }}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              className="action-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{ opacity: currentPage === totalPages ? 0.35 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
