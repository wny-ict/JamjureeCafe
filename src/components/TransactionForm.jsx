import React, { useState, useEffect, useRef } from 'react';
import { X, DollarSign, Calendar, FileText, User, HelpCircle, AlertCircle } from 'lucide-react';

// รายการแนะนำอัจฉริยะยอดนิยมสำหรับ Jamjuree Cafe
const SUGGESTIONS = {
  income: [
    'ขายเงินสด',
    'เงินโอน'
  ],
  expense: [
    'ซื้อวัตถุดิบ',
    'จ่ายค่าวัตถุดิบที่ค้าง',
    'จ่ายค่างวดเงินกู้',
    'ซื้อของแม็คโคร',
    'ค่าจ้างพนักงาน',
    'ค่าเบเกอรี่',
    'ซื้อเมล็ดกาแฟ',
    'ซื้อแก้วกาแฟ',
    'ซื้อผงชงน้ำ',
    'ซื้อนมเมจิ'
  ]
};

export default function TransactionForm({ transaction, onSubmit, onClose, role, isLoading }) {
  const isEdit = !!transaction;
  const [type, setType] = useState('income'); // 'income' | 'expense'
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [createdBy, setCreatedBy] = useState(role === 'admin' ? 'แอดมิน' : 'เจ้าหน้าที่');
  
  // สถานะจัดการระบบแนะนำ (Suggestions Dropdown)
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const suggestRef = useRef(null);

  // สถานะแจ้งเตือนข้อผิดพลาดข้อมูลในการกรอกฟอร์ม
  const [formError, setFormError] = useState('');

  // ตั้งค่าข้อมูลตั้งต้นหากเป็นการกดปุ่ม "แก้ไข"
  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setDate(transaction.date);
      setDescription(transaction.description);
      setAmount(transaction.amount.toString());
      setNote(transaction.note || '');
      setCreatedBy(transaction.created_by || '');
    } else {
      // โหมดสร้างใหม่ ดึงวันที่วันนี้
      setDate(new Date().toLocaleDateString('sv')); // รูปแบบ YYYY-MM-DD
      setCreatedBy(role === 'admin' ? 'ผู้ดูแลระบบ' : 'เจ้าหน้าที่คาเฟ่');
    }
  }, [transaction, role]);

  // คัดกรองรายการแนะนำตามที่ผู้ใช้พิมพ์
  useEffect(() => {
    const list = SUGGESTIONS[type] || [];
    if (description.trim() === '') {
      setFilteredSuggestions(list);
    } else {
      const match = list.filter(item => 
        item.toLowerCase().includes(description.toLowerCase())
      );
      setFilteredSuggestions(match);
    }
  }, [description, type]);

  // ดักจับการคลิกนอกกรอบคำแนะนำเพื่อปิดอัตโนมัติ
  useEffect(() => {
    function handleClickOutside(event) {
      if (suggestRef.current && !suggestRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('กรุณากรอกจำนวนเงินให้ถูกต้องและมากกว่า 0 บาท');
      return;
    }

    if (description.trim() === '') {
      setFormError('กรุณากรอกรายการธุรกรรม');
      return;
    }

    const data = {
      date,
      type,
      description: description.trim(),
      amount: parsedAmount,
      note: note.trim(),
      created_by: createdBy.trim() || (role === 'admin' ? 'ผู้ดูแลระบบ' : 'เจ้าหน้าที่คาเฟ่')
    };

    onSubmit(data);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        
        {/* ส่วนหัวหน้าต่าง */}
        <div className="modal-header">
          <h3 className="panel-title" style={{ fontSize: '1.2rem' }}>
            {isEdit ? '✏️ แก้ไขรายการบัญชี' : '📝 บันทึกรายการบัญชีใหม่'}
          </h3>
          <button className="action-btn" onClick={onClose} disabled={isLoading}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            
            {/* กล่องข้อความแจ้งเตือนความผิดพลาดสีแดงหรูหราอินไลน์ */}
            {formError && (
              <div style={{ 
                backgroundColor: '#FFEBEE', 
                color: '#D32F2F', 
                padding: '0.75rem 1rem', 
                borderRadius: 'var(--radius-md)', 
                fontSize: '0.85rem', 
                marginBottom: '1.25rem',
                border: '1px solid #FFCDD2',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{formError}</span>
              </div>
            )}
            
            {/* ตัวสลับประเภท รายรับ / รายจ่าย */}
            <div className="type-toggle-group" style={{ opacity: isLoading ? 0.6 : 1, pointerEvents: isLoading ? 'none' : 'auto' }}>
              <button
                type="button"
                className={`type-toggle-btn income ${type === 'income' ? 'active' : ''}`}
                onClick={() => { if (!isLoading) { setType('income'); if (!isEdit) setDescription(''); } }}
                disabled={isLoading}
              >
                <span>➕ รายรับ (Income)</span>
              </button>
              <button
                type="button"
                className={`type-toggle-btn expense ${type === 'expense' ? 'active' : ''}`}
                onClick={() => { if (!isLoading) { setType('expense'); if (!isEdit) setDescription(''); } }}
                disabled={isLoading}
              >
                <span>➖ รายจ่าย (Expense)</span>
              </button>
            </div>

            {/* ช่องกรอกวันที่ */}
            <div className="form-group">
              <label htmlFor="tx-date">วันที่ทำรายการ</label>
              <div className="search-input-wrapper">
                <Calendar className="search-icon" size={16} />
                <input
                  id="tx-date"
                  type="date"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem' }}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* ช่องกรอกรายการธุรกรรมพร้อม Auto-complete */}
            <div className="form-group" style={{ position: 'relative' }} ref={suggestRef}>
              <label htmlFor="tx-desc">รายการ / คำอธิบาย</label>
              <div className="search-input-wrapper">
                <FileText className="search-icon" size={16} />
                <input
                  id="tx-desc"
                  type="text"
                  placeholder="เช่น เมล็ดกาแฟ, นมข้น, ยอดขายรายวัน..."
                  className="form-input"
                  style={{ paddingLeft: '2.25rem' }}
                  value={description}
                  onChange={(e) => { setDescription(e.target.value); setShowSuggestions(true); setFormError(''); }}
                  onFocus={() => { if (!isLoading) setShowSuggestions(true); }}
                  required
                  autoComplete="off"
                  disabled={isLoading}
                />
              </div>
              
              {/* รายการแนะนำ Dropdown */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="suggest-list">
                  {filteredSuggestions.map((item) => (
                    <div
                      key={item}
                      className="suggest-item"
                      onClick={() => {
                        setDescription(item);
                        setShowSuggestions(false);
                        setFormError('');
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ช่องกรอกจำนวนเงิน */}
            <div className="form-group">
              <label htmlFor="tx-amount">จำนวนเงิน (บาท)</label>
              <div className="search-input-wrapper">
                <span className="search-icon" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>฿</span>
                <input
                  id="tx-amount"
                  type="number"
                  step="any"
                  placeholder="0.00"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setFormError(''); }}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* ช่องกรอกผู้บันทึก */}
            <div className="form-group">
              <label htmlFor="tx-creator">ผู้ทำบันทึก</label>
              <div className="search-input-wrapper">
                <User className="search-icon" size={16} />
                <input
                  id="tx-creator"
                  type="text"
                  placeholder="ชื่อผู้ทำรายการ เช่น นร.สมชาย, ครูลัดดา..."
                  className="form-input"
                  style={{ paddingLeft: '2.25rem' }}
                  value={createdBy}
                  onChange={(e) => setCreatedBy(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* ช่องกรอกหมายเหตุ */}
            <div className="form-group">
              <label htmlFor="tx-note">หมายเหตุ (ถ้ามี)</label>
              <div className="search-input-wrapper">
                <HelpCircle className="search-icon" size={16} />
                <input
                  id="tx-note"
                  type="text"
                  placeholder="ข้อมูลเพิ่มเติมเพื่อช่วยในการจดจำ..."
                  className="form-input"
                  style={{ paddingLeft: '2.25rem' }}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

          </div>

          {/* ปุ่มทำรายการด้านล่าง */}
          <div className="modal-footer" style={{ opacity: isLoading ? 0.7 : 1 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
              ยกเลิก
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ minWidth: '140px' }}>
              {isLoading ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                  <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block', fontSize: '1.15rem' }}>☕</span>
                  กำลังบันทึก...
                </span>
              ) : (
                isEdit ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูล'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
