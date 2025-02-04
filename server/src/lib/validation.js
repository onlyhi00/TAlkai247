import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2),
});

export const validateLoginInput = (data) => {
  return loginSchema.safeParse(data);
};

export const validateRegisterInput = (data) => {
  return registerSchema.safeParse(data);
};
