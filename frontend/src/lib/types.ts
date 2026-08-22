export type Role = "admin" | "employee";
export type AttendanceStatus = "present" | "absent" | "half_day" | "leave";
export type LeaveType = "paid" | "sick" | "unpaid";
export type LeaveStatus = "pending" | "approved" | "rejected";

export type Profile = {
  full_name: string;
  phone: string | null;
  address: string | null;
  profile_picture_url: string | null;
  job_title: string | null;
  department: string | null;
  date_joined: string | null;
};

export type User = {
  id: number;
  employee_id: string;
  email: string;
  role: Role;
  is_verified: boolean;
  created_at: string;
  profile: Profile | null;
};

export type EmployeeListItem = {
  id: number;
  employee_id: string;
  email: string;
  role: Role;
  full_name: string;
  job_title: string | null;
  department: string | null;
  date_joined: string | null;
};

export type AttendanceRecord = {
  id: number;
  user_id: number;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: AttendanceStatus;
};

export type AttendanceRow = AttendanceRecord & {
  employee_id: string;
  full_name: string;
};

export type AttendanceToday = {
  date: string;
  checked_in: boolean;
  checked_out: boolean;
  record: AttendanceRecord | null;
};

export type LeaveRequest = {
  id: number;
  user_id: number;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  remarks: string | null;
  status: LeaveStatus;
  admin_comment: string | null;
  created_at: string;
  updated_at: string;
  days: number;
};

export type LeaveRow = LeaveRequest & {
  employee_id: string;
  full_name: string;
};

export type Salary = {
  user_id: number;
  base_salary: number;
  allowances: Record<string, number>;
  deductions: Record<string, number>;
  effective_date: string | null;
  gross: number;
  net: number;
};

export type AnalyticsSummary = {
  total_employees: number;
  present_today: number;
  on_leave_today: number;
  pending_leave_requests: number;
};

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};
