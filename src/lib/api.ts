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
        const response = await axios.get<RefreshResponse>(
          `${BASE_URL}/auth/refresh`,
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          },
        );

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

export interface Area {
  id: number;
  name: string;
}

export interface ReferralDetails {
  referralCode: string;
  total: number;
  references: Array<{
    name: string;
  }>;
}

export interface RegisterInvestorRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  mobileFone: string;
  fiscalCode: string;
  city: string;
  country: string;
  investmentMinValue: string;
  investmentMaxValue: string;
  investmentNetWorth: string;
  investmentAnnualIncome: string;
  birthDate: string;
  areas: number[];
  referralToken?: string;
}

interface EntrepreneurProfile {
  avatar: string | null;
  name: string | null;
  about: string | null;
  city: string | null;
  country: string | null;
  companyRole: string | null;
  companyName: string | null;
  memberSince: string;
  focusSector: string;
  skills: string[];
  totalInvestors: number;
}

interface InvestorProfile {
  reputation: string | null;
  name: string | null;
  about: string | null;
  city: string | null;
  country: string | null;
  companyRole: string | null;
  companyName: string | null;
  memberSince: string;
  netWorth: string;
  investmentObjective: string | null;
  avatar: string | null;
  areas: number[];
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
  registerInvestor: async (data: RegisterInvestorRequest) => {
    const response = await api.post<void>(
      "/authentication/register-investor",
      data,
    );
    return response.data;
  },
  getUserProfile: async (type: string) => {
    const endpoint = type === "ENTREPRENEUR" ? "/entrepreneur" : "/investor";
    const response = await api.get<EntrepreneurProfile | InvestorProfile>(
      endpoint,
    );
    return response.data;
  },
};

export const referralApi = {
  getReferralList: async (email: string) => {
    const response = await api.get<ReferralDetails>(`/referral/${email}`);
    return response.data;
  },
};

export const skillsApi = {
  getSkillsList: async () => {
    const response = await api.get<Skill[]>("/skill/skills-list");
    return response.data;
  },
};

export const areasApi = {
  getAreasList: async () => {
    const response = await api.get<Area[]>("/areas/areas-list");
    return response.data;
  },
};

interface ProjectResponse {
  id: number;
  name: string;
  quickSolution: string;
  website?: string;
  foundationDate: string;
  companySector: string;
  companyStage: string;
  country: string;
  city: string;
  about: string;
  startInvestment: string;
  investorsSlots: number;
  annualRevenue: string;
  investmentGoal: string;
  equity: string | undefined
  companyFaq: {
    question: string;
    answer: string;
  }[]
}

type ProjectRequest = Omit<ProjectResponse, 'id'>

interface UploadFileRequest {
  idProject: number;
  name: string;
  type: string;
  size: string;
  base64: string;
}

export const projectApi = {
  createProject: async (data: ProjectRequest) => {
    const response = await api.post<ProjectResponse>("/project", data);
    return response.data;
  },
  uploadFile: async (data: UploadFileRequest) => {
    const response = await api.post<void>("/project/upload-file", data);
    return response.data;
  },
};
