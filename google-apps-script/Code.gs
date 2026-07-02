/**
 * Jamjuree Cafe - Income & Expense Web App Backend (V2 - Direct Monthly Sheets Integration)
 * Spreadsheet ID: 1DQNgmVi5Of8gto6ypeEe0GsklGHSrVNBBey-xMg2BvA
 * 
 * พัฒนาโดย: Antigravity AI Coding Assistant
 */

var SPREADSHEET_ID = "1DQNgmVi5Of8gto6ypeEe0GsklGHSrVNBBey-xMg2BvA";
var MONTH_ABBRS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * รองรับการเรียกข้อมูลแบบ GET (ดึงธุรกรรมทั้งหมดจากทุกชีตรายเดือนรวมกัน)
 */
function doGet(e) {
  var action = e.parameter.action || "getTransactions";
  var result = {};
  
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    if (action === "getTransactions") {
      result = {
        success: true,
        data: getTransactionsListFromSheets(ss)
      };
    } else if (action === "getPasswords") {
      result = {
        success: true,
        data: getPasswordsFromSheet(ss)
      };
    } else {
      result = { success: false, message: "ไม่พบ Action ที่กำหนด: " + action };
    }
  } catch (err) {
    result = { success: false, message: "ข้อผิดพลาด GET: " + err.toString() };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * รองรับการทำบันทึก แก้ไข ลบข้อมูลแบบ POST (เขียนตรงไปยังชีตเดือนนั้นๆ อัตโนมัติ)
 */
function doPost(e) {
  var result = {};
  try {
    var postData;
    // ตรวจสอบการแปลง JSON เพื่อไม่ให้พังเมื่อรับ Content-Type แบบ text/plain หรือ application/json
    if (e.postData && e.postData.contents) {
      postData = JSON.parse(e.postData.contents);
    } else {
      postData = e.parameter;
    }
    
    var action = postData.action;
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    if (action === "addTransaction") {
      result = addTransactionRow(ss, postData.transaction);
    } else if (action === "updateTransaction") {
      result = updateTransactionRow(ss, postData.id, postData.transaction);
    } else if (action === "deleteTransaction") {
      result = deleteTransactionRow(ss, postData.id);
    } else if (action === "resetAndReimport") {
      // สั่งคำนวณสูตรและยอดประจำวันของทุกชีตรายเดือนใหม่
      recalculateAllSheets(ss);
      result = { 
        success: true, 
        message: "ซิงค์และคำนวณยอดเงินคงเหลือเรียบร้อยแล้ว", 
        data: getTransactionsListFromSheets(ss) 
      };
    } else if (action === "clearAllTransactions") {
      // ล้างข้อมูลในชีตรายเดือนทั้งหมด
      clearAllMonthlySheetsData(ss);
      result = { 
        success: true, 
        message: "ล้างข้อมูลธุรกรรมเก่าออกเรียบร้อยแล้ว", 
        data: [] 
      };
    } else if (action === "debug") {
      var sheets = ss.getSheets();
      var details = [];
      for (var j = 0; j < sheets.length; j++) {
        var sh = sheets[j];
        var lr = sh.getLastRow();
        var vals = [];
        if (lr >= 3) {
          vals = sh.getRange(3, 1, Math.min(lr - 2, 5), 5).getValues();
        }
        details.push({
          name: sh.getName(),
          lastRow: lr,
          firstRows: vals
        });
      }
      result = {
        success: true,
        sheetsDetails: details
      };
    } else if (action === "populateMay") {
      var sheet = getOrCreateMonthSheet(ss, "May");
      var data = JSON.parse(e.postData.contents).data;
      var lastRow = sheet.getLastRow();
      if (lastRow >= 3) {
        sheet.getRange(3, 1, lastRow - 2, 8).clearContent();
        sheet.getRange(3, 1, lastRow - 2, 8).clearNote();
      }
      var writeValues = [];
      var writeNotes = [];
      for (var r = 0; r < data.length; r++) {
        var row = data[r];
        writeValues.push([
          row.date || "",
          row.incDesc || "",
          row.incAmt !== "" ? Number(row.incAmt) : "",
          row.expDesc || "",
          row.expAmt !== "" ? Number(row.expAmt) : ""
        ]);
        var rowNotes = ["", "", "", "", ""];
        if (row.incAmt !== "") {
          rowNotes[1] = JSON.stringify({ created_by: "System Migration", timestamp: new Date().toISOString() });
        }
        if (row.expAmt !== "") {
          rowNotes[3] = JSON.stringify({ created_by: "System Migration", timestamp: new Date().toISOString() });
        }
        writeNotes.push(rowNotes);
      }
      if (writeValues.length > 0) {
        sheet.getRange(3, 1, writeValues.length, 5).setValues(writeValues);
        sheet.getRange(3, 1, writeNotes.length, 5).setNotes(writeNotes);
      }
      calculateAndWriteBalancesForSheet(sheet);
      result = { success: true, message: "เขียนข้อมูลและคำนวณสูตรแผ่นงานพฤษภาคมเสร็จเรียบร้อย!" };
    } else {
      result = { success: false, message: "ไม่พบ POST Action: " + action };
    }
  } catch (err) {
    result = { success: false, message: "ข้อผิดพลาด POST: " + err.toString() };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * แปลง YYYY-MM-DD เป็นพุทธศักราชสไตล์ไทย DD/MM/2569
 */
function formatDateBE(dateStr) {
  var parts = dateStr.split('-');
  if (parts.length === 3) {
    var y = parseInt(parts[0], 10);
    var m = parts[1];
    var d = parts[2];
    var thaiYear = y + 543;
    return d + "/" + m + "/" + thaiYear;
  }
  return dateStr;
}

/**
 * ดึงข้อมูลหรือสร้างชีตรายเดือนใหม่หากไม่พบชีตนั้นๆ พร้อมตกแต่งโครงสร้างให้สวยงาม
 */
function getOrCreateMonthSheet(ss, monthName) {
  var sheet = ss.getSheetByName(monthName);
  if (sheet) return sheet;
  
  sheet = ss.insertSheet(monthName);
  
  // เขียนหัวข้อหลัก (แถวที่ 1)
  sheet.appendRow(["วัน/เดือน/ปี", "รายรับ", "", "รายจ่าย", "", "ยอดเงินคงเหลือ", "วัน/เดือน/ปี", "ยอดคงเหลือประจำวัน"]);
  // เขียนหัวข้อย่อย (แถวที่ 2)
  sheet.appendRow(["", "รายการรายรับ", "จำนวนเงินรายรับ", "รายการรายจ่าย", "จำนวนเงินรายจ่าย", "", "", ""]);
  
  // รวมหัวเซลล์ (Merge Cells)
  sheet.getRange("B1:C1").merge(); // รายรับ
  sheet.getRange("D1:E1").merge(); // รายจ่าย
  
  // จัดสไตล์และโทนสีมินิมอล น้ำตาล-ขาว
  sheet.getRange("A1:H1").setFontWeight("bold").setBackground("#D7CCC8").setHorizontalAlignment("center");
  sheet.getRange("A2:H2").setFontWeight("bold").setBackground("#EFEBE9").setHorizontalAlignment("center");
  
  // ตรึงแถว 2 แถวบนสุด
  sheet.setFrozenRows(2);
  
  return sheet;
}

/**
 * แปลงข้อมูลวันที่จากชีตให้อยู่ในรูปแบบ YYYY-MM-DD
 */
function parseLegacyDate(dateVal) {
  if (!dateVal) return "";
  
  if (dateVal instanceof Date) {
    var y = dateVal.getFullYear();
    if (y > 2400) y -= 543;
    var m = String(dateVal.getMonth() + 1).padStart(2, '0');
    var d = String(dateVal.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }
  
  var str = String(dateVal).trim();
  var rangeMatch = str.match(/^(\d+)-(\d+)\/(\d+)\/(\d+)$/);
  if (rangeMatch) {
    var d = rangeMatch[1].trim().padStart(2, '0');
    var m = rangeMatch[3].trim().padStart(2, '0');
    var y = rangeMatch[4].trim();
    var yearNum = parseInt(y, 10);
    if (yearNum > 2400) yearNum -= 543;
    else if (yearNum < 100) yearNum += 2000;
    return yearNum + '-' + m + '-' + d;
  }
  
  var parts = str.split('/');
  if (parts.length === 3) {
    var d = parts[0].trim().padStart(2, '0');
    var m = parts[1].trim().padStart(2, '0');
    var y = parts[2].trim();
    var yearNum = parseInt(y, 10);
    if (yearNum > 2400) yearNum -= 543;
    else if (yearNum < 100) yearNum += 2000;
    return yearNum + '-' + m + '-' + d;
  }
  
  return str;
}

/**
 * คำนวณยอดเงินคงเหลือ F และสรุปยอดประจำวัน G, H ของแผ่นงาน
 */
function calculateAndWriteBalancesForSheet(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 3) return;
  
  // 1. สร้างและเขียนสูตรคอลัมน์ F (ยอดเงินคงเหลือ)
  var formulas = [];
  formulas.push(["=IF(AND(ISBLANK(A3),ISBLANK(B3),ISBLANK(D3)),\"\",N(C3)-N(E3))"]);
  
  for (var i = 4; i <= lastRow; i++) {
    formulas.push(["=IF(AND(ISBLANK(A" + i + "),ISBLANK(B" + i + "),ISBLANK(D" + i + ")),\"\",N(F" + (i-1) + ")+N(C" + i + ")-N(E" + i + "))"]);
  }
  
  sheet.getRange(3, 6, lastRow - 2, 1).clearContent();
  sheet.getRange(3, 6, formulas.length, 1).setFormulas(formulas);
  
  // บังคับประมวลผลสูตรชีตทันที
  SpreadsheetApp.flush();
  
  // 2. คำนวณยอดปิดสิ้นวัน (Daily Closing Balance)
  var rangeValues = sheet.getRange(3, 1, lastRow - 2, 6).getValues(); // ดึง Col A - F
  var dailyBalances = {};
  var activeDateStr = "";
  
  for (var k = 0; k < rangeValues.length; k++) {
    var dateCell = rangeValues[k][0];
    var runningBal = rangeValues[k][5]; // คอลัมน์ F (index 5)
    
    if (dateCell !== undefined && dateCell !== null && String(dateCell).trim() !== "") {
      var isoDate = parseLegacyDate(dateCell);
      if (isoDate) {
        activeDateStr = formatDateBE(isoDate); // จัดเป็นรูปแบบไทย DD/MM/YYYY เสมอ เช่น 14/05/2569
      } else {
        activeDateStr = String(dateCell).trim();
      }
    }
    
    if (activeDateStr && runningBal !== "" && runningBal !== null && !isNaN(parseFloat(runningBal))) {
      dailyBalances[activeDateStr] = parseFloat(runningBal);
    }
  }
  
  // ล้างคอลัมน์ G และ H เก่า
  sheet.getRange(3, 7, lastRow - 2, 2).clearContent();
  
  // ป้อนยอดปิดวันลงในคอลัมน์ G และ H
  var dailyRows = [];
  for (var dateKey in dailyBalances) {
    dailyRows.push([dateKey, dailyBalances[dateKey]]);
  }
  
  if (dailyRows.length > 0) {
    sheet.getRange(3, 7, dailyRows.length, 2).setValues(dailyRows);
  }
}

/**
 * เพิ่มธุรกรรมใหม่ลงในชีตของแต่ละเดือน
 */
function addTransactionRow(ss, tx) {
  var id = "TX-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
  
  // ค้นหาชื่อย่อเดือนจากข้อมูลวันที่
  var dateParts = tx.date.split('-');
  var monthIdx = parseInt(dateParts[1], 10); // 1-12
  var monthName = MONTH_ABBRS[monthIdx - 1];
  
  var sheet = getOrCreateMonthSheet(ss, monthName);
  var formattedDate = formatDateBE(tx.date);
  
  // ฟอกข้อความล้างข้อมูลเสี่ยงภัย Formula Injection
  var cleanDesc = sanitizeString(tx.description);
  var cleanNote = sanitizeString(tx.note);
  var cleanCreator = sanitizeString(tx.created_by);
  
  // เตรียมข้อมูลเขียนลงตารางคู่ขนาน
  var rowData;
  if (tx.type === "income") {
    rowData = [formattedDate, cleanDesc, parseFloat(tx.amount), "", "", "", "", ""];
  } else {
    rowData = [formattedDate, "", "", cleanDesc, parseFloat(tx.amount), "", "", ""];
  }
  
  sheet.appendRow(rowData);
  var lastRow = sheet.getLastRow();
  
  // เซฟ ID, หมายเหตุ และผู้บันทึกเป็น Note (ความคิดเห็น) ไว้ในช่องรายการเพื่อรักษาข้อมูลและคงความสะอาดของชีต
  var noteStr = "ID: " + id + "\nหมายเหตุ: " + (cleanNote || "-") + "\nผู้บันทึก: " + cleanCreator;
  if (tx.type === "income") {
    sheet.getRange(lastRow, 2).setNote(noteStr);
  } else {
    sheet.getRange(lastRow, 4).setNote(noteStr);
  }
  
  // คำนวณผลใหม่
  calculateAndWriteBalancesForSheet(sheet);
  
  return {
    success: true,
    data: {
      id: id,
      date: tx.date,
      type: tx.type,
      description: tx.description,
      amount: parseFloat(tx.amount),
      note: tx.note || "",
      created_by: tx.created_by,
      timestamp: Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss")
    }
  };
}

/**
 * อัปเดตข้อมูลธุรกรรมเดิม
 */
function updateTransactionRow(ss, id, tx) {
  var location = findTransactionLocation(ss, id);
  if (!location) {
    return { success: false, message: "ไม่พบข้อมูลธุรกรรมดังกล่าวในระบบเพื่อแก้ไข" };
  }
  
  var oldSheet = location.sheet;
  var oldRowIndex = location.rowIndex;
  
  var dateParts = tx.date.split('-');
  var monthIdx = parseInt(dateParts[1], 10);
  var newMonthName = MONTH_ABBRS[monthIdx - 1];
  
  var formattedDate = formatDateBE(tx.date);
  
  // ฟอกข้อความล้างข้อมูลเสี่ยงภัย Formula Injection
  var cleanDesc = sanitizeString(tx.description);
  var cleanNote = sanitizeString(tx.note);
  var cleanCreator = sanitizeString(tx.created_by);
  var noteStr = "ID: " + id + "\nหมายเหตุ: " + (cleanNote || "-") + "\nผู้บันทึก: " + cleanCreator;
  
  if (oldSheet.getName() === newMonthName) {
    // แก้ไขในชีตเดิม
    oldSheet.getRange(oldRowIndex, 1).setValue(formattedDate);
    oldSheet.getRange(oldRowIndex, 2, 1, 4).clearContent();
    oldSheet.getRange(oldRowIndex, 2).clearNote();
    oldSheet.getRange(oldRowIndex, 4).clearNote();
    
    if (tx.type === "income") {
      oldSheet.getRange(oldRowIndex, 2).setValue(cleanDesc);
      oldSheet.getRange(oldRowIndex, 3).setValue(parseFloat(tx.amount));
      oldSheet.getRange(oldRowIndex, 2).setNote(noteStr);
    } else {
      oldSheet.getRange(oldRowIndex, 4).setValue(cleanDesc);
      oldSheet.getRange(oldRowIndex, 5).setValue(parseFloat(tx.amount));
      oldSheet.getRange(oldRowIndex, 4).setNote(noteStr);
    }
    
    calculateAndWriteBalancesForSheet(oldSheet);
  } else {
    // เปลี่ยนเดือน ย้ายข้ามชีต: ลบแถวเก่าและไปเพิ่มชีตใหม่
    oldSheet.deleteRow(oldRowIndex);
    calculateAndWriteBalancesForSheet(oldSheet);
    
    var newSheet = getOrCreateMonthSheet(ss, newMonthName);
    var rowData;
    if (tx.type === "income") {
      rowData = [formattedDate, cleanDesc, parseFloat(tx.amount), "", "", "", "", ""];
    } else {
      rowData = [formattedDate, "", "", cleanDesc, parseFloat(tx.amount), "", "", ""];
    }
    newSheet.appendRow(rowData);
    var lastRow = newSheet.getLastRow();
    
    if (tx.type === "income") {
      newSheet.getRange(lastRow, 2).setNote(noteStr);
    } else {
      newSheet.getRange(lastRow, 4).setNote(noteStr);
    }
    
    calculateAndWriteBalancesForSheet(newSheet);
  }
  
  return { success: true };
}

/**
 * ลบธุรกรรมโดยหา ID จากทุกแผ่นงาน
 */
function deleteTransactionRow(ss, id) {
  var location = findTransactionLocation(ss, id);
  if (!location) {
    return { success: false, message: "ไม่พบรหัสธุรกรรมเพื่อลบ" };
  }
  
  var sheet = location.sheet;
  sheet.deleteRow(location.rowIndex);
  calculateAndWriteBalancesForSheet(sheet);
  
  return { success: true, message: "ลบรายการธุรกรรมเรียบร้อย" };
}

/**
 * ค้นหาตำแหน่งแผ่นงานและลำดับแถวที่มี ID บันทึกอยู่ในเซลล์คอมเมนต์
 */
function findTransactionLocation(ss, id) {
  for (var s = 0; s < MONTH_ABBRS.length; s++) {
    var sheet = ss.getSheetByName(MONTH_ABBRS[s]);
    if (!sheet) continue;
    
    var rowIndex = findRowByTxId(sheet, id);
    if (rowIndex !== -1) {
      return { sheet: sheet, rowIndex: rowIndex };
    }
  }
  return null;
}

/**
 * สแกนคอมเมนต์หาแถวตรงกับรหัสธุรกรรมที่ระบุ
 */
function findRowByTxId(sheet, id) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 3) return -1;
  
  var range = sheet.getRange(3, 1, lastRow - 2, 5); // อ่านแถวที่ 3 ลงไป คอลัมน์ A ถึง E
  var notes = range.getNotes();
  
  for (var i = 0; i < notes.length; i++) {
    var noteB = notes[i][1]; // รายรับ (B)
    var noteD = notes[i][3]; // รายจ่าย (D)
    
    if (noteB && noteB.indexOf("ID: " + id) !== -1) {
      return i + 3;
    }
    if (noteD && noteD.indexOf("ID: " + id) !== -1) {
      return i + 3;
    }
  }
  
  return -1;
}

/**
 * ดึงธุรกรรมจากแผ่นงานรายเดือนมารวมกันเพื่อแสดงที่แอพหน้าบ้าน
 */
function getTransactionsListFromSheets(ss) {
  var list = [];
  
  for (var s = 0; s < MONTH_ABBRS.length; s++) {
    var monthName = MONTH_ABBRS[s];
    var sheet = ss.getSheetByName(monthName);
    if (!sheet) continue;
    
    var lastRow = sheet.getLastRow();
    if (lastRow < 3) continue;
    
    var range = sheet.getRange(3, 1, lastRow - 2, 5);
    var values = range.getValues();
    var notes = range.getNotes();
    var activeDateStr = "";
    
    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      
      // ดึงและแปลงวันที่
      if (row[0] !== undefined && row[0] !== null && String(row[0]).trim() !== "") {
        activeDateStr = parseLegacyDate(row[0]);
      }
      
      if (!activeDateStr) continue;
      
      var colB = String(row[1]).trim();
      var colD = String(row[3]).trim();
      
      if (colB.indexOf("รวมรายรับ") !== -1 || colD.indexOf("รวมรายจ่าย") !== -1) {
        continue;
      }
      
      // รายรับ
      var incDesc = colB;
      var incAmt = parseFloat(row[2]);
      if (incDesc && !isNaN(incAmt)) {
        var meta = parseCellNote(notes[i][1]);
        list.push({
          id: meta.id || ("TX-MIG-" + monthName + "-" + i + "-INC"),
          date: activeDateStr,
          type: "income",
          description: incDesc,
          amount: incAmt,
          note: meta.note || "",
          created_by: cleanCreatedBy(meta.createdBy),
          timestamp: Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss")
        });
      }
      
      // รายจ่าย
      var expDesc = colD;
      var expAmt = parseFloat(row[4]);
      if (expDesc && !isNaN(expAmt)) {
        var meta = parseCellNote(notes[i][3]);
        list.push({
          id: meta.id || ("TX-MIG-" + monthName + "-" + i + "-EXP"),
          date: activeDateStr,
          type: "expense",
          description: expDesc,
          amount: expAmt,
          note: meta.note || "",
          created_by: cleanCreatedBy(meta.createdBy),
          timestamp: Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss")
        });
      }
    }
  }
  
  // เรียงลำดับจากวันที่ล่าสุดไปยังอดีต
  list.sort(function(a, b) {
    return new Date(b.date) - new Date(a.date);
  });
  
  return list;
}

