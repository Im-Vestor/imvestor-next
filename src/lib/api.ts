import axios, { type AxiosError } from "axios";

const BASE_URL =
  "http://ec2-13-60-216-152.eu-north-1.compute.amazonaws.com:3000/api";

export const api = axios.create({
  baseURL: BASE_URL,
});

// Add a request interceptor to add the token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(new Error(error as string));
  },
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest 
    //   !(originalRequest as any)._retry
    ) {
    //   originalRequest._retry = true;

      try {
        const refreshToken = sessionStorage.getItem("refreshToken");
        const response = await axios.get<RefreshResponse>(`${BASE_URL}/auth/refresh`, {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        });

        const { token: newAccessToken } = response.data;
        sessionStorage.setItem("accessToken", newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh token is invalid, clear storage and redirect to login
        sessionStorage.clear();
        window.location.href = "/login";
        return Promise.reject(new Error(refreshError as string));
      }
    }

    return Promise.reject(error);
  },
);

export interface LoginResponse {
  token: string;
  refreshToken: string;
  userType: "ENTREPRENEUR" | "INVESTOR";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshResponse {
  token: string;
}

export interface Skill {
  id: number;
  description: string;
}

export interface RegisterEntrepreneurRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  fiscalCode: string;
  mobileFone: string;
  birthDate: string;
  skills: number[];
  referralToken?: string;
}

export const authApi = {
  login: async (data: LoginRequest) => {
    const response = await api.post<LoginResponse>(
      "/authentication/login",
      data,
    );
    return response.data;
  },
  registerEntrepreneur: async (data: RegisterEntrepreneurRequest) => {
    const response = await api.post<void>(
      "/authentication/register-entrepreneur",
      data,
    );
    return response.data;
  },
};

export const skillsApi = {
  getSkillsList: async () => {
    const response = await api.get<Skill[]>("/skill/skills-list");
    return response.data;
  },
};
