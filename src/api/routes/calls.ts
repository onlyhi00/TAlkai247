import { Router } from 'express';
import { prisma } from '@/lib/prisma';
import { validateCall } from '@/lib/validation';
import type { Call } from '@/types/schema';
import type { ApiResponse, PaginatedResponse } from '@/types/schema';

const router = Router();

// Get paginated calls
router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, contactId, assistantId, status } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);

    const where = {
      ...(req.user?.id && { userId: req.user.id }),
      ...(contactId && { contactId: String(contactId) }),
      ...(assistantId && { assistantId: String(assistantId) }),
      ...(status && { status: String(status) }),
    };

    const [calls, total] = await Promise.all([
      prisma.call.findMany({
        where,
        skip,
        take: Number(pageSize),
        orderBy: { startTime: 'desc' },
        include: {
          contact: true,
          assistant: true,
        },
      }),
      prisma.call.count({ where }),
    ]);

    const response: ApiResponse<PaginatedResponse<Call>> = {
      success: true,
      data: {
        items: calls,
        total,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(total / Number(pageSize)),
      },
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch calls',
        details: error,
      },
    });
  }
});

// Get call by ID
router.get('/:id', async (req, res) => {
  try {
    const call = await prisma.call.findUnique({
      where: { id: req.params.id },
      include: {
        contact: true,
        assistant: true,
      },
    });

    if (!call) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Call not found',
        },
      });
    }

    res.json({
      success: true,
      data: call,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch call',
        details: error,
      },
    });
  }
});

// Start new call
router.post('/start', async (req, res) => {
  try {
    const validation = validateCall(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid call data',
          details: validation.errors,
        },
      });
    }

    const call = await prisma.call.create({
      data: {
        ...req.body,
        userId: req.user.id,
        status: 'IN_PROGRESS',
        startTime: new Date(),
      },
      include: {
        contact: true,
        assistant: true,
      },
    });

    // Update contact's lastContactedAt
    await prisma.contact.update({
      where: { id: call.contactId },
      data: { lastContactedAt: new Date() },
    });

    res.status(201).json({
      success: true,
      data: call,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to start call',
        details: error,
      },
    });
  }
});

// End call
router.post('/:id/end', async (req, res) => {
  try {
    const call = await prisma.call.update({
      where: { id: req.params.id },
      data: {
        status: 'COMPLETED',
        endTime: new Date(),
        duration: req.body.duration,
        metrics: req.body.metrics,
        transcript: req.body.transcript,
        recording: req.body.recording,
      },
      include: {
        contact: true,
        assistant: true,
      },
    });

    res.json({
      success: true,
      data: call,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to end call',
        details: error,
      },
    });
  }
});

// Update call goals
router.put('/:id/goals', async (req, res) => {
  try {
    const call = await prisma.call.update({
      where: { id: req.params.id },
      data: {
        goals: req.body.goals,
      },
    });

    res.json({
      success: true,
      data: call,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update call goals',
        details: error,
      },
    });
  }
});

// Add call note
router.post('/:id/notes', async (req, res) => {
  try {
    const call = await prisma.call.update({
      where: { id: req.params.id },
      data: {
        notes: req.body.note,
      },
    });

    res.json({
      success: true,
      data: call,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to add call note',
        details: error,
      },
    });
  }
});

export default router;