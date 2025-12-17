const { query } = require('../config/db');

class StaffScheduleModel {
  // Create staff schedule
  async createStaffSchedule(scheduleData) {
    const { 
      staff_id, 
      clinic_id, 
      room_id, 
      shift_date, 
      start_time, 
      end_time, 
      status = 'Active' 
    } = scheduleData;

    const sql = `
      INSERT INTO staff_schedules 
      (staff_id, clinic_id, room_id, shift_date, start_time, end_time, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [
      staff_id, 
      clinic_id, 
      room_id, 
      shift_date, 
      start_time, 
      end_time, 
      status
    ]);
    return result.insertId;
  }

  // Get staff schedules
  async getStaffSchedules(filters = {}) {
    const { 
      staff_id, 
      clinic_id, 
      start_date, 
      end_date, 
      status 
    } = filters;

    let sql = `
      SELECT ss.schedule_id, ss.staff_id, 
             CONCAT(s.first_name, ' ', s.last_name) as staff_name, 
             ss.clinic_id, c.clinic_name, ss.room_id, 
             wa.room_name, ss.shift_date, 
             ss.start_time, ss.end_time, ss.status
      FROM staff_schedules ss
      JOIN staff s ON ss.staff_id = s.staff_id
      JOIN clinics c ON ss.clinic_id = c.clinic_id
      LEFT JOIN work_areas wa ON ss.room_id = wa.room_id
      WHERE 1=1
    `;
    const params = [];

    if (staff_id) {
      sql += ' AND ss.staff_id = ?';
      params.push(staff_id);
    }
    if (clinic_id) {
      sql += ' AND ss.clinic_id = ?';
      params.push(clinic_id);
    }
    if (start_date) {
      sql += ' AND ss.shift_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      sql += ' AND ss.shift_date <= ?';
      params.push(end_date);
    }
    if (status) {
      sql += ' AND ss.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY ss.shift_date, ss.start_time';
    return await query(sql, params);
  }

  // Update staff schedule
  async updateStaffSchedule(scheduleId, scheduleData) {
    const { 
      clinic_id, 
      room_id, 
      shift_date, 
      start_time, 
      end_time, 
      status 
    } = scheduleData;

    const sql = `
      UPDATE staff_schedules 
      SET clinic_id = ?, 
          room_id = ?, 
          shift_date = ?, 
          start_time = ?, 
          end_time = ?, 
          status = ? 
      WHERE schedule_id = ?
    `;
    await query(sql, [
      clinic_id, 
      room_id, 
      shift_date, 
      start_time, 
      end_time, 
      status, 
      scheduleId
    ]);
    return this.getScheduleById(scheduleId);
  }

  // Get schedule by ID
  async getScheduleById(scheduleId) {
    const sql = `
      SELECT * 
      FROM staff_schedules 
      WHERE schedule_id = ?
    `;
    const [schedule] = await query(sql, [scheduleId]);
    return schedule;
  }

  // Check for scheduling conflicts
  async checkScheduleConflicts(scheduleData) {
    const { 
      staff_id, 
      shift_date, 
      start_time, 
      end_time 
    } = scheduleData;

    const sql = `
      SELECT * 
      FROM staff_schedules 
      WHERE staff_id = ? 
        AND shift_date = ? 
        AND status = 'Active'
        AND (
          (start_time <= ? AND end_time >= ?) OR
          (start_time <= ? AND end_time >= ?) OR
          (start_time >= ? AND end_time <= ?)
        )
    `;
    const conflicts = await query(sql, [
      staff_id, 
      shift_date, 
      start_time, end_time,
      start_time, end_time,
      start_time, end_time
    ]);

    return conflicts.length > 0;
  }

  // Bulk create schedules with conflict checking
  async bulkCreateSchedules(schedules) {
    const { transaction } = require('../config/db');
    const queries = [];
    
    // First, check for conflicts
    for (const schedule of schedules) {
      const hasConflict = await this.checkScheduleConflicts(schedule);
      if (hasConflict) {
        throw new Error(`Schedule conflict for staff ${schedule.staff_id} on ${schedule.shift_date}`);
      }
    }

    // If no conflicts, proceed with creating schedules
    for (const schedule of schedules) {
      queries.push({
        sql: `
          INSERT INTO staff_schedules 
          (staff_id, clinic_id, room_id, shift_date, start_time, end_time, status) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        params: [
          schedule.staff_id,
          schedule.clinic_id,
          schedule.room_id || null,
          schedule.shift_date,
          schedule.start_time,
          schedule.end_time,
          schedule.status || 'Active'
        ]
      });
    }

    return await transaction(queries);
  }

  // Delete schedule
  async deleteSchedule(scheduleId) {
    const sql = 'DELETE FROM staff_schedules WHERE schedule_id = ?';
    await query(sql, [scheduleId]);
  }

  // Update schedule status
  async updateScheduleStatus(scheduleId, status) {
    const sql = 'UPDATE staff_schedules SET status = ? WHERE schedule_id = ?';
    await query(sql, [status, scheduleId]);
    return this.getScheduleById(scheduleId);
  }

  // Get schedules by date
  async getSchedulesByDate(date) {
    const sql = `
      SELECT ss.*, 
             CONCAT(s.first_name, ' ', s.last_name) as staff_name,
             c.clinic_name,
             wa.room_name
      FROM staff_schedules ss
      JOIN staff s ON ss.staff_id = s.staff_id
      JOIN clinics c ON ss.clinic_id = c.clinic_id
      LEFT JOIN work_areas wa ON ss.room_id = wa.room_id
      WHERE ss.shift_date = ?
      ORDER BY ss.start_time
    `;
    return await query(sql, [date]);
  }

  // Get staff availability
  async getStaffAvailability(staffId, startDate, endDate) {
    const sql = `
      SELECT shift_date, start_time, end_time, status
      FROM staff_schedules
      WHERE staff_id = ?
        AND shift_date BETWEEN ? AND ?
        AND status = 'Active'
      ORDER BY shift_date, start_time
    `;
    return await query(sql, [staffId, startDate, endDate]);
  }

  // Get detailed conflicts with messages
  async getDetailedConflicts(scheduleData) {
    const { 
      staff_id, 
      shift_date, 
      start_time, 
      end_time 
    } = scheduleData;

    const sql = `
      SELECT ss.*, 
             CONCAT(s.first_name, ' ', s.last_name) as staff_name,
             c.clinic_name
      FROM staff_schedules ss
      JOIN staff s ON ss.staff_id = s.staff_id
      JOIN clinics c ON ss.clinic_id = c.clinic_id
      WHERE ss.staff_id = ? 
        AND ss.shift_date = ? 
        AND ss.status = 'Active'
        AND (
          (ss.start_time <= ? AND ss.end_time >= ?) OR
          (ss.start_time <= ? AND ss.end_time >= ?) OR
          (ss.start_time >= ? AND ss.end_time <= ?)
        )
    `;
    
    const conflicts = await query(sql, [
      staff_id, 
      shift_date, 
      start_time, end_time,
      start_time, end_time,
      start_time, end_time
    ]);

    return conflicts.map(conflict => ({
      ...conflict,
      message: `${conflict.staff_name} already scheduled at ${conflict.clinic_name} from ${conflict.start_time} to ${conflict.end_time}`
    }));
  }
}

module.exports = new StaffScheduleModel();