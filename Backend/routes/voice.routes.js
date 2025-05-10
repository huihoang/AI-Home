
import express from 'express';
const router = express.Router();
  
import updatedVoice from '../controllers/voice.controller.js';

router.post('/update-status', updatedVoice.updatedVoiceStatus);
// curl -X POST http://localhost:8080/voice/update-status -H "Content-Type: application/json" -d "{\"status\":\"turn on fan\"}"

export default router;