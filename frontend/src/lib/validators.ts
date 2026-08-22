import { z } from "zod";

export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
export const PASSWORD_MESSAGE =
  "Password must be at least 8 characters and contain at least one letter and one number.";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid work email address"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  employee_id: z
    .string()
    .min(1, "Employee ID is required")
    .max(32, "Employee ID must be 32 characters or fewer"),
  email: z.string().email("Please enter a valid work email address"),
  password: z.string().regex(PASSWORD_REGEX, PASSWORD_MESSAGE),
  full_name: z
    .string()
    .min(1, "Full name is required")
    .max(120, "Full name must be 120 characters or fewer"),
  role: z.enum(["admin", "employee"]).default("employee"),
});

export const leaveApplicationSchema = z
  .object({
    leave_type: z.enum(["paid", "sick", "unpaid"]),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    remarks: z.string().max(500, "Remarks cannot exceed 500 characters").optional(),
  })
  .refine(
    (data) => {
      if (!data.start_date || !data.end_date) return true;
      return new Date(data.end_date) >= new Date(data.start_date);
    },
    {
      message: "End date cannot be earlier than start date",
      path: ["end_date"],
    }
  );

export const profileSelfUpdateSchema = z.object({
  phone: z.string().max(20, "Phone number is too long").nullable().optional(),
  address: z.string().max(300, "Address is too long").nullable().optional(),
  profile_picture_url: z
    .string()
    .url("Please enter a valid image URL")
    .max(500)
    .or(z.literal(""))
    .nullable()
    .optional(),
});

export const salaryUpdateSchema = z.object({
  base_salary: z.number().min(0, "Base salary must be non-negative").optional(),
  allowances: z.record(z.string(), z.number()).optional(),
  deductions: z.record(z.string(), z.number()).optional(),
  effective_date: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type LeaveApplicationFormData = z.infer<typeof leaveApplicationSchema>;
export type ProfileSelfUpdateFormData = z.infer<typeof profileSelfUpdateSchema>;
