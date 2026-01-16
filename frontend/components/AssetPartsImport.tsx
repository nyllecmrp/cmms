'use client';

import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ part: string; error: string }>;
}

interface AssetPartsImportProps {
  assetId: string;
  onImportComplete: () => void;
}

export default function AssetPartsImport({ assetId, onImportComplete }: AssetPartsImportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const template = [
      {
        partNumber: 'SEAL-001',
        sapNumber: 'MAT-12345',
        partName: 'Hydraulic Seal',
        description: 'Main hydraulic seal',
        manufacturer: 'SKF',
        modelNumber: 'HS-2000',
        unitOfMeasure: 'EA',
        quantity: 2,
        componentClassification: 'A',
        pmType: 'TBM',
        smpNumber: 101,
        frequencyPM: '3M',
        maintenanceTimeMinutes: 30,
        machineStopRequired: 'STOP',
        inspectionStandard: 'C',
        frequencyAM: '1W',
        qaMatrixNo: 201,
        qmMatrixNo: 301,
        kaizenType: 'Reliability',
        kaizenNo: 'KZ-2024-001',
        storeroomLocation: 'A-12-3',
        vendor: 'SKF Bearings',
        notes: 'Critical component - monitor weekly',
      },
      {
        partNumber: 'BELT-002',
        sapNumber: 'MAT-12346',
        partName: 'Drive Belt',
        description: 'V-belt for motor drive',
        manufacturer: 'Gates',
        modelNumber: 'V-BELT-100',
        unitOfMeasure: 'EA',
        quantity: 1,
        componentClassification: 'B',
        pmType: 'CBM',
        smpNumber: 102,
        frequencyPM: '6M',
        maintenanceTimeMinutes: 45,
        machineStopRequired: 'STOP',
        inspectionStandard: 'I',
        frequencyAM: 'M',
        qaMatrixNo: 202,
        qmMatrixNo: 302,
        kaizenType: 'Cost',
        kaizenNo: 'KZ-2024-002',
        storeroomLocation: 'B-05-1',
        vendor: 'Gates Corporation',
        notes: 'Check tension monthly',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Parts Template');

    // Set column widths
    ws['!cols'] = [
      { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 30 }, { wch: 15 },
      { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 10 },
      { wch: 12 }, { wch: 15 }, { wch: 20 }, { wch: 18 }, { wch: 18 },
      { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 },
      { wch: 18 }, { wch: 20 }, { wch: 40 },
    ];

    XLSX.writeFile(wb, 'asset-parts-template.xlsx');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setResult(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Transform to API format
      const parts = jsonData.map((row: any) => ({
        partNumber: row.partNumber || row.PartNumber,
        sapNumber: row.sapNumber || row.SAPNumber,
        partName: row.partName || row.PartName,
        description: row.description || row.Description,
        manufacturer: row.manufacturer || row.Manufacturer,
        modelNumber: row.modelNumber || row.ModelNumber,
        unitOfMeasure: row.unitOfMeasure || row.UnitOfMeasure || 'EA',
        quantity: parseFloat(row.quantity || row.Quantity || 1),
        componentClassification: row.componentClassification || row.ComponentClassification,
        pmType: row.pmType || row.PMType,
        smpNumber: row.smpNumber ? parseInt(row.smpNumber) : row.SMPNumber ? parseInt(row.SMPNumber) : undefined,
        frequencyPM: row.frequencyPM || row.FrequencyPM,
        maintenanceTimeMinutes: row.maintenanceTimeMinutes ? parseInt(row.maintenanceTimeMinutes) : row.MaintenanceTimeMinutes ? parseInt(row.MaintenanceTimeMinutes) : undefined,
        machineStopRequired: row.machineStopRequired || row.MachineStopRequired,
        inspectionStandard: row.inspectionStandard || row.InspectionStandard,
        frequencyAM: row.frequencyAM || row.FrequencyAM,
        qaMatrixNo: row.qaMatrixNo ? parseInt(row.qaMatrixNo) : row.QAMatrixNo ? parseInt(row.QAMatrixNo) : undefined,
        qmMatrixNo: row.qmMatrixNo ? parseInt(row.qmMatrixNo) : row.QMMatrixNo ? parseInt(row.QMMatrixNo) : undefined,
        kaizenType: row.kaizenType || row.KaizenType,
        kaizenNo: row.kaizenNo || row.KaizenNo,
        storeroomLocation: row.storeroomLocation || row.StoreroomLocation,
        vendor: row.vendor || row.Vendor,
        notes: row.notes || row.Notes,
      }));

      // Send to backend
      const response = await fetch(`/api/assets/${assetId}/parts/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parts }),
      });

      if (!response.ok) throw new Error('Import failed');

      const importResult = await response.json();
      setResult(importResult as ImportResult);

      if (importResult.success > 0) {
        setTimeout(() => {
          onImportComplete();
          if (importResult.failed === 0) {
            setIsOpen(false);
          }
        }, 2000);
      }
    } catch (error: any) {
      alert(`Import failed: ${error.message}`);
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        Import Parts (CSV/Excel)
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Import Asset Parts</h2>
                <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                  <li>Download the Excel template below</li>
                  <li>Fill in your parts data (supports CSV, XLS, XLSX)</li>
                  <li>Upload the completed file</li>
                  <li>Review import results</li>
                </ol>
              </div>

              <button
                onClick={downloadTemplate}
                className="w-full px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Excel Template
              </button>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xls,.xlsx"
                  onChange={handleFileUpload}
                  disabled={importing}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="space-y-2">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="text-gray-600">
                      {importing ? (
                        <span className="text-blue-600 font-semibold">Importing...</span>
                      ) : (
                        <>
                          <span className="text-blue-600 font-semibold">Click to upload</span> or drag and drop
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">CSV, XLS, or XLSX files</p>
                  </div>
                </label>
              </div>

              {result && (
                <div className={`rounded p-4 ${result.failed === 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                  <h3 className="font-semibold mb-2">Import Results:</h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-green-700">✓ Successfully imported: {result.success} parts</p>
                    {result.failed > 0 && (
                      <>
                        <p className="text-red-700">✗ Failed: {result.failed} parts</p>
                        <div className="mt-2 max-h-40 overflow-y-auto">
                          {result.errors.map((err, idx) => (
                            <div key={idx} className="text-xs text-red-600 bg-red-50 p-2 rounded mb-1">
                              <strong>{err.part}:</strong> {err.error}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
