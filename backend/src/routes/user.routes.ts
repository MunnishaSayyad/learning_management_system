import express, { Router } from "express";

import { register,login,googleAuth,getProfile } from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth";

const routes = Router();

routes.post('/signup', register);
routes.post('/signin', login);
routes.post("/google", googleAuth); 

routes.get("/profile", authenticate, getProfile);


export default routes;