import { Router } from 'express';
import { prisma } from '@/lib/prisma';
import { validateWhisperTemplate } from '@/lib/validation';
import type { WhisperTemplate } from '@/types/schema';
import type { ApiResponse, PaginatedResponse } from '@/types/schema';

const router = Router();

// Get paginated whisper templates
router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, search, type, includeSystem = true } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);

    const where = {
      OR: [
        {
          userId: req.user.id,
        },
        {
          isSystem: true,
          isHidden: false,
          ...(includeSystem === 'false' && { id: 'none' }),
        },
      ],
      ...(type && { type: String(type) }),
      ...(search && {
        OR: [
          { name: { contains: String(search), mode: 'insensitive' } },
          { systemPrompt: { contains: String(search), mode: 'insensitive' } },
          { editablePrompt: { contains: String(search), mode: 'insensitive' } },
          { tags: { has: String(search) } },
        ],
      }),
    };

    const [templates, total] = await Promise.all([
      prisma.whisperTemplate.findMany({
        where,
        skip,
        take: Number(pageSize),
        orderBy: [
          { isSystem: 'desc' },
          { createdAt: 'desc' },
        ],
      }),
      prisma.whisperTemplate.count({ where }),
    ]);

    const response: ApiResponse<PaginatedResponse<WhisperTemplate>> = {
      success: true,
      data: {
        items: templates,
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
        message: 'Failed to fetch whisper templates',
        details: error,
      },
    });
  }
});

// Get whisper template by ID
router.get('/:id', async (req, res) => {
  try {
    const template = await prisma.whisperTemplate.findFirst({
      where: {
        id: req.params.id,
        OR: [
          { userId: req.user.id },
          { isSystem: true },
        ],
      },
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Whisper template not found',
        },
      });
    }

    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch whisper template',
        details: error,
      },
    });
  }
});

// Create new whisper template
router.post('/', async (req, res) => {
  try {
    const validation = validateWhisperTemplate(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid whisper template data',
          details: validation.errors,
        },
      });
    }

    const template = await prisma.whisperTemplate.create({
      data: {
        ...req.body,
        userId: req.user.id,
        isSystem: false,
      },
    });

    res.status(201).json({
      success: true,
      data: template,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create whisper template',
        details: error,
      },
    });
  }
});

// Update whisper template
router.put('/:id', async (req, res) => {
  try {
    const validation = validateWhisperTemplate(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid whisper template data',
          details: validation.errors,
        },
      });
    }

    const template = await prisma.whisperTemplate.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Whisper template not found or cannot be modified',
        },
      });
    }

    const updatedTemplate = await prisma.whisperTemplate.update({
      where: {
        id: req.params.id,
      },
      data: req.body,
    });

    res.json({
      success: true,
      data: updatedTemplate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update whisper template',
        details: error,
      },
    });
  }
});

// Delete whisper template
router.delete('/:id', async (req, res) => {
  try {
    const template = await prisma.whisperTemplate.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
        isSystem: false,
      },
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Whisper template not found or cannot be deleted',
        },
      });
    }

    await prisma.whisperTemplate.delete({
      where: {
        id: req.params.id,
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
        message: 'Failed to delete whisper template',
        details: error,
      },
    });
  }
});

// Toggle template visibility (for system templates)
router.post('/:id/toggle-visibility', async (req, res) => {
  try {
    const template = await prisma.whisperTemplate.findFirst({
      where: {
        id: req.params.id,
        isSystem: true,
      },
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'System template not found',
        },
      });
    }

    const updatedTemplate = await prisma.whisperTemplate.update({
      where: {
        id: req.params.id,
      },
      data: {
        isHidden: !template.isHidden,
      },
    });

    res.json({
      success: true,
      data: updatedTemplate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to toggle template visibility',
        details: error,
      },
    });
  }
});

export default router;