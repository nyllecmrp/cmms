const fs = require('fs');
const content = fs.readFileSync('WCMLedgerGrid.tsx', 'utf8');

const newWeekCells = `                      >
                        <div className="flex flex-wrap gap-0.5 justify-center items-center" style={{ minHeight: '20px' }}>
                          {pmExecuted && (
                            <div className="w-2 h-2 rounded-full bg-blue-600" title="PM Executed" />
                          )}
                          {pmPlanned && (
                            <div className="w-2 h-2 rounded-full bg-yellow-400" title="PM Planned" />
                          )}
                          {breakdown && (
                            <div className="w-2 h-2 rounded-full bg-red-600" title="Breakdown/Overdue" />
                          )}
                          {unplanned && (
                            <div className="w-2 h-2 rounded-full bg-gray-400" title="Unplanned/AM" />
                          )}
                        </div>
                      </td>`;

// Find start and end markers
const startIdx = content.indexOf('                      >\n                        <div className="relative w-full h-full"');
const endIdx = content.indexOf('</td>', startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const before = content.substring(0, startIdx);
  const after = content.substring(endIdx);
  const newContent = before + newWeekCells + after.substring(5); // skip </td>
  fs.writeFileSync('WCMLedgerGrid.tsx', newContent, 'utf8');
  console.log('Successfully replaced week cells with colored dots');
} else {
  console.log('Could not find markers');
}
