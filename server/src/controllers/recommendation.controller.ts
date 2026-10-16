import { Response, NextFunction } from 'express';
import { RecommendationService } from '../services/recommendation.service';
import { AuthenticatedRequest } from '../types';

export class RecommendationController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const recommendations = await RecommendationService.generateRecommendations(req.user!.id);
      return res.status(200).json({
        success: true,
        message: 'Personalized energy recommendations generated',
        data: { recommendations },
      });
    } catch (error) {
      next(error);
    }
  }
}
