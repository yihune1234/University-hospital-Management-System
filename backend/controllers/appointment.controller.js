



const AppointmentModel = require('../models/appointment.model');
const { AppError } = require('../middleware/error.middleware');
const validator = require('../utils/validator');

class AppointmentController {
  // Create a new appointment
  async createAppointment(req, res) {
    const appointmentData = req.body;

    // Validate input
const errors = validator.validateAppointment(req.body);

if (errors.length > 0) {
    return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors
    });
}

    // Check for scheduling conflicts
    const hasConflicts = await AppointmentModel.checkAppointmentConflicts(appointmentData);
    if (hasConflicts) {
      throw new AppError('Scheduling conflict detected', 409);
    }

    // Create appointment
    const appointmentId = await AppointmentModel.createAppointment(appointmentData);
    const appointment = await AppointmentModel.getAppointmentById(appointmentId);

    // Create waiting queue entry
    await AppointmentModel.createWaitingQueueEntry(appointmentId);

    res.status(201).json(appointment);
  }

  // Search appointments
  async searchAppointments(req, res) {
    const filters = req.query;

    const appointments = await AppointmentModel.searchAppointments(filters);
    res.json(appointments);
  }

  // Get appointment by ID
  async getAppointmentById(req, res) {
    const { appointmentId } = req.params;

    const appointment = await AppointmentModel.getAppointmentById(appointmentId);
    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    res.json(appointment);
  }

  // Update appointment status
  async updateAppointmentStatus(req, res) {
    const { appointmentId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['Scheduled', 'In-Progress', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid status', 400);
    }

    const updatedAppointment = await AppointmentModel.updateAppointmentStatus(
      appointmentId, 
      status
    );

    res.json(updatedAppointment);
  }

  // Cancel appointment
  async cancelAppointment(req, res) {
    const { appointmentId } = req.params;
    const { cancellationReason } = req.body;

    if (!cancellationReason) {
      throw new AppError('Cancellation reason is required', 400);
    }

    const cancelledAppointment = await AppointmentModel.cancelAppointment(
      appointmentId, 
      cancellationReason
    );

    res.json(cancelledAppointment);
  }

  // Bulk create appointments
  async bulkCreateAppointments(req, res) {
    const appointments = req.body;

    // Validate input
    if (!Array.isArray(appointments) || appointments.length === 0) {
      throw new AppError('Invalid appointments data', 400);
    }

    const validationErrors = appointments.flatMap(appointment => 
      validator.validateAppointment(appointment)
    );

    if (validationErrors.length > 0) {
      throw new AppError('Validation failed', 400, validationErrors);
    }

    const importResult = await AppointmentModel.bulkCreateAppointments(appointments);
    res.status(201).json({
      message: 'Appointments created successfully',
      importedCount: importResult.length
    });
  }

  // Get current queue for a clinic
  async getCurrentQueue(req, res) {
    const { clinicId } = req.params;

    const queue = await AppointmentModel.getCurrentQueue(clinicId);
    res.json(queue);
  }

  // Update queue status
  async updateQueueStatus(req, res) {
    const { queueId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['Waiting', 'In-Service', 'Completed', 'Skipped'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid queue status', 400);
    }

    const updatedQueue = await AppointmentModel.updateQueueStatus(queueId, status);
    res.json(updatedQueue);
  }
}

module.exports = new AppointmentController();