import axios, { type AxiosError } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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

    if (error.response?.status === 401 && originalRequest) {
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
    joined: string;
  }>;
}

export interface RegisterInvestorRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  mobileFone: string;
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

export interface EntrepreneurProfile {
  avatar: string | null;
  banner: string | null;
  firstName: string;
  lastName: string;
  about: string | null;
  city: string | null;
  country: string | null;
  fiscalCode: string | null;
  mobileFone: string | null;
  companyRole: string | null;
  companyName: string | null;
  memberSince: string;
  focusSector: string;
  skills: string[];
  totalInvestors: number;
}

export interface InvestorProfile {
  reputation: string | null;
  banner: string | null;
  firstName: string | null;
  lastName: string | null;
  about: string | null;
  mobileFone: string | null;
  fiscalCode: string | null;
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

interface PhotoUpload {
  name: string;
  type: string;
  size: string;
  base64: string;
}

interface UpdateEntrepreneurProfileRequest {
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  companyRole: string;
  companyName: string;
  fiscalCode: string;
  mobileFone: string;
  about?: string;
  photo?: PhotoUpload;
}

interface UpdateInvestorProfileRequest {
  firstName: string;
  lastName: string;
  mobileFone: string;
  fiscalCode: string;
  country: string;
  city: string;
  about?: string;
  photo?: PhotoUpload;
}

interface UploadBannerRequest {
  name: string;
  type: string;
  size: string;
  base64: string;
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

export interface ProjectResponse {
  about: string;
  companyName: string;
  quickSolution: string | null;
  cityState: string;
  country: string;
  slots: number;
  banner: string;
}

type ProjectRequest = {
  banner: {
    name: string;
    type: string;
    size: string;
    base64: string;
  };
  name: string;
  quickSolution: string;
  webSite?: string;
  foundationDate: string;
  companySector: number;
  companyStage: string;
  country: string;
  city: string;
  about: string;
  startInvestment: number;
  investorSlots: number;
  annualRevenue: number;
  investmentGoal: number;
  equity: number | undefined;
  companyFaq: {
    question: string;
    answer: string;
  }[];
}

interface UploadFileRequest {
  idProject: number;
  name: string;
  type: string;
  size: string;
  base64: string;
}

export const stateApi = {
  getStateList: async (countryId: number) => {
    const response = await api.get<string[]>(`/country/${countryId}`);
    return response.data;
  },
};

export const projectApi = {
  createProject: async (data: ProjectRequest) => {
    const response = await api.post<ProjectResponse>("/project", data);
    return response.data;
  },
  uploadFile: async (data: UploadFileRequest) => {
    const response = await api.post<void>("/project/upload-file", data);
    return response.data;
  },
  getEntrepreneurProjects: async () => {
    const response = await api.get<ProjectResponse[]>(
      "/project/entrepreneur",
    );
    return response.data;
  },
};

export const profileApi = {
  getEntrepreneurProfile: async () => {
    const response = await api.get<EntrepreneurProfile>("/entrepreneur");
    return response.data;
  },
  getInvestorProfile: async () => {
    const response = await api.get<InvestorProfile>("/investor");
    return response.data;
  },
  updateEntrepreneurProfile: async (data: UpdateEntrepreneurProfileRequest) => {
    const response = await api.patch<void>("/entrepreneur", data);
    return response.data;
  },
  updateInvestorProfile: async (data: UpdateInvestorProfileRequest) => {
    const response = await api.patch<void>("/investor", data);
    return response.data;
  },
  uploadBanner: async (data: UploadBannerRequest) => {
    const response = await api.post<void>("/api/upload-banner", data);
    return response.data;
  }
};
