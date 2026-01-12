import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Bid from '../models/Bid';
import Gig from '../models/Gig';

export const createBid = async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { gigId, message, price } = req.body;
    const freelancerId = (req as any).user.id;

    // Check if gig exists and is open
    const gig = await Gig.findById(gigId).session(session);
    if (!gig || gig.status !== 'open') {
      await session.abortTransaction();
      res.status(400).json({ message: 'Gig not available for bidding' });
      return;
    }

    // Check if user already bid on this gig
    const existingBid = await Bid.findOne({ gigId, freelancerId }).session(session);
    if (existingBid) {
      await session.abortTransaction();
      res.status(400).json({ message: 'You have already bid on this gig' });
      return;
    }
    //if Bidder and Owner are same
    if(gig.ownerId.toString() === freelancerId){
      await session.abortTransaction();
      res.status(400).json({ message: 'You cannot bid on your own gig' });
      return;
    }
    const bid = new Bid({ gigId, freelancerId, message, price });
    await bid.save({ session });

    await session.commitTransaction();
    res.status(201).json(bid);
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Server error' });
  } finally {
    session.endSession();
  }
};

export const getMyBids = async (req: Request, res: Response): Promise<void> => {
  try {
    const freelancerId = (req as any).user.id;
    const bids = await Bid.find({ freelancerId })
      .populate('gigId', 'title description budget status')
      .sort({ createdAt: -1 });
    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getBidsForGig = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gigId } = req.params;
    const userId = (req as any).user.id;

    // Check if user owns the gig
    const gig = await Gig.findById(gigId);
    if (!gig) {
      res.status(404).json({ message: 'Gig not found' });
      return;
    }

    const isOwner = gig.ownerId.toString() === userId;

    // Check if user has bid on this gig
    const userBid = await Bid.findOne({ gigId, freelancerId: userId });

    if (!isOwner && !userBid) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const bids = await Bid.find({ gigId }).populate('freelancerId', 'name email').sort({ createdAt: -1 });
    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const hireBid = async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bidId } = req.params;
    const userId = (req as any).user.id;

    // Find the bid
    const bid = await Bid.findById(bidId).session(session);
    if (!bid) {
      await session.abortTransaction();
      res.status(404).json({ message: 'Bid not found' });
      return;
    }

    // Check if user owns the gig
    const gig = await Gig.findById(bid.gigId).session(session);
    if (!gig || gig.ownerId.toString() !== userId) {
      await session.abortTransaction();
      res.status(403).json({ message: 'Access denied' });
      return;
    }
 
    // Check if gig is still open
    if (gig.status !== 'open') {
      await session.abortTransaction();
      res.status(400).json({ message: 'Gig is no longer available' });
      return;
    }

    // Update the hired bid
    await Bid.findByIdAndUpdate(bidId, { status: 'hired' }, { session });

    // Update gig status
    await Gig.findByIdAndUpdate(bid.gigId, { status: 'assigned' }, { session });

    // Reject all other bids for this gig
    await Bid.updateMany(
      { gigId: bid.gigId, _id: { $ne: new mongoose.Types.ObjectId(bidId as any) } },
      { status: 'rejected' },
      { session }
    );

    await session.commitTransaction();
    res.json({ message: 'Bid hired successfully' });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Server error' });
  } finally {
    session.endSession();
  }
};
export const rejectBid = async (req: Request, res: Response): Promise<void> => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { bidId } = req.params;
        const userId = (req as any).user.id;

        // Find the bid
        const bid = await Bid.findById(bidId).session(session);
        if (!bid) {
            await session.abortTransaction();
            res.status(404).json({ message: 'Bid not found' });
            return;
        }

        // Check if user owns the gig
        const gig = await Gig.findById(bid.gigId).session(session);
        if (!gig || gig.ownerId.toString() !== userId) {
            await session.abortTransaction();
            res.status(403).json({ message: 'Access denied' });
            return;
        }
        
        // Update the rejected bid
        await Bid.findByIdAndUpdate(bidId, { status: 'rejected' }, { session });
        await session.commitTransaction();
        res.json({ message: 'Bid rejected successfully' });
    }
    catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: 'Server error' });
    } finally {
        session.endSession();
    }
};

export const withdrawBid = async (req: Request, res: Response): Promise<void> => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { bidId } = req.params;
        const userId = (req as any).user.id;

        // Find the bid
        const bid = await Bid.findById(bidId).session(session);
        if (!bid) {
            await session.abortTransaction();
            res.status(404).json({ message: 'Bid not found' });
            return;
        }

        // Check if user owns the bid
        if (bid.freelancerId.toString() !== userId) {
            await session.abortTransaction();
            res.status(403).json({ message: 'Access denied' });
            return;
        }

        // Check if bid is still pending (not hired or rejected)
        if (bid.status !== 'pending') {
            await session.abortTransaction();
            res.status(400).json({ message: 'Cannot withdraw bid that has been processed' });
            return;
        }
        
        // Update the bid status to withdrawn
        await Bid.findByIdAndUpdate(bidId, { status: 'withdrawn' }, { session });
        await session.commitTransaction();
        res.json({ message: 'Bid withdrawn successfully' });
    }
    catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: 'Server error' });
    } finally {
        session.endSession();
    }
};