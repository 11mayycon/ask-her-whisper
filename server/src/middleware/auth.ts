import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  supportId?: string;
  adminId?: string;
  type?: string;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Suporte para tokens de usuário e suporte
    if (decoded.type === 'support') {
      req.supportId = decoded.supportId;
      req.adminId = decoded.adminId;
      req.userRole = decoded.role;
      req.type = decoded.type;
    } else {
      req.userId = decoded.userId;
      req.userRole = decoded.role;
    }
    
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.userRole !== 'admin' && req.userRole !== 'super_admin') {
    return res.status(403).json({ error: 'Acesso negado: requer permissão de admin' });
  }
  next();
};

export const requireSupport = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!['admin', 'super_admin', 'support'].includes(req.userRole || '')) {
    return res.status(403).json({ error: 'Acesso negado: requer permissão de suporte' });
  }
  next();
};
