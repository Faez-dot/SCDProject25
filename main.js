const readline = require('readline');
const db = require('./db');
require('./events/logger'); // Initialize event logger

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function menu() {
  console.log(`
===== NodeVault =====
1. Add Record
2. List Records
3. Update Record
4. Delete Record
5. Search Records(added)
6. Sort Records(added)
7. Export Data(added)
8. View Statistics(added)
9. Exit
=====================
  `);

  rl.question('Choose option: ', ans => {
    switch (ans.trim()) {
      case '1':
        rl.question('Enter name: ', name => {
          rl.question('Enter value: ', value => {
            db.addRecord({ name, value });
            console.log('✅ Record added successfully!');
            menu();
          });
        });
        break;

      case '2':
        const records = db.listRecords();
        if (records.length === 0) console.log('No records found.');
        else records.forEach(r => console.log(`ID: ${r.id} | Name: ${r.name} | Value: ${r.value}`));
        menu();
        break;

      case '3':
        rl.question('Enter record ID to update: ', id => {
          rl.question('New name: ', name => {
            rl.question('New value: ', value => {
              const updated = db.updateRecord(Number(id), name, value);
              console.log(updated ? '✅ Record updated!' : '❌ Record not found.');
              menu();
            });
          });
        });
        break;

      case '4':
        rl.question('Enter record ID to delete: ', id => {
          const deleted = db.deleteRecord(Number(id));
          console.log(deleted ? '🗑️ Record deleted!' : '❌ Record not found.');
          menu();
        });
        break;
      
      case '5':
        rl.question('Enter search keyword: ', term => {
        term = term.trim().toLowerCase();
        const records = db.listRecords();
        const results = records.filter(r =>r.id.toString() === term || r.name.toLowerCase().includes(term));
        if(results.length==0) console.log("No records found.");
        else results.forEach(r=> console.log(`ID: ${r.id} | Name: ${r.name} | Value: ${r.value}`));
        menu();
      });
      break;

      case '6':
        rl.question('Sort by field(name/created):',field=>{
        rl.question('Order (asc,desc):',order=>{
          const records=[...db.listRecords()];
          if (field.toLowerCase()==='name') records.sort((a,b)=> a.name.localeCompare(b.name));
          else records.sort((a,b)=> new Date(a.created)-new Date(b.created));

          if (order.toLowerCase()==='desc') records.reverse();
          records.forEach(r=>console.log(`ID: ${r.id} | Name: ${r.name} | Value: ${r.value} | Created: ${r.created}`));
          menu();
         });
        });
       break;

      case '7': {
        const path=require('path');
        const fs=require('fs');
        const exportFile=path.join(__dirname, 'export.txt');
        const records=db.listRecords();
        const header=`Export Date: ${new Date().toISOString()}\nTotal Records: ${records.length}\nFile: export.txt\n\n`;
        const body=records.map((r,i)=>`${i+1}. ID:${r.id} | Name: ${r.name} | Value: ${r.value}}\n`).join('\n');
        fs.writeFileSync(exportFile,header+body,'utf8');
        console.log('Data exported successfully to export.txt');
        menu();
        break;
       }

      case '8' :{

        const path=require('path');
        const fs=require('fs');
        const vaultFile=path.join(__dirname,'vault.json');
        const records=db.listRecords();
        if (records.length===0){
           console.log("No records");
        }
        else {
           const stats={
                total: records.length,
                lastModified: fs.existsSync(vaultFile) ? fs.statSync(vaultFile).mtime.toISOString(): 'N/A',
                longestName: records.reduce((a,b)=>a.name.length>b.name.length?a:b).name,
                earliest: records.reduce((a,b)=>new Date(a.created)<new Date(b.created)?a:b).created,
                latest: records.reduce((a,b)=>new Date(a.created)>new Date(b.created)?a:b).created
           }; 
           console.log(
`-------------------------
Statistics:
-------------------------
Total Records: ${stats.total}
Last Modified: ${stats.lastModified}
Longest Name: ${stats.longesrName} (${stats.longestName.length} chars)
Earliest Record: ${stats.earilest}
Latest Record: ${stats.latest}
-------------------------`);
         }
         menu();
         break;
      }

      case '9':
        console.log('👋 Exiting NodeVault...');
        rl.close();
        break;

      default:
        console.log('Invalid option.');
        menu();
    }
  });
}

menu();
