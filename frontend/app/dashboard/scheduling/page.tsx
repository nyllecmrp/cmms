'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ScheduledTask {
  id: string;
  title: string;
  type: 'work_order' | 'pm' | 'inspection' | 'meeting';
  assetId?: string;
  assetName?: string;
  assignedTo: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: string;
  endDate: string;
  duration: number; // in hours
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  description: string;
  dependencies?: string[];
}

export default function SchedulingPage() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'calendar' | 'gantt' | 'list'>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [tasks, setTasks] = useState<ScheduledTask[]>([
    {
      id: '1',
      title: 'Hydraulic Pump PM Service',
      type: 'pm',
      assetId: 'PUMP-001',
      assetName: 'Hydraulic Pump A',
      assignedTo: 'John Smith',
      priority: 'high',
      startDate: '2025-10-05',
      endDate: '2025-10-05',
      duration: 4,
      status: 'scheduled',
      description: 'Quarterly preventive maintenance',
    },
    {
      id: '2',
      title: 'CT Scanner Calibration',
      type: 'inspection',
      assetId: 'CT-SCAN-01',
      assetName: 'CT Scanner - Radiology',
      assignedTo: 'Jane Doe',
      priority: 'critical',
      startDate: '2025-10-06',
      endDate: '2025-10-06',
      duration: 6,
      status: 'scheduled',
      description: 'Annual calibration inspection',
    },
    {
      id: '3',
      title: 'Emergency Generator Test',
      type: 'inspection',
      assetId: 'GEN-001',
      assetName: 'Emergency Generator',
      assignedTo: 'Mike Johnson',
      priority: 'medium',
      startDate: '2025-10-07',
      endDate: '2025-10-07',
      duration: 2,
      status: 'scheduled',
      description: 'Monthly generator load test',
    },
    {
      id: '4',
      title: 'HVAC Filter Replacement',
      type: 'work_order',
      assetId: 'HVAC-001',
      assetName: 'HVAC Unit - Floor 3',
      assignedTo: 'Tom Brown',
      priority: 'low',
      startDate: '2025-10-08',
      endDate: '2025-10-08',
      duration: 3,
      status: 'scheduled',
      description: 'Replace air filters in HVAC system',
    },
    {
      id: '5',
      title: 'Monthly Maintenance Review',
      type: 'meeting',
      assignedTo: 'All Technicians',
      priority: 'medium',
      startDate: '2025-10-10',
      endDate: '2025-10-10',
      duration: 2,
      status: 'scheduled',
      description: 'Review maintenance performance and upcoming tasks',
    },
  ]);

  const [formData, setFormData] = useState({
    title: '',
    type: 'work_order' as const,
    assetId: '',
    assignedTo: '',
    priority: 'medium' as const,
    startDate: '',
    endDate: '',
    duration: 1,
    description: '',
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'work_order': return '🔧';
      case 'pm': return '📅';
      case 'inspection': return '🔍';
      case 'meeting': return '👥';
      default: return '📋';
    }
  };

  const handleCreateTask = () => {
    if (!formData.title || !formData.startDate || !formData.assignedTo) {
      alert('Please fill in all required fields');
      return;
    }

    const newTask: ScheduledTask = {
      id: String(tasks.length + 1),
      ...formData,
      status: 'scheduled',
    };

    setTasks([...tasks, newTask]);
    setIsCreateModalOpen(false);
    setFormData({
      title: '',
      type: 'work_order',
      assetId: '',
      assignedTo: '',
      priority: 'medium',
      startDate: '',
      endDate: '',
      duration: 1,
      description: '',
    });
  };

  const handleStatusUpdate = (taskId: string, newStatus: ScheduledTask['status']) => {
    setTasks(tasks.map(task => task.id === taskId ? { ...task, status: newStatus } : task));
  };

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => task.startDate === dateStr);
  };

  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Previous month days
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const stats = {
    totalTasks: tasks.length,
    scheduled: tasks.filter(t => t.status === 'scheduled').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Scheduling & Planning</h1>
        <p className="text-gray-600 mt-1">Manage and visualize maintenance schedules</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalTasks}</p>
            </div>
            <div className="text-4xl">📋</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="text-3xl font-bold text-gray-900">{stats.scheduled}</p>
            </div>
            <div className="text-4xl">📅</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-gray-900">{stats.inProgress}</p>
            </div>
            <div className="text-4xl">⚙️</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>
      </div>

      {/* View Controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentView('calendar')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                currentView === 'calendar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📅 Calendar View
            </button>
            <button
              onClick={() => setCurrentView('gantt')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                currentView === 'gantt'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📊 Gantt Chart
            </button>
            <button
              onClick={() => setCurrentView('list')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                currentView === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📋 List View
            </button>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            ➕ Schedule Task
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {currentView === 'calendar' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              ← Previous
            </button>
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Next →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold text-gray-700 py-2">
                {day}
              </div>
            ))}

            {generateCalendarDays().map((date, idx) => {
              const dayTasks = date ? getTasksForDate(date) : [];
              const isToday = date && date.toDateString() === new Date().toDateString();

              return (
                <div
                  key={idx}
                  className={`min-h-24 p-2 border rounded-lg ${
                    !date ? 'bg-gray-50' : isToday ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'
                  }`}
                >
                  {date && (
                    <>
                      <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                        {date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayTasks.slice(0, 2).map(task => (
                          <div
                            key={task.id}
                            className={`text-xs p-1 rounded truncate ${getPriorityColor(task.priority)} border`}
                            title={task.title}
                          >
                            {getTypeIcon(task.type)} {task.title}
                          </div>
                        ))}
                        {dayTasks.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{dayTasks.length - 2} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Gantt Chart View */}
      {currentView === 'gantt' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gantt Chart View</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-64">Task</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tasks.map(task => (
                  <tr key={task.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <span className="text-xl mr-2">{getTypeIcon(task.type)}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{task.title}</div>
                          <div className="text-xs text-gray-500">{task.assignedTo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                          <div
                            className={`h-6 rounded-full flex items-center justify-center text-xs text-white font-medium ${
                              task.priority === 'critical' ? 'bg-red-500' :
                              task.priority === 'high' ? 'bg-orange-500' :
                              task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(task.duration * 10, 100)}%` }}
                          >
                            {task.duration}h
                          </div>
                        </div>
                        <span className="ml-4 text-xs text-gray-600 whitespace-nowrap">
                          {task.startDate}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* List View */}
      {currentView === 'list' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tasks.map(task => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{getTypeIcon(task.type)}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{task.title}</div>
                        <div className="text-xs text-gray-500">{task.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{task.assetName || '-'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{task.assignedTo}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority).replace('border-', 'border ')}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{task.startDate}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusUpdate(task.id, e.target.value as ScheduledTask['status'])}
                      className="text-sm border border-gray-300 rounded px-2 py-1 text-gray-700"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Task Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Schedule New Task</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="work_order">Work Order</option>
                    <option value="pm">Preventive Maintenance</option>
                    <option value="inspection">Inspection</option>
                    <option value="meeting">Meeting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asset ID</label>
                  <input
                    type="text"
                    value={formData.assetId}
                    onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="e.g., PUMP-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To *</label>
                  <input
                    type="text"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTask}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Schedule Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
