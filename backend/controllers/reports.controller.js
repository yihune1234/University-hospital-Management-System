const ReportsModel = require('../models/reports.model');

// Helper function to get date format based on groupBy parameter
const getDateFormat = (groupBy) => {
  switch (groupBy) {
    case 'month': return '%Y-%m';
    case 'year': return '%Y';
    default: return '%Y-%m-%d';
  }
};

// Helper function to get default date range
const getDefaultDateRange = (days = 30) => {
  const endDate = new Date();
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return { startDate, endDate };
};

// Patient Reports
exports.getPatientOverview = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dates = startDate && endDate 
      ? { startDate, endDate }
      : getDefaultDateRange(30);
    
    const data = await ReportsModel.getPatientOverview(dates.startDate, dates.endDate);
    res.json(data);
  } catch (error) {
    console.error('Error fetching patient overview:', error);
    res.status(500).json({ message: 'Error fetching patient overview' });
  }
};

exports.getPatientDemographics = async (req, res) => {
  try {
    const data = await ReportsModel.getPatientDemographics();
    res.json(data);
  } catch (error) {
    console.error('Error fetching demographics:', error);
    res.status(500).json({ message: 'Error fetching demographics' });
  }
};

exports.getPatientRegistrations = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    const dates = startDate && endDate 
      ? { startDate, endDate }
      : getDefaultDateRange(90);
    
    const dateFormat = getDateFormat(groupBy);
    const data = await ReportsModel.getPatientRegistrations(
      dates.startDate, 
      dates.endDate, 
      dateFormat
    );
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ message: 'Error fetching registrations' });
  }
};

exports.getPatientVisits = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dates = startDate && endDate 
      ? { startDate, endDate }
      : getDefaultDateRange(90);
    
    const data = await ReportsModel.getPatientVisits(dates.startDate, dates.endDate);
    res.json(data);
  } catch (error) {
    console.error('Error fetching visits:', error);
    res.status(500).json({ message: 'Error fetching visits' });
  }
};

// Financial Reports
exports.getFinancialOverview = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dates = startDate && endDate 
      ? { startDate, endDate }
      : getDefaultDateRange(30);
    
    const data = await ReportsModel.getFinancialOverview(dates.startDate, dates.endDate);
    res.json(data);
  } catch (error) {
    console.error('Error fetching financial overview:', error);
    res.status(500).json({ message: 'Error fetching financial overview' });
  }
};

exports.getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    const dates = startDate && endDate 
      ? { startDate, endDate }
      : getDefaultDateRange(90);
    
    const dateFormat = getDateFormat(groupBy);
    const data = await ReportsModel.getRevenueReport(
      dates.startDate, 
      dates.endDate, 
      dateFormat
    );
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching revenue report:', error);
    res.status(500).json({ message: 'Error fetching revenue report' });
  }
};

exports.getPaymentReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dates = startDate && endDate 
      ? { startDate, endDate }
      : getDefaultDateRange(30);
    
    const data = await ReportsModel.getPaymentReport(dates.startDate, dates.endDate);
    res.json(data);
  } catch (error) {
    console.error('Error fetching payment report:', error);
    res.status(500).json({ message: 'Error fetching payment report' });
  }
};

exports.getOutstandingBills = async (req, res) => {
  try {
    const data = await ReportsModel.getOutstandingBills();
    res.json(data);
  } catch (error) {
    console.error('Error fetching outstanding bills:', error);
    res.status(500).json({ message: 'Error fetching outstanding bills' });
  }
};

// Appointment Reports
exports.getAppointmentOverview = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dates = startDate && endDate 
      ? { startDate, endDate }
      : getDefaultDateRange(30);
    
    const data = await ReportsModel.getAppointmentOverview(dates.startDate, dates.endDate);
    res.json(data);
  } catch (error) {
    console.error('Error fetching appointment overview:', error);
    res.status(500).json({ message: 'Error fetching appointment overview' });
  }
};

exports.getAppointmentTrends = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    const dates = startDate && endDate 
      ? { startDate, endDate }
      : getDefaultDateRange(90);
    
    const dateFormat = getDateFormat(groupBy);
    const data = await ReportsModel.getAppointmentTrends(
      dates.startDate, 
      dates.endDate, 
      dateFormat
    );
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching appointment trends:', error);
    res.status(500).json({ message: 'Error fetching appointment trends' });
  }
};

exports.getNoShowReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dates = startDate && endDate 
      ? { startDate, endDate }
      : getDefaultDateRange(90);
    
    const data = await ReportsModel.getNoShowReport(dates.startDate, dates.endDate);
    res.json(data);
  } catch (error) {
    console.error('Error fetching no-show report:', error);
    res.status(500).json({ message: 'Error fetching no-show report' });
  }
};

exports.getWaitTimeReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dates = startDate && endDate 
      ? { startDate, endDate }
      : getDefaultDateRange(30);
    
    const data = await ReportsModel.getWaitTimeReport(dates.startDate, dates.endDate);
    res.json(data);
  } catch (error) {
    console.error('Error fetching wait time report:', error);
    res.status(500).json({ message: 'Error fetching wait time report' });
  }
};

