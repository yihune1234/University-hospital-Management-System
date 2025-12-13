const { query, transaction } = require('../config/db');

class PrescriptionModel {
    // Create a new prescription
    async createPrescription(prescriptionData) {
        const { 
            patient_id, 
            doctor_id, 
            drug_id, 
            dosage, 
            frequency, 
            duration, 
            instructions 
        } = prescriptionData;

        const sql = `
            INSERT INTO prescriptions 
            (patient_id, doctor_id, drug_id, dosage, frequency, 
             duration, instructions, date_issued) 
            VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_DATE)
        `;

        try {
            const result = await query(sql, [
                patient_id,
                doctor_id,
                drug_id,
                dosage,
                frequency,
                duration,
                instructions
            ]);

            return this.getPrescriptionById(result.insertId);
        } catch (error) {
            throw error;
        }
    }

    // Get prescription by ID with full details
    async getPrescriptionById(prescriptionId) {
        const prescriptionSql = `
            SELECT p.*, 
                  concat( pat.first_name,' ',pat.middle_name,' ',pat.last_name) AS patient_name,
                   s.first_name AS doctor_first_name, 
                   s.last_name AS doctor_last_name,
                   d.drug_name
            FROM prescriptions p
            JOIN patients pat ON p.patient_id = pat.patient_id
            JOIN staff s ON p.doctor_id = s.staff_id
            JOIN pharmacy_inventory d ON p.drug_id = d.drug_id
            WHERE p.prescription_id = ?
        `;

        try {
            const [prescription] = await query(prescriptionSql, [prescriptionId]);
            return prescription;
        } catch (error) {
            throw error;
        }
    }

    // Search prescriptions
    async searchPrescriptions(filters) {
        const { 
            patient_id, 
            doctor_id, 
            start_date, 
            end_date, 
            drug_id, 
            limit = 50, 
            offset = 0 
        } = filters;

        let sql = `
            SELECT 
                p.prescription_id,
                p.patient_id,
              concat(pat.first_name,' ',pat.middle_name,' ',pat.last_name) AS patient_name,
                p.doctor_id,
                s.first_name AS doctor_first_name,
                s.last_name AS doctor_last_name,
                p.drug_id,
                d.drug_name,
                p.dosage,
                p.frequency,
                p.duration,
                p.date_issued
            FROM prescriptions p
            JOIN patients pat ON p.patient_id = pat.patient_id
            JOIN staff s ON p.doctor_id = s.staff_id
            JOIN pharmacy_inventory d ON p.drug_id = d.drug_id
            WHERE 1=1
        `;
        const params = [];

        if (patient_id) {
            sql += ' AND p.patient_id = ?';
            params.push(patient_id);
        }
        if (doctor_id) {
            sql += ' AND p.doctor_id = ?';
            params.push(doctor_id);
        }
        if (start_date) {
            sql += ' AND p.date_issued >= ?';
            params.push(start_date);
        }
        if (end_date) {
            sql += ' AND p.date_issued <= ?';
            params.push(end_date);
        }
        if (drug_id) {
            sql += ' AND p.drug_id = ?';
            params.push(drug_id);
        }

        sql += ' ORDER BY p.date_issued DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        try {
            return await query(sql, params);
        } catch (error) {
            throw error;
        }
    }

    // Calculate prescription quantity (helper method)
    calculatePrescriptionQuantity(frequency, duration) {
        // Parse frequency (e.g., "1x daily", "twice daily")
        const frequencyMap = {
            'once daily': 1,
            'twice daily': 2,
            'thrice daily': 3,
            'four times daily': 4
        };

        const timesPerDay = this.parseFrequencyString(frequency);
        return timesPerDay * duration;
    }

    // Parse frequency string
    parseFrequencyString(frequency) {
        const frequencyMap = {
            'once daily': 1, 
            'twice daily': 2, 
            'thrice daily': 3, 
            'four times daily': 4 
        };

        return frequencyMap[frequency.toLowerCase()] || 1;
    }

    // Update prescription details
    async updatePrescription(prescriptionId, updateData) {
        const { dosage, frequency, duration, instructions } = updateData;

        const sql = `
            UPDATE prescriptions 
            SET 
                dosage = ?, 
                frequency = ?, 
                duration = ?, 
                instructions = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE prescription_id = ?
        `;

        try {
            await query(sql, [
                dosage, 
                frequency, 
                duration, 
                instructions, 
                prescriptionId
            ]);

            return this.getPrescriptionById(prescriptionId);
        } catch (error) {
            throw error;
        }
    }

    // Check prescription fulfillment status
    async checkPrescriptionFulfillment(prescriptionId) {
        const sql = `
            SELECT 
                prescription_id,
                COALESCE(SUM(dispensed_quantity), 0) AS total_dispensed,
                CASE 
                    WHEN COALESCE(SUM(dispensed_quantity), 0) >= (duration * 
                        CASE 
                            WHEN frequency = 'once daily' THEN 1
                            WHEN frequency = 'twice daily' THEN 2
                            WHEN frequency = 'thrice daily' THEN 3
                            WHEN frequency = 'four times daily' THEN 4
                            ELSE 1
                        END
                    ) THEN 'Fully Dispensed'
                    WHEN COALESCE(SUM(dispensed_quantity), 0) > 0 THEN 'Partially Dispensed'
                    ELSE 'Not Dispensed'
                END AS fulfillment_status
            FROM (
                SELECT 
                    p.prescription_id,
                    p.duration,
                    p.frequency,
                    COALESCE(d.quantity, 0) AS dispensed_quantity
                FROM prescriptions p
                LEFT JOIN dispensations d ON p.prescription_id = d.prescription_id
                WHERE p.prescription_id = ?
            ) AS prescription_fulfillment
        `;

        try {
            const [fulfillmentStatus] = await query(sql, [prescriptionId]);
            return fulfillmentStatus;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new PrescriptionModel();