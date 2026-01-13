'use client';

import { useState } from 'react';

interface AssetPart {
  id: string;
  partNumber: string;
  partName: string;
  sapNumber?: string;
  componentClassification?: string;
  pmType?: string;
  smpNumber?: number;
  frequencyPM?: string;
  maintenanceTimeMinutes?: number;
  machineStopRequired?: string;
  inspectionStandard?: string;
  frequencyAM?: string;
  qaMatrixNo?: number;
  qmMatrixNo?: number;
  kaizenType?: string;
  kaizenNo?: string;
  storeroomLocation?: string;
  vendor?: string;
}

interface WCMLedgerGridProps {
  asset: {
    assetNumber: string;
    name: string;
  };
  parts: AssetPart[];
  year?: number;
}

export default function WCMLedgerGrid({ asset, parts, year = new Date().getFullYear() }: WCMLedgerGridProps) {
  const weeks = Array.from({ length: 52 }, (_, i) => i + 1);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  const getClassificationBadge = (classification?: string) => {
    if (!classification) return <span className="text-gray-400 text-xs">-</span>;

    const badges: Record<string, { label: string; color: string }> = {
      'A': { label: 'A', color: 'bg-red-600' },
      'B': { label: 'B', color: 'bg-yellow-600' },
      'C': { label: 'C', color: 'bg-green-600' },
    };

    const classUpper = classification.toUpperCase();
    const badge = badges[classUpper] || { label: classification, color: 'bg-gray-400' };

    return (
      <span
        className={`inline-block w-6 h-6 ${badge.color} text-white text-xs font-bold rounded flex items-center justify-center`}
        title={`Class ${badge.label}`}
      >
        {badge.label}
      </span>
    );
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-6 py-4">
        <h2 className="text-2xl font-bold text-white">WCM MACHINE LEDGER - {year}</h2>
        <p className="text-blue-100 text-sm mt-1">
          {asset.assetNumber} - {asset.name}
        </p>
      </div>

      {/* Main Grid - Horizontal Scroll */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            {/* Section Headers */}
            <tr className="bg-blue-900 text-white">
              <th colSpan={9} className="border border-gray-300 px-2 py-2 text-center font-bold">
                COMPONENT INFORMATION
              </th>
              <th colSpan={5} className="border border-blue-400 px-2 py-2 text-center font-bold bg-blue-800">
                PM - PREVENTIVE MAINTENANCE
              </th>
              <th colSpan={2} className="border border-green-400 px-2 py-2 text-center font-bold bg-green-800">
                AM - AUTONOMOUS
              </th>
              <th colSpan={2} className="border border-purple-400 px-2 py-2 text-center font-bold bg-purple-800">
                QM - QUALITY
              </th>
              <th colSpan={2} className="border border-orange-400 px-2 py-2 text-center font-bold bg-orange-800">
                FI - KAIZEN
              </th>
              <th colSpan={52} className="border border-gray-300 px-2 py-2 text-center font-bold">
                ANNUAL MAINTENANCE SCHEDULE (Week 1-52)
              </th>
            </tr>

            {/* Column Headers */}
            <tr className="bg-blue-800 text-white text-xs">
              {/* Component Info */}
              <th className="border border-gray-300 px-2 py-2 sticky left-0 bg-blue-800 z-10" style={{minWidth: '40px'}}>No.</th>
              <th className="border border-gray-300 px-2 py-2" style={{minWidth: '100px'}}>Component No.</th>
              <th className="border border-gray-300 px-2 py-2" style={{minWidth: '120px'}}>Component Name</th>
              <th className="border border-gray-300 px-2 py-2" style={{minWidth: '80px'}}>Part No.</th>
              <th className="border border-gray-300 px-2 py-2" style={{minWidth: '80px'}}>Storeroom</th>
              <th className="border border-gray-300 px-2 py-2" style={{minWidth: '100px'}}>Vendor</th>
              <th className="border border-gray-300 px-2 py-2 text-center" style={{minWidth: '50px'}}>ABC</th>

              {/* PM Fields */}
              <th className="border border-blue-400 px-2 py-2 bg-blue-700" style={{minWidth: '60px'}}>PM Type</th>
              <th className="border border-blue-400 px-2 py-2 bg-blue-700" style={{minWidth: '60px'}}>SMP No.</th>
              <th className="border border-blue-400 px-2 py-2 bg-blue-700" style={{minWidth: '70px'}}>Frequency</th>
              <th className="border border-blue-400 px-2 py-2 bg-blue-700" style={{minWidth: '70px'}}>Duration (min)</th>
              <th className="border border-blue-400 px-2 py-2 bg-blue-700" style={{minWidth: '80px'}}>Machine</th>

              {/* AM Fields */}
              <th className="border border-green-400 px-2 py-2 bg-green-700" style={{minWidth: '80px'}}>Inspection</th>
              <th className="border border-green-400 px-2 py-2 bg-green-700" style={{minWidth: '70px'}}>Frequency</th>

              {/* QM Fields */}
              <th className="border border-purple-400 px-2 py-2 bg-purple-700" style={{minWidth: '70px'}}>QA Matrix</th>
              <th className="border border-purple-400 px-2 py-2 bg-purple-700" style={{minWidth: '70px'}}>QM Matrix</th>

              {/* FI/Kaizen Fields */}
              <th className="border border-orange-400 px-2 py-2 bg-orange-700" style={{minWidth: '80px'}}>Kaizen Type</th>
              <th className="border border-orange-400 px-2 py-2 bg-orange-700" style={{minWidth: '80px'}}>Kaizen No.</th>

              {/* Week Numbers */}
              {weeks.map((week) => (
                <th
                  key={week}
                  className={`border border-gray-300 px-1 py-2 text-center cursor-pointer hover:bg-blue-600 transition ${
                    selectedWeek === week ? 'bg-blue-600' : 'bg-blue-800'
                  }`}
                  style={{minWidth: '35px'}}
                  onClick={() => setSelectedWeek(week === selectedWeek ? null : week)}
                  title={`Week ${week}`}
                >
                  {week}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {parts.length === 0 ? (
              <tr>
                <td colSpan={71} className="border border-gray-300 px-4 py-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="text-6xl">📋</div>
                    <div className="text-gray-700 font-semibold text-lg">No Components Defined</div>
                    <div className="text-gray-500 text-sm">
                      Add parts to this machine to populate the WCM Machine Ledger
                    </div>
                    <button
                      onClick={() => window.history.back()}
                      className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Go Back to Add Parts
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              parts.map((part, index) => (
                <tr key={part.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  {/* Component Info */}
                  <td className="border border-gray-300 px-2 py-2 text-center font-semibold sticky left-0 bg-inherit z-10">
                    {index + 1}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 font-mono text-blue-700">{part.partNumber}</td>
                  <td className="border border-gray-300 px-2 py-2 font-semibold">{part.partName}</td>
                  <td className="border border-gray-300 px-2 py-2 font-mono text-xs">{part.sapNumber || '-'}</td>
                  <td className="border border-gray-300 px-2 py-2 text-xs">{part.storeroomLocation || '-'}</td>
                  <td className="border border-gray-300 px-2 py-2 text-xs">{part.vendor || '-'}</td>
                  <td className="border border-gray-300 px-2 py-2 text-center">
                    {getClassificationBadge(part.componentClassification)}
                  </td>

                  {/* PM Fields */}
                  <td className="border border-blue-400 px-2 py-2 text-center bg-blue-50">
                    {part.pmType || '-'}
                  </td>
                  <td className="border border-blue-400 px-2 py-2 text-center bg-blue-50">
                    {part.smpNumber || '-'}
                  </td>
                  <td className="border border-blue-400 px-2 py-2 text-center bg-blue-50">
                    {part.frequencyPM || '-'}
                  </td>
                  <td className="border border-blue-400 px-2 py-2 text-center font-semibold bg-blue-50">
                    {part.maintenanceTimeMinutes || '-'}
                  </td>
                  <td className="border border-blue-400 px-2 py-2 text-center text-xs bg-blue-50">
                    {part.machineStopRequired || '-'}
                  </td>

                  {/* AM Fields */}
                  <td className="border border-green-400 px-2 py-2 text-center text-xs bg-green-50">
                    {part.inspectionStandard || '-'}
                  </td>
                  <td className="border border-green-400 px-2 py-2 text-center bg-green-50">
                    {part.frequencyAM || '-'}
                  </td>

                  {/* QM Fields */}
                  <td className="border border-purple-400 px-2 py-2 text-center bg-purple-50">
                    {part.qaMatrixNo || '-'}
                  </td>
                  <td className="border border-purple-400 px-2 py-2 text-center bg-purple-50">
                    {part.qmMatrixNo || '-'}
                  </td>

                  {/* FI/Kaizen Fields */}
                  <td className="border border-orange-400 px-2 py-2 text-xs bg-orange-50">
                    {part.kaizenType || '-'}
                  </td>
                  <td className="border border-orange-400 px-2 py-2 text-xs bg-orange-50">
                    {part.kaizenNo || '-'}
                  </td>

                  {/* Week Grid Cells */}
                  {weeks.map((week) => (
                    <td
                      key={week}
                      className={`border border-gray-300 px-1 py-2 text-center cursor-pointer hover:bg-yellow-100 ${
                        selectedWeek === week ? 'bg-yellow-50' : ''
                      }`}
                      title={`Week ${week} - ${part.partName}`}
                    >
                      {/* This will show scheduled maintenance indicators */}
                      {/* For now, show PM indicator based on frequency */}
                      {part.frequencyPM && week % 4 === 0 ? (
                        <span className="text-blue-600 font-bold text-xs">PM</span>
                      ) : part.frequencyAM === '1W' ? (
                        <span className="text-green-600 text-xs">·</span>
                      ) : (
                        ''
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 border-t-2 border-gray-300 px-6 py-4">
        <h4 className="text-sm font-bold text-gray-900 mb-3">LEGEND</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-6 bg-blue-700 text-white flex items-center justify-center rounded font-bold flex-shrink-0">PM</div>
            <span className="text-gray-700">Preventive Maintenance (TBM/CBM/BDM)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-6 bg-green-700 text-white flex items-center justify-center rounded font-bold flex-shrink-0">AM</div>
            <span className="text-gray-700">Autonomous Maintenance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-6 bg-purple-700 text-white flex items-center justify-center rounded font-bold flex-shrink-0">QM</div>
            <span className="text-gray-700">Quality Maintenance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-6 bg-orange-700 text-white flex items-center justify-center rounded font-bold flex-shrink-0">FI</div>
            <span className="text-gray-700">Focused Improvement (Kaizen)</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <span className="inline-block w-6 h-6 bg-red-600 text-white text-xs font-bold rounded flex items-center justify-center flex-shrink-0">A</span>
            <span className="text-gray-700">Critical Component</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-6 h-6 bg-yellow-600 text-white text-xs font-bold rounded flex items-center justify-center flex-shrink-0">B</span>
            <span className="text-gray-700">Important Component</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-6 h-6 bg-green-600 text-white text-xs font-bold rounded flex items-center justify-center flex-shrink-0">C</span>
            <span className="text-gray-700">Standard Component</span>
          </div>
        </div>
      </div>
    </div>
  );
}
