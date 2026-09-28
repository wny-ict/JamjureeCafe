import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  Calendar, 
  CalendarDays, 
  BarChart, 
  ArrowRight,
  Layers,
  Columns,
  Info,
  CheckCircle2,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
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
  
  // รูปแบบการแสดงผลรายการสำหรับตรวจสอบบัญชี:
  // 'split' = แยกตารางรายรับ และ ตารางรายจ่าย (แนะนำสำหรับการตรวจบัญชี)
  // 'side_by_side' = แยก 2 ฝั่ง ซ้าย-ขวา (แบบสมุดบัญชีมาตรฐาน)
  // 'combined' = รวมทุกรายการเรียงตามลำดับเวลา
  // 'income_only' = เฉพาะรายการรายรับ
  // 'expense_only' = เฉพาะรายการรายจ่าย
  const [viewMode, setViewMode] = useState('split');

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

  // แยกรายการธุรกรรมออกเป็น รายรับ, รายจ่าย และ ยอดยกมา
  const incomeList = filteredData.filter(t => t.type === 'income' && !isBroughtForward(t.description));
  const expenseList = filteredData.filter(t => t.type === 'expense' && !isBroughtForward(t.description));
  const broughtForwardList = filteredData.filter(t => isBroughtForward(t.description));

  const totalIncomeAmount = incomeList.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenseAmount = expenseList.reduce((sum, t) => sum + t.amount, 0);

  // คำนวณสรุปการเงินของรายงาน (ไม่นับรวมยอดยกมาในรายรับ/รายจ่ายหลักเพื่อแสดงกำไรขาดทุนจริงประจำช่วงเวลา)
  const incomeSum = reportType === 'summary'
    ? monthlySummaryList.reduce((sum, m) => sum + m.income, 0)
    : totalIncomeAmount;

  const expenseSum = reportType === 'summary'
    ? monthlySummaryList.reduce((sum, m) => sum + m.expense, 0)
    : totalExpenseAmount;

  const netPeriodMargin = incomeSum - expenseSum;

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

  const getViewModeLabel = () => {
    switch (viewMode) {
      case 'split':
        return 'รูปแบบแยกตารางรายรับ - รายจ่าย';
      case 'side_by_side':
        return 'รูปแบบบัญชีแยก 2 ฝั่ง (รายรับซ้าย - รายจ่ายขวา)';
      case 'income_only':
        return 'เฉพาะรายการรายรับ';
      case 'expense_only':
        return 'เฉพาะรายการรายจ่าย';
      case 'combined':
      default:
        return 'รูปแบบรวมตามลำดับเวลา';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const maxDualRows = Math.max(incomeList.length, expenseList.length, 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* ส่วนกรองข้อมูลและปุ่มควบคุมรายงาน (จะซ่อนไว้ตอนกดสั่งพิมพ์ PDF) */}
      <div className="panel-card report-controls" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* แถวที่ 1: ตัวเลือกช่วงเวลา และปุ่มสั่งพิมพ์ PDF */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            
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

        {/* แถวที่ 2: ตัวเลือกรูปแบบการแสดงผลแยกรายรับ-รายจ่าย สำหรับตรวจบัญชี */}
        {reportType !== 'summary' ? (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            flexWrap: 'wrap', 
            gap: '0.75rem', 
            paddingTop: '0.85rem', 
            borderTop: '1px solid var(--border)' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-brown)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <Layers size={15} />
                รูปแบบการแสดงผล (ตรวจบัญชี):
              </span>
              <div className="report-view-toggle">
                <button
                  type="button"
                  className={`report-toggle-btn ${viewMode === 'split' ? 'active' : ''}`}
                  onClick={() => setViewMode('split')}
                  title="แยกเป็น 2 ตาราง: ตารางรายรับ และ ตารางรายจ่าย พร้อมยอดรวมแต่ละหมวด"
                >
                  <span>📑 แยกตาราง รายรับ - รายจ่าย (แนะนำ)</span>
                </button>
                <button
                  type="button"
                  className={`report-toggle-btn ${viewMode === 'side_by_side' ? 'active' : ''}`}
                  onClick={() => setViewMode('side_by_side')}
                  title="แสดงเทียบเคียง 2 ฝั่ง ซ้ายเป็นรายรับ ขวาเป็นรายจ่าย แบบสมุดบัญชีมาตรฐาน"
                >
                  <span>⚖️ แยก 2 ฝั่ง ซ้าย-ขวา</span>
                </button>
                <button
                  type="button"
                  className={`report-toggle-btn ${viewMode === 'combined' ? 'active' : ''}`}
                  onClick={() => setViewMode('combined')}
                  title="รวมทุกรายการเรียงตามวันที่ทำรายการ"
                >
                  <span>📅 รวมตามวันที่</span>
                </button>
                <button
                  type="button"
                  className={`report-toggle-btn ${viewMode === 'income_only' ? 'active' : ''}`}
                  onClick={() => setViewMode('income_only')}
                  title="แสดงเฉพาะรายการรายรับ เหมาะสำหรับตรวจใบเสร็จรับเงิน"
                >
                  <span>📥 เฉพาะรายรับ</span>
                </button>
                <button
                  type="button"
                  className={`report-toggle-btn ${viewMode === 'expense_only' ? 'active' : ''}`}
                  onClick={() => setViewMode('expense_only')}
                  title="แสดงเฉพาะรายการรายจ่าย เหมาะสำหรับตรวจใบสำคัญจ่ายและบิลซื้อของ"
                >
                  <span>📤 เฉพาะรายจ่าย</span>
                </button>
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <Info size={13} />
              <span>เลือกรูปแบบตารางที่ต้องการ แล้วกดพิมพ์ PDF ได้ทันที</span>
            </div>
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            flexWrap: 'wrap', 
            gap: '0.5rem', 
            paddingTop: '0.85rem', 
            borderTop: '1px solid var(--border)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}>
            <span>📊 แสดงตารางเปรียบเทียบรายรับ-รายจ่ายจริงและเงินสะสม 12 เดือน ประจำปี พ.ศ. {selectedYear + 543}</span>
            <button 
              type="button"
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
              onClick={() => {
                setReportType('yearly');
                setViewMode('split');
              }}
            >
              <span>📑 ดูแจกแจงแยกรายรับ-รายจ่ายทั้งปี พ.ศ. {selectedYear + 543}</span>
            </button>
          </div>
        )}
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
            {reportType !== 'summary' && (
              <strong style={{ marginLeft: '0.5rem', color: 'var(--primary-dark)' }}>
                • {getViewModeLabel()}
              </strong>
            )}
          </p>
        </div>

        {/* การแจ้งเตือนยอดยกมา (ถ้ามี) */}
        {broughtForwardAmount !== 0 && reportType !== 'summary' && (
          <div className="report-bf-notice">
            📌 <strong>ยอดยกมาจากงวดก่อนหน้า:</strong> มีการบันทึกยอดยกมาจำนวน {broughtForwardAmount >= 0 ? '+' : ''}{broughtForwardAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท (นำไปคำนวณในยอดเงินคงเหลือสุทธิ ไม่รวมเป็นรายรับ/รายจ่ายของงวดนี้ เพื่อความถูกต้องในการตรวจสอบบัญชี)
          </div>
        )}

        {/* 1. โหมดรายงานสรุปยอดบัญชีรายเดือน (Summary Table) */}
        {reportType === 'summary' && (
          <div style={{ overflowX: 'auto', width: '100%', marginBottom: '1.5rem' }}>
            <table className="report-table">
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
                      <td style={{ textAlign: 'right', color: 'var(--success-dark, #2e7d32)', fontWeight: 500 }}>
                        {m.income.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--danger-dark, #c62828)', fontWeight: 500 }}>
                        {m.expense.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: m.net >= 0 ? 'var(--success-dark, #2e7d32)' : 'var(--danger-dark, #c62828)' }}>
                        {m.net >= 0 ? '+' : ''}{m.net.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: m.balance >= 0 ? 'var(--primary-dark)' : 'var(--danger-dark, #c62828)' }}>
                        {m.balance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="report-subtotal-row">
                  <td style={{ fontWeight: 700 }}>รวมทั้งสิ้นทั้งปี (12 เดือน)</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--success-dark, #2e7d32)' }}>
                    {incomeSum.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--danger-dark, #c62828)' }}>
                    {expenseSum.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: netPeriodMargin >= 0 ? 'var(--success-dark, #2e7d32)' : 'var(--danger-dark, #c62828)' }}>
                    {netPeriodMargin >= 0 ? '+' : ''}{netPeriodMargin.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: balanceSum >= 0 ? 'var(--primary-dark)' : 'var(--danger-dark, #c62828)' }}>
                    {balanceSum.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* 2. โหมดแยกตาราง: รายรับ และ รายจ่าย (Split Tables) - แนะนำสำหรับการตรวจบัญชี */}
        {reportType !== 'summary' && viewMode === 'split' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '1.5rem' }}>
            
            {/* 2.1 ตารางรายการรายรับ */}
            <div>
              <div className="report-table-header income">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="report-badge-dot income"></span>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                    หมวดที่ 1: รายการรายรับ (Income Records)
                  </h4>
                  <span className="report-badge income">{incomeList.length} รายการ</span>
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  ยอดรวมรายรับ: {totalIncomeAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
                </div>
              </div>

              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table className="report-table">
                  <thead>
                    <tr>
                      <th style={{ width: '8%', textAlign: 'center' }}>ลำดับ</th>
                      <th style={{ width: '18%' }}>วัน/เดือน/ปี</th>
                      <th style={{ width: '38%' }}>รายการรายรับ</th>
                      <th style={{ width: '18%' }}>ผู้ทำบันทึก</th>
                      <th style={{ width: '18%', textAlign: 'right' }}>จำนวนเงิน (บาท)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomeList.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                          📭 ไม่มีรายการรายรับในช่วงเวลานี้
                        </td>
                      </tr>
                    ) : (
                      incomeList.map((t, index) => (
                        <tr key={t.id || index}>
                          <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{index + 1}</td>
                          <td>{formatThaiDate(t.date)}</td>
                          <td>
                            <div style={{ fontWeight: 500 }}>{t.description}</div>
                            {t.note && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                หมายเหตุ: {t.note}
                              </div>
                            )}
                          </td>
                          <td>{t.created_by || '-'}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--success-dark, #2e7d32)' }}>
                            +{t.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="report-subtotal-row">
                      <td colSpan="4" style={{ textAlign: 'right', fontWeight: 700 }}>
                        รวมรายรับทั้งสิ้น ({incomeList.length} รายการ):
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--success-dark, #2e7d32)' }}>
                        {totalIncomeAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* 2.2 ตารางรายการรายจ่าย */}
            <div>
              <div className="report-table-header expense">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="report-badge-dot expense"></span>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                    หมวดที่ 2: รายการรายจ่าย (Expense Records)
                  </h4>
                  <span className="report-badge expense">{expenseList.length} รายการ</span>
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  ยอดรวมรายจ่าย: {totalExpenseAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
                </div>
              </div>

              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table className="report-table">
                  <thead>
                    <tr>
                      <th style={{ width: '8%', textAlign: 'center' }}>ลำดับ</th>
                      <th style={{ width: '18%' }}>วัน/เดือน/ปี</th>
                      <th style={{ width: '38%' }}>รายการรายจ่าย</th>
                      <th style={{ width: '18%' }}>ผู้ทำบันทึก</th>
                      <th style={{ width: '18%', textAlign: 'right' }}>จำนวนเงิน (บาท)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenseList.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                          📭 ไม่มีรายการรายจ่ายในช่วงเวลานี้
                        </td>
                      </tr>
                    ) : (
                      expenseList.map((t, index) => (
                        <tr key={t.id || index}>
                          <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{index + 1}</td>
                          <td>{formatThaiDate(t.date)}</td>
                          <td>
                            <div style={{ fontWeight: 500 }}>{t.description}</div>
                            {t.note && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                หมายเหตุ: {t.note}
                              </div>
                            )}
                          </td>
                          <td>{t.created_by || '-'}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--danger-dark, #c62828)' }}>
                            -{t.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="report-subtotal-row">
                      <td colSpan="4" style={{ textAlign: 'right', fontWeight: 700 }}>
                        รวมรายจ่ายทั้งสิ้น ({expenseList.length} รายการ):
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--danger-dark, #c62828)' }}>
                        {totalExpenseAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* 3. โหมดแยก 2 ฝั่ง ซ้าย-ขวา (Side-by-Side Dual Ledger) แบบสมุดบัญชีมาตรฐาน */}
        {reportType !== 'summary' && viewMode === 'side_by_side' && (
          <div style={{ overflowX: 'auto', width: '100%', marginBottom: '1.5rem' }}>
            <table className="report-table report-dual-table">
              <thead>
                <tr>
                  <th colSpan="4" style={{ textAlign: 'center', backgroundColor: '#E8F5E9', color: '#1B5E20', borderBottom: '2px solid #81C784' }}>
                    📥 ฝั่งรายรับ (Income) - {incomeList.length} รายการ
                  </th>
                  <th colSpan="4" style={{ textAlign: 'center', backgroundColor: '#FFEBEE', color: '#B71C1C', borderBottom: '2px solid #E57373' }}>
                    📤 ฝั่งรายจ่าย (Expense) - {expenseList.length} รายการ
                  </th>
                </tr>
                <tr>
                  {/* คอลัมน์รายรับ */}
                  <th style={{ width: '5%', textAlign: 'center' }}>ที่</th>
                  <th style={{ width: '13%' }}>วัน/เดือน/ปี</th>
                  <th style={{ width: '20%' }}>รายการรายรับ</th>
                  <th style={{ width: '12%', textAlign: 'right' }}>จำนวนเงิน (บาท)</th>
                  {/* คอลัมน์รายจ่าย */}
                  <th style={{ width: '5%', textAlign: 'center' }}>ที่</th>
                  <th style={{ width: '13%' }}>วัน/เดือน/ปี</th>
                  <th style={{ width: '20%' }}>รายการรายจ่าย</th>
                  <th style={{ width: '12%', textAlign: 'right' }}>จำนวนเงิน (บาท)</th>
                </tr>
              </thead>
              <tbody>
                {incomeList.length === 0 && expenseList.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                      📭 ไม่มีธุรกรรมที่เกิดขึ้นในช่วงเวลาดังกล่าว
                    </td>
                  </tr>
                ) : (
                  Array.from({ length: maxDualRows }).map((_, idx) => {
                    const inc = incomeList[idx];
                    const exp = expenseList[idx];
                    return (
                      <tr key={idx}>
                        {/* ฝั่งรายรับ */}
                        {inc ? (
                          <>
                            <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{idx + 1}</td>
                            <td>{formatThaiDate(inc.date)}</td>
                            <td>
                              <span style={{ fontWeight: 500 }}>{inc.description}</span>
                              {inc.note && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>({inc.note})</span>}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--success-dark, #2e7d32)' }}>
                              {inc.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                            </td>
                          </>
                        ) : (
                          <>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                          </>
                        )}

                        {/* ฝั่งรายจ่าย */}
                        {exp ? (
                          <>
                            <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{idx + 1}</td>
                            <td>{formatThaiDate(exp.date)}</td>
                            <td>
                              <span style={{ fontWeight: 500 }}>{exp.description}</span>
                              {exp.note && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>({exp.note})</span>}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--danger-dark, #c62828)' }}>
                              {exp.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                            </td>
                          </>
                        ) : (
                          <>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                          </>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
              <tfoot>
                <tr className="report-subtotal-row">
                  <td colSpan="3" style={{ textAlign: 'right', fontWeight: 700 }}>
                    รวมรายรับทั้งสิ้น ({incomeList.length} รายการ):
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--success-dark, #2e7d32)' }}>
                    {totalIncomeAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </td>
                  <td colSpan="3" style={{ textAlign: 'right', fontWeight: 700 }}>
                    รวมรายจ่ายทั้งสิ้น ({expenseList.length} รายการ):
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--danger-dark, #c62828)' }}>
                    {totalExpenseAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* 4. โหมดเฉพาะรายการรายรับ (Income Only) */}
        {reportType !== 'summary' && viewMode === 'income_only' && (
          <div style={{ overflowX: 'auto', width: '100%', marginBottom: '1.5rem' }}>
            <div className="report-table-header income">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="report-badge-dot income"></span>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                  บัญชีรายการรายรับ (Income Records)
                </h4>
                <span className="report-badge income">{incomeList.length} รายการ</span>
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                ยอดรวมรายรับ: {totalIncomeAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
              </div>
            </div>

            <table className="report-table">
              <thead>
                <tr>
                  <th style={{ width: '8%', textAlign: 'center' }}>ลำดับ</th>
                  <th style={{ width: '18%' }}>วัน/เดือน/ปี</th>
                  <th style={{ width: '38%' }}>รายการรายรับ</th>
                  <th style={{ width: '18%' }}>ผู้ทำบันทึก</th>
                  <th style={{ width: '18%', textAlign: 'right' }}>จำนวนเงิน (บาท)</th>
                </tr>
              </thead>
              <tbody>
                {incomeList.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem' }}>
                      📭 ไม่มีรายการรายรับในช่วงเวลานี้
                    </td>
                  </tr>
                ) : (
                  incomeList.map((t, index) => (
                    <tr key={t.id || index}>
                      <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{index + 1}</td>
                      <td>{formatThaiDate(t.date)}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{t.description}</div>
                        {t.note && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            หมายเหตุ: {t.note}
                          </div>
                        )}
                      </td>
                      <td>{t.created_by || '-'}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--success-dark, #2e7d32)' }}>
                        +{t.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="report-subtotal-row">
                  <td colSpan="4" style={{ textAlign: 'right', fontWeight: 700 }}>
                    รวมรายรับทั้งสิ้น ({incomeList.length} รายการ):
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--success-dark, #2e7d32)' }}>
                    {totalIncomeAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* 5. โหมดเฉพาะรายการรายจ่าย (Expense Only) */}
        {reportType !== 'summary' && viewMode === 'expense_only' && (
          <div style={{ overflowX: 'auto', width: '100%', marginBottom: '1.5rem' }}>
            <div className="report-table-header expense">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="report-badge-dot expense"></span>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                  บัญชีรายการรายจ่าย (Expense Records)
                </h4>
                <span className="report-badge expense">{expenseList.length} รายการ</span>
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                ยอดรวมรายจ่าย: {totalExpenseAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
              </div>
            </div>

            <table className="report-table">
              <thead>
                <tr>
                  <th style={{ width: '8%', textAlign: 'center' }}>ลำดับ</th>
                  <th style={{ width: '18%' }}>วัน/เดือน/ปี</th>
                  <th style={{ width: '38%' }}>รายการรายจ่าย</th>
                  <th style={{ width: '18%' }}>ผู้ทำบันทึก</th>
                  <th style={{ width: '18%', textAlign: 'right' }}>จำนวนเงิน (บาท)</th>
                </tr>
              </thead>
              <tbody>
                {expenseList.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem' }}>
                      📭 ไม่มีรายการรายจ่ายในช่วงเวลานี้
                    </td>
                  </tr>
                ) : (
                  expenseList.map((t, index) => (
                    <tr key={t.id || index}>
                      <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{index + 1}</td>
                      <td>{formatThaiDate(t.date)}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{t.description}</div>
                        {t.note && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            หมายเหตุ: {t.note}
                          </div>
                        )}
                      </td>
                      <td>{t.created_by || '-'}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--danger-dark, #c62828)' }}>
                        -{t.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="report-subtotal-row">
                  <td colSpan="4" style={{ textAlign: 'right', fontWeight: 700 }}>
                    รวมรายจ่ายทั้งสิ้น ({expenseList.length} รายการ):
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--danger-dark, #c62828)' }}>
                    {totalExpenseAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* 6. โหมดเดิม: รวมทุกรายการเรียงตามลำดับเวลา (Combined Chronological) */}
        {reportType !== 'summary' && viewMode === 'combined' && (
          <div style={{ overflowX: 'auto', width: '100%', marginBottom: '1.5rem' }}>
            <table className="report-table">
              <thead>
                <tr>
                  <th style={{ width: '6%', textAlign: 'center' }}>ลำดับ</th>
                  <th style={{ width: '16%' }}>วัน/เดือน/ปี</th>
                  <th style={{ width: '34%' }}>รายการธุรกรรม</th>
                  <th style={{ width: '12%', textAlign: 'center' }}>ประเภท</th>
                  <th style={{ width: '18%', textAlign: 'right' }}>จำนวนเงิน (บาท)</th>
                  <th style={{ width: '14%' }}>ผู้ทำบันทึก</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                      📭 ไม่มีธุรกรรมที่เกิดขึ้นในช่วงเวลาดังกล่าว
                    </td>
                  </tr>
                ) : (
                  filteredData.map((t, idx) => (
                    <tr key={t.id || idx}>
                      <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{idx + 1}</td>
                      <td>{formatThaiDate(t.date)}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{t.description}</div>
                        {t.note && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            หมายเหตุ: {t.note}
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {isBroughtForward(t.description) ? (
                          <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.4rem', borderRadius: '4px', backgroundColor: '#FFF9E6', color: '#B78103', fontWeight: 600 }}>
                            ยอดยกมา
                          </span>
                        ) : t.type === 'income' ? (
                          <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.4rem', borderRadius: '4px', backgroundColor: '#E8F5E9', color: '#1B5E20', fontWeight: 600 }}>
                            รายรับ
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.4rem', borderRadius: '4px', backgroundColor: '#FFEBEE', color: '#B71C1C', fontWeight: 600 }}>
                            รายจ่าย
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }} className={`amount-text ${t.type === 'income' ? 'income' : 'expense'}`}>
                        {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                      <td>{t.created_by || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="report-subtotal-row">
                  <td colSpan="4" style={{ textAlign: 'right', fontWeight: 700 }}>
                    รวมรายรับ {totalIncomeAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} | รวมรายจ่าย:
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--danger-dark, #c62828)' }}>
                    {totalExpenseAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* ตารางกล่องรวมสะสมตอนท้าย (Reconciliation Summary Box) */}
        <div className="report-summary-box" style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', width: '100%', flexWrap: 'wrap' }}>
          
          {/* กล่องรายรับ */}
          <div className="summary-item" style={{ flex: 1, minWidth: '130px', textAlign: 'center' }}>
            <span className="summary-item-label">ยอดสะสมรายรับจริง</span>
            <span className="summary-item-val" style={{ color: 'var(--success-dark, #2e7d32)', display: 'block', marginTop: '0.25rem' }}>
              {incomeSum.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
            </span>
            {reportType !== 'summary' && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                ({incomeList.length} รายการ)
              </span>
            )}
          </div>
          
          {/* กล่องยอดยกมา (ถ้ามี) */}
          {broughtForwardAmount !== 0 && (
            <>
              <div style={{ width: '1px', backgroundColor: 'var(--border)' }}></div>
              <div className="summary-item" style={{ flex: 1, minWidth: '130px', textAlign: 'center' }}>
                <span className="summary-item-label">ยอดยกมาจากเดือนก่อน</span>
                <span className="summary-item-val" style={{ color: broughtForwardAmount >= 0 ? 'var(--success-dark, #2e7d32)' : 'var(--danger-dark, #c62828)', display: 'block', marginTop: '0.25rem' }}>
                  {broughtForwardAmount >= 0 ? '+' : ''}{broughtForwardAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
                </span>
              </div>
            </>
          )}

          {/* กล่องรายจ่าย */}
          <div style={{ width: '1px', backgroundColor: 'var(--border)' }}></div>
          <div className="summary-item" style={{ flex: 1, minWidth: '130px', textAlign: 'center' }}>
            <span className="summary-item-label">ยอดสะสมรายจ่ายจริง</span>
            <span className="summary-item-val" style={{ color: 'var(--danger-dark, #c62828)', display: 'block', marginTop: '0.25rem' }}>
              {expenseSum.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
            </span>
            {reportType !== 'summary' && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                ({expenseList.length} รายการ)
              </span>
            )}
          </div>

          {/* กล่องผลต่างกำไร-ขาดทุนประจำงวด */}
          <div style={{ width: '1px', backgroundColor: 'var(--border)' }}></div>
          <div className="summary-item" style={{ flex: 1, minWidth: '130px', textAlign: 'center' }}>
            <span className="summary-item-label">กำไร / ส่วนต่างประจำงวด</span>
            <span className="summary-item-val" style={{ color: netPeriodMargin >= 0 ? 'var(--success-dark, #2e7d32)' : 'var(--danger-dark, #c62828)', display: 'block', marginTop: '0.25rem' }}>
              {netPeriodMargin >= 0 ? '+' : ''}{netPeriodMargin.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {netPeriodMargin >= 0 ? 'ผลกำไรจากการดำเนินงาน' : 'รายจ่ายสูงกว่ารายรับ'}
            </span>
          </div>

          {/* กล่องเงินคงเหลือสุทธิ */}
          <div style={{ width: '1px', backgroundColor: 'var(--border)' }}></div>
          <div className="summary-item" style={{ flex: 1, minWidth: '130px', textAlign: 'center' }}>
            <span className="summary-item-label" style={{ fontWeight: 600 }}>ยอดเงินคงเหลือสะสมสุทธิ</span>
            <span className="summary-item-val" style={{ color: balanceSum >= 0 ? 'var(--primary-dark)' : 'var(--danger-dark, #c62828)', fontWeight: 'bold', display: 'block', marginTop: '0.25rem' }}>
              {balanceSum.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              ยอดเงินคงคลัง ณ ปัจจุบัน
            </span>
          </div>
        </div>

        {/* ส่วนลายเซ็นท้ายรายงาน สำหรับการตรวจบัญชี */}
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
            <p className="signature-title" style={{ marginTop: '0.25rem' }}>ผู้ตรวจรับรองบัญชี / ผู้ดูแลระบบ</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>วันที่ _____/_____/__________</p>
          </div>
        </div>

        {/* ลายน้ำท้ายกระดาษสำหรับอ้างอิงระบบพิมพ์ */}
        <div style={{ 
          marginTop: '3.5rem', 
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
