const express = require('express');
const router = express.Router();
const { authMiddleware, checkRole } = require('../middleware/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');
const RoomController = require('../controllers/room.controller');

// Get all rooms
router.get('/rooms', 
  authMiddleware, // Admin, Reception, Doctor, Nurse roles
  asyncHandler(RoomController.getAllRooms)
);

// Get room statistics
router.get('/rooms/statistics', 
  authMiddleware, 
  checkRole([1, 2]), // Admin, Reception roles
  asyncHandler(RoomController.getRoomStatistics)
);

// Search rooms
router.get('/rooms/search', 
  authMiddleware, 
  checkRole([1, 2, 3, 4]), // Admin, Reception, Doctor, Nurse roles
  asyncHandler(RoomController.searchRooms)
);

// Get room by ID
router.get('/rooms/:roomId', 
  authMiddleware,
  checkRole([1, 2, 3, 4]), // Admin, Reception, Doctor, Nurse roles
  asyncHandler(RoomController.getRoomById)
);

// Get rooms by clinic
router.get('/clinics/:clinicId/rooms', 
  authMiddleware,
  checkRole([1, 2, 3, 4]), // Admin, Reception, Doctor, Nurse roles
  asyncHandler(RoomController.getRoomsByClinic)
);

// Get available rooms by clinic
router.get('/clinics/:clinicId/rooms/available', 
  authMiddleware,
  checkRole([1, 2, 3, 4]), // Admin, Reception, Doctor, Nurse roles
  asyncHandler(RoomController.getAvailableRooms)
);

// Create new room (Admin only)
router.post('/rooms', 
  authMiddleware, 
  checkRole([1]), 
  asyncHandler(RoomController.createRoom)
);

// Update room (Admin only)
router.put('/rooms/:roomId', 
  authMiddleware, 
  checkRole([1]), 
  asyncHandler(RoomController.updateRoom)
);

// Update room status (Admin only)
router.patch('/rooms/:roomId/status', 
  authMiddleware, 
  checkRole([1]), 
  asyncHandler(RoomController.updateRoomStatus)
);

// Delete room (Admin only)
router.delete('/rooms/:roomId', 
  authMiddleware, 
  checkRole([1]), 
  asyncHandler(RoomController.deleteRoom)
);

module.exports = router;
