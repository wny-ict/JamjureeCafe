import React, { useState, useEffect } from 'react';
import { 
  Coffee, UserCheck, Shield, LayoutDashboard, 
  ListOrdered, FileSpreadsheet, Settings, LogOut, 
  Wifi, WifiOff, CheckCircle2, AlertTriangle, Info, Copy, Check, Key
} from 'lucide-react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import TransactionForm from './components/TransactionForm';
import ReportView from './components/ReportView';
import schoolLogo from './school_logo.png';

// ข้อมูลจริงของเดือน May 2569 แกะตามรูปตารางสเปรดชีตของคุณครูทั้งหมด 39 แถว (รายรับ 15 รายการ, รายจ่าย 24 รายการ)
const MOCK_DATA = [
  {
    "id": "TX-MIG-Jun-30-INC-1",
    "date": "2026-06-30",
    "type": "income",
    "description": "รับเงินสด",
    "amount": 6536,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:92.000Z"
  },
  {
    "id": "TX-MIG-Jun-30-INC-2",
    "date": "2026-06-30",
    "type": "income",
    "description": "รับเงินโอน",
    "amount": 2775,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:91.000Z"
  },
  {
    "id": "TX-MIG-Jun-30-EXP-1",
    "date": "2026-06-30",
    "type": "expense",
    "description": "ซื้อวัตถุดิบ",
    "amount": 2727,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:90.000Z"
  },
  {
    "id": "TX-MIG-Jun-29-INC-1",
    "date": "2026-06-29",
    "type": "income",
    "description": "รับเงินสด",
    "amount": 6975,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:89.000Z"
  },
  {
    "id": "TX-MIG-Jun-29-INC-2",
    "date": "2026-06-29",
    "type": "income",
    "description": "รับเงินโอน",
    "amount": 2590,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:88.000Z"
  },
  {
    "id": "TX-MIG-Jun-29-EXP-1",
    "date": "2026-06-29",
    "type": "expense",
    "description": "ซื้อวัตถุดิบ",
    "amount": 1899,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:87.000Z"
  },
  {
    "id": "TX-MIG-Jun-29-EXP-2",
    "date": "2026-06-29",
    "type": "expense",
    "description": "นมเมจิ",
    "amount": 1380,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:86.000Z"
  },
  {
    "id": "TX-MIG-Jun-29-EXP-3",
    "date": "2026-06-29",
    "type": "expense",
    "description": "จ่ายค่าตู้แช่ที่เหลือ",
    "amount": 20000,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:85.000Z"
  },
  {
    "id": "TX-MIG-Jun-28-EXP-1",
    "date": "2026-06-28",
    "type": "expense",
    "description": "จ่ายค่าวัตถุดิบ",
    "amount": 1833,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:84.000Z"
  },
  {
    "id": "TX-MIG-Jun-28-EXP-2",
    "date": "2026-06-28",
    "type": "expense",
    "description": "ซื้อของแม็คโคร",
    "amount": 5520,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:83.000Z"
  },
  {
    "id": "TX-MIG-Jun-26-INC-1",
    "date": "2026-06-26",
    "type": "income",
    "description": "รับเงินสด",
    "amount": 6540,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:82.000Z"
  },
  {
    "id": "TX-MIG-Jun-26-INC-2",
    "date": "2026-06-26",
    "type": "income",
    "description": "รับเงินโอน",
    "amount": 2170,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:81.000Z"
  },
  {
    "id": "TX-MIG-Jun-26-EXP-1",
    "date": "2026-06-26",
    "type": "expense",
    "description": "ซื้อวัตถุดิบ",
    "amount": 4648,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:80.000Z"
  },
  {
    "id": "TX-MIG-Jun-26-EXP-2",
    "date": "2026-06-26",
    "type": "expense",
    "description": "ค่าจ้างพนักงาน",
    "amount": 4350,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:79.000Z"
  },
  {
    "id": "TX-MIG-Jun-26-EXP-3",
    "date": "2026-06-26",
    "type": "expense",
    "description": "ค่าขนมเบเกอรี่",
    "amount": 3290,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:78.000Z"
  },
  {
    "id": "TX-MIG-Jun-25-INC-1",
    "date": "2026-06-25",
    "type": "income",
    "description": "รับเงินสด",
    "amount": 6645,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:77.000Z"
  },
  {
    "id": "TX-MIG-Jun-25-INC-2",
    "date": "2026-06-25",
    "type": "income",
    "description": "รับเงินโอน",
    "amount": 1535,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:76.000Z"
  },
  {
    "id": "TX-MIG-Jun-25-EXP-1",
    "date": "2026-06-25",
    "type": "expense",
    "description": "ซื้อวัตถุดิบ",
    "amount": 742,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:75.000Z"
  },
  {
    "id": "TX-MIG-Jun-25-EXP-2",
    "date": "2026-06-25",
    "type": "expense",
    "description": "จ่ายค่างวดสหกรณ์",
    "amount": 4481,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:74.000Z"
  },
  {
    "id": "TX-MIG-Jun-25-EXP-3",
    "date": "2026-06-25",
    "type": "expense",
    "description": "จ่ายค่าผงชงน้ำ",
    "amount": 1867,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:73.000Z"
  },
  {
    "id": "TX-MIG-Jun-24-INC-1",
    "date": "2026-06-24",
    "type": "income",
    "description": "รับเงินสด",
    "amount": 7090,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:72.000Z"
  },
  {
    "id": "TX-MIG-Jun-24-INC-2",
    "date": "2026-06-24",
    "type": "income",
    "description": "รับเงินโอน",
    "amount": 1715,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:71.000Z"
  },
  {
    "id": "TX-MIG-Jun-24-EXP-1",
    "date": "2026-06-24",
    "type": "expense",
    "description": "ซื้อวัตถุดิบ",
    "amount": 1207,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:70.000Z"
  },
  {
    "id": "TX-MIG-Jun-24-EXP-2",
    "date": "2026-06-24",
    "type": "expense",
    "description": "ซื้อของแม็คโคร",
    "amount": 2302,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:69.000Z"
  },
  {
    "id": "TX-MIG-Jun-23-INC-1",
    "date": "2026-06-23",
    "type": "income",
    "description": "รับเงินสด",
    "amount": 5985,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:68.000Z"
  },
  {
    "id": "TX-MIG-Jun-23-INC-2",
    "date": "2026-06-23",
    "type": "income",
    "description": "รับเงินโอน",
    "amount": 1410,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:67.000Z"
  },
  {
    "id": "TX-MIG-Jun-23-EXP-1",
    "date": "2026-06-23",
    "type": "expense",
    "description": "จ่ายค่าอุปกรณ์ที่ค้าง",
    "amount": 10000,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:66.000Z"
  },
  {
    "id": "TX-MIG-Jun-23-EXP-2",
    "date": "2026-06-23",
    "type": "expense",
    "description": "ซื้อวัตถุดิบ",
    "amount": 2849,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:65.000Z"
  },
  {
    "id": "TX-MIG-Jun-23-EXP-3",
    "date": "2026-06-23",
    "type": "expense",
    "description": "ซื้อของแม็คโคร",
    "amount": 2675,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:64.000Z"
  },
  {
    "id": "TX-MIG-Jun-22-INC-1",
    "date": "2026-06-22",
    "type": "income",
    "description": "รับเงินสด",
    "amount": 6940,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:63.000Z"
  },
  {
    "id": "TX-MIG-Jun-22-INC-2",
    "date": "2026-06-22",
    "type": "income",
    "description": "รับเงินโอน",
    "amount": 1355,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:62.000Z"
  },
  {
    "id": "TX-MIG-Jun-22-EXP-1",
    "date": "2026-06-22",
    "type": "expense",
    "description": "จ่ายค่าวัตถุดิบ",
    "amount": 580,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:61.000Z"
  },
  {
    "id": "TX-MIG-Jun-22-EXP-2",
    "date": "2026-06-22",
    "type": "expense",
    "description": "จ่ายค่ากาแฟ",
    "amount": 1192,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:60.000Z"
  },
  {
    "id": "TX-MIG-Jun-22-EXP-3",
    "date": "2026-06-22",
    "type": "expense",
    "description": "จ่ายค่าแม็คโคร",
    "amount": 4739,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:59.000Z"
  },
  {
    "id": "TX-MIG-Jun-19-INC-1",
    "date": "2026-06-19",
    "type": "income",
    "description": "รับเงินสด",
    "amount": 6920,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:58.000Z"
  },
  {
    "id": "TX-MIG-Jun-19-INC-2",
    "date": "2026-06-19",
    "type": "income",
    "description": "รับเงินโอน",
    "amount": 1290,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:57.000Z"
  },
  {
    "id": "TX-MIG-Jun-19-EXP-1",
    "date": "2026-06-19",
    "type": "expense",
    "description": "ซื้อวัตถุดิบ",
    "amount": 819,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:56.000Z"
  },
  {
    "id": "TX-MIG-Jun-19-EXP-2",
    "date": "2026-06-19",
    "type": "expense",
    "description": "จ่ายค่าขนมเบเกอรี่",
    "amount": 2380,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:55.000Z"
  },
  {
    "id": "TX-MIG-Jun-19-EXP-3",
    "date": "2026-06-19",
    "type": "expense",
    "description": "จ่ายค่าจ้างพนักงาน",
    "amount": 4000,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:54.000Z"
  },
  {
    "id": "TX-MIG-Jun-19-EXP-4",
    "date": "2026-06-19",
    "type": "expense",
    "description": "จ่ายค่าแก้วกาแฟ",
    "amount": 8900,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:53.000Z"
  },
  {
    "id": "TX-MIG-Jun-18-INC-1",
    "date": "2026-06-18",
    "type": "income",
    "description": "รับเงินสด",
    "amount": 9055,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:52.000Z"
  },
  {
    "id": "TX-MIG-Jun-18-INC-2",
    "date": "2026-06-18",
    "type": "income",
    "description": "รับเงินโอน",
    "amount": 1670,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:51.000Z"
  },
  {
    "id": "TX-MIG-Jun-18-EXP-1",
    "date": "2026-06-18",
    "type": "expense",
    "description": "ซื้อวัตถุดิบ",
    "amount": 651,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:50.000Z"
  },
  {
    "id": "TX-MIG-Jun-17-INC-1",
    "date": "2026-06-17",
    "type": "income",
    "description": "รับเงินสด",
    "amount": 6635,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:49.000Z"
  },
  {
    "id": "TX-MIG-Jun-17-INC-2",
    "date": "2026-06-17",
    "type": "income",
    "description": "รับเงินโอน",
    "amount": 670,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:48.000Z"
  },
  {
    "id": "TX-MIG-Jun-17-EXP-1",
    "date": "2026-06-17",
    "type": "expense",
    "description": "จ่ายค่าวัตถุดิบ",
    "amount": 1275,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:47.000Z"
  },
  {
    "id": "TX-MIG-Jun-16-INC-1",
    "date": "2026-06-16",
    "type": "income",
    "description": "รับเงินสด",
    "amount": 6605,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:46.000Z"
  },
  {
    "id": "TX-MIG-Jun-16-INC-2",
    "date": "2026-06-16",
    "type": "income",
    "description": "รับเงินโอน",
    "amount": 745,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:45.000Z"
  },
  {
    "id": "TX-MIG-Jun-16-EXP-1",
    "date": "2026-06-16",
    "type": "expense",
    "description": "จ่ายค่าวัตถุดิบ",
    "amount": 1764,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:44.000Z"
  },
  {
    "id": "TX-MIG-Jun-15-INC-1",
    "date": "2026-06-15",
    "type": "income",
    "description": "รับเงินสด",
    "amount": 7710,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:43.000Z"
  },
  {
    "id": "TX-MIG-Jun-15-INC-2",
    "date": "2026-06-15",
    "type": "income",
    "description": "รับเงินโอน",
    "amount": 555,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:42.000Z"
  },
  {
    "id": "TX-MIG-Jun-15-EXP-1",
    "date": "2026-06-15",
    "type": "expense",
    "description": "จ่ายค่าวัตถุดิบ",
    "amount": 610,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:41.000Z"
  },
  {
    "id": "TX-MIG-Jun-15-EXP-2",
    "date": "2026-06-15",
    "type": "expense",
    "description": "จ่ายค่าไซรัป",
    "amount": 812,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:40.000Z"
  },
  {
    "id": "TX-MIG-Jun-13-EXP-1",
    "date": "2026-06-13",
    "type": "expense",
    "description": "ซื้อวัตถุดิบ",
    "amount": 414,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:39.000Z"
  },
  {
    "id": "TX-MIG-Jun-13-EXP-2",
    "date": "2026-06-13",
    "type": "expense",
    "description": "จ่ายค่าแม็คโคร",
    "amount": 5837.5,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:38.000Z"
  },
  {
    "id": "TX-MIG-Jun-12-INC-1",
    "date": "2026-06-12",
    "type": "income",
    "description": "ขายได้เงินสด",
    "amount": 7140,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:37.000Z"
  },
  {
    "id": "TX-MIG-Jun-12-INC-2",
    "date": "2026-06-12",
    "type": "income",
    "description": "ขายได้เงินโอน",
    "amount": 1080,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:36.000Z"
  },
  {
    "id": "TX-MIG-Jun-12-EXP-1",
    "date": "2026-06-12",
    "type": "expense",
    "description": "ซื้อวัตถุดิบ",
    "amount": 4643,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:35.000Z"
  },
  {
    "id": "TX-MIG-Jun-12-EXP-2",
    "date": "2026-06-12",
    "type": "expense",
    "description": "ค่าขนมเบเกอรี่",
    "amount": 2340,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:34.000Z"
  },
  {
    "id": "TX-MIG-Jun-12-EXP-3",
    "date": "2026-06-12",
    "type": "expense",
    "description": "ค่าจ้างพนักงาน",
    "amount": 4250,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:33.000Z"
  },
  {
    "id": "TX-MIG-Jun-11-INC-1",
    "date": "2026-06-11",
    "type": "income",
    "description": "ขายได้เงินสด",
    "amount": 7145,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:32.000Z"
  },
  {
    "id": "TX-MIG-Jun-11-INC-2",
    "date": "2026-06-11",
    "type": "income",
    "description": "ขายได้เงินโอน",
    "amount": 1810,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:31.000Z"
  },
  {
    "id": "TX-MIG-Jun-11-EXP-1",
    "date": "2026-06-11",
    "type": "expense",
    "description": "ซื้อวัตถุดิบ",
    "amount": 925,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:30.000Z"
  },
  {
    "id": "TX-MIG-Jun-10-INC-1",
    "date": "2026-06-10",
    "type": "income",
    "description": "ขายได้เงินสด",
    "amount": 12280,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:29.000Z"
  },
  {
    "id": "TX-MIG-Jun-10-INC-2",
    "date": "2026-06-10",
    "type": "income",
    "description": "ขายได้เงินโอน",
    "amount": 1345,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:28.000Z"
  },
  {
    "id": "TX-MIG-Jun-10-EXP-1",
    "date": "2026-06-10",
    "type": "expense",
    "description": "ซื้อวัตถุดิบ",
    "amount": 2235,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:27.000Z"
  },
  {
    "id": "TX-MIG-Jun-10-EXP-2",
    "date": "2026-06-10",
    "type": "expense",
    "description": "จ่ายค่าตู้แช่งวดที่2",
    "amount": 5000,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:26.000Z"
  },
  {
    "id": "TX-MIG-Jun-10-EXP-3",
    "date": "2026-06-10",
    "type": "expense",
    "description": "ซื้อวัตถุดิบ",
    "amount": 1460,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:25.000Z"
  },
  {
    "id": "TX-MIG-Jun-09-INC-1",
    "date": "2026-06-09",
    "type": "income",
    "description": "ขายได้เงินสด",
    "amount": 9440,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:24.000Z"
  },
  {
    "id": "TX-MIG-Jun-09-INC-2",
    "date": "2026-06-09",
    "type": "income",
    "description": "ขายได้เงินโอน",
    "amount": 720,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:23.000Z"
  },
  {
    "id": "TX-MIG-Jun-09-EXP-1",
    "date": "2026-06-09",
    "type": "expense",
    "description": "ซื้อวัตถุดิบ",
    "amount": 702,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:22.000Z"
  },
  {
    "id": "TX-MIG-Jun-09-EXP-2",
    "date": "2026-06-09",
    "type": "expense",
    "description": "จ่ายค่าวัตถุดิบที่ค้าง",
    "amount": 2723,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:21.000Z"
  },
  {
    "id": "TX-MIG-Jun-09-EXP-3",
    "date": "2026-06-09",
    "type": "expense",
    "description": "จ่ายค่าเมล็ดกาแฟ",
    "amount": 800,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:20.000Z"
  },
  {
    "id": "TX-MIG-Jun-09-EXP-4",
    "date": "2026-06-09",
    "type": "expense",
    "description": "ซื้อวัตถุดิบ",
    "amount": 2984,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:19.000Z"
  },
  {
    "id": "TX-MIG-Jun-08-INC-1",
    "date": "2026-06-08",
    "type": "income",
    "description": "ขายได้เงินสด",
    "amount": 7095,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:18.000Z"
  },
  {
    "id": "TX-MIG-Jun-08-INC-2",
    "date": "2026-06-08",
    "type": "income",
    "description": "ขายได้เงินโอน",
    "amount": 2580,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:17.000Z"
  },
  {
    "id": "TX-MIG-Jun-08-EXP-1",
    "date": "2026-06-08",
    "type": "expense",
    "description": "ซื้อของแม็คโคร",
    "amount": 1887,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:16.000Z"
  },
  {
    "id": "TX-MIG-Jun-08-EXP-2",
    "date": "2026-06-08",
    "type": "expense",
    "description": "โอนซื้อวัตถุดิบ",
    "amount": 1015,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:15.000Z"
  },
  {
    "id": "TX-MIG-Jun-08-EXP-3",
    "date": "2026-06-08",
    "type": "expense",
    "description": "ซื้อวัตถุดิบ",
    "amount": 2757,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:14.000Z"
  },
  {
    "id": "TX-MIG-Jun-05-INC-1",
    "date": "2026-06-05",
    "type": "income",
    "description": "ขายได้เงินสด",
    "amount": 8330,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:13.000Z"
  },
  {
    "id": "TX-MIG-Jun-05-INC-2",
    "date": "2026-06-05",
    "type": "income",
    "description": "ขายได้เงินโอน",
    "amount": 785,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:12.000Z"
  },
  {
    "id": "TX-MIG-Jun-05-EXP-1",
    "date": "2026-06-05",
    "type": "expense",
    "description": "ซื้อวัตถุดิบ",
    "amount": 1807,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:11.000Z"
  },
  {
    "id": "TX-MIG-Jun-05-EXP-2",
    "date": "2026-06-05",
    "type": "expense",
    "description": "ซื้อของแม็คโคร",
    "amount": 4905,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:10.000Z"
  },
  {
    "id": "TX-MIG-Jun-05-EXP-3",
    "date": "2026-06-05",
    "type": "expense",
    "description": "จ่ายค่าจ้างพนักงาน",
    "amount": 3950,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:09.000Z"
  },
  {
    "id": "TX-MIG-Jun-05-EXP-4",
    "date": "2026-06-05",
    "type": "expense",
    "description": "จ่ายค่าเบเกอรี่",
    "amount": 3760,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:08.000Z"
  },
  {
    "id": "TX-MIG-Jun-04-INC-1",
    "date": "2026-06-04",
    "type": "income",
    "description": "ขายได้เงินสด",
    "amount": 8395,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:07.000Z"
  },
  {
    "id": "TX-MIG-Jun-04-INC-2",
    "date": "2026-06-04",
    "type": "income",
    "description": "ขายได้เงินโอน",
    "amount": 1050,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:06.000Z"
  },
  {
    "id": "TX-MIG-Jun-04-EXP-1",
    "date": "2026-06-04",
    "type": "expense",
    "description": "ซื้อวัตถุดิบ",
    "amount": 810,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:05.000Z"
  },
  {
    "id": "TX-MIG-Jun-04-EXP-2",
    "date": "2026-06-04",
    "type": "expense",
    "description": "โอนจ่ายค่าวัตถุดิบ",
    "amount": 2280,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:04.000Z"
  },
  {
    "id": "TX-MIG-Jun-03-INC-1",
    "date": "2026-06-03",
    "type": "income",
    "description": "ขายได้เงินสด",
    "amount": 9230,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:03.000Z"
  },
  {
    "id": "TX-MIG-Jun-03-INC-2",
    "date": "2026-06-03",
    "type": "income",
    "description": "เงินโอน",
    "amount": 735,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:02.000Z"
  },
  {
    "id": "TX-MIG-Jun-03-EXP-1",
    "date": "2026-06-03",
    "type": "expense",
    "description": "ซื้อวัตถุดิบ",
    "amount": 1771,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:01.000Z"
  },
  {
    "id": "TX-MIG-Jun-01-INC-BF",
    "date": "2026-06-01",
    "type": "income",
    "description": "ยอดยกมาจากเดือนพฤษภาคม",
    "amount": 24416.25,
    "note": "ยอดยกมาตามหลักบัญชีสะสมเงินสด",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T15:00:00.000Z"
  },
  {
    "id": "TX-MIG-May-29-INC-1",
    "date": "2026-05-29",
    "type": "income",
    "description": "ขายได้เงินสด",
    "amount": 9388,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T12:00:38.000Z"
  },
  {
    "id": "TX-MIG-May-29-INC-2",
    "date": "2026-05-29",
    "type": "income",
    "description": "ขายได้เงินโอน",
    "amount": 1210,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T12:00:37.000Z"
  },
  {
    "id": "TX-MIG-May-29-EXP-1",
    "date": "2026-05-29",
    "type": "expense",
    "description": "จ่ายค่าวัตถุดิบ",
    "amount": 515,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T12:00:36.000Z"
  },
  {
    "id": "TX-MIG-May-29-EXP-2",
    "date": "2026-05-29",
    "type": "expense",
    "description": "จ่ายค่าแก้วกาแฟ",
    "amount": 10650,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T12:00:35.000Z"
  },
  {
    "id": "TX-MIG-May-29-EXP-3",
    "date": "2026-05-29",
    "type": "expense",
    "description": "จ่ายค่าขนม",
    "amount": 2400,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T12:00:34.000Z"
  },
  {
    "id": "TX-MIG-May-29-EXP-4",
    "date": "2026-05-29",
    "type": "expense",
    "description": "ค่าจ้างพนักงาน",
    "amount": 3600,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T12:00:33.000Z"
  },
  {
    "id": "TX-MIG-May-28-INC-1",
    "date": "2026-05-28",
    "type": "income",
    "description": "ขายได้เงินสด",
    "amount": 8680,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T12:00:32.000Z"
  },
  {
    "id": "TX-MIG-May-28-INC-2",
    "date": "2026-05-28",
    "type": "income",
    "description": "ขายได้เงินโอน",
    "amount": 2425,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T12:00:31.000Z"
  },
  {
    "id": "TX-MIG-May-28-EXP-1",
    "date": "2026-05-28",
    "type": "expense",
    "description": "ซื้อวัตถุดิบ",
    "amount": 1951,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T12:00:30.000Z"
  },
  {
    "id": "TX-MIG-May-28-EXP-2",
    "date": "2026-05-28",
    "type": "expense",
    "description": "แม็คโคร",
    "amount": 5238,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T12:00:29.000Z"
  },
  {
    "id": "TX-MIG-May-27-INC-1",
    "date": "2026-05-27",
    "type": "income",
    "description": "ขายได้เงินสด",
    "amount": 7655,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T12:00:28.000Z"
  },
  {
    "id": "TX-MIG-May-27-INC-2",
    "date": "2026-05-27",
    "type": "income",
    "description": "ขายได้เงินโอน",
    "amount": 2330,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T12:00:27.000Z"
  },
  {
    "id": "TX-MIG-May-27-EXP-1",
    "date": "2026-05-27",
    "type": "expense",
    "description": "ซื้อวัตถุดิบ",
    "amount": 2861,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T12:00:26.000Z"
  },
  {
    "id": "TX-MIG-May-27-EXP-2",
    "date": "2026-05-27",
    "type": "expense",
    "description": "จ่ายค่าอุปกรณ์ที่ค้าง",
    "amount": 2189,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T12:00:25.000Z"
  },
  {
    "id": "TX-MIG-May-26-INC-1",
    "date": "2026-05-26",
    "type": "income",
    "description": "ขายได้",
    "amount": 9280,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T12:00:24.000Z"
  },
  {
    "id": "TX-MIG-May-26-INC-2",
    "date": "2026-05-26",
    "type": "income",
    "description": "เงินโอนเข้า",
    "amount": 1825,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T12:00:23.000Z"
  },
  {
    "id": "TX-MIG-May-26-EXP-1",
    "date": "2026-05-26",
    "type": "expense",
    "description": "ซื้อวัตถุดิบ",
    "amount": 8264,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T12:00:22.000Z"
  },
  {
    "id": "TX-MIG-May-25-INC-1",
    "date": "2026-05-25",
    "type": "income",
    "description": "ขายได้",
    "amount": 9995,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T12:00:21.000Z"
  },
  {
    "id": "TX-MIG-May-25-EXP-1",
    "date": "2026-05-25",
    "type": "expense",
    "description": "ซื้อวัตถุดิบ",
    "amount": 420,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T12:00:20.000Z"
  },
  {
    "id": "TX-MIG-May-24-EXP-1",
    "date": "2026-05-24",
    "type": "expense",
    "description": "ซื้อวัตถุดิบและโทรศัพท์",
    "amount": 4455,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T12:00:19.000Z"
  },
  {
    "id": "TX-MIG-May-23-EXP-1",
    "date": "2026-05-23",
    "type": "expense",
    "description": "ซื้อของแม็คโคร",
    "amount": 3075,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T12:00:18.000Z"
  },
  {
    "id": "TX-MIG-May-22-INC-1",
    "date": "2026-05-22",
    "type": "income",
    "description": "ขายได้",
    "amount": 9715,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T12:00:17.000Z"
  },
  {
    "id": "TX-MIG-May-22-EXP-1",
    "date": "2026-05-22",
    "type": "expense",
    "description": "ซื้อวัตถุดิบ",
    "amount": 4962.5,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T12:00:16.000Z"
  },
  {
    "id": "TX-MIG-May-22-EXP-2",
    "date": "2026-05-22",
    "type": "expense",
    "description": "จ่ายค่าแรงพนักงาน",
    "amount": 3100,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T12:00:15.000Z"
  },
  {
    "id": "TX-MIG-May-22-EXP-3",
    "date": "2026-05-22",
    "type": "expense",
    "description": "ค่าเบเกอรี่",
    "amount": 3244,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T12:00:14.000Z"
  },
  {
    "id": "TX-MIG-May-21-INC-1",
    "date": "2026-05-21",
    "type": "income",
    "description": "ขายได้",
    "amount": 10955,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T12:00:13.000Z"
  },
  {
    "id": "TX-MIG-May-21-EXP-1",
    "date": "2026-05-21",
    "type": "expense",
    "description": "ซื้อวัตถุดิบ",
    "amount": 6103,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T12:00:12.000Z"
  },
  {
    "id": "TX-MIG-May-20-INC-1",
    "date": "2026-05-20",
    "type": "income",
    "description": "ขายได้",
    "amount": 9220,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T12:00:11.000Z"
  },
  {
    "id": "TX-MIG-May-20-EXP-1",
    "date": "2026-05-20",
    "type": "expense",
    "description": "ซื้อวัตถุดิบ",
    "amount": 3737.25,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T12:00:10.000Z"
  },
  {
    "id": "TX-MIG-May-20-EXP-2",
    "date": "2026-05-20",
    "type": "expense",
    "description": "จ่ายค่าอุปกรณ์ที่ค้าง",
    "amount": 2821,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T12:00:09.000Z"
  },
  {
    "id": "TX-MIG-May-19-INC-1",
    "date": "2026-05-19",
    "type": "income",
    "description": "ขายได้",
    "amount": 9620,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T12:00:08.000Z"
  },
  {
    "id": "TX-MIG-May-19-EXP-1",
    "date": "2026-05-19",
    "type": "expense",
    "description": "ซื้อวัตถุดิบ",
    "amount": 3264,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T12:00:07.000Z"
  },
  {
    "id": "TX-MIG-May-19-EXP-2",
    "date": "2026-05-19",
    "type": "expense",
    "description": "ซื้อของแมคโคร",
    "amount": 1262,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T12:00:06.000Z"
  },
  {
    "id": "TX-MIG-May-18-INC-1",
    "date": "2026-05-18",
    "type": "income",
    "description": "ขายได้",
    "amount": 12465,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T12:00:05.000Z"
  },
  {
    "id": "TX-MIG-May-18-EXP-1",
    "date": "2026-05-18",
    "type": "expense",
    "description": "ซื้อวัตถุดิบแม็คโคร",
    "amount": 3765,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T12:00:04.000Z"
  },
  {
    "id": "TX-MIG-May-18-EXP-2",
    "date": "2026-05-18",
    "type": "expense",
    "description": "จ่ายค่าอุปกรณ์ที่ค้าง",
    "amount": 3657,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T12:00:03.000Z"
  },
  {
    "id": "TX-MIG-May-18-EXP-3",
    "date": "2026-05-18",
    "type": "expense",
    "description": "ซื้อวัตถุดิบ",
    "amount": 1327,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T12:00:02.000Z"
  },
  {
    "id": "TX-MIG-May-14-INC-1",
    "date": "2026-05-14",
    "type": "income",
    "description": "ขายได้",
    "amount": 9280,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T12:00:01.000Z"
  },
  {
    "id": "TX-MIG-May-14-EXP-1",
    "date": "2026-05-14",
    "type": "expense",
    "description": "ซื้อวัตถุดิบ",
    "amount": 6766,
    "note": "นำเข้าข้อมูลจริง",
    "created_by": "System Migration",
    "timestamp": "2026-07-02T12:00:00.000Z"
  }
];

