const RoomModel = require('../models/room.model');
const { AppError } = require('../middleware/error.middleware');

class RoomController {
  async getAllRooms(req, res) {
    const rooms = await RoomModel.getAllRooms();
    res.json(rooms);
  }

  async getRoomById(req, res) {
    const { roomId } = req.params;
    const room = await RoomModel.getRoomById(roomId);

    if (!room) {
      throw new AppError('Room not found', 404);
    }

    res.json(room);
  }

  async getRoomsByClinic(req, res) {
    const { clinicId } = req.params;
    const rooms = await RoomModel.getRoomsByClinic(clinicId);
    res.json(rooms);
  }

  async createRoom(req, res) {
    const { clinic_id, room_name, room_type, capacity, status } = req.body;

    // Validate required fields
    if (!clinic_id || !room_name || !room_type) {
      throw new AppError('Missing required fields: clinic_id, room_name, room_type', 400);
    }

    // Validate room type
    const validTypes = ['Consultation', 'Emergency', 'Vitals', 'Lab', 'Other'];
    if (!validTypes.includes(room_type)) {
      throw new AppError(`Invalid room type. Must be one of: ${validTypes.join(', ')}`, 400);
    }

    // Create room
    const roomId = await RoomModel.createRoom({
      clinic_id,
      room_name,
      room_type,
      capacity: capacity || 1,
      status: status || 'Available'
    });

    res.status(201).json({
      message: 'Room created successfully',
      room_id: roomId
    });
  }

  async updateRoom(req, res) {
    const { roomId } = req.params;
    const { room_name, room_type, capacity, status } = req.body;

    // Check if room exists
    const existing = await RoomModel.getRoomById(roomId);
    if (!existing) {
      throw new AppError('Room not found', 404);
    }

    // Validate room type if provided
    if (room_type) {
      const validTypes = ['Consultation', 'Emergency', 'Vitals', 'Lab', 'Other'];
      if (!validTypes.includes(room_type)) {
        throw new AppError(`Invalid room type. Must be one of: ${validTypes.join(', ')}`, 400);
      }
    }

    // Update room
    await RoomModel.updateRoom(roomId, {
      room_name,
      room_type,
      capacity,
      status
    });

    res.json({ message: 'Room updated successfully' });
  }

  async updateRoomStatus(req, res) {
    const { roomId } = req.params;
    const { status } = req.body;

    if (!status) {
      throw new AppError('Status is required', 400);
    }

    await RoomModel.updateRoomStatus(roomId, status);
    res.json({ message: 'Room status updated successfully' });
  }

  async deleteRoom(req, res) {
    const { roomId } = req.params;

    // Check if room exists
    const existing = await RoomModel.getRoomById(roomId);
    if (!existing) {
      throw new AppError('Room not found', 404);
    }

    await RoomModel.deleteRoom(roomId);
    res.json({ message: 'Room deleted successfully' });
  }

  async searchRooms(req, res) {
    const { search } = req.query;
    const rooms = await RoomModel.searchRooms(search);
    res.json(rooms);
  }

  async getRoomStatistics(req, res) {
    const stats = await RoomModel.getRoomStatistics();
    res.json(stats);
  }

  async getAvailableRooms(req, res) {
    const { clinicId } = req.params;
    const rooms = await RoomModel.getAvailableRooms(clinicId);
    res.json(rooms);
  }
}

module.exports = new RoomController();
