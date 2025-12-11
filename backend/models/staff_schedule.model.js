const { query } = require('../config/db');

class StaffScheduleModel {
  // Create staff schedule
  async createStaffSchedule(scheduleData) {
    const { 
      staff_id, 
      clinic_id, 
      work_area_id, 
      work_date, 
      shift_type, 
      start_time, 
      end_time, 
      status = 'Scheduled' 
    } = scheduleData;

    const sql = `
      INSERT INTO staff_schedules 
      (staff_id, clinic_id, work_area_id, work_date, 
       shift_type, start_time, end_time, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [
      staff_id, 
      clinic_id, 
      work_area_id, 
      work_date, 
      shift_type, 
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
      work_date_start, 
      work_date_end, 
      status 
    } = filters;

    let sql = `
      SELECT ss.schedule_id, ss.staff_id, s.first_name, s.last_name, 
             ss.clinic_id, c.clinic_name, ss.work_area_id, 
             wa.area_name, ss.work_date, ss.shift_type, 
             ss.start_time, ss.end_time, ss.status
      FROM staff_schedules ss
      JOIN staff s ON ss.staff_id = s.staff_id
      JOIN clinics c ON ss.clinic_id = c.clinic_id
      JOIN work_areas wa ON ss.work_area_id = wa.work_area_id
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
    if (work_date_start) {
      sql += ' AND ss.work_date >= ?';
      params.push(work_date_start);
    }
    if (work_date_end) {
      sql += ' AND ss.work_date <= ?';
      params.push(work_date_end);
    }
    if (status) {
      sql += ' AND ss.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY ss.work_date, ss.start_time';
    return await query(sql, params);
  }

  // Update staff schedule
  async updateStaffSchedule(scheduleId, scheduleData) {
    const { 
      clinic_id, 
      work_area_id, 
      work_date, 
      shift_type, 
      start_time, 
      end_time, 
      status 
    } = scheduleData;

    const sql = `
      UPDATE staff_schedules 
      SET clinic_id = ?, 
          work_area_id = ?, 
          work_date = ?, 
          shift_type = ?, 
          start_time = ?, 
          end_time = ?, 
          status = ? 
      WHERE schedule_id = ?
    `;
    await query(sql, [
      clinic_id, 
      work_area_id, 
      work_date, 
      shift_type, 
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
      work_date, 
      start_time, 
      end_time 
    } = scheduleData;

    const sql = `
      SELECT * 
      FROM staff_schedules 
      WHERE staff_id = ? 
        AND work_date = ? 
        AND (
          (start_time <= ? AND end_time >= ?) OR
          (start_time <= ? AND end_time >= ?) OR
          (start_time >= ? AND end_time <= ?)
        )
    `;
    const conflicts = await query(sql, [
      staff_id, 
      work_date, 
      start_time, end_time,
      start_time, end_time,
      start_time, end_time
    ]);

    return conflicts.length > 0;
  }

  // Bulk create schedules with conflict checking
  async bulkCreateSchedules(schedules) {
    const queries = [];
    
    // First, check for conflicts
    for (const schedule of schedules) {
      const hasConflict = await this.checkScheduleConflicts(schedule);
      if (hasConflict) {
        throw new Error(`Schedule conflict for staff ${schedule.staff_id} on ${schedule.work_date}`);
      }
    }

    // If no conflicts, proceed with creating schedules
    for (const schedule of schedules) {
      queries.push({
        sql: `
          INSERT INTO staff_schedules 
          (staff_id, clinic_id, work_area_id, work_date, 
           shift_type, start_time, end_time, status) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        params: [
          schedule.staff_id,
          schedule.clinic_id,
          schedule.work_area_id,
          schedule.work_date,
          schedule.shift_type,
          schedule.start_time,
          schedule.end_time,
          schedule.status || 'Scheduled'
        ]
      });
    }

    return await transaction(queries);
  }
}

module.exports = new StaffScheduleModel();