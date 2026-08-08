# BrewPOS

## GitHub Pages
อัปโหลด `index.html` ไว้ที่หน้าแรกของ repository แล้วตั้ง:
Settings → Pages → Deploy from a branch → main → / (root)

URL:
https://USERNAME.github.io/AiriMatcha/

## Google Sheets
1. สร้าง Google Sheet
2. Extensions → Apps Script
3. วางโค้ดจาก GoogleAppsScript_BrewPOS.gs
4. Run `setupDatabase()` 1 ครั้ง
5. Deploy → New deployment → Web app
6. Execute as: Me
7. Who has access: Anyone
8. นำ Web App URL ไปใส่ใน index.html ที่ `window.GSHEET_DB_URL`
