import React, { useState, useEffect } from 'react';
import { Printer, Calendar, CalendarDays, BarChart, ArrowRight } from 'lucide-react';
import { formatThaiDate } from './Transactions';
import schoolLogo from '../school_logo.png';

export default function ReportView({ 
  transactions,
  reportType: propReportType,
  setReportType: propSetReportType,
  selectedYear: propSelectedYear,
  setSelectedYear: propSetSelectedYear
}) {
  // รองรับการแชร์สถานะข้ามคอมโพเนนต์ หรือใช้สถานะในตัวหากไม่มีการส่งมา
  const [localReportType, localSetReportType] = useState('monthly');
  const reportType = propReportType !== undefined ? propReportType : localReportType;
  const setReportType = propSetReportType !== undefined ? propSetReportType : localSetReportType;
  
  // สำหรับช่วงวันที่เลือก
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
  
  const [localSelectedYear, localSetSelectedYear] = useState(new Date().getFullYear());
  const selectedYear = propSelectedYear !== undefined ? propSelectedYear : localSelectedYear;
  const setSelectedYear = propSetSelectedYear !== undefined ? propSetSelectedYear : localSetSelectedYear;
  
  const [selectedQuarter, setSelectedQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3)); // 1-4

  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [filteredData, setFilteredData] = useState([]);

  // คำนวณช่วงของสัปดาห์ (จันทร์ - อาทิตย์) ของวันที่กำหนด
  const getWeekRange = (dateString) => {
    const current = new Date(dateString);
    const day = current.getDay();
    // ปรับให้วันจันทร์เป็นวันแรกของสัปดาห์ (ใน JS 0=อาทิตย์, 1=จันทร์)
    const distanceToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(current);
    monday.setDate(current.getDate() + distanceToMonday);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return {
      start: monday.toISOString().split('T')[0],
      end: sunday.toISOString().split('T')[0]
    };
  };

  // ดึงวันสิ้นสุดของเดือน
  const getMonthRange = (year, month) => {
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return { start, end };
  };

  // ดึงวันเริ่มต้นและสิ้นสุดของไตรมาส
  const getQuarterRange = (year, quarter) => {
    const quarters = {
      1: { startMonth: '01', endMonth: '03', lastDay: '31' },
      2: { startMonth: '04', endMonth: '06', lastDay: '30' },
      3: { startMonth: '07', endMonth: '09', lastDay: '30' },
      4: { startMonth: '10', endMonth: '12', lastDay: '31' }
    };
    const q = quarters[quarter];
    return {
      start: `${year}-${q.startMonth}-01`,
      end: `${year}-${q.endMonth}-${q.lastDay}`
    };
  };

  // ช่วยกรองรายการยอดยกมาเพื่อเอาเฉพาะรายรับ/รายจ่ายจริงมาบวก
  const isBroughtForward = (desc) => {
    if (!desc) return false;
    const d = desc.toLowerCase();
    return d.includes('ยกยอด') || d.includes('ยอดยกมา');
  };

  const getMonthlySummaryTable = () => {
    const months = {};
    const filteredTxs = transactions.filter(t => {
      if (!t.date) return false;
      const yearStr = t.date.substring(0, 4);
      return yearStr === String(selectedYear) && !isBroughtForward(t.description);
    }).sort((a, b) => a.date.localeCompare(b.date));

    filteredTxs.forEach(t => {
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

  // อัปเดตกรอบวันที่และจำแนกข้อมูลตามฟิลเตอร์
  useEffect(() => {
    let range = { start: '', end: '' };

    if (reportType === 'weekly') {
      range = getWeekRange(selectedDate);
    } else if (reportType === 'monthly') {
      range = getMonthRange(selectedYear, selectedMonth);
    } else if (reportType === 'quarterly') {
      range = getQuarterRange(selectedYear, selectedQuarter);
    } else if (reportType === 'yearly' || reportType === 'summary') {
      range = {
        start: `${selectedYear}-01-01`,
        end: `${selectedYear}-12-31`
      };
    }

    setDateRange(range);

    // กรองข้อมูลธุรกรรมที่อยู่ในกรอบวันที่ (dateRange)
    const filtered = transactions.filter(t => {
      return t.date >= range.start && t.date <= range.end;
    }).sort((a, b) => new Date(a.date) - new Date(b.date)); // เรียงตามวันที่เก่าสุดไปหาใหม่สุดสำหรับการทำรายงาน

    setFilteredData(filtered);
  }, [reportType, selectedDate, selectedMonth, selectedYear, selectedQuarter, transactions]);

  // เช็คและคำนวณยอดยกมา
  const getBroughtForwardAmount = () => {
    let bf = 0;
    filteredData.forEach(t => {
      if (isBroughtForward(t.description)) {
        if (t.type === 'income') {
          bf += t.amount;
        } else {
          bf -= t.amount;
        }
      }
    });
    return bf;
  };

  const broughtForwardAmount = getBroughtForwardAmount();

  // คำนวณสรุปการเงินของรายงาน (ไม่นับรวมยอดยกมาในรายรับ/รายจ่ายหลักเพื่อแสดงกำไรขาดทุนจริงประจำเดือน)
  const incomeSum = reportType === 'summary'
    ? monthlySummaryList.reduce((sum, m) => sum + m.income, 0)
    : filteredData
        .filter(t => t.type === 'income' && !isBroughtForward(t.description))
        .reduce((sum, t) => sum + t.amount, 0);

  const expenseSum = reportType === 'summary'
    ? monthlySummaryList.reduce((sum, m) => sum + m.expense, 0)
    : filteredData
        .filter(t => t.type === 'expense' && !isBroughtForward(t.description))
        .reduce((sum, t) => sum + t.amount, 0);

  const balanceSum = reportType === 'summary'
    ? (monthlySummaryList.length > 0 ? monthlySummaryList[monthlySummaryList.length - 1].balance : 0)
    : (incomeSum - expenseSum + broughtForwardAmount);

  const thaiMonthsFull = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  // พิมพ์หัวข้อรายงานในภาษาไทยให้เป็นทางการ
  const getReportTitle = () => {
    const yearTh = selectedYear + 543;
    if (reportType === 'weekly') {
      return `รายงานบัญชีรายรับ-รายจ่าย ประจำสัปดาห์ (${formatThaiDate(dateRange.start)} ถึง ${formatThaiDate(dateRange.end)})`;
    } else if (reportType === 'monthly') {
      return `รายงานบัญชีรายรับ-รายจ่าย ประจำเดือน ${thaiMonthsFull[selectedMonth - 1]} พ.ศ. ${yearTh}`;
    } else if (reportType === 'quarterly') {
      return `รายงานบัญชีรายรับ-รายจ่าย ประจำไตรมาสที่ ${selectedQuarter} พ.ศ. ${yearTh}`;
    } else if (reportType === 'yearly') {
      return `รายงานบัญชีรายรับ-รายจ่าย ประจำปีงบประมาณ พ.ศ. ${yearTh}`;
    } else if (reportType === 'summary') {
      return `รายงานสรุปยอดบัญชีรายรับ-รายจ่าย และยอดคงเหลือรายเดือน ประจำปี พ.ศ. ${yearTh}`;
    }
    return '';
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* ส่วนกรองข้อมูลและปุ่มควบคุมรายงาน (จะซ่อนไว้ตอนกดสั่งพิมพ์ PDF) */}
      <div className="panel-card report-controls">
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', flexGrow: 1, alignItems: 'center' }}>
          
          {/* เลือกประเภทรายงาน */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>เลือกประเภทรายงาน</span>
            <select
              className="filter-select"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="weekly">รายสัปดาห์</option>
              <option value="monthly">รายเดือน</option>
              <option value="quarterly">รายไตรมาส</option>
              <option value="yearly">รายปี</option>
              <option value="summary">รายงานสรุปยอดบัญชีรายเดือน</option>
            </select>
          </div>

          {/* ปรับฟิลเตอร์ตามประเภทรายงานที่เลือก */}
          {reportType === 'weekly' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>เลือกสัปดาห์ของวันที่</span>
              <input
                type="date"
                className="filter-select"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          )}

          {reportType === 'monthly' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>เดือน</span>
                <select
                  className="filter-select"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                >
                  {thaiMonthsFull.map((m, idx) => (
                    <option key={m} value={idx + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>ปี ค.ศ.</span>
                <select
                  className="filter-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  {[2025, 2026, 2027, 2028, 2029].map(y => (
                    <option key={y} value={y}>{y + 543} (พ.ศ.)</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {reportType === 'quarterly' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>ไตรมาส</span>
                <select
                  className="filter-select"
                  value={selectedQuarter}
                  onChange={(e) => setSelectedQuarter(parseInt(e.target.value))}
                >
                  <option value={1}>ไตรมาส 1 (ม.ค. - มี.ค.)</option>
                  <option value={2}>ไตรมาส 2 (เม.ย. - มิ.ย.)</option>
                  <option value={3}>ไตรมาส 3 (ก.ค. - ก.ย.)</option>
                  <option value={4}>ไตรมาส 4 (ต.ค. - ธ.ค.)</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>ปี ค.ศ.</span>
                <select
                  className="filter-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  {[2025, 2026, 2027, 2028, 2029].map(y => (
                    <option key={y} value={y}>{y + 543} (พ.ศ.)</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {(reportType === 'yearly' || reportType === 'summary') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>ประจำปี พ.ศ.</span>
              <select
                className="filter-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >
                {[2025, 2026, 2027, 2028, 2029].map(y => (
                  <option key={y} value={y}>{y + 543}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', borderLeft: '1px solid var(--border)', paddingLeft: '1rem', marginLeft: '0.5rem' }}>
            <span>ช่วงรายงาน:</span>
            <strong>{formatThaiDate(dateRange.start)}</strong>
            <ArrowRight size={14} />
            <strong>{formatThaiDate(dateRange.end)}</strong>
          </div>
        </div>

        {/* ปุ่มสั่งพิมพ์รายงาน */}
        <button className="btn btn-primary" onClick={handlePrint}>
          <Printer size={16} />
          <span>พิมพ์รายงาน (PDF)</span>
        </button>
      </div>

      {/* หน้ากระดาษตัวอย่างเอกสารรายงานสำหรับบันทึกเป็น PDF */}
      <div className="report-view">
        
        {/* หัวกระดาษเอกสาร */}
        <div className="report-header-layout">
          <img src={schoolLogo} className="school-logo-img" alt="โลโก้โรงเรียน" />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#3E2723', marginBottom: '0.25rem' }}>
            รายงานบัญชีรายรับ-รายจ่ายร้านกาแฟ Jamjuree Cafe
          </h2>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 500, color: '#5D4037', marginBottom: '0.5rem' }}>
            โรงเรียนวังน้ำเย็นวิทยาคม สำนักงานเขตพื้นที่การศึกษามัธยมศึกษาสระแก้ว
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {getReportTitle()}
          </p>
        </div>

        {/* ตารางแสดงรายละเอียดธุรกรรมสะสม */}
        <div style={{ overflowX: 'auto', width: '100%', marginBottom: '1.5rem' }}>
          <table className="report-table">
            {reportType === 'summary' ? (
              <>
                <thead>
                  <tr>
                    <th style={{ width: '25%' }}>เดือน</th>
                    <th style={{ width: '20%', textAlign: 'right' }}>รายรับจริง (บาท)</th>
                    <th style={{ width: '20%', textAlign: 'right' }}>รายจ่ายจริง (บาท)</th>
                    <th style={{ width: '15%', textAlign: 'right' }}>ส่วนต่างประจำเดือน</th>
                    <th style={{ width: '20%', textAlign: 'right' }}>ยอดคงเหลือสะสมสิ้นเดือน</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlySummaryList.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                        📭 ไม่มีข้อมูลประวัติรายเดือนเพื่อสรุปยอดในปีนี้
                      </td>
                    </tr>
                  ) : (
                    monthlySummaryList.map((m) => (
                      <tr key={m.key}>
                        <td style={{ fontWeight: 500 }}>{m.label}</td>
                        <td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: 500 }}>
                          {m.income.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ textAlign: 'right', color: 'var(--danger)', fontWeight: 500 }}>
                          {m.expense.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: m.net >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                          {m.net >= 0 ? '+' : ''}{m.net.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: m.balance >= 0 ? 'var(--primary-dark)' : 'var(--danger)' }}>
                          {m.balance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </>
            ) : (
              <>
                <thead>
                  <tr>
                    <th style={{ width: '18%' }}>วัน/เดือน/ปี</th>
                    <th style={{ width: '32%' }}>รายการธุรกรรม</th>
                    <th style={{ width: '15%', textAlign: 'center' }}>ประเภท</th>
                    <th style={{ width: '20%', textAlign: 'right' }}>จำนวนเงิน (บาท)</th>
                    <th style={{ width: '15%' }}>ผู้ทำบันทึก</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                        📭 ไม่มีธุรกรรมที่เกิดขึ้นในช่วงเวลาดังกล่าว
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((t) => (
                      <tr key={t.id}>
                        <td>{formatThaiDate(t.date)}</td>
                        <td style={{ fontWeight: 500 }}>{t.description}</td>
                        <td style={{ textAlign: 'center' }}>
                          {t.type === 'income' ? 'รายรับ' : 'รายจ่าย'}
                        </td>
                        <td style={{ textAlign: 'right' }} className={`amount-text ${t.type === 'income' ? 'income' : 'expense'}`}>
                          {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </td>
                        <td>{t.created_by}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </>
            )}
          </table>
        </div>

        {/* ตารางกล่องรวมสะสมตอนท้าย */}
        <div className="report-summary-box" style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', width: '100%' }}>
          <div className="summary-item" style={{ flex: 1, textAlign: 'center' }}>
            <span className="summary-item-label">ยอดสะสมรายรับจริง</span>
            <span className="summary-item-val" style={{ color: 'var(--success)', display: 'block', marginTop: '0.25rem' }}>
              {incomeSum.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
            </span>
          </div>
          
          {broughtForwardAmount !== 0 && (
            <>
              <div style={{ width: '1px', backgroundColor: 'var(--border)' }}></div>
              <div className="summary-item" style={{ flex: 1, textAlign: 'center' }}>
                <span className="summary-item-label">ยอดยกมาจากเดือนก่อน</span>
                <span className="summary-item-val" style={{ color: broughtForwardAmount >= 0 ? 'var(--success)' : 'var(--danger)', display: 'block', marginTop: '0.25rem' }}>
                  {broughtForwardAmount >= 0 ? '+' : ''}{broughtForwardAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
                </span>
              </div>
            </>
          )}

          <div style={{ width: '1px', backgroundColor: 'var(--border)' }}></div>
          <div className="summary-item" style={{ flex: 1, textAlign: 'center' }}>
            <span className="summary-item-label">ยอดสะสมรายจ่ายจริง</span>
            <span className="summary-item-val" style={{ color: 'var(--danger)', display: 'block', marginTop: '0.25rem' }}>
              {expenseSum.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
            </span>
          </div>

          <div style={{ width: '1px', backgroundColor: 'var(--border)' }}></div>
          <div className="summary-item" style={{ flex: 1, textAlign: 'center' }}>
            <span className="summary-item-label" style={{ fontWeight: 600 }}>ยอดเงินคงเหลือสะสม</span>
            <span className="summary-item-val" style={{ color: balanceSum >= 0 ? 'var(--primary-dark)' : 'var(--danger)', fontWeight: 'bold', display: 'block', marginTop: '0.25rem' }}>
              {balanceSum.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
            </span>
          </div>
        </div>

        {/* ส่วนลายเซ็นท้ายรายงาน */}
        <div className="report-signatures">
          <div className="signature-block">
            <div className="signature-line"></div>
            <p style={{ fontWeight: 500, fontSize: '0.9rem' }}>(ลงชื่อ) ................................................</p>
            <p className="signature-title" style={{ marginTop: '0.25rem' }}>ผู้จัดทำรายงาน / เจ้าหน้าที่คาเฟ่</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>วันที่ _____/_____/__________</p>
          </div>
          <div className="signature-block">
            <div className="signature-line"></div>
            <p style={{ fontWeight: 500, fontSize: '0.9rem' }}>(ลงชื่อ) ................................................</p>
            <p className="signature-title" style={{ marginTop: '0.25rem' }}>ผู้อนุมัติรายงาน / ผู้ดูแลระบบ</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>วันที่ _____/_____/__________</p>
          </div>
        </div>

        {/* ลายน้ำท้ายกระดาษสำหรับอ้างอิงระบบพิมพ์ */}
        <div style={{ 
          marginTop: '4rem', 
          textAlign: 'right', 
          fontSize: '0.65rem', 
          color: 'var(--text-muted)', 
          opacity: 0.6 
        }}>
          พิมพ์โดยระบบบัญชี Jamjuree Cafe • พิมพ์วันที่ {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}
