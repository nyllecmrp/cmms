'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface AssetPart {
  id: string;
  partNumber: string;
  partName: string;
  componentClassification?: string;
  pmType?: string;
  frequencyPM?: string;
  maintenanceTimeMinutes?: number;
  frequencyAM?: string;
  inspectionStandard?: string;
}

interface MaintenanceTask {
  id: string;
  assetPartId: string;
  assetId: string;
  weekNumber: number;
  year: number;
  maintenanceType: 'PM' | 'AM' | 'QM' | 'GM';
  status: 'planned' | 'completed' | 'skipped' | 'overdue';
  scheduledDate?: string;
  durationMinutes?: number;
  partName?: string;
  partNumber?: string;
}

interface MaintenanceCalendarProps {
  assetId: string;
  assetName: string;
  parts: AssetPart[];
  onScheduleChange?: () => void;
}

export default function MaintenanceCalendar({ assetId, assetName, parts, onScheduleChange }: MaintenanceCalendarProps) {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const currentWeek = Math.ceil((new Date().getTime() - new Date(currentYear, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));

  const [year, setYear] = useState(currentYear);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    partId: '',
    maintenanceType: 'PM' as 'PM' | 'AM' | 'QM' | 'GM',
    status: 'planned' as 'planned' | 'completed' | 'overdue',
  });

  const weeks = Array.from({ length: 52 }, (_, i) => i + 1);

  useEffect(() => {
    loadSchedule();
  }, [assetId, year]);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      // This endpoint doesn't exist yet, but we'll create it
      const data = await api.get(`/maintenance-schedule/${assetId}?year=${year}`) as MaintenanceTask[];
      setTasks(data);
    } catch (error: any) {
      console.error('Failed to load schedule:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const generateSchedule = async () => {
    if (!confirm(`Generate maintenance schedule for ${year}? This will create tasks based on component frequencies.`)) {
      return;
    }

    try {
      setLoading(true);
      await api.post(`/maintenance-schedule/generate`, {
        assetId,
        year,
        parts: parts.map(p => ({
          assetPartId: p.id,
          partNumber: p.partNumber,
          partName: p.partName,
          frequencyPM: p.frequencyPM,
          frequencyAM: p.frequencyAM,
          maintenanceTimeMinutes: p.maintenanceTimeMinutes,
        })),
      });
      alert('Schedule generated successfully!');
      loadSchedule();
    } catch (error: any) {
      alert(`Failed to generate schedule: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getTasksForWeek = (weekNumber: number) => {
    return tasks.filter(t => t.weekNumber === weekNumber);
  };

  const getWeekStatus = (weekNumber: number) => {
    const weekTasks = getTasksForWeek(weekNumber);
    if (weekTasks.length === 0) return 'empty';
    if (weekTasks.every(t => t.status === 'completed')) return 'completed';
    if (weekTasks.some(t => t.status === 'overdue')) return 'overdue';
    return 'planned';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 border-green-400';
      case 'overdue': return 'bg-red-100 border-red-400';
      case 'planned': return 'bg-blue-100 border-blue-400';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PM': return 'bg-blue-600';
      case 'AM': return 'bg-green-600';
      case 'QM': return 'bg-purple-600';
      case 'GM': return 'bg-orange-600';
      default: return 'bg-gray-600';
    }
  };


  const addManualTask = async () => {
    if (!selectedWeek || !newTask.partId) {
      alert('Please select a part and ensure a week is selected');
      return;
    }

    const part = parts.find(p => p.id === newTask.partId);
    if (!part) return;

    try {
      setLoading(true);
      await api.post('/maintenance-schedule/manual', {
        assetId,
        assetPartId: newTask.partId,
        weekNumber: selectedWeek,
        year,
        maintenanceType: newTask.maintenanceType,
        status: newTask.status,
        partNumber: part.partNumber,
        partName: part.partName,
      });
      
      setShowAddTask(false);
      setNewTask({
        partId: '',
        maintenanceType: 'PM',
        status: 'planned',
      });
      loadSchedule();
      if (onScheduleChange) onScheduleChange();
    } catch (error: any) {
      alert(`Failed to add task: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm('Delete this maintenance task?')) return;
    
    try {
      await api.delete(`/maintenance-schedule/${taskId}`);
      loadSchedule();
      if (onScheduleChange) onScheduleChange();
    } catch (error: any) {
      alert(`Failed to delete task: ${error.message}`);
    }
  };

  const toggleTaskStatus = async (task: MaintenanceTask) => {
    try {
      const newStatus = task.status === 'completed' ? 'planned' : 'completed';
      await api.patch(`/maintenance-schedule/${task.id}`, {
        status: newStatus,
        completedDate: newStatus === 'completed' ? new Date().toISOString() : null,
      });
      loadSchedule();
      if (onScheduleChange) onScheduleChange();
    } catch (error: any) {
      alert(`Failed to update task: ${error.message}`);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-900 to-green-700 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">📅 Maintenance Calendar</h2>
            <p className="text-green-100 text-sm mt-1">{assetName} - {year}</p>
          </div>
          <div className="flex gap-3 items-center">
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="px-4 py-2 rounded-lg border-2 border-white text-gray-900 font-semibold"
            >
              {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button
              onClick={generateSchedule}
              className="px-4 py-2 bg-white text-green-900 rounded-lg hover:bg-green-50 font-semibold transition"
              disabled={loading}
            >
              🔄 Generate Schedule
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading schedule...</p>
          </div>
        ) : (
          <>
            {/* Week Grid */}
            <div className="grid grid-cols-13 gap-2 mb-6">
              {/* Quarter Labels */}
              <div className="col-span-13 grid grid-cols-4 gap-2 mb-2">
                <div className="bg-gray-100 px-4 py-2 rounded-lg text-center font-bold text-gray-700">Q1 (Weeks 1-13)</div>
                <div className="bg-gray-100 px-4 py-2 rounded-lg text-center font-bold text-gray-700">Q2 (Weeks 14-26)</div>
                <div className="bg-gray-100 px-4 py-2 rounded-lg text-center font-bold text-gray-700">Q3 (Weeks 27-39)</div>
                <div className="bg-gray-100 px-4 py-2 rounded-lg text-center font-bold text-gray-700">Q4 (Weeks 40-52)</div>
              </div>

              {/* Week Cells */}
              {weeks.map((week) => {
                const weekTasks = getTasksForWeek(week);
                const status = getWeekStatus(week);
                const isCurrent = week === currentWeek && year === currentYear;

                return (
                  <div
                    key={week}
                    onClick={() => setSelectedWeek(week === selectedWeek ? null : week)}
                    className={`
                      relative border-2 rounded-lg p-3 cursor-pointer transition hover:shadow-md
                      ${getStatusColor(status)}
                      ${selectedWeek === week ? 'ring-4 ring-blue-500 shadow-lg' : ''}
                      ${isCurrent ? 'ring-2 ring-yellow-400' : ''}
                    `}
                  >
                    <div className="text-center">
                      <div className="text-xs font-bold text-gray-700">W{week}</div>
                      {weekTasks.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1 justify-center">
                          {weekTasks.slice(0, 3).map((task, idx) => (
                            <span
                              key={idx}
                              className={`${getTypeColor(task.maintenanceType)} text-white text-xs px-1 rounded font-bold`}
                              title={`${task.maintenanceType}: ${task.partName}`}
                            >
                              {task.maintenanceType}
                            </span>
                          ))}
                          {weekTasks.length > 3 && (
                            <span className="bg-gray-600 text-white text-xs px-1 rounded font-bold">
                              +{weekTasks.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Week Details */}
            {selectedWeek && (
              <div className="mt-6 bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Week {selectedWeek} Details
                </h3>

                {getTasksForWeek(selectedWeek).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-lg">No maintenance scheduled for this week</p>
                    <p className="text-sm mt-2">Click "Generate Schedule" to auto-populate</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getTasksForWeek(selectedWeek).map((task) => (
                      <div
                        key={task.id}
                        className="bg-white border-2 border-gray-300 rounded-lg p-4 hover:shadow-md transition"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`${getTypeColor(task.maintenanceType)} text-white px-3 py-1 rounded-lg font-bold text-sm`}>
                              {task.maintenanceType}
                            </span>
                            <div>
                              <p className="font-bold text-gray-900">{task.partName}</p>
                              <p className="text-sm text-gray-600">Part: {task.partNumber}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {task.durationMinutes && (
                              <span className="text-sm text-gray-600">
                                ⏱️ {task.durationMinutes} min
                              </span>
                            )}
                            <button
                              onClick={() => toggleTaskStatus(task)}
                              className={`px-4 py-2 rounded-lg font-semibold transition ${
                                task.status === 'completed'
                                  ? 'bg-green-600 text-white hover:bg-green-700'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {task.status === 'completed' ? '✓ Completed' : 'Mark Complete'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Legend */}
            <div className="mt-6 bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-bold text-gray-900 mb-3">LEGEND</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center rounded font-bold text-xs">PM</div>
                  <span className="text-sm text-gray-900 font-semibold">Preventive Maintenance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-600 text-white flex items-center justify-center rounded font-bold text-xs">AM</div>
                  <span className="text-sm text-gray-900 font-semibold">Autonomous Maintenance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-600 text-white flex items-center justify-center rounded font-bold text-xs">QM</div>
                  <span className="text-sm text-gray-900 font-semibold">Quality Maintenance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-600 text-white flex items-center justify-center rounded font-bold text-xs">GM</div>
                  <span className="text-sm text-gray-900 font-semibold">General Maintenance</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-300">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border-2 border-green-400 rounded"></div>
                  <span className="text-sm text-gray-900 font-semibold">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 border-2 border-blue-400 rounded"></div>
                  <span className="text-sm text-gray-900 font-semibold">Planned</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border-2 border-red-400 rounded"></div>
                  <span className="text-sm text-gray-900 font-semibold">Overdue</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
