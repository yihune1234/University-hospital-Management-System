



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

  // Reassign room (for nurses)
  async reassignRoom(req, res) {
    const { appointmentId } = req.params;
    const { room_id, reason } = req.body;

    if (!room_id) {
      throw new AppError('Room ID is required', 400);
    }

    // Get appointment details
    const appointment = await AppointmentModel.getAppointmentById(appointmentId);
    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    const oldRoomId = appointment.room_id;

    // Update room
    await AppointmentModel.updateAppointmentRoom(appointmentId, room_id);

    // Create notification for doctor and assigned staff
    const NotificationModel = require('../models/notification.model');
    
    const notificationMessage = `Room changed for appointment #${appointmentId}. ${reason || 'No reason provided'}`;
    
    // Notify doctor
    if (appointment.staff_id) {
      await NotificationModel.createNotification({
        user_id: appointment.staff_id,
        type: 'room_change',
        title: 'Room Reassignment',
        message: notificationMessage,
        related_id: appointmentId,
        related_type: 'appointment'
      });
    }

    // Notify nurse who made the change
    if (req.user && req.user.userId) {
      await NotificationModel.createNotification({
        user_id: req.user.userId,
        type: 'room_change',
        title: 'Room Reassignment Confirmed',
        message: `You reassigned appointment #${appointmentId} to a new room.`,
        related_id: appointmentId,
        related_type: 'appointment'
      });
    }

    res.json({
      success: true,
      message: 'Room reassigned successfully',
      appointment_id: appointmentId,
      old_room_id: oldRoomId,
      new_room_id: room_id
    });
  }

  // Reassign doctor (for nurses)
  async reassignDoctor(req, res) {
    const { appointmentId } = req.params;
    const { staff_id, reason } = req.body;

    if (!staff_id) {
      throw new AppError('Staff ID is required', 400);
    }

    // Get appointment details
    const appointment = await AppointmentModel.getAppointmentById(appointmentId);
    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    const oldStaffId = appointment.staff_id;

    // Update doctor/staff
    await AppointmentModel.updateAppointmentDoctor(appointmentId, staff_id);

    // Create notifications
    const NotificationModel = require('../models/notification.model');
    
    const notificationMessage = `Doctor/Staff reassigned for appointment #${appointmentId}. ${reason || 'No reason provided'}`;
    
    // Notify new doctor
    await NotificationModel.createNotification({
      user_id: staff_id,
      type: 'doctor_reassignment',
      title: 'New Patient Assigned',
      message: `You have been assigned to appointment #${appointmentId}.`,
      related_id: appointmentId,
      related_type: 'appointment'
    });

    // Notify old doctor if exists
    if (oldStaffId) {
      await NotificationModel.createNotification({
        user_id: oldStaffId,
        type: 'doctor_reassignment',
        title: 'Patient Reassigned',
        message: notificationMessage,
        related_id: appointmentId,
        related_type: 'appointment'
      });
    }

    // Notify nurse who made the change
    if (req.user && req.user.userId) {
      await NotificationModel.createNotification({
        user_id: req.user.userId,
        type: 'doctor_reassignment',
        title: 'Doctor Reassignment Confirmed',
        message: `You reassigned appointment #${appointmentId} to a new doctor.`,
        related_id: appointmentId,
        related_type: 'appointment'
      });
    }

    res.json({
      success: true,
      message: 'Doctor reassigned successfully',
      appointment_id: appointmentId,
      old_staff_id: oldStaffId,
      new_staff_id: staff_id
    });
  }

  // Get current queue for clinic
  async getCurrentQueue(req, res) {
    const { clinicId } = req.params;
    const { date } = req.query;

    const queue = await AppointmentModel.getCurrentQueue(clinicId, date);
    const stats = await AppointmentModel.getQueueStatistics(clinicId, date);

    res.json({
      queue,
      statistics: stats
    });
  }

  // Update queue status
  async updateQueueStatus(req, res) {
    const { queueId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['Waiting', 'In-Service', 'Completed'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid queue status', 400);
    }

    const updatedQueue = await AppointmentModel.updateQueueStatus(queueId, status);
    res.json(updatedQueue);
  }

  // Call next patient in queue
  async callNextPatient(req, res) {
    const { clinicId } = req.params;

    const nextPatient = await AppointmentModel.callNextPatient(clinicId);
    
    if (!nextPatient) {
      return res.json({
        message: 'No patients waiting in queue',
        patient: null
      });
    }

    res.json({
      message: 'Next patient called',
      patient: nextPatient
    });
  }

  // Add patient to queue (walk-in or manual)
  async addToQueue(req, res) {
    const { appointment_id, clinic_id } = req.body;

    if (!appointment_id || !clinic_id) {
      throw new AppError('appointment_id and clinic_id are required', 400);
    }

    const queueId = await AppointmentModel.addToQueue({ appointment_id, clinic_id });
    
    res.status(201).json({
      message: 'Patient added to queue',
      queue_id: queueId
    });
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
}

module.exports = new AppointmentController();