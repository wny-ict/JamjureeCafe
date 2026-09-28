// สคริปต์สแกนตรวจสอบข้อมูลในทุกแผ่นงานอย่างละเอียดเพื่อค้นหาตาราง พ.ค.
const API_URL = "https://script.google.com/macros/s/AKfycbz6KSgf9Cc_OWQpRrBf_yihY-o3q34S4-G-n2cJZHTEl3CoJc6YSkXFtOm8xY0ryedQjA/exec";

// เราจะแก้ให้ action=debug ใน Code.gs ส่งข้อมูลทุกชีต หรือเขียนเงื่อนไขส่งรายละเอียดเพิ่ม
async function scanAllSheets() {
  console.log("กำลังเชื่อมต่อไปยัง Google Apps Script เพื่อดึงโครงสร้างแถวของทุกแท็บชีต...");
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "debug" })
    });
    const json = await res.json();
    console.log("ผลการสแกนชีตทั้งหมด:", JSON.stringify(json, null, 2));
  } catch (e) {
    console.error("สแกนล้มเหลว: " + e.message);
  }
}

scanAllSheets();