/**
 * ช่วยแมปชื่อผู้บันทึกระบบให้เป็นภาษาไทยสากล
 */
function cleanCreatedBy(name) {
  if (!name) return "เจ้าหน้าที่คาเฟ่";
  name = name.trim();
  if (name === "System Migration" || name === "System Upload" || name === "Staff" || name === "System" || name === "System Migration (May)") {
    return "เจ้าหน้าที่คาเฟ่";
  }
  if (name === "Admin" || name === "ผู้ดูแลระบบ (Admin)") {
    return "ผู้ดูแลระบบ";
  }
  return name;
}

/**
 * ช่วยแกะรายละเอียดคอมเมนต์ ID, หมายเหตุ, ผู้ทำรายการ
 */
function parseCellNote(noteStr) {
  var meta = { id: "", note: "", createdBy: "" };
  if (!noteStr) return meta;
  
  noteStr = noteStr.trim();
  // ตรวจสอบกรณีเป็นข้อมูลโครงสร้าง JSON ดิบ
  if (noteStr.indexOf("{") === 0 && noteStr.lastIndexOf("}") === noteStr.length - 1) {
    try {
      var json = JSON.parse(noteStr);
      meta.id = json.id || json.ID || "";
      meta.note = json.note || json.หมายเหตุ || "";
      meta.createdBy = json.created_by || json.ผู้บันทึก || json.createdBy || "";
      return meta;
    } catch (e) {
      // ข้ามไปประมวลผลต่อด้านล่างหาก parsing ผิดพลาด
    }
  }
  
  var lines = noteStr.split('\n');
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (line.indexOf("ID:") === 0) {
      meta.id = line.substring(3).trim();
    } else if (line.indexOf("หมายเหตุ:") === 0) {
      meta.note = line.substring(9).trim();
    } else if (line.indexOf("ผู้บันทึก:") === 0) {
      meta.createdBy = line.substring(10).trim();
    }
  }
  
  // เผื่อความเข้ากันได้ย้อนหลัง
  if (!meta.note && lines.length > 0 && lines[0].indexOf("ID:") === -1 && lines[0].indexOf("หมายเหตุ:") === -1) {
    meta.note = noteStr;
  }
  
  return meta;
}

/**
 * สั่งคำนวณยอดเงินของทุกชีตรายเดือนใหม่ทั้งหมด
 */
function recalculateAllSheets(ss) {
  for (var s = 0; s < MONTH_ABBRS.length; s++) {
    var sheet = ss.getSheetByName(MONTH_ABBRS[s]);
    if (!sheet) continue;
    calculateAndWriteBalancesForSheet(sheet);
  }
}

/**
 * ล้างข้อมูลแถวธุรกรรมทั้งหมดในชีตรายเดือน
 */
function clearAllMonthlySheetsData(ss) {
  for (var s = 0; s < MONTH_ABBRS.length; s++) {
    var sheet = ss.getSheetByName(MONTH_ABBRS[s]);
    if (!sheet) continue;
    
    var lastRow = sheet.getLastRow();
    if (lastRow >= 3) {
      sheet.getRange(3, 1, lastRow - 2, 8).clearContent();
      sheet.getRange(3, 1, lastRow - 2, 8).clearNote();
    }
  }
}

/**
 * ดึงรหัสผ่านทั้งหมดจากแผ่นงาน Passwords
 */
function getPasswordsFromSheet(ss) {
  var sheet = getOrCreatePasswordsSheet(ss);
  var values = sheet.getRange(2, 1, 3, 2).getValues();
  var creds = {};
  for (var i = 0; i < values.length; i++) {
    creds[values[i][0]] = values[i][1];
  }
  return creds;
}

/**
 * สร้างและกำหนดค่าเรนเดอร์ในแท็บ Passwords หากไม่พบชีตนี้ในตารางหลัก
 */
function getOrCreatePasswordsSheet(ss) {
  var sheet = ss.getSheetByName("Passwords");
  if (sheet) return sheet;
  
  sheet = ss.insertSheet("Passwords");
  sheet.appendRow(["บทบาท (Role)", "รหัสผ่าน (Password)", "คำอธิบาย (Description)"]);
  sheet.appendRow(["staff", "cafe2026", "รหัสผ่านเข้าใช้งานสำหรับเจ้าหน้าที่คาเฟ่"]);
  sheet.appendRow(["admin", "admin@2026", "รหัสผ่านเข้าใช้งานสำหรับผู้ดูแลระบบ"]);
  sheet.appendRow(["api", "admin@api2026", "รหัสผ่านเข้าถึงส่วนตั้งค่าการเชื่อมต่อ API"]);
  
  // ตกแต่งหัวตารางสีพาสเทลน้ำตาลอ่อน
  sheet.getRange("A1:C1").setFontWeight("bold").setBackground("#D7CCC8").setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, 3);
  
  return sheet;
}

/**
 * ฟอกทำความสะอาดข้อความสตริงเพื่อป้องกัน Google Sheets Formula Injection (CSV Injection)
 * หากข้อความเริ่มต้นด้วยเครื่องหมายคำนวณ (=, +, -, @) ระบบจะเติมเครื่องหมายฝนทอง (') นำหน้าโดยอัตโนมัติ
 */
function sanitizeString(str) {
  if (!str) return "";
  var val = String(str).trim();
  if (/^[=\+\-\@]/.test(val)) {
    return "'" + val;
  }
  return val;
}
