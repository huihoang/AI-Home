import express from 'express';
import auth from '../middleware/auth.js'
const router = express.Router();
  
import updatedVoice from '../controllers/voice.controller.js';

router.post('/update-status', auth, updatedVoice.updatedVoiceStatus);
// nhớ thay token mới
// curl -X POST http://localhost:8080/voice/update-status -H "Content-Type: application/json" -H "Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjgwZGVlMWYyOTI5MzA5MTU2MWYyMmYwIiwiZW1haWwiOiJuZ3V5ZW5ob2FuZzAyMDEyMDA0QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NzU4MDQwMywiZXhwIjoxNzQ3NTg0MDAzfQ.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjgwZGVlMWYyOTI5MzA5MTU2MWYyMmYwIiwiZW1haWwiOiJuZ3V5ZW5ob2FuZzAyMDEyMDA0QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NzY3MzI1NCwiZXhwIjoxNzQ3Njc2ODU0fQ.fZkK_G4cgucCsBvxWqSDM9GxFqJ7mns-fG9Ems-lSi0" -d "{\"status\":\"turn on fan 3\", \"user_id\":\"680dee1f29293091561f22f0\"}"

export default router;