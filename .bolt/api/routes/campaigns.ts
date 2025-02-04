import { Router } from 'express';
import { prisma } from '@/lib/prisma';
import { validateCampaign } from '@/lib/validation';
import type { Campaign } from '@/types/schema';
import type { ApiResponse, PaginatedResponse } from '@/types/schema';

const router = Router();

// Get paginated campaigns
router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, search, status } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);

    const where = {
      userId: req.user.id,
      ...(search && {
        OR: [
          { name: { contains: String(search), mode: 'insensitive' } },
          { description: { contains: String(search), mode: 'insensitive' } },
        ],
      }),
      ...(status && { status: String(status) }),
    };

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        skip,
        take: Number(pageSize),
        orderBy: { createdAt: 'desc' },
        include: {
          contacts: true,
        },
      }),
      prisma.campaign.count({ where }),
    ]);

    const response: ApiResponse<PaginatedResponse<Campaign>> = {
      success: true,
      data: {
        items: campaigns,
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
        message: 'Failed to fetch campaigns',
        details: error,
      },
    });
  }
});

// Get campaign by ID
router.get('/:id', async (req, res) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: {
        contacts: true,
      },
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Campaign not found',
        },
      });
    }

    res.json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch campaign',
        details: error,
      },
    });
  }
});

// Create new campaign
router.post('/', async (req, res) => {
  try {
    const validation = validateCampaign(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid campaign data',
          details: validation.errors,
        },
      });
    }

    const campaign = await prisma.campaign.create({
      data: {
        ...req.body,
        userId: req.user.id,
      },
      include: {
        contacts: true,
      },
    });

    res.status(201).json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create campaign',
        details: error,
      },
    });
  }
});

// Update campaign
router.put('/:id', async (req, res) => {
  try {
    const validation = validateCampaign(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid campaign data',
          details: validation.errors,
        },
      });
    }

    const campaign = await prisma.campaign.update({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      data: req.body,
      include: {
        contacts: true,
      },
    });

    res.json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update campaign',
        details: error,
      },
    });
  }
});

// Delete campaign
router.delete('/:id', async (req, res) => {
  try {
    await prisma.campaign.delete({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    res.json({
      success: true,
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete campaign',
        details: error,
      },
    });
  }
});

// Add contacts to campaign
router.post('/:id/contacts', async (req, res) => {
  try {
    const { contactIds } = req.body;

    const campaign = await prisma.campaign.update({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      data: {
        contacts: {
          connect: contactIds.map((id: string) => ({ id })),
        },
      },
      include: {
        contacts: true,
      },
    });

    res.json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to add contacts to campaign',
        details: error,
      },
    });
  }
});

// Remove contacts from campaign
router.delete('/:id/contacts', async (req, res) => {
  try {
    const { contactIds } = req.body;

    const campaign = await prisma.campaign.update({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      data: {
        contacts: {
          disconnect: contactIds.map((id: string) => ({ id })),
        },
      },
      include: {
        contacts: true,
      },
    });

    res.json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to remove contacts from campaign',
        details: error,
      },
    });
  }
});

export default router;