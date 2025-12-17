const QueueModel = require('../models/queue.model');

// Get clinic queue with statistics
exports.getClinicQueue = async (req, res) => {
  try {
    const { clinicId } = req.params;
    
    const [queue, statistics] = await Promise.all([
      QueueModel.getClinicQueue(clinicId),
      QueueModel.getQueueStatistics(clinicId)
    ]);
    
    res.json({
      queue,
      statistics
    });
  } catch (error) {
    console.error('Error fetching clinic queue:', error);
    res.status(500).json({ message: 'Error fetching clinic queue' });
  }
};

// Add patient to queue
exports.addToQueue = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    
    if (!appointmentId) {
      return res.status(400).json({ message: 'Appointment ID is required' });
    }
    
    const queueEntry = await QueueModel.addToQueue(appointmentId);
    
    res.status(201).json({
      message: 'Patient added to queue successfully',
      queue: queueEntry
    });
  } catch (error) {
    console.error('Error adding to queue:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Patient already in queue' });
    }
    
    res.status(500).json({ message: 'Error adding patient to queue' });
  }
};

// Update queue status
exports.updateQueueStatus = async (req, res) => {
  try {
    const { queueId } = req.params;
    const { status } = req.body;
    
    if (!status || !['Waiting', 'In-Service', 'Completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const updated = await QueueModel.updateQueueStatus(queueId, status);
    
    if (!updated) {
      return res.status(404).json({ message: 'Queue entry not found' });
    }
    
    res.json({ message: 'Queue status updated successfully' });
  } catch (error) {
    console.error('Error updating queue status:', error);
    res.status(500).json({ message: 'Error updating queue status' });
  }
};

// Call next patient
exports.callNextPatient = async (req, res) => {
  try {
    const { clinicId } = req.params;
    
    const nextPatient = await QueueModel.callNextPatient(clinicId);
    
    if (!nextPatient) {
      return res.json({
        message: 'No patients waiting in queue',
        patient: null
      });
    }
    
    res.json({
      message: 'Next patient called successfully',
      patient: nextPatient
    });
  } catch (error) {
    console.error('Error calling next patient:', error);
    res.status(500).json({ message: 'Error calling next patient' });
  }
};

// Remove from queue
exports.removeFromQueue = async (req, res) => {
  try {
    const { queueId } = req.params;
    
    const removed = await QueueModel.removeFromQueue(queueId);
    
    if (!removed) {
      return res.status(404).json({ message: 'Queue entry not found' });
    }
    
    res.json({ message: 'Patient removed from queue successfully' });
  } catch (error) {
    console.error('Error removing from queue:', error);
    res.status(500).json({ message: 'Error removing from queue' });
  }
};

// Get patient queue position
exports.getPatientQueuePosition = async (req, res) => {
  try {
    const { patientId, clinicId } = req.params;
    
    const position = await QueueModel.getPatientQueuePosition(patientId, clinicId);
    
    if (!position) {
      return res.json({
        message: 'Patient not in queue',
        position: null
      });
    }
    
    res.json({
      message: 'Queue position retrieved successfully',
      position
    });
  } catch (error) {
    console.error('Error getting queue position:', error);
    res.status(500).json({ message: 'Error getting queue position' });
  }
};

// Reorder queue manually
exports.reorderQueue = async (req, res) => {
  try {
    const { queueUpdates } = req.body;
    
    if (!Array.isArray(queueUpdates) || queueUpdates.length === 0) {
      return res.status(400).json({ message: 'Invalid queue updates' });
    }
    
    // Validate updates
    for (const update of queueUpdates) {
      if (!update.queue_id || !update.queue_number) {
        return res.status(400).json({ message: 'Each update must have queue_id and queue_number' });
      }
    }
    
    await QueueModel.reorderQueue(queueUpdates);
    
    res.json({ message: 'Queue reordered successfully' });
  } catch (error) {
    console.error('Error reordering queue:', error);
    res.status(500).json({ message: 'Error reordering queue' });
  }
};
