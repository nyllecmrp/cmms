'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface PMSchedule {
  id: string;
  title: string;
  assetName: string;
  frequency: string;
  lastCompleted: string;
  nextDue: string;
  status: 'On Track' | 'Due Soon' | 'Overdue';
  assignedTo: string;
  assignedToId?: string;
  estimatedDuration: string;
}

interface Asset {
  id: string;
  name: string;
  assetNumber: string;
  category: string;
  maintenanceParts?: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function PreventiveMaintenancePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'schedules' | 'calendar' | 'compliance'>('schedules');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<PMSchedule | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetSearch, setAssetSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [showAssetDropdown, setShowAssetDropdown] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Filtering and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'On Track' | 'Due Soon' | 'Overdue'>('all');
  const [frequencyFilter, setFrequencyFilter] = useState<string>('all');

  // Calendar view filter state
  const [calendarFilter, setCalendarFilter] = useState<'all' | 'my-assigned' | 'unassigned' | 'by-technician'>('all');
  const [selectedTechnicianFilter, setSelectedTechnicianFilter] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    frequency: 'Monthly',
    assignedToId: '',
    estimatedHours: '',
    nextDue: '',
    description: '',
    customFrequency: '',
    customFrequencyUnit: 'days',
  });

  // Parts state
  const [parts, setParts] = useState<Array<{name: string, quantity: string, estimatedCost: string}>>([]);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data for fallback
  const mockSchedules: PMSchedule[] = [
    {
      id: '1',
      title: 'Monthly Motor Inspection',
      assetName: 'Conveyor Motor A1',
      frequency: 'Monthly',
      lastCompleted: '2025-09-03',
      nextDue: '2025-10-03',
      status: 'On Track',
      assignedTo: 'Maria Santos',
      estimatedDuration: '2 hours',
    },
    {
      id: '2',
      title: 'Quarterly HVAC Filter Change',
      assetName: 'HVAC Unit 5',
      frequency: 'Quarterly',
      lastCompleted: '2025-07-15',
      nextDue: '2025-10-15',
      status: 'Due Soon',
      assignedTo: 'Juan Cruz',
      estimatedDuration: '1 hour',
    },
    {
      id: '3',
      title: 'Annual Pump Overhaul',
      assetName: 'Water Pump #3',
      frequency: 'Annually',
      lastCompleted: '2024-09-20',
      nextDue: '2025-09-20',
      status: 'Overdue',
      assignedTo: 'Unassigned',
      estimatedDuration: '4 hours',
    },
  ];

  const [schedules, setSchedules] = useState<PMSchedule[]>(mockSchedules);

  // Helper function to calculate status based on nextDue date
  const calculateStatus = (nextDue: string): 'On Track' | 'Due Soon' | 'Overdue' => {
    const dueDate = new Date(nextDue);
    const today = new Date();
    const daysDiff = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) return 'Overdue';
    if (daysDiff <= 7) return 'Due Soon';
    return 'On Track';
  };

  // Fetch PM schedules from backend
  const fetchPMSchedules = async () => {
    if (!user?.organizationId) return;

    try {
      const response = await api.getPMSchedules(user.organizationId);
      const data = response as any;

      // Map backend response to PMSchedule interface
      const mappedSchedules: PMSchedule[] = data.map((schedule: any) => ({
        id: schedule.id,
        title: schedule.name,
        assetName: schedule.asset?.name || 'No Asset',
        frequency: schedule.frequency,
        lastCompleted: schedule.lastCompleted || 'Never',
        nextDue: schedule.nextDue,
        status: calculateStatus(schedule.nextDue),
        assignedTo: schedule.assignedTo
          ? `${schedule.assignedTo.firstName} ${schedule.assignedTo.lastName}`
          : 'Unassigned',
        assignedToId: schedule.assignedTo?.id || null,
        estimatedDuration: schedule.estimatedHours
          ? `${schedule.estimatedHours} ${schedule.estimatedHours === 1 ? 'hour' : 'hours'}`
          : 'Not specified',
      }));

      setSchedules(mappedSchedules);
    } catch (error) {
      console.error('Failed to fetch PM schedules:', error);
      // Keep using mock data on error
    }
  };

  // Fetch PM schedules when component mounts
  useEffect(() => {
    if (user?.organizationId) {
      fetchPMSchedules();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.organizationId]);

  // Set default calendar filter based on user role
  useEffect(() => {
    if (user?.roleId === 'technician') {
      setCalendarFilter('my-assigned');
    } else {
      setCalendarFilter('all');
    }
  }, [user?.roleId]);

  // Fetch users when calendar tab is active or modal opens
  useEffect(() => {
    if (user?.organizationId && (activeTab === 'calendar' || showAddModal)) {
      const fetchUsers = async () => {
        try {
          const data = await api.getUsers(user.organizationId);
          setUsers(data as User[]);
        } catch (error) {
          console.error('Failed to fetch users:', error);
        }
      };

      fetchUsers();
    }
  }, [activeTab, showAddModal, user?.organizationId]);

  // Fetch assets when modal opens
  useEffect(() => {
    if (showAddModal && user?.organizationId) {
      const fetchAssets = async () => {
        try {
          const data = await api.getAssets(user.organizationId);
          setAssets(data as Asset[]);
        } catch (error) {
          console.error('Failed to fetch assets:', error);
        }
      };

      fetchAssets();
    }
  }, [showAddModal, user?.organizationId]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validate required fields
    if (!formData.name.trim()) {
      setFormError('PM Title is required');
      return;
    }
    if (!formData.frequency) {
      setFormError('Frequency is required');
      return;
    }
    if (!formData.nextDue) {
      setFormError('Next Due Date is required');
      return;
    }
    if (!user?.organizationId || !user?.id) {
      setFormError('User authentication error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert parts array to JSON if there are parts with filled data
      const validParts = parts.filter(p => p.name.trim() && p.quantity && p.estimatedCost);
      const partsJson = validParts.length > 0
        ? JSON.stringify(validParts.map(p => ({
            name: p.name.trim(),
            quantity: parseInt(p.quantity),
            estimatedCost: parseFloat(p.estimatedCost)
          })))
        : undefined;

      const payload = {
        organizationId: user.organizationId,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        assetId: selectedAsset?.id,
        frequency: formData.frequency,
        frequencyValue: 1,
        assignedToId: formData.assignedToId || undefined,
        nextDue: formData.nextDue,
        estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
        parts: partsJson,
        createdById: user.id,
      };

      if (selectedSchedule) {
        // Update existing schedule
        await api.updatePMSchedule(selectedSchedule.id, payload);
      } else {
        // Create new schedule
        await api.createPMSchedule(payload);
      }

      // Reset form
      setFormData({
        name: '',
        frequency: 'Monthly',
        assignedToId: '',
        estimatedHours: '',
        nextDue: '',
        description: '',
        customFrequency: '',
        customFrequencyUnit: 'days',
      });
      setParts([]);
      setSelectedAsset(null);
      setAssetSearch('');

      // Close modal
      setShowAddModal(false);

      // Refresh schedule list
      await fetchPMSchedules();
    } catch (error: any) {
      console.error('Failed to create PM schedule:', error);
      setFormError(error.message || 'Failed to create PM schedule. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!showAddModal) {
      setFormData({
        name: '',
        frequency: 'Monthly',
        assignedToId: '',
        estimatedHours: '',
        nextDue: '',
        description: '',
        customFrequency: '',
        customFrequencyUnit: 'days',
      });
      setParts([]);
      setSelectedAsset(null);
      setAssetSearch('');
      setFormError('');
      setSelectedSchedule(null);
    }
  }, [showAddModal]);

  // Populate form when editing a schedule
  useEffect(() => {
    if (selectedSchedule && showAddModal) {
      // Find the full schedule data from the schedules list to get the original data
      const fetchScheduleDetails = async () => {
        try {
          const scheduleData = await api.getPMSchedule(selectedSchedule.id);

          setFormData({
            name: scheduleData.name || '',
            frequency: scheduleData.frequency || 'Monthly',
            assignedToId: scheduleData.assignedToId || '',
            estimatedHours: scheduleData.estimatedHours?.toString() || '',
            nextDue: scheduleData.nextDue || '',
            description: scheduleData.description || '',
            customFrequency: '',
            customFrequencyUnit: 'days',
          });

          // Set the selected asset if there is one
          if (scheduleData.asset) {
            setSelectedAsset({
              id: scheduleData.asset.id,
              name: scheduleData.asset.name,
              assetNumber: scheduleData.asset.assetNumber || '',
              category: '',
            });
          }

          // Parse and set parts if they exist
          if (scheduleData.parts) {
            try {
              const parsedParts = JSON.parse(scheduleData.parts);
              setParts(parsedParts.map((p: any) => ({
                name: p.name || '',
                quantity: String(p.quantity || ''),
                estimatedCost: String(p.estimatedCost || p.price || '')
              })));
            } catch (e) {
              console.error('Failed to parse parts:', e);
              setParts([]);
            }
          }
        } catch (error) {
          console.error('Failed to fetch schedule details:', error);
        }
      };

      fetchScheduleDetails();
    }
  }, [selectedSchedule, showAddModal]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAddModal) {
        setShowAddModal(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showAddModal]);

  // Auto-populate parts when an asset is selected
  useEffect(() => {
    if (selectedAsset?.maintenanceParts) {
      try {
        const parsed = JSON.parse(selectedAsset.maintenanceParts);
        setParts(parsed.map((p: any) => ({
          name: p.name || '',
          quantity: String(p.quantity || ''),
          estimatedCost: String(p.estimatedCost || '')
        })));
      } catch (e) {
        console.error('Failed to parse maintenance parts:', e);
        setParts([]);
      }
    } else {
      // Clear parts if no asset selected or asset has no parts
      setParts([]);
    }
  }, [selectedAsset]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Track': return 'bg-green-100 text-green-800';
      case 'Due Soon': return 'bg-yellow-100 text-yellow-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter schedules based on search and filters
  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = searchQuery === '' ||
      schedule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schedule.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schedule.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || schedule.status === statusFilter;
    const matchesFrequency = frequencyFilter === 'all' || schedule.frequency === frequencyFilter;

    return matchesSearch && matchesStatus && matchesFrequency;
  });

  // Filter schedules for calendar view based on selected filter
  const getCalendarFilteredSchedules = () => {
    switch (calendarFilter) {
      case 'my-assigned':
        return schedules.filter(schedule => schedule.assignedToId === user?.id);
      case 'unassigned':
        return schedules.filter(schedule => !schedule.assignedToId || schedule.assignedTo === 'Unassigned');
      case 'by-technician':
        if (!selectedTechnicianFilter) return schedules;
        return schedules.filter(schedule => schedule.assignedToId === selectedTechnicianFilter);
      case 'all':
      default:
        return schedules;
    }
  };

  const calendarFilteredSchedules = getCalendarFilteredSchedules();

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getPMsForDate = (dateString: string) => {
    return calendarFilteredSchedules.filter(schedule =>
      schedule.nextDue === dateString
    );
  };

  const formatDateForComparison = (year: number, month: number, day: number) => {
    const date = new Date(year, month, day);
    return date.toISOString().split('T')[0];
  };

  const handleDateClick = (dateString: string) => {
    const pms = getPMsForDate(dateString);
    if (pms.length > 0) {
      setSelectedDate(dateString);
      setShowDateModal(true);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Export to CSV function
  const exportToCSV = () => {
    const headers = ['PM Title', 'Asset', 'Frequency', 'Last Completed', 'Next Due', 'Status', 'Assigned To', 'Duration'];
    const rows = filteredSchedules.map(s => [
      s.title,
      s.assetName,
      s.frequency,
      s.lastCompleted,
      s.nextDue,
      s.status,
      s.assignedTo,
      s.estimatedDuration
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pm-schedules-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Clone PM schedule
  const clonePMSchedule = async (schedule: PMSchedule) => {
    try {
      const scheduleData = await api.getPMSchedule(schedule.id);

      setFormData({
        name: `${scheduleData.name} (Copy)`,
        frequency: scheduleData.frequency || 'Monthly',
        assignedToId: scheduleData.assignedToId || '',
        estimatedHours: scheduleData.estimatedHours?.toString() || '',
        nextDue: scheduleData.nextDue || '',
        description: scheduleData.description || '',
        customFrequency: '',
        customFrequencyUnit: 'days',
      });

      if (scheduleData.asset) {
        setSelectedAsset({
          id: scheduleData.asset.id,
          name: scheduleData.asset.name,
          assetNumber: scheduleData.asset.assetNumber || '',
          category: '',
        });
      }

      if (scheduleData.parts) {
        try {
          const parsedParts = JSON.parse(scheduleData.parts);
          setParts(parsedParts.map((p: any) => ({
            name: p.name || '',
            quantity: String(p.quantity || ''),
            estimatedCost: String(p.estimatedCost || p.price || '')
          })));
        } catch (e) {
          console.error('Failed to parse parts:', e);
          setParts([]);
        }
      }

      setSelectedSchedule(null); // Not editing, but cloning
      setShowAddModal(true);
    } catch (error) {
      console.error('Failed to clone PM schedule:', error);
      alert('Failed to clone PM schedule');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Preventive Maintenance</h1>
          <p className="text-gray-600 mt-1">Scheduled maintenance & PM compliance</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToCSV}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
          >
            📊 Export CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            + New PM Schedule
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total PM Schedules</div>
          <div className="text-2xl font-bold text-gray-900">24</div>
          <div className="text-xs text-green-600 mt-1">↑ 3 this month</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Due This Week</div>
          <div className="text-2xl font-bold text-yellow-600">8</div>
          <div className="text-xs text-gray-500 mt-1">2 overdue</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Compliance Rate</div>
          <div className="text-2xl font-bold text-green-600">94%</div>
          <div className="text-xs text-green-600 mt-1">↑ 2% vs last month</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Auto-Generated WOs</div>
          <div className="text-2xl font-bold text-blue-600">156</div>
          <div className="text-xs text-gray-500 mt-1">Last 30 days</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: 'schedules', name: 'PM Schedules', icon: '📋' },
              { id: 'calendar', name: 'Calendar View', icon: '📅' },
              { id: 'compliance', name: 'Compliance', icon: '✓' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* PM Schedules Tab */}
        {activeTab === 'schedules' && (
          <div className="p-6">
            {/* Search and Filters */}
            <div className="mb-6 flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="🔍 Search by title, asset, or technician..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="all">All Statuses</option>
                  <option value="On Track">On Track</option>
                  <option value="Due Soon">Due Soon</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
              <div>
                <select
                  value={frequencyFilter}
                  onChange={(e) => setFrequencyFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="all">All Frequencies</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Semi-Annually">Semi-Annually</option>
                  <option value="Annually">Annually</option>
                </select>
              </div>
              {(searchQuery || statusFilter !== 'all' || frequencyFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setFrequencyFilter('all');
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              )}
            </div>

            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredSchedules.length} of {schedules.length} schedules
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      PM Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Asset
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Frequency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Last Completed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Next Due
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSchedules.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          <div className="text-4xl mb-2">📋</div>
                          <div className="text-lg font-medium">No PM schedules found</div>
                          <div className="text-sm">
                            {searchQuery || statusFilter !== 'all' || frequencyFilter !== 'all'
                              ? 'Try adjusting your filters'
                              : 'Create your first PM schedule to get started'}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredSchedules.map((schedule) => (
                    <tr key={schedule.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{schedule.title}</div>
                        <div className="text-xs text-gray-500">{schedule.estimatedDuration}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{schedule.assetName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{schedule.frequency}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {new Date(schedule.lastCompleted).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {new Date(schedule.nextDue).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(schedule.status)}`}>
                          {schedule.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{schedule.assignedTo}</span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={async () => {
                            if (confirm(`Mark "${schedule.title}" as completed? This will reschedule the next PM based on the frequency.`)) {
                              try {
                                const result = await api.completePMSchedule(schedule.id) as any;
                                alert(`PM completed! Rescheduled from ${new Date(result.oldNextDue).toLocaleDateString()} to ${new Date(result.newNextDue).toLocaleDateString()}`);
                                await fetchPMSchedules();
                              } catch (err: any) {
                                alert(err.message || 'Failed to complete PM');
                              }
                            }
                          }}
                          className="text-purple-600 hover:text-purple-800 mr-3 font-semibold"
                          title="Mark PM as Complete and Auto-Reschedule"
                        >
                          ✓ Complete
                        </button>
                        <button
                          onClick={async () => {
                            if (!user?.id) {
                              alert('User not authenticated');
                              return;
                            }
                            try {
                              const result = await api.generateWorkOrderFromPMSchedule(schedule.id, user.id);
                              alert(`Work Order ${(result as any).workOrderNumber} generated successfully!`);
                              await fetchPMSchedules();
                            } catch (err: any) {
                              alert(err.message || 'Failed to generate work order');
                            }
                          }}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                          title="Generate Work Order"
                        >
                          Generate WO
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSchedule(schedule);
                            setShowAddModal(true);
                          }}
                          className="text-gray-600 hover:text-gray-800 mr-3"
                          title="Edit PM Schedule"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => clonePMSchedule(schedule)}
                          className="text-green-600 hover:text-green-800 mr-3"
                          title="Clone PM Schedule"
                        >
                          Clone
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Are you sure you want to delete "${schedule.title}"?`)) {
                              try {
                                await api.deletePMSchedule(schedule.id);
                                await fetchPMSchedules();
                              } catch (err) {
                                alert('Failed to delete PM schedule');
                              }
                            }
                          }}
                          className="text-red-600 hover:text-red-800"
                          title="Delete PM Schedule"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Calendar View Tab */}
        {activeTab === 'calendar' && (
          <div className="p-6">
            {/* Filter Buttons */}
            <div className="mb-6 flex flex-wrap gap-3 items-center">
              <button
                onClick={() => setCalendarFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  calendarFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🔵 All PMs ({schedules.length})
              </button>
              <button
                onClick={() => setCalendarFilter('my-assigned')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  calendarFilter === 'my-assigned'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                👤 My Assigned PMs ({schedules.filter(s => s.assignedToId === user?.id).length})
              </button>
              <button
                onClick={() => setCalendarFilter('unassigned')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  calendarFilter === 'unassigned'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📋 Unassigned PMs ({schedules.filter(s => !s.assignedToId || s.assignedTo === 'Unassigned').length})
              </button>
              {(user?.roleId === 'admin' || user?.roleId === 'manager') && (
                <>
                  <button
                    onClick={() => setCalendarFilter('by-technician')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      calendarFilter === 'by-technician'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    👥 By Technician
                  </button>
                  {calendarFilter === 'by-technician' && (
                    <select
                      value={selectedTechnicianFilter}
                      onChange={(e) => setSelectedTechnicianFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      <option value="">Select Technician...</option>
                      {users
                        .filter((u: any) => u.roleId === 'technician')
                        .map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.firstName} {u.lastName}
                          </option>
                        ))}
                    </select>
                  )}
                </>
              )}
            </div>

            {/* Calendar Header */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  ← Previous
                </button>
                <h3 className="text-xl font-semibold text-gray-900">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={() => navigateMonth('next')}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Next →
                </button>
              </div>
              <p className="text-center text-sm text-blue-600 font-medium mt-2">
                Showing {calendarFilteredSchedules.length} PM schedules | Click on dates with PMs to see details
              </p>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-lg shadow p-6">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-500 uppercase py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar dates */}
              <div className="grid grid-cols-7 gap-2">
                {(() => {
                  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
                  const days = [];

                  // Empty cells for days before the first day of the month
                  for (let i = 0; i < startingDayOfWeek; i++) {
                    days.push(<div key={`empty-${i}`} className="aspect-square p-2"></div>);
                  }

                  // Actual days of the month
                  for (let day = 1; day <= daysInMonth; day++) {
                    const dateString = formatDateForComparison(year, month, day);
                    const pmsForDate = getPMsForDate(dateString);
                    const isToday = dateString === new Date().toISOString().split('T')[0];
                    const hasPMs = pmsForDate.length > 0;

                    days.push(
                      <div
                        key={day}
                        onClick={() => handleDateClick(dateString)}
                        className={`aspect-square p-2 border rounded-lg transition ${
                          isToday
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${hasPMs ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'}`}
                      >
                        <div className="flex flex-col h-full">
                          <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                            {day}
                          </div>
                          {hasPMs && (
                            <div className="mt-1 flex-1 flex items-center justify-center">
                              <div className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 font-semibold">
                                {pmsForDate.length} PM{pmsForDate.length > 1 ? 's' : ''}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return days;
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Date Details Modal */}
        {showDateModal && selectedDate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    PM Schedules for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {getPMsForDate(selectedDate).length} scheduled maintenance{getPMsForDate(selectedDate).length > 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => setShowDateModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <div className="p-6 space-y-4">
                {getPMsForDate(selectedDate).map((pm) => (
                  <div key={pm.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900">{pm.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">Asset: {pm.assetName}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        pm.status === 'On Track' ? 'bg-green-100 text-green-800' :
                        pm.status === 'Due Soon' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {pm.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Frequency:</span>
                        <span className="ml-2 font-medium text-gray-900">{pm.frequency}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <span className="ml-2 font-medium text-gray-900">{pm.estimatedDuration}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Assigned To:</span>
                        <span className={`ml-2 font-medium ${pm.assignedTo === 'Unassigned' ? 'text-red-600' : 'text-gray-900'}`}>
                          {pm.assignedTo}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Last Completed:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {pm.lastCompleted !== 'Never' ? new Date(pm.lastCompleted).toLocaleDateString() : 'Never'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => setShowDateModal(false)}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Summary</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">On-Time Completion</span>
                      <span className="text-sm font-semibold text-green-600">94%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Due This Month</span>
                      <span className="text-sm font-semibold text-blue-600">12/15</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Overdue</span>
                      <span className="text-sm font-semibold text-red-600">3</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: '12%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance by Asset Type</h3>
                <div className="space-y-3">
                  {[
                    { type: 'Motors', compliance: 98, total: 15 },
                    { type: 'HVAC Systems', compliance: 92, total: 8 },
                    { type: 'Pumps', compliance: 85, total: 12 },
                    { type: 'Electrical', compliance: 90, total: 10 },
                  ].map((item) => (
                    <div key={item.type} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{item.type}</div>
                        <div className="text-xs text-gray-500">{item.total} assets</div>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">{item.compliance}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add PM Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowAddModal(false)}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedSchedule ? 'Edit PM Schedule' : 'Create PM Schedule'}
                  </h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  {formError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {formError}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PM Title *
                    </label>
                    <input
                      type="text"
                      placeholder="Monthly motor inspection"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      placeholder="Detailed description of the PM tasks..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                      rows={3}
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Asset * 
                      {assets.length > 0 && (
                        <span className="text-xs text-green-600 ml-2">
                          ({assets.length} assets loaded)
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Type to search assets..."
                        value={selectedAsset ? `${selectedAsset.name} (${selectedAsset.assetNumber})` : assetSearch}
                        onChange={(e) => {
                          setAssetSearch(e.target.value);
                          setSelectedAsset(null);
                          setShowAssetDropdown(true);
                        }}
                        onFocus={() => setShowAssetDropdown(true)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                      {selectedAsset && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAsset(null);
                            setAssetSearch('');
                            setShowAssetDropdown(true);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    
                    {/* Asset Dropdown */}
                    {showAssetDropdown && !selectedAsset && (
                      <>
                        {/* Invisible overlay to close dropdown when clicking outside */}
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setShowAssetDropdown(false)}
                        />
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {assets.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500">
                              Loading assets...
                            </div>
                          ) : assets.filter(asset => 
                            assetSearch === '' ||
                            asset.name.toLowerCase().includes(assetSearch.toLowerCase()) ||
                            asset.assetNumber.toLowerCase().includes(assetSearch.toLowerCase()) ||
                            asset.category.toLowerCase().includes(assetSearch.toLowerCase())
                          ).length > 0 ? (
                            assets
                              .filter(asset => 
                                assetSearch === '' ||
                                asset.name.toLowerCase().includes(assetSearch.toLowerCase()) ||
                                asset.assetNumber.toLowerCase().includes(assetSearch.toLowerCase()) ||
                                asset.category.toLowerCase().includes(assetSearch.toLowerCase())
                              )
                              .map((asset) => (
                                <button
                                  key={asset.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedAsset(asset);
                                    setAssetSearch('');
                                    setShowAssetDropdown(false);
                                  }}
                                  className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                                  <div className="text-xs text-gray-500">
                                    {asset.assetNumber} • {asset.category}
                                  </div>
                                </button>
                              ))
                          ) : (
                            <div className="px-4 py-3 text-sm text-gray-500">
                              No assets found matching &quot;{assetSearch}&quot;
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency *
                    </label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                      required
                    >
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Semi-Annually">Semi-Annually</option>
                      <option value="Annually">Annually</option>
                      <option value="Custom">Custom Interval</option>
                    </select>
                  </div>

                  {/* Custom Frequency Input */}
                  {formData.frequency === 'Custom' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Every
                        </label>
                        <input
                          type="number"
                          min="1"
                          placeholder="30"
                          value={formData.customFrequency}
                          onChange={(e) => setFormData({ ...formData, customFrequency: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Unit
                        </label>
                        <select
                          value={formData.customFrequencyUnit}
                          onChange={(e) => setFormData({ ...formData, customFrequencyUnit: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                        >
                          <option value="days">Days</option>
                          <option value="weeks">Weeks</option>
                          <option value="months">Months</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Next Due Date *
                    </label>
                    <input
                      type="date"
                      value={formData.nextDue}
                      onChange={(e) => setFormData({ ...formData, nextDue: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assign To
                      {users.length > 0 && (
                        <span className="text-xs text-green-600 ml-2">
                          ({users.length} users loaded)
                        </span>
                      )}
                    </label>
                    <select
                      value={formData.assignedToId}
                      onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      <option value="">Select technician...</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.firstName} {u.lastName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Duration (hours)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      placeholder="2"
                      value={formData.estimatedHours}
                      onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parts Required
                      <span className="text-xs text-gray-500 font-normal ml-1">(Optional - triggers Purchase Request)</span>
                    </label>

                    {parts.map((part, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="Part name"
                          value={part.name}
                          onChange={(e) => {
                            const newParts = [...parts];
                            newParts[index].name = e.target.value;
                            setParts(newParts);
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                        <input
                          type="number"
                          placeholder="Qty"
                          value={part.quantity}
                          onChange={(e) => {
                            const newParts = [...parts];
                            newParts[index].quantity = e.target.value;
                            setParts(newParts);
                          }}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                        <div className="relative w-28">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                          <input
                            type="number"
                            placeholder="Cost"
                            value={part.estimatedCost}
                            onChange={(e) => {
                              const newParts = [...parts];
                              newParts[index].estimatedCost = e.target.value;
                              setParts(newParts);
                            }}
                            className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setParts(parts.filter((_, i) => i !== index))}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => setParts([...parts, { name: '', quantity: '', estimatedCost: '' }])}
                      className="mt-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition border border-blue-200"
                    >
                      + Add Part
                    </button>

                    {parts.length > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        A Purchase Request will be automatically created for these parts.
                      </p>
                    )}
                  </div>
                </form>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? (selectedSchedule ? 'Updating...' : 'Creating...')
                    : (selectedSchedule ? 'Update Schedule' : 'Create Schedule')
                  }
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition mt-3 sm:mt-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
