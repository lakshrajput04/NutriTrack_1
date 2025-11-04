export interface UserDTO {
  _id: string;
  name: string;
  email: string;
  age?: number;
  weight?: number;
  height?: number;
  activityLevel?: string;
  goals?: string[];
  dailyCalorieGoal?: number;
  googleId?: string;
  fitDataEnabled?: boolean;
  googleAccessToken?: string;
}

export interface LoginResult {
  user: UserDTO;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export async function login(
  email: string, 
  name?: string,
  age?: number,
  weight?: number,
  height?: number,
  activityLevel?: string
): Promise<LoginResult> {
  const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name, age, weight, height, activityLevel }),
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch (e) {
    // ignore json parse errors
  }

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `Login failed (${res.status})`;
    throw new Error(msg);
  }

  return data as LoginResult;
}

export function saveUser(user: UserDTO) {
  localStorage.setItem("nutritrack_user", JSON.stringify(user));
}

export function getUser(): UserDTO | null {
  const raw = localStorage.getItem("nutritrack_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserDTO;
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem("nutritrack_user");
}