const DEFAULT_API_URL = "https://script.google.com/macros/s/AKfycbz6KSgf9Cc_OWQpRrBf_yihY-o3q34S4-G-n2cJZHTEl3CoJc6YSkXFtOm8xY0ryedQjA/exec";

export default function App() {
  const [role, setRole] = useState(null); // null | 'staff' | 'admin'
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('transactions'); // 'dashboard' | 'transactions' | 'reports' | 'settings'
  const [isLoading, setIsLoading] = useState(false);
  const [isMockMode, setIsMockMode] = useState(true);

  // ย้ายสถานะประเภทรายงานและปีฟิลเตอร์ขึ้นมาเก็บไว้แชร์ข้ามเมนูพิมพ์รายงาน
  const [reportType, setReportType] = useState('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [apiUrl, setApiUrl] = useState(() => {
    return localStorage.getItem('jamjuree_api_url') || DEFAULT_API_URL;
  });

  // สถานะจัดการฟอร์ม Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // สถานะจำการคัดลอกคู่มือสคริปต์
  const [copied, setCopied] = useState(false);

  // แจ้งเตือนในแอพ (Toast notification)
  const [toast, setToast] = useState(null);

  // ยืนยันรหัสผ่านเข้าถึง API
  const [apiPasswordVerified, setApiPasswordVerified] = useState(false);

  // รหัสผ่านเข้าใช้งานสดจากชีต
  const [passwords, setPasswords] = useState({ staff: 'cafe2026', admin: 'admin@2026', api: 'admin@api2026' });

  // สถานะจัดการ Confirm Modal ทั่วไปของแอปพลิเคชัน
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    isDanger: false
  });

  // ปิดล็อคหน้าตั้งค่า API อัตโนมัติเมื่อกดสลับไปหน้าอื่นเพื่อความปลอดภัยสูงสุด
  useEffect(() => {
    if (activeTab !== 'settings') {
      setApiPasswordVerified(false);
    }
  }, [activeTab]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // ดึงบทบาทเข้าสู่ระบบจาก localStorage
  useEffect(() => {
    const savedRole = localStorage.getItem('jamjuree_role');
    if (savedRole) {
      setRole(savedRole);
      // แอดมินให้ตั้งหน้าแรกที่แดชบอร์ด เจ้าหน้าที่ตั้งหน้าแรกที่ตารางบันทึก
      setActiveTab(savedRole === 'admin' ? 'dashboard' : 'transactions');
    }
  }, []);

  // ดึงรายการธุรกรรมเมื่อเข้าโปรแกรม
  useEffect(() => {
    loadTransactions();
    loadPasswords();
  }, [apiUrl]);

  const loadPasswords = async () => {
    try {
      const res = await fetch(`${apiUrl}?action=getPasswords`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error('API server returned error');
      const json = await res.json();
      if (json.success && json.data) {
        setPasswords(json.data);
      }
    } catch (err) {
      console.warn("ไม่สามารถดึงข้อมูลรหัสผ่านจากกูเกิลชีตได้ จะใช้รหัสผ่านสำรอง: ", err);
    }
  };

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      // พยายามลองเรียกใช้ API จริงก่อน
      const res = await fetch(`${apiUrl}?action=getTransactions`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!res.ok) throw new Error('API server returned error');
      
      const json = await res.json();
      if (json.success) {
        setTransactions(json.data);
        setIsMockMode(false);
        showToast('เชื่อมต่อฐานข้อมูล Google Sheets สำเร็จ', 'success');
      } else {
        throw new Error(json.message || 'API error');
      }
    } catch (err) {
      console.warn("ไม่สามารถเรียก Apps Script API ได้ ระบบจะดึงฐานข้อมูลจำลองในเครื่องมาใช้งานแทน:", err);
      // โหมดออฟไลน์ / จำลองข้อมูล
      const savedData = localStorage.getItem('jamjuree_txs');
      if (savedData) {
        setTransactions(JSON.parse(savedData));
      } else {
        setTransactions(MOCK_DATA);
        localStorage.setItem('jamjuree_txs', JSON.stringify(MOCK_DATA));
      }
      setIsMockMode(true);
      showToast('ใช้โหมดจำลองเนื่องจากยังไม่ได้เปิดสิทธิ์หรือตั้งค่าสคริปต์', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (userRole) => {
    setRole(userRole);
    localStorage.setItem('jamjuree_role', userRole);
    setActiveTab(userRole === 'admin' ? 'dashboard' : 'transactions');
    showToast(`เข้าสู่ระบบในฐานะ ${userRole === 'admin' ? 'ผู้ดูแลระบบ' : 'เจ้าหน้าที่'} สำเร็จ`);
  };

  const handleLogout = () => {
    setRole(null);
    localStorage.removeItem('jamjuree_role');
    showToast('ออกจากระบบเรียบร้อยแล้ว');
  };

  // ฟังก์ชัน CRUD บันทึกข้อมูล
  const handleSaveTransaction = async (formData) => {
    setIsLoading(true);
    try {
      if (isMockMode) {
        // จัดการแบบออฟไลน์ด้วย localStorage
        let updatedList = [];
        if (editingTransaction) {
          // แก้ไขรายการ
          updatedList = transactions.map(t => 
            t.id === editingTransaction.id 
              ? { ...t, ...formData, timestamp: new Date().toISOString() } 
              : t
          );
          showToast('แก้ไขข้อมูลธุรกรรมเรียบร้อยแล้ว');
        } else {
          // เพิ่มรายการใหม่
          const newTx = {
            id: `TX-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
            ...formData,
            timestamp: new Date().toISOString()
          };
          updatedList = [newTx, ...transactions];
          showToast('เพิ่มรายการธุรกรรมใหม่เสร็จสิ้น');
        }
        setTransactions(updatedList);
        localStorage.setItem('jamjuree_txs', JSON.stringify(updatedList));
        setIsFormOpen(false);
        setEditingTransaction(null);
      } else {
        // ส่ง POST ไป Google Apps Script
        const payload = editingTransaction 
          ? { action: 'updateTransaction', id: editingTransaction.id, transaction: formData }
          : { action: 'addTransaction', transaction: formData };

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (result.success) {
          await loadTransactions(); // โหลดรายการใหม่ทั้งหมดจากฐานข้อมูลคลาวด์
          setIsFormOpen(false);
          setEditingTransaction(null);
          showToast(editingTransaction ? 'บันทึกการแก้ไขไปยัง Google Sheet สำเร็จ' : 'บันทึกรายการลง Google Sheet สำเร็จ');
        } else {
          throw new Error(result.message);
        }
      }
    } catch (err) {
      showToast(`ข้อผิดพลาด: ${err.message}`, 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTransaction = (id) => {
    setConfirmModal({
      isOpen: true,
      title: '🗑️ ยืนยันการลบรายการบัญชี',
      message: 'คุณแน่ใจหรือไม่ที่จะลบรายการธุรกรรมนี้? การลบแล้วจะไม่สามารถเรียกคืนข้อมูลภายหลังได้',
      isDanger: true,
      onConfirm: async () => {
        setIsLoading(true);
        try {
          if (isMockMode) {
            const updatedList = transactions.filter(t => t.id !== id);
            setTransactions(updatedList);
            localStorage.setItem('jamjuree_txs', JSON.stringify(updatedList));
            showToast('ลบรายการธุรกรรมออกจากเครื่องสำเร็จ');
          } else {
            const response = await fetch(apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              body: JSON.stringify({ action: 'deleteTransaction', id: id })
            });
            const result = await response.json();
            if (result.success) {
              await loadTransactions();
              showToast('ลบรายการธุรกรรมบน Google Sheet สำเร็จ');
            } else {
              throw new Error(result.message);
            }
          }
        } catch (err) {
          showToast(`ลบไม่สำเร็จ: ${err.message}`, 'danger');
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  // สั่งซิงค์คำนวณสูตรและดึงข้อมูลจริงจากทุกชีตรายเดือน
  const handleSyncMonthlyData = async () => {
    setIsLoading(true);
    try {
      if (isMockMode) {
        // โหมดจำลอง โหลดข้อมูล May ดั้งเดิม
        setTransactions(MOCK_DATA);
        localStorage.setItem('jamjuree_txs', JSON.stringify(MOCK_DATA));
        showToast('ซิงค์ข้อมูลจำลองสำเร็จ', 'success');
      } else {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'resetAndReimport' })
        });
        const result = await response.json();
        if (result.success) {
          setTransactions(result.data);
          showToast('คำนวณสูตรและซิงค์ยอดจากชีตรายเดือนสำเร็จ', 'success');
        } else {
          throw new Error(result.message);
        }
      }
    } catch (err) {
      showToast(`ซิงค์ไม่สำเร็จ: ${err.message}`, 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  // ล้างข้อมูลธุรกรรมเก่าออกทั้งหมดเพื่อเริ่มบันทึกใหม่
  const handleClearAllTransactions = () => {
    setConfirmModal({
      isOpen: true,
      title: '🚨 คำเตือนร้ายแรง: ล้างฐานข้อมูลทั้งหมด',
      message: 'คุณต้องการลบข้อมูลธุรกรรมทั้งหมดในทุกแท็บรายเดือนในสเปรดชีตใช่หรือไม่? การลบนี้จะไม่สามารถกู้คืนข้อมูลใดๆ ได้อีก',
      isDanger: true,
      onConfirm: async () => {
        setIsLoading(true);
        try {
          if (isMockMode) {
            setTransactions([]);
            localStorage.setItem('jamjuree_txs', JSON.stringify([]));
            showToast('ล้างข้อมูลจำลองในเครื่องเรียบร้อยแล้ว', 'success');
          } else {
            const response = await fetch(apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              body: JSON.stringify({ action: 'clearAllTransactions' })
            });
            const result = await response.json();
            if (result.success) {
              setTransactions([]);
              showToast('ล้างข้อมูลธุรกรรมใน Google Sheet ทุกแผ่นงานสำเร็จ', 'success');
            } else {
              throw new Error(result.message);
            }
          }
        } catch (err) {
          showToast(`ล้างข้อมูลไม่สำเร็จ: ${err.message}`, 'danger');
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const handleCopyCode = () => {
    // โค้ด Apps Script ดำเนินการคัดลอกลงคลิปบอร์ด
    const code = `/**
 * โค้ด Apps Script สำหรับ Jamjuree Cafe
 * สามารถคัดลอกไฟล์ Code.gs ในโฟลเดอร์ของโปรเจกต์ไปใช้งานได้ทันที
 */`;
    navigator.clipboard.writeText(code); // จริงๆ แนะนำให้ผู้ใช้อ่านไฟล์ Code.gs ในเครื่องโดยตรงจะสะดวกกว่า
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // หากไม่มีการล็อกอิน ให้แสดงหน้าเข้าสู่ระบบ
  if (!role) {
    return <Login onLogin={handleLogin} passwords={passwords} />;
  }

  return (
    <div className="app-layout">
      
      {/* 1. เมนูด้านข้าง (Sidebar) */}
      <aside className="sidebar">
        <div>
          <div className="brand">
            <img src={schoolLogo} className="brand-logo-img" alt="โลโก้โรงเรียน" />
            <div className="brand-info">
              <h2>Jamjuree Cafe</h2>
              <p>รร.วังน้ำเย็นวิทยาคม</p>
            </div>
          </div>

          {/* รายการปุ่มเมนูนำทาง */}
          <nav>
            <ul className="nav-menu">
              
              {/* แดชบอร์ด (เฉพาะแอดมินเท่านั้น) */}
              {role === 'admin' && (
                <li>
                  <div 
                    className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                  >
                    <LayoutDashboard size={18} />
                    <span>หน้าแรก (แดชบอร์ด)</span>
                  </div>
                </li>
              )}

              {/* บันทึกรายการบัญชี (ทุกคนใช้ได้) */}
              <li>
                <div 
                  className={`nav-link ${activeTab === 'transactions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('transactions')}
                >
                  <ListOrdered size={18} />
                  <span>บันทึกบัญชีรายวัน</span>
                </div>
              </li>

              {/* พิมพ์รายงานบัญชี */}
              <li>
                <div 
                  className={`nav-link ${activeTab === 'reports' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reports')}
                >
                  <FileSpreadsheet size={18} />
                  <span>จัดทำรายงาน PDF</span>
                </div>
              </li>

              {/* ตั้งค่าระบบ (เฉพาะแอดมินสามารถดูและตั้งค่าลิงก์ชีตได้) */}
              {role === 'admin' && (
                <li>
                  <div 
                    className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                  >
                    <Settings size={18} />
                    <span>ตั้งค่าสิทธิ์ & API</span>
                  </div>
                </li>
              )}

            </ul>
          </nav>
        </div>

        {/* บล็อกผู้ใช้งานด้านล่าง */}
        <div className="user-panel">
          <div className="user-info">
            <div className="user-avatar">
              {role === 'admin' ? 'AD' : 'ST'}
            </div>
            <div className="user-meta">
              <h4>{role === 'admin' ? 'ผู้ดูแลระบบ' : 'เจ้าหน้าที่คาเฟ่'}</h4>
              <p>ฝ่ายบริการบันทึกรายรับ</p>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={15} />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* 2. เนื้อหาหน้าแสดงผลหลัก */}
      <main className="main-content">
        
        {/* แถบหัวขอด้านบน */}
        <header className="top-header">
          <div className="page-title">
            <h1>
              {activeTab === 'dashboard' && '📊 แดชบอร์ดแสดงผลการดำเนินงาน'}
              {activeTab === 'transactions' && '📝 รายการบัญชีรายรับ-รายจ่าย'}
              {activeTab === 'reports' && '📄 พิมพ์รายงานบัญชีการเงิน'}
              {activeTab === 'settings' && '⚙️ ตั้งค่าระบบและการเชื่อมต่อ'}
            </h1>
            <p>ระบบงานบัญชีร้านกาแฟเพื่อการเรียนรู้เชิงพาณิชย์ของโรงเรียน</p>
          </div>

          {/* ป้ายแสดงสถานะการเชื่อมต่อฐานข้อมูล Google Sheet */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isMockMode ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                <WifiOff size={14} />
                <span>โหมดจำลองข้อมูลในเครื่อง (Offline)</span>
              </div>
            ) : (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'var(--success-bg)', color: 'var(--success)', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                <Wifi size={14} />
                <span>เชื่อมโยง Google Sheet สำเร็จ (Online)</span>
              </div>
            )}
          </div>
        </header>

        {/* เนื้อหารายหน้าตามแท็บเมนูที่กดเลือก */}
        <div className="container">
          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem', flexDirection: 'column', gap: '1rem', color: 'var(--primary-brown)' }}>
              <div className="brand-icon" style={{ animation: 'spin 2s linear infinite', width: '50px', height: '50px', fontSize: '1.5rem' }}>☕</div>
              <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>กำลังอัปเดตและติดต่อเซิร์ฟเวอร์ Google Sheet...</p>
            </div>
          )}

          {/* สไตล์อนิเมชั่นหมุนถ้วยกาแฟ */}
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>

          {!isLoading && (
            <>
              {activeTab === 'dashboard' && role === 'admin' && (
                <Dashboard 
                  transactions={transactions} 
                  onSync={loadTransactions} 
                  onPrintSummary={() => {
                    setReportType('summary');
                    setSelectedYear(2026); // ปีประวัติสารสนเทศของร้านกาแฟ
                    setActiveTab('reports');
                    setTimeout(() => window.print(), 350);
                  }}
                />
              )}

              {activeTab === 'transactions' && (
                <Transactions
                  transactions={transactions}
                  role={role}
                  onAdd={() => { setEditingTransaction(null); setIsFormOpen(true); }}
                  onEdit={(tx) => { setEditingTransaction(tx); setIsFormOpen(true); }}
                  onDelete={handleDeleteTransaction}
                  onSyncLegacy={handleSyncMonthlyData}
                />
              )}

              {activeTab === 'reports' && (
                <ReportView 
                  transactions={transactions} 
                  reportType={reportType}
                  setReportType={setReportType}
                  selectedYear={selectedYear}
                  setSelectedYear={setSelectedYear}
                />
              )}

              {activeTab === 'settings' && role === 'admin' && (
                !apiPasswordVerified ? (
                  <div className="panel-card" style={{ maxWidth: '450px', margin: '2rem auto', textAlign: 'center', padding: '2.5rem' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--accent-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '1px solid var(--border)' }}>
                      <Key size={28} style={{ color: 'var(--primary-brown)' }} />
                    </div>
                    <h3 className="panel-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>🔐 ยืนยันรหัสผ่านเพื่อตั้งค่า API</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                      คุณกำลังเข้าถึงพื้นที่การตั้งค่าระบบเชื่อมต่อกูเกิลสเปรดชีต กรุณากรอกรหัสผ่านเพื่อทำรายการ
                    </p>
                    
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const pw = e.target.elements.apiPassword.value;
                      if (pw === (passwords.api || 'admin@api2026')) {
                        setApiPasswordVerified(true);
                        showToast('ปลดล็อคหน้าตั้งค่า API สำเร็จ', 'success');
                      } else {
                        showToast('รหัสผ่านไม่ถูกต้อง! กรุณาลองใหม่อีกครั้ง', 'danger');
                        e.target.elements.apiPassword.value = '';
                      }
                    }}>
                      <div className="form-group" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                        <label htmlFor="api-password-input">รหัสผ่านตั้งค่า API</label>
                        <input
                          id="api-password-input"
                          name="apiPassword"
                          type="password"
                          className="form-input"
                          placeholder="กรอกรหัสผ่านเพื่อเข้าใช้งาน..."
                          required
                          autoFocus
                          style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.9rem' }}
                        />
                      </div>
                      
                      <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
                        ยืนยันและเข้าสู่หน้าตั้งค่า
                      </button>
                    </form>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* แผงควบคุมตั้งค่า API */}
                  <div className="panel-card">
                    <h3 className="panel-title" style={{ marginBottom: '0.5rem' }}>📡 ตั้งค่าการเชื่อมต่อ API ของ Google Apps Script</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                      หากคุณ Deploy โค้ด Apps Script ใหม่จาก Google Drive คุณสามารถอัปเดต URL เพื่อบันทึกข้อมูลเข้าชีตของคุณได้โดยตรงจากตรงนี้
                    </p>
                    
                    <div className="form-group">
                      <label htmlFor="api-url-input">Google Apps Script Web App URL</label>
                      <input
                        id="api-url-input"
                        type="url"
                        className="form-input"
                        value={apiUrl}
                        onChange={(e) => setApiUrl(e.target.value)}
                        placeholder="https://script.google.com/macros/s/.../exec"
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                      <button 
                        className="btn btn-primary"
                        onClick={() => {
                          localStorage.setItem('jamjuree_api_url', apiUrl);
                          loadTransactions();
                        }}
                      >
                        บันทึกการเชื่อมโยง API
                      </button>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => {
                          setApiUrl(DEFAULT_API_URL);
                          localStorage.setItem('jamjuree_api_url', DEFAULT_API_URL);
                          showToast('คืนค่าที่อยู่สคริปต์เริ่มต้นเรียบร้อย');
                        }}
                      >
                        คืนค่าเริ่มต้น
                      </button>
                      <button 
                        className="btn btn-secondary"
                        onClick={handleSyncMonthlyData}
                        style={{ borderColor: 'var(--primary-light)', color: 'var(--primary-dark)' }}
                      >
                        🔄 ซิงค์และคำนวณยอดเงินใหม่
                      </button>
                      <button 
                        className="btn btn-danger"
                        onClick={handleClearAllTransactions}
                      >
                        🚨 ล้างข้อมูลในชีตทั้งหมดทิ้ง
                      </button>
                    </div>
                  </div>

                  {/* คำแนะนำการติดตั้ง Google Apps Script สำหรับผู้ดูแลระบบ */}
                  <div className="panel-card">
                    <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      <Info size={20} style={{ color: 'var(--primary-brown)' }} />
                      <span>คำแนะนำในการตั้งค่าระบบฐานข้อมูล (สำหรับแอดมิน)</span>
                    </h3>
                    
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <p>
                        เพื่อให้ระบบบันทึกรายรับรายจ่ายทำงานอย่างเต็มระบบร่วมกับ Google Sheet รหัส ID: 
                        <strong style={{ fontFamily: 'monospace', backgroundColor: 'var(--bg-cream)', padding: '0.1rem 0.3rem', borderRadius: '4px', margin: '0 0.25rem' }}>
                          1DQNgmVi5Of8gto6ypeEe0GsklGHSrVNBBey-xMg2BvA
                        </strong> 
                        กรุณาดำเนินการตามขั้นตอนดังต่อไปนี้:
                      </p>
                      
                      <ol style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li>เปิดหน้าต่างตารางงาน Google Sheet ของคุณ</li>
                        <li>ไปที่เมนู <strong>ส่วนขยาย (Extensions)</strong> &gt; <strong>Apps Script</strong></li>
                        <li>ลบโค้ดเริ่มต้นออก แล้วคัดลอกโค้ดจากไฟล์ <a href="file:///c:/Users/lenovo/Desktop/Jamjuree Cafe/google-apps-script/Code.gs" style={{ textDecoration: 'underline', fontWeight: 600 }}>Code.gs</a> ที่อยู่ในเครื่องโฟลเดอร์โครงการนี้ไปวางแทนที่</li>
                        <li>กดปุ่มบันทึก (แผ่นดิสก์)</li>
                        <li>คลิกปุ่ม <strong>การทำให้ใช้งานได้ (Deploy)</strong> &gt; <strong>การทำให้ใช้งานได้ใหม่ (New Deployment)</strong></li>
                        <li>เลือกประเภทเป็น <strong>เว็บแอป (Web App)</strong></li>
                        <li>กำหนดค่าการตั้งค่าสิทธิ์ให้ละเอียดดังนี้:
                          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.25rem', listStyleType: 'circle' }}>
                            <li>ผู้ดำเนินการ: <strong>ฉัน (อีเมลแอดมินของคุณ)</strong></li>
                            <li>ผู้เข้าถึงได้: <strong>ทุกคน (Anyone)</strong> (จำเป็นมากเพื่อให้แอพเรียกซิงค์ข้ามคลาวด์ได้)</li>
                          </ul>
                        </li>
                        <li>กดปุ่ม <strong>ทำให้ใช้งานได้ (Deploy)</strong> และคัดลอก <strong>URL เว็บแอป (Web App URL)</strong> ที่ได้รับ นำมาวางลงในช่องบันทึก URL ด้านบนนี้</li>
                      </ol>
                    </div>
                  </div>

                </div>
              ))}
            </>
          )}
        </div>

        {/* แบบฟอร์ม Modal สำหรับเพิ่มหรือแก้ไขธุรกรรม */}
        {isFormOpen && (
          <TransactionForm
            transaction={editingTransaction}
            role={role}
            onSubmit={handleSaveTransaction}
            onClose={() => { setIsFormOpen(false); setEditingTransaction(null); }}
            isLoading={isLoading}
          />
        )}

        {/* หน้าต่างยืนยันการทำรายการพรีเมียมส่วนตัว (Custom Confirm Modal) */}
        {confirmModal.isOpen && (
          <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: '420px', padding: '2rem', textAlign: 'center' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                backgroundColor: confirmModal.isDanger ? '#FFEBEE' : 'var(--accent-cream)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 1.25rem',
                border: confirmModal.isDanger ? '1px solid #FFCDD2' : '1px solid var(--border)'
              }}>
                <AlertTriangle size={28} style={{ color: confirmModal.isDanger ? '#D32F2F' : 'var(--primary-brown)' }} />
              </div>
              <h3 className="panel-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                {confirmModal.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.75rem', lineHeight: 1.5 }}>
                {confirmModal.message}
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ flex: 1, padding: '0.75rem' }}
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                >
                  ยกเลิก
                </button>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1, padding: '0.75rem', backgroundColor: confirmModal.isDanger ? '#D32F2F' : undefined, borderColor: confirmModal.isDanger ? '#D32F2F' : undefined, color: 'white' }}
                  onClick={() => {
                    if (confirmModal.onConfirm) confirmModal.onConfirm();
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                  }}
                >
                  ยืนยันทำรายการ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* แจ้งเตือนด่วนสไตล์ Toast */}
        {toast && (
          <div className="toast">
            {toast.type === 'success' && <CheckCircle2 size={18} style={{ color: '#81C784' }} />}
            {toast.type === 'warning' && <AlertTriangle size={18} style={{ color: '#FFD54F' }} />}
            {toast.type === 'danger' && <AlertTriangle size={18} style={{ color: '#E57373' }} />}
            <span>{toast.message}</span>
          </div>
        )}

      </main>
    </div>
  );
}
