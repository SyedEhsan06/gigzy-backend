import express from 'express';
import { createBid, getBidsForGig, hireBid, getMyBids, rejectBid, withdrawBid } from '../controllers/bid.controller';
import authMiddleware from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/', authMiddleware, createBid);
router.get('/my-bids', authMiddleware, getMyBids);
router.get('/:gigId', authMiddleware, getBidsForGig);
router.patch('/:bidId/hire', authMiddleware, hireBid);
router.patch('/:bidId/reject', authMiddleware, rejectBid);
router.patch('/:bidId/withdraw', authMiddleware, withdrawBid);

export default router;
