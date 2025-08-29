import { Router } from 'express';
import { PreviewController } from '../controllers/previewController';

const router = Router();
const previewController = new PreviewController();

// POST /preview - Get URL preview
router.post('/', (req, res, next) => {
  previewController.getPreview(req, res).catch(next);
});

export default router;
