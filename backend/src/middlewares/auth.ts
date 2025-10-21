import { Request, Response, NextFunction,RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
config();

const JWT_SECRET = process.env.JWT_SECRET!;

interface DecodedToken {
  id?: string; // For manual JWT
  role?: "student" | "instructor" | "admin";
  sub?: string; // For Google OAuth
}

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: "student" | "instructor" | "admin";
}



export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction):Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({
        success: false,
        message:"User is not authenticated",
      })
      return
    }
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const isCustomAuth = token.length < 500;

    let decoded: DecodedToken;

    if (isCustomAuth) {
      // Manually issued JWT

      
      decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
      req.userId = decoded.id;
      req.userRole = decoded.role;
    } else {
      // Google OAuth token
      decoded = jwt.decode(token) as DecodedToken;
      req.userId = decoded?.sub; // Google's unique ID
      req.userRole = "student"; // Default fallback role
    }

    next();
  } catch (error) {
    console.error("Auth Error:", error);
    next(error);
  }
};

export const authorizeRoles = (...allowedRoles: string[]): RequestHandler => {
  return (req: AuthRequest, res: Response, next:NextFunction) => {
    const userRole = req.userRole;

    if (!userRole || !allowedRoles.includes(userRole)) {
      res.status(403).json({ message: "Access denied: insufficient permissions" });
      return; // <-- required to exit function
    }

    next();
  };
};