// Staff Reports
exports.getStaffPerformance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dates = startDate && endDate 
      ? { startDate, endDate }
      : getDefaultDateRange(30);
    
    const data = await ReportsModel.getStaffPerformance(dates.startDate, dates.endDate);
    res.json(data);
  } catch (error) {
    console.error('Error fetching staff performance:', error);
    res.status(500).json({ message: 'Error fetching staff performance' });
  }
};

exports.getStaffUtilization = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dates = startDate && endDate 
      ? { startDate, endDate }
      : getDefaultDateRange(30);
    
    const data = await ReportsModel.getStaffUtilization(dates.startDate, dates.endDate);
    res.json(data);
  } catch (error) {
    console.error('Error fetching staff utilization:', error);
    res.status(500).json({ message: 'Error fetching staff utilization' });
  }
};

exports.getScheduleReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dates = startDate && endDate 
      ? { startDate: startDate || new Date(), endDate: endDate || new Date(Date.now() + 30*24*60*60*1000) }
      : { startDate: new Date(), endDate: new Date(Date.now() + 30*24*60*60*1000) };
    
    const data = await ReportsModel.getScheduleReport(dates.startDate, dates.endDate);
    res.json(data);
  } catch (error) {
    console.error('Error fetching schedule report:', error);
    res.status(500).json({ message: 'Error fetching schedule report' });
  }
};

// Clinic Reports
exports.getClinicUtilization = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dates = startDate && endDate 
      ? { startDate, endDate }
      : getDefaultDateRange(30);
    
    const data = await ReportsModel.getClinicUtilization(dates.startDate, dates.endDate);
    res.json(data);
  } catch (error) {
    console.error('Error fetching clinic utilization:', error);
    res.status(500).json({ message: 'Error fetching clinic utilization' });
  }
};

exports.getClinicPerformance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dates = startDate && endDate 
      ? { startDate, endDate }
      : getDefaultDateRange(30);
    
    const data = await ReportsModel.getClinicPerformance(dates.startDate, dates.endDate);
    res.json(data);
  } catch (error) {
    console.error('Error fetching clinic performance:', error);
    res.status(500).json({ message: 'Error fetching clinic performance' });
  }
};

// Lab Reports
exports.getLabOverview = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dates = startDate && endDate 
      ? { startDate, endDate }
      : getDefaultDateRange(30);
    
    const data = await ReportsModel.getLabOverview(dates.startDate, dates.endDate);
    res.json(data);
  } catch (error) {
    console.error('Error fetching lab overview:', error);
    res.status(500).json({ message: 'Error fetching lab overview' });
  }
};

exports.getLabTurnaroundTime = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dates = startDate && endDate 
      ? { startDate, endDate }
      : getDefaultDateRange(90);
    
    const data = await ReportsModel.getLabTurnaroundTime(dates.startDate, dates.endDate);
    res.json(data);
  } catch (error) {
    console.error('Error fetching lab turnaround time:', error);
    res.status(500).json({ message: 'Error fetching lab turnaround time' });
  }
};

// Pharmacy Reports
exports.getPharmacyOverview = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dates = startDate && endDate 
      ? { startDate, endDate }
      : getDefaultDateRange(30);
    
    const data = await ReportsModel.getPharmacyOverview(dates.startDate, dates.endDate);
    res.json(data);
  } catch (error) {
    console.error('Error fetching pharmacy overview:', error);
    res.status(500).json({ message: 'Error fetching pharmacy overview' });
  }
};

exports.getInventoryReport = async (req, res) => {
  try {
    const data = await ReportsModel.getInventoryReport();
    res.json(data);
  } catch (error) {
    console.error('Error fetching inventory report:', error);
    res.status(500).json({ message: 'Error fetching inventory report' });
  }
};

// Audit Logs
exports.getAuditLogs = async (req, res) => {
  try {
    const { startDate, endDate, userId, action, limit, offset } = req.query;
    const dates = startDate && endDate 
      ? { startDate, endDate }
      : getDefaultDateRange(30);
    
    const filters = {
      startDate: dates.startDate,
      endDate: dates.endDate,
      userId,
      action,
      limit: limit || 100,
      offset: offset || 0
    };
    
    const data = await ReportsModel.getAuditLogs(filters);
    res.json(data);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Error fetching audit logs' });
  }
};

exports.exportAuditLogs = async (req, res) => {
  try {
    const { startDate, endDate, userId, action } = req.query;
    const dates = startDate && endDate 
      ? { startDate, endDate }
      : getDefaultDateRange(30);
    
    const filters = {
      startDate: dates.startDate,
      endDate: dates.endDate,
      userId,
      action,
      limit: 10000,
      offset: 0
    };
    
    const data = await ReportsModel.getAuditLogs(filters);
    
    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
    
    // Create CSV content
    const headers = ['Log ID', 'User', 'Role', 'Action', 'Table', 'Record ID', 'IP Address', 'Timestamp'];
    const csvRows = [headers.join(',')];
    
    data.logs.forEach(log => {
      const row = [
        log.log_id,
        log.user_name || 'N/A',
        log.role_name || 'N/A',
        log.action,
        log.table_name,
        log.record_id || 'N/A',
        log.ip_address || 'N/A',
        log.created_at
      ];
      csvRows.push(row.join(','));
    });
    
    res.send(csvRows.join('\n'));
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    res.status(500).json({ message: 'Error exporting audit logs' });
  }
};
