const CampusModel = require('../models/campus.model');
const ClinicModel = require('../models/clinic.model');
const { AppError } = require('../middleware/error.middleware.js');

class CampusController {
  // Create a new campus
  async createCampus(req, res) {
    const { campus_name, location, status } = req.body;

    // Validate input
    if (!campus_name || !location) {
      throw new AppError('Campus name and location are required', 400);
    }

    const campusId = await CampusModel.createCampus({ 
      campus_name, 
      location, 
      status 
    });

    const campus = await CampusModel.getCampusById(campusId);
    res.status(201).json(campus);
  }

  // Get all campuses
  async getAllCampuses(req, res) {
    const campuses = await CampusModel.getAllCampuses();
    res.json(campuses);
  }

  // Get campus by ID
  async getCampusById(req, res) {
    const { campusId } = req.params;
    const campus = await CampusModel.getCampusById(campusId);

    if (!campus) {
      throw new AppError('Campus not found', 404);
    }

    res.json(campus);
  }

  // Update campus
  async updateCampus(req, res) {
    const { campusId } = req.params;
    const { campus_name, location, status } = req.body;

    // Validate input
    if (!campus_name || !location) {
      throw new AppError('Campus name and location are required', 400);
    }

    const updatedCampus = await CampusModel.updateCampus(campusId, { 
      campus_name, 
      location, 
      status 
    });

    res.json(updatedCampus);
  }
}

class ClinicController {
  // Create a new clinic
  async createClinic(req, res) {
    const { 
      campus_id, 
      clinic_name, 
      clinic_type, 
      open_time, 
      close_time, 
      status 
    } = req.body;

    // Validate input
    if (!campus_id || !clinic_name || !clinic_type || !open_time || !close_time) {
      throw new AppError('All clinic details are required', 400);
    }

    const clinicId = await ClinicModel.createClinic({ 
      campus_id, 
      clinic_name, 
      clinic_type, 
      open_time, 
      close_time, 
      status 
    });

    const clinic = await ClinicModel.getClinicById(clinicId);
    res.status(201).json(clinic);
  }

  // Get clinics by campus
  async getClinicsByCampus(req, res) {
    const { campusId } = req.params;
    const clinics = await ClinicModel.getClinicsByCampus(campusId);
    res.json(clinics);
  }

  // Update clinic
  async updateClinic(req, res) {
    const { clinicId } = req.params;
    const { 
      campus_id, 
      clinic_name, 
      clinic_type, 
      open_time, 
      close_time, 
      status 
    } = req.body;

    // Validate input
    if (!campus_id || !clinic_name || !clinic_type || !open_time || !close_time) {
      throw new AppError('All clinic details are required', 400);
    }

    const updatedClinic = await ClinicModel.updateClinic(clinicId, { 
      campus_id, 
      clinic_name, 
      clinic_type, 
      open_time, 
      close_time, 
      status 
    });

    res.json(updatedClinic);
  }

  // Activate/Deactivate clinic
  async toggleClinicStatus(req, res) {
    const { clinicId } = req.params;
    const { status } = req.body;

    // Validate input
    if (!status || !['Active', 'Inactive'].includes(status)) {
      throw new AppError('Invalid status. Must be Active or Inactive', 400);
    }

    const updatedClinic = await ClinicModel.toggleClinicStatus(clinicId, status);
    res.json(updatedClinic);
  }
}

class StaffScheduleController {
  // Create staff schedule
  async createStaffSchedule(req, res) {
    const { 
      staff_id, 
      clinic_id, 
      room_id, 
      shift_date, 
      start_time, 
      end_time, 
      status 
    } = req.body;

    // Validate input
    if (!staff_id || !clinic_id || !shift_date || !start_time || !end_time) {
      throw new AppError('All schedule details are required', 400);
    }

    const StaffScheduleModel = require('../models/staff_schedule.model');
    const scheduleId = await StaffScheduleModel.createStaffSchedule({ 
      staff_id, 
      clinic_id, 
      room_id, 
      shift_date, 
      start_time, 
      end_time, 
      status 
    });

    const schedule = await StaffScheduleModel.getScheduleById(scheduleId);
    res.status(201).json(schedule);
  }

  // Get staff schedules
  async getStaffSchedules(req, res) {
    const { 
      staff_id, 
      clinic_id, 
      start_date, 
      end_date, 
      status 
    } = req.query;

    const StaffScheduleModel = require('../models/staff_schedule.model');
    const schedules = await StaffScheduleModel.getStaffSchedules({
      staff_id, 
      clinic_id, 
      start_date, 
      end_date, 
      status
    });

    res.json(schedules);
  }

  // Bulk create schedules
  async bulkCreateSchedules(req, res) {
    const schedules = req.body;

    // Validate input
    if (!Array.isArray(schedules) || schedules.length === 0) {
      throw new AppError('Invalid schedules data', 400);
    }

    const StaffScheduleModel = require('../models/staff_schedule.model');
    const createdSchedules = await StaffScheduleModel.bulkCreateSchedules(schedules);
    res.status(201).json({ 
      message: 'Schedules created successfully',
      created: createdSchedules.length 
    });
  }

  // Update schedule
  async updateSchedule(req, res) {
    const { scheduleId } = req.params;
    const scheduleData = req.body;

    const StaffScheduleModel = require('../models/staff_schedule.model');
    const schedule = await StaffScheduleModel.updateStaffSchedule(scheduleId, scheduleData);
    res.json(schedule);
  }

  // Delete schedule
  async deleteSchedule(req, res) {
    const { scheduleId } = req.params;

    const StaffScheduleModel = require('../models/staff_schedule.model');
    await StaffScheduleModel.deleteSchedule(scheduleId);
    res.json({ message: 'Schedule deleted successfully' });
  }

  // Update schedule status
  async updateScheduleStatus(req, res) {
    const { scheduleId } = req.params;
    const { status } = req.body;

    const StaffScheduleModel = require('../models/staff_schedule.model');
    const schedule = await StaffScheduleModel.updateScheduleStatus(scheduleId, status);
    res.json(schedule);
  }

  // Check conflicts
  async checkConflicts(req, res) {
    const scheduleData = req.body;

    const StaffScheduleModel = require('../models/staff_schedule.model');
    const conflicts = await StaffScheduleModel.getDetailedConflicts(scheduleData);
    res.json({ conflicts });
  }
}

module.exports = {
  CampusController: new CampusController(),
  ClinicController: new ClinicController(),
  StaffScheduleController: new StaffScheduleController()
};