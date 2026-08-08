const SHEET_NAME = 'BrewPOS_DB';

function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.getRange(1,1,1,4).setValues([['updated_at','key','scope','value']]);
    sh.setFrozenRows(1);
    sh.getRange(1,1,1,4).setFontWeight('bold');
  }
}

function doGet(e) {
  try {
    setupDatabase();
    const p = e && e.parameter ? e.parameter : {};
    const action = p.action || 'get';
    if (action === 'ping') return json_({ok:true});
    const key = String(p.key || '');
    const scope = String(p.scope || 'shared');
    if (!key) return json_({ok:false,error:'Missing key'});
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const last = sh.getLastRow();
    if (last < 2) return json_({ok:true,found:false});
    const rows = sh.getRange(2,1,last-1,4).getValues();
    for (let i=rows.length-1;i>=0;i--) {
      if (String(rows[i][1])===key && String(rows[i][2])===scope)
        return json_({ok:true,found:true,value:String(rows[i][3] ?? '')});
    }
    return json_({ok:true,found:false});
  } catch(err) { return json_({ok:false,error:String(err)}); }
}

function doPost(e) {
  try {
    setupDatabase();
    const data = JSON.parse(e.postData.contents || '{}');
    if (data.action !== 'set') return json_({ok:false,error:'Unsupported action'});
    const key = String(data.key || '');
    const scope = String(data.scope || 'shared');
    const value = data.value == null ? '' : String(data.value);
    if (!key) return json_({ok:false,error:'Missing key'});
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
      const last = sh.getLastRow();
      if (last >= 2) {
        const rows = sh.getRange(2,1,last-1,4).getValues();
        for (let i=rows.length-1;i>=0;i--) {
          if (String(rows[i][1])===key && String(rows[i][2])===scope) {
            sh.getRange(i+2,1,1,4).setValues([[new Date(),key,scope,value]]);
            return json_({ok:true,updated:true});
          }
        }
      }
      sh.appendRow([new Date(),key,scope,value]);
      return json_({ok:true,created:true});
    } finally { lock.releaseLock(); }
  } catch(err) { return json_({ok:false,error:String(err)}); }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
