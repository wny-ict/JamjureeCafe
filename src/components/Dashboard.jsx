import React from 'react';
import { TrendingUp, TrendingDown, Wallet, Calendar, AlertCircle, RefreshCw, Printer } from 'lucide-react';

export default function Dashboard({ transactions, onSync, onPrintSummary }) {
  // ฟังก์ชั่นช่วยกรองเอาเฉพาะธุรกรรมจริงในเนื้อเดือน (ละเว้นแถวยอดยกมาเพื่อไม่ให้นับซ้ำซ้อนสองรอบในทางสถิติ)
  const isBroughtForward = (desc) => {
    if (!desc) return false;
    const d = desc.toLowerCase();
    return d.includes('ยกยอด') || d.includes('ยอดยกมา');
  };

  const filteredTransactions = transactions.filter(t => !isBroughtForward(t.description));

  // 1. คำนวณหา ยอดรวมรายรับ, ยอดรวมรายจ่าย, และ ยอดคงเหลือ จากธุรกรรมหมุนเวียนจริง
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // 2. คำนวณข้อมูลสำหรับ กราฟรายเดือน (Income vs Expense by Month)
  const getMonthlyData = () => {
    const months = {};
    filteredTransactions.forEach(t => {
      if (!t.date) return;
      const monthKey = t.date.substring(0, 7); // "YYYY-MM"
      if (!months[monthKey]) {
        months[monthKey] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        months[monthKey].income += t.amount;
      } else {
        months[monthKey].expense += t.amount;
      }
    });

    // แปลงเป็น Array และเรียงลำดับจากอดีตไปหาปัจจุบัน (จำกัดสูงสุด 6 เดือนหลังสุด)
    return Object.keys(months)
      .map(key => {
        const [year, month] = key.split('-');
        const monthNames = [
          'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
          'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
        ];
        const thaiYearBE = String(parseInt(year, 10) + 543).substring(2);
        const label = `${monthNames[parseInt(month, 10) - 1]} ${thaiYearBE}`;
        return {
          key,
          label,
          income: months[key].income,
          expense: months[key].expense
        };
      })
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-6);
  };

  const monthlyData = getMonthlyData();

  // หาค่ายอดเงินที่สูงที่สุดในประวัติรายเดือนเพื่อสเกลความสูงกราฟแท่ง
  const maxMonthlyVal = Math.max(
    ...monthlyData.map(d => Math.max(d.income, d.expense)),
    1000 // ค่าเริ่มต้นขั้นต่ำเพื่อไม่ให้หารศูนย์
  );

  // 3. สรุปรายจ่ายตามรายการหลัก (Top Expenses Categories)
  const getExpenseCategories = () => {
    const categories = {};
    const expenses = filteredTransactions.filter(t => t.type === 'expense');
    
    expenses.forEach(t => {
      const cat = t.description.trim() || 'อื่นๆ';
      categories[cat] = (categories[cat] || 0) + t.amount;
    });

    return Object.keys(categories)
      .map(name => ({
        name,
        amount: categories[name],
        percentage: totalExpense > 0 ? Math.round((categories[name] / totalExpense) * 100) : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5); // แสดง 5 รายการยอดสูงสุด
  };

  const topExpenses = getExpenseCategories();

  // 4. คำนวณสรุปประวัติผลประกอบการรายเดือนสำหรับตารางด้านล่างแดชบอร์ด
  const getMonthlySummaryTable = () => {
    const months = {};
    const sortedTxs = [...filteredTransactions].sort((a, b) => a.date.localeCompare(b.date));
    
    sortedTxs.forEach(t => {
      if (!t.date) return;
      const monthKey = t.date.substring(0, 7); // "YYYY-MM"
      if (!months[monthKey]) {
        months[monthKey] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        months[monthKey].income += t.amount;
      } else {
        months[monthKey].expense += t.amount;
      }
    });

    let runningBalance = 0;
    const monthKeys = Object.keys(months).sort();
    
    return monthKeys.map(key => {
      const sum = months[key];
      const net = sum.income - sum.expense;
      runningBalance += net;
      
      const [year, month] = key.split('-');
      const monthNames = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
      ];
      const label = `${monthNames[parseInt(month, 10) - 1]} ${parseInt(year, 10) + 543}`;
      
      return {
        key,
        label,
        income: sum.income,
        expense: sum.expense,
        net,
        balance: runningBalance
      };
    });
  };

  const monthlySummaryList = getMonthlySummaryTable();

  // กำหนดสเปกตรัมโทนสีน้ำตาลสำหรับแจกแจงรายการรายจ่าย
  const brownSpectrum = [
    '#5D4037', // Espresso Dark
    '#6D4C41',
    '#8D6E63', // Latte Medium
    '#A1887F',
    '#D7CCC8'  /* Light Milk Cream */
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* สรุปยอดการเงิน 3 การ์ด */}
      <div className="stats-grid">
        <div className="stat-card income">
          <div className="stat-data">
            <h3>รายรับทั้งหมด</h3>
            <p>{totalIncome.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="stat-card expense">
          <div className="stat-data">
            <h3>รายจ่ายทั้งหมด</h3>
            <p>{totalExpense.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="stat-icon">
            <TrendingDown size={24} />
          </div>
        </div>

        <div className="stat-card balance">
          <div className="stat-data">
            <h3>ยอดคงเหลือสุทธิ</h3>
            <p style={{ color: netBalance >= 0 ? 'var(--primary-dark)' : 'var(--danger)' }}>
              {netBalance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="stat-icon">
            <Wallet size={24} />
          </div>
        </div>
      </div>

      {/* บล็อควิเคราะห์ข้อมูลแบบสองคอลัมน์ */}
      <div className="dashboard-grid">
        
        {/* แผนภูมิกราฟแท่ง รายรับรายจ่าย ประจำเดือน */}
        <div className="panel-card">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">วิเคราะห์ความเคลื่อนไหวทางบัญชี</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>เปรียบเทียบยอดรวม รายรับ-รายจ่าย ในรอบ 6 เดือนล่าสุด</p>
            </div>
            <button className="action-btn" onClick={onSync} title="ดึงข้อมูลล่าสุดจากชีต">
              <RefreshCw size={16} />
            </button>
          </div>

          {monthlyData.length === 0 ? (
            <div className="table-empty" style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p>📭 ไม่พบข้อมูลประวัติรายเดือนเพื่อแสดงแผนภูมิ</p>
            </div>
          ) : (
            <div>
              <div className="chart-container">
                {monthlyData.map((d, index) => {
                  const incHeight = (d.income / maxMonthlyVal) * 100;
                  const expHeight = (d.expense / maxMonthlyVal) * 100;

                  return (
                    <div className="chart-bar-group" key={d.key}>
                      <div className="chart-bar-container">
                        {/* แท่งรายรับ */}
                        <div
                          className="chart-bar income"
                          style={{ height: `${incHeight}%` }}
                          data-value={`${d.income.toLocaleString()} บาท`}
                        ></div>
                        {/* แท่งรายจ่าย */}
                        <div
                          className="chart-bar expense"
                          style={{ height: `${expHeight}%` }}
                          data-value={`${d.expense.toLocaleString()} บาท`}
                        ></div>
                      </div>
                      <span className="chart-label">{d.label}</span>
                    </div>
                  );
                })}
              </div>
              
              {/* คำอธิบายสัญลักษณ์กราฟ */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1.25rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--success)', borderRadius: '3px' }}></div>
                  <span>รายรับ (Income)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--danger)', borderRadius: '3px' }}></div>
                  <span>รายจ่าย (Expense)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ตารางสัดส่วนหมวดหมู่รายจ่ายยอดฮิต */}
        <div className="panel-card">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">สัดส่วนค่าใช้จ่ายหลัก</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>วิเคราะห์รายการรายจ่ายสะสมสูงสุด 5 หมวดหมู่</p>
            </div>
          </div>

          {topExpenses.length === 0 ? (
            <div className="table-empty" style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p>📭 ไม่พบข้อมูลค่าใช้จ่ายเพื่อจำแนกหมวดหมู่</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', justifyContent: 'center', minHeight: '260px' }}>
              <div className="pie-chart-list">
                {topExpenses.map((item, idx) => (
                  <div className="pie-item" key={item.name}>
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                        <div className="pie-legend">
                          <div className="pie-dot" style={{ backgroundColor: brownSpectrum[idx % brownSpectrum.length] }}></div>
                          <span style={{ fontWeight: 500 }}>{item.name}</span>
                        </div>
                        <span className="pie-val">{item.percentage}% ({item.amount.toLocaleString()} ฿)</span>
                      </div>
                      
                      {/* เส้นสัดส่วนเปอร์เซ็นต์แบบ Minimal */}
                      <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-cream)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            width: `${item.percentage}%`, 
                            height: '100%', 
                            backgroundColor: brownSpectrum[idx % brownSpectrum.length],
                            borderRadius: '3px' 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ตารางสรุปยอดบัญชีรายเดือน */}
      <div className="panel-card" style={{ width: '100%' }}>
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 className="panel-title">ตารางสรุปยอดบัญชีรายเดือน</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>วิเคราะห์ผลกำไร-ขาดทุนจริงรายเดือนและเงินคงเหลือสะสมปลายเดือน</p>
          </div>
          {onPrintSummary && (
            <button 
              className="btn btn-primary" 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.4rem', 
                padding: '0.5rem 1rem', 
                fontSize: '0.8rem',
                height: 'fit-content'
              }}
              onClick={onPrintSummary}
            >
              <Printer size={14} />
              <span>พิมพ์รายงาน PDF</span>
            </button>
          )}
        </div>
        
        <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
          <table className="report-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#F5F0EA' }}>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--primary-dark)', borderBottom: '1px solid #A09080' }}>เดือน</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--primary-dark)', borderBottom: '1px solid #A09080' }}>รายรับจริง (บาท)</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--primary-dark)', borderBottom: '1px solid #A09080' }}>รายจ่ายจริง (บาท)</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--primary-dark)', borderBottom: '1px solid #A09080' }}>ส่วนต่างประจำเดือน</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--primary-dark)', borderBottom: '1px solid #A09080' }}>ยอดคงเหลือสะสมสิ้นเดือน</th>
              </tr>
            </thead>
            <tbody>
              {monthlySummaryList.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>📭 ไม่พบข้อมูลรายเดือนเพื่อทำการแสดงผล</td>
                </tr>
              ) : (
                monthlySummaryList.map((m) => (
                  <tr key={m.key} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{m.label}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: 'var(--success)', fontWeight: 500 }}>
                      +{m.income.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: 'var(--danger)', fontWeight: 500 }}>
                      -{m.expense.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: m.net >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                      {m.net >= 0 ? '+' : ''}{m.net.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, color: m.balance >= 0 ? 'var(--primary-dark)' : 'var(--danger)' }}>
                      {m.balance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* บล็อกแจ้งเตือนข้อแนะนำทางการเงินเบื้องต้น */}
      <div className="panel-card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', backgroundColor: 'var(--bg-white)', borderLeft: '4px solid var(--primary-light)' }}>
        <AlertCircle style={{ color: 'var(--primary-brown)', flexShrink: 0 }} size={24} />
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>บทวิเคราะห์สุขภาพทางการเงิน Jamjuree Cafe</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            {netBalance >= 0 
              ? `ยอดคงเหลือสุทธิมีค่าเป็นบวก (+${netBalance.toLocaleString()} บาท) แสดงว่าคาเฟ่มีสภาพคล่องทางการเงินที่ดีในปัจจุบัน ควรบริหารต้นทุนค่าใช้จ่ายหลักเพื่อรักษาระดับกำไร`
              : `แจ้งเตือน! ยอดคงเหลือติดลบ (${netBalance.toLocaleString()} บาท) กรุณาตรวจสอบและบันทึกข้อมูลรายรับเพื่อวิเคราะห์จุดคุ้มทุน หรือพิจารณาปรับลดรายจ่ายที่ไม่จำเป็น`
            }
          </p>
        </div>
      </div>
    </div>
  );
}
