const { query } = require('../config/db');

class RoomModel {
  // Get all rooms
  async getAllRooms() {
    const sql = `
      SELECT wa.*, c.clinic_name, cp.campus_name
      FROM work_areas wa
      JOIN clinics c ON wa.clinic_id = c.clinic_id
      JOIN campuses cp ON c.campus_id = cp.campus_id
      ORDER BY wa.created_at DESC
    `;
    return await query(sql);
  }

  // Get room by ID
  async getRoomById(roomId) {
    const sql = `
      SELECT wa.*, c.clinic_name, cp.campus_name
      FROM work_areas wa
      JOIN clinics c ON wa.clinic_id = c.clinic_id
      JOIN campuses cp ON c.campus_id = cp.campus_id
      WHERE wa.room_id = ?
    `;
    const results = await query(sql, [roomId]);
    return results[0];
  }

  // Get rooms by clinic
  async getRoomsByClinic(clinicId) {
    const sql = `
      SELECT wa.*, c.clinic_name
      FROM work_areas wa
      JOIN clinics c ON wa.clinic_id = c.clinic_id
      WHERE wa.clinic_id = ?
      ORDER BY wa.room_name
    `;
    return await query(sql, [clinicId]);
  }

  // Get rooms by type
  async getRoomsByType(roomType) {
    const sql = `
      SELECT wa.*, c.clinic_name, cp.campus_name
      FROM work_areas wa
      JOIN clinics c ON wa.clinic_id = c.clinic_id
      JOIN campuses cp ON c.campus_id = cp.campus_id
      WHERE wa.room_type = ?
      ORDER BY wa.room_name
    `;
    return await query(sql, [roomType]);
  }

  // Create room
  async createRoom(roomData) {
    const {
      clinic_id,
      room_name,
      room_type,
      capacity = 1,
      status = 'Active'
    } = roomData;

    const sql = `
      INSERT INTO work_areas 
      (clinic_id, room_name, room_type, capacity, status)
      VALUES (?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      clinic_id,
      room_name,
      room_type,
      capacity,
      status
    ]);

    return result.insertId;
  }

  // Update room
  async updateRoom(roomId, roomData) {
    const {
      clinic_id,
      room_name,
      room_type,
      capacity,
      status
    } = roomData;

    const sql = `
      UPDATE work_areas 
      SET 
        clinic_id = ?,
        room_name = ?,
        room_type = ?,
        capacity = ?,
        status = ?
      WHERE room_id = ?
    `;

    await query(sql, [
      clinic_id,
      room_name,
      room_type,
      capacity,
      status,
      roomId
    ]);

    return this.getRoomById(roomId);
  }

  // Update room status
  async updateRoomStatus(roomId, status) {
    const sql = 'UPDATE work_areas SET status = ? WHERE room_id = ?';
    await query(sql, [status, roomId]);
    return this.getRoomById(roomId);
  }

  // Delete room
  async deleteRoom(roomId) {
    const sql = 'DELETE FROM work_areas WHERE room_id = ?';
    await query(sql, [roomId]);
  }

  // Check if room name exists in clinic
  async roomNameExistsInClinic(clinicId, roomName, excludeRoomId = null) {
    let sql = 'SELECT room_id FROM work_areas WHERE clinic_id = ? AND room_name = ?';
    const params = [clinicId, roomName];
    
    if (excludeRoomId) {
      sql += ' AND room_id != ?';
      params.push(excludeRoomId);
    }
    
    const results = await query(sql, params);
    return results.length > 0;
  }

  // Search rooms with filters
  async searchRooms(filters) {
    const {
      clinic_id,
      room_type,
      status,
      search_term,
      limit = 100,
      offset = 0
    } = filters;

    let sql = `
      SELECT wa.*, c.clinic_name, cp.campus_name
      FROM work_areas wa
      JOIN clinics c ON wa.clinic_id = c.clinic_id
      JOIN campuses cp ON c.campus_id = cp.campus_id
      WHERE 1=1
    `;
    const params = [];

    if (clinic_id) {
      sql += ' AND wa.clinic_id = ?';
      params.push(clinic_id);
    }

    if (room_type) {
      sql += ' AND wa.room_type = ?';
      params.push(room_type);
    }

    if (status) {
      sql += ' AND wa.status = ?';
      params.push(status);
    }

    if (search_term) {
      sql += ' AND wa.room_name LIKE ?';
      params.push(`%${search_term}%`);
    }

    sql += ' ORDER BY wa.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    return await query(sql, params);
  }

  // Get room statistics
  async getRoomStatistics() {
    const sql = `
      SELECT 
        COUNT(*) as total_rooms,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active_rooms,
        SUM(CASE WHEN status = 'Inactive' THEN 1 ELSE 0 END) as inactive_rooms,
        SUM(capacity) as total_capacity
      FROM work_areas
    `;
    const results = await query(sql);
    return results[0];
  }

  // Get room count by type
  async getRoomCountByType() {
    const sql = `
      SELECT room_type, COUNT(*) as count, SUM(capacity) as total_capacity
      FROM work_areas
      WHERE status = 'Active'
      GROUP BY room_type
      ORDER BY room_type
    `;
    return await query(sql);
  }

  // Get available rooms for scheduling
  async getAvailableRooms(clinicId, date, startTime, endTime) {
    const sql = `
      SELECT wa.*
      FROM work_areas wa
      WHERE wa.clinic_id = ?
        AND wa.status = 'Active'
        AND wa.room_id NOT IN (
          SELECT room_id
          FROM staff_schedules
          WHERE clinic_id = ?
            AND shift_date = ?
            AND status = 'Active'
            AND (
              (start_time <= ? AND end_time >= ?) OR
              (start_time <= ? AND end_time >= ?) OR
              (start_time >= ? AND end_time <= ?)
            )
        )
      ORDER BY wa.room_name
    `;
    return await query(sql, [
      clinicId,
      clinicId,
      date,
      startTime, endTime,
      startTime, endTime,
      startTime, endTime
    ]);
  }
}

module.exports = new RoomModel();
