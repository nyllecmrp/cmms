'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

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


interface MaintenanceSchedule {
  id: string;
  assetPartId: string;
  weekNumber: number;
  maintenanceType: 'PM' | 'AM' | 'QM' | 'GM';
  status: 'planned' | 'completed' | 'skipped' | 'overdue';
}

interface WCMLedgerGridProps {
  asset: {
    assetNumber: string;
    name: string;
  };
  parts: AssetPart[];
  year?: number;
  onDataChange?: () => void;
}

export default function WCMLedgerGrid({ asset, parts, year = new Date().getFullYear(), onDataChange }: WCMLedgerGridProps) {
  const weeks = Array.from({ length: 52 }, (_, i) => i + 1);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [editingCell, setEditingCell] = useState<{ partId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);

  useEffect(() => {
    const loadSchedules = async () => {
      try {
        const assetId = parts[0]?.assetId;
        if (!assetId) return;
        const data = await api.get(`/maintenance-schedule/${assetId}?year=${year}`) as MaintenanceSchedule[];
        setSchedules(data);
      } catch (error) {
        console.error('Failed to load schedules:', error);
        setSchedules([]);
      }
    };
    if (parts.length > 0) {
      loadSchedules();
    }
  }, [parts, year]);


  const getClassificationBadge = (classification?: string) => {
    if (!classification) return <span className="text-gray-400 text-xs">-</span>;

    const badges: Record<string, { label: string; color: string }> = {
      'Critical': { label: 'A', color: 'bg-red-600' },
      'Important': { label: 'B', color: 'bg-yellow-600' },
      'Standard': { label: 'C', color: 'bg-green-600' },
      'A': { label: 'A', color: 'bg-red-600' },
      'B': { label: 'B', color: 'bg-yellow-600' },
      'C': { label: 'C', color: 'bg-green-600' },
    };

    const badge = badges[classification] || { label: classification.charAt(0).toUpperCase(), color: 'bg-gray-400' };

    return (
      <span
        className={`inline-block w-6 h-6 ${badge.color} text-white text-xs font-bold rounded flex items-center justify-center`}
        title={classification}
      >
        {badge.label}
      </span>
    );
  };


  const getScheduleForCell = (partId: string, weekNumber: number) => {
    return schedules.filter(s => s.assetPartId === partId && s.weekNumber === weekNumber);
  };

  const handleCellClick = (partId: string, field: string, currentValue: any) => {
    setEditingCell({ partId, field });
    setEditValue(currentValue?.toString() || '');
  };

  const handleCellBlur = async () => {
    if (!editingCell) return;
    const { partId, field } = editingCell;
    const part = parts.find(p => p.id === partId);
    if (!part) return;

    const currentValue = (part as any)[field];
    if (currentValue?.toString() === editValue) {
      setEditingCell(null);
      return;
    }

    let valueToSave: any = editValue;
    if (field === 'smpNumber' || field === 'qaMatrixNo' || field === 'qmMatrixNo' || field === 'maintenanceTimeMinutes') {
      valueToSave = editValue ? parseInt(editValue) : null;
    }

    try {
      setSaving(true);
      await api.patch(`/assets/parts/${partId}`, { [field]: valueToSave || null });
      if (onDataChange) onDataChange();
      setEditingCell(null);
    } catch (error: any) {
      alert(`Failed to save: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCellBlur();
    else if (e.key === 'Escape') setEditingCell(null);
  };

  const renderEditableCell = (part: AssetPart, field: keyof AssetPart, value: any, className: string = '', bgClass: string = '') => {
    const isEditing = editingCell?.partId === part.id && editingCell?.field === field;
    const displayValue = value || '-';

    if (isEditing) {
      return (
        <td className={`border border-gray-300 px-1 py-1 ${bgClass}`}>
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleCellBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className={`w-full px-1 py-1 text-xs text-gray-900 border-2 border-blue-500 rounded focus:outline-none ${className}`}
            disabled={saving}
          />
        </td>
      );
    }

    return (
      <td
        className={`border border-gray-300 px-2 py-2 cursor-pointer hover:bg-yellow-100 ${className} ${bgClass}`}
        onClick={() => handleCellClick(part.id, field, value)}
        title="Click to edit"
      >
        <span className="text-gray-900">{displayValue}</span>
      </td>
    );
  };

  const renderClassificationCell = (part: AssetPart) => {
    const isEditing = editingCell?.partId === part.id && editingCell?.field === 'componentClassification';

    if (isEditing) {
      return (
        <td className="border border-gray-300 px-1 py-1 text-center">
          <select
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleCellBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="w-full px-1 py-1 text-xs text-gray-900 border-2 border-blue-500 rounded focus:outline-none"
            disabled={saving}
          >
            <option value="">-</option>
            <option value="Critical">A - Critical</option>
            <option value="Important">B - Important</option>
            <option value="Standard">C - Standard</option>
          </select>
        </td>
      );
    }

    return (
      <td
        className="border border-gray-300 px-2 py-2 text-center cursor-pointer hover:bg-yellow-100"
        onClick={() => handleCellClick(part.id, 'componentClassification', part.componentClassification)}
        title="Click to edit"
      >
        {getClassificationBadge(part.componentClassification)}
      </td>
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
              <th colSpan={10} className="border border-gray-300 px-2 py-2 text-center font-bold">
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
              <th className="border border-gray-300 px-2 py-2" style={{minWidth: '60px'}}>Image</th>
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
                  <td className="border border-gray-300 px-2 py-2 text-center font-semibold text-gray-900 sticky left-0 bg-inherit z-10">
                    {index + 1}
                  </td>
                  <td className="border border-gray-300 px-1 py-1 text-center">
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </td>
                  <td className="border border-gray-300 px-2 py-2 font-mono text-blue-700">{part.partNumber}</td>
                  <td className="border border-gray-300 px-2 py-2 font-semibold text-gray-900">{part.partName}</td>
                  {renderEditableCell(part, 'sapNumber', part.sapNumber, 'font-mono text-xs')}
                  {renderEditableCell(part, 'storeroomLocation', part.storeroomLocation, 'text-xs')}
                  {renderEditableCell(part, 'vendor', part.vendor, 'text-xs')}
                  {renderClassificationCell(part)}

                  {/* PM Fields */}
                  {renderEditableCell(part, 'pmType', part.pmType, 'text-center', 'bg-blue-50')}
                  {renderEditableCell(part, 'smpNumber', part.smpNumber, 'text-center', 'bg-blue-50')}
                  {renderEditableCell(part, 'frequencyPM', part.frequencyPM, 'text-center', 'bg-blue-50')}
                  {renderEditableCell(part, 'maintenanceTimeMinutes', part.maintenanceTimeMinutes, 'text-center font-semibold', 'bg-blue-50')}
                  {renderEditableCell(part, 'machineStopRequired', part.machineStopRequired, 'text-center text-xs', 'bg-blue-50')}

                  {/* AM Fields */}
                  {renderEditableCell(part, 'inspectionStandard', part.inspectionStandard, 'text-center text-xs', 'bg-green-50')}
                  {renderEditableCell(part, 'frequencyAM', part.frequencyAM, 'text-center', 'bg-green-50')}

                  {/* QM Fields */}
                  {renderEditableCell(part, 'qaMatrixNo', part.qaMatrixNo, 'text-center', 'bg-purple-50')}
                  {renderEditableCell(part, 'qmMatrixNo', part.qmMatrixNo, 'text-center', 'bg-purple-50')}

                  {/* FI/Kaizen Fields */}
                  {renderEditableCell(part, 'kaizenType', part.kaizenType, 'text-xs', 'bg-orange-50')}
                  {renderEditableCell(part, 'kaizenNo', part.kaizenNo, 'text-xs', 'bg-orange-50')}

                  {/* Week Grid Cells - WCM Triangular Format */}
                  {weeks.map((week) => {
                    const cellSchedules = getScheduleForCell(part.id, week);
                    
                    // Check for each maintenance type and status
                    const pmPlanned = cellSchedules.find(s => s.maintenanceType === 'PM' && s.status === 'planned');
                    const pmExecuted = cellSchedules.find(s => s.maintenanceType === 'PM' && s.status === 'completed');
                    const breakdown = cellSchedules.find(s => s.status === 'overdue');
                    const unplanned = cellSchedules.find(s => s.maintenanceType === 'AM');
                    
                    return (
                      <td
                        key={week}
                        className={`border border-gray-300 p-0 text-center cursor-pointer hover:opacity-80 ${
                          selectedWeek === week ? 'ring-2 ring-yellow-400' : ''
                        }`}
                        title={`Week ${week}${cellSchedules.length > 0 ? ': ' + cellSchedules.map(s => `${s.maintenanceType} (${s.status})`).join(', ') : ''}`}
                        style={{ width: '24px', height: '24px' }}
                      >
                        <div className="relative w-full h-full" style={{ width: '24px', height: '24px' }}>
                          {/* Top Triangle - Planned Maintenance Executed (Blue) */}
                          <div
                            className={`absolute top-0 left-0 right-0 ${pmExecuted ? 'bg-blue-600' : 'bg-gray-100'}`}
                            style={{
                              width: '0',
                              height: '0',
                              borderLeft: '12px solid transparent',
                              borderRight: '12px solid transparent',
                              borderTop: pmExecuted ? '12px solid rgb(37, 99, 235)' : '12px solid rgb(243, 244, 246)',
                            }}
                          />
                          
                          {/* Right Triangle - Breakdown Maintenance (Red) */}
                          <div
                            className={`absolute top-0 right-0 bottom-0 ${breakdown ? 'bg-red-600' : 'bg-gray-100'}`}
                            style={{
                              width: '0',
                              height: '0',
                              borderTop: '12px solid transparent',
                              borderBottom: '12px solid transparent',
                              borderRight: breakdown ? '12px solid rgb(220, 38, 38)' : '12px solid rgb(243, 244, 246)',
                            }}
                          />
                          
                          {/* Bottom Triangle - Planned Maintenance (Yellow) */}
                          <div
                            className={`absolute bottom-0 left-0 right-0 ${pmPlanned ? 'bg-yellow-400' : 'bg-gray-100'}`}
                            style={{
                              width: '0',
                              height: '0',
                              borderLeft: '12px solid transparent',
                              borderRight: '12px solid transparent',
                              borderBottom: pmPlanned ? '12px solid rgb(250, 204, 21)' : '12px solid rgb(243, 244, 246)',
                            }}
                          />
                          
                          {/* Left Triangle - Unplanned Extra Maintenance (White/Gray) */}
                          <div
                            className={`absolute top-0 left-0 bottom-0 ${unplanned ? 'bg-gray-400' : 'bg-gray-100'}`}
                            style={{
                              width: '0',
                              height: '0',
                              borderTop: '12px solid transparent',
                              borderBottom: '12px solid transparent',
                              borderLeft: unplanned ? '12px solid rgb(156, 163, 175)' : '12px solid rgb(243, 244, 246)',
                            }}
                          />
                        </div>
                      </td>
                    );
                  })}
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
