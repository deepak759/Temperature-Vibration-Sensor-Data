const API_BASE_URL = `${import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'}/api`;

// Helper function to get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Helper function to make API requests
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = token;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Auth API
export const authAPI = {
  register: async (data: { username: string; email: string; password: string }) => {
    return apiRequest<{ message: string; userId: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  verifyOTP: async (data: { email: string; otp: number }) => {
    return apiRequest<{ message: string }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login: async (data: { email: string; password: string }) => {
    return apiRequest<{
      message: string;
      token: string;
      user: {
        id: string;
        username: string;
        email: string;
        role: string;
        plantAccess: Array<{
          plantId: string;
          plantName: string;
          accessType: string;
        }>;
      };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  resendOTP: async (data: { email: string }) => {
    return apiRequest<{ message: string }>('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Plant API
export const plantAPI = {
  getAll: async () => {
    return apiRequest<{
      message: string;
      plants: Array<{
        _id: string;
        name: string;
        description?: string;
        location?: string;
        createdBy: {
          _id: string;
          username: string;
          email: string;
        };
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
      }>;
    }>('/plants');
  },

  getById: async (plantId: string) => {
    return apiRequest<{
      message: string;
      plant: {
        _id: string;
        name: string;
        description?: string;
        location?: string;
        createdBy: {
          _id: string;
          username: string;
          email: string;
        };
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
      };
    }>(`/plants/${plantId}`);
  },

  create: async (data: { name: string; description?: string; location?: string }) => {
    return apiRequest<{
      message: string;
      plant: {
        _id: string;
        name: string;
        description?: string;
        location?: string;
        createdBy: {
          _id: string;
          username: string;
          email: string;
        };
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
      };
    }>('/plants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (plantId: string, data: { name?: string; description?: string; location?: string; isActive?: boolean }) => {
    return apiRequest<{
      message: string;
      plant: {
        _id: string;
        name: string;
        description?: string;
        location?: string;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
      };
    }>(`/plants/${plantId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (plantId: string) => {
    return apiRequest<{ message: string }>(`/plants/${plantId}`, {
      method: 'DELETE',
    });
  },
};

// Admin API
export const adminAPI = {
  addViewerUser: async (plantId: string, data: { username: string; email: string; password: string }) => {
    return apiRequest<{
      message: string;
      user: {
        id: string;
        username: string;
        email: string;
        role: string;
      };
    }>(`/admin/plants/${plantId}/users`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getPlantUsers: async (plantId: string) => {
    return apiRequest<{
      message: string;
      plant: {
        id: string;
        name: string;
      };
      users: Array<{
        id: string;
        username: string;
        email: string;
        role: string;
        plantAccess: string;
        emailVerified: boolean;
        createdAt: string;
      }>;
    }>(`/admin/plants/${plantId}/users`);
  },

  addAlertEmail: async (plantId: string, data: { email: string }) => {
    return apiRequest<{
      message: string;
      alertEmail: {
        _id: string;
        plantId: string;
        email: string;
        addedBy: {
          _id: string;
          username: string;
          email: string;
        };
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
      };
    }>(`/admin/plants/${plantId}/alert-emails`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getAlertEmails: async (plantId: string) => {
    return apiRequest<{
      message: string;
      plant: {
        id: string;
        name: string;
      };
      alertEmails: Array<{
        _id: string;
        plantId: string;
        email: string;
        addedBy: {
          _id: string;
          username: string;
          email: string;
        };
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
      }>;
    }>(`/admin/plants/${plantId}/alert-emails`);
  },

  removeAlertEmail: async (plantId: string, alertEmailId: string) => {
    return apiRequest<{ message: string }>(`/admin/plants/${plantId}/alert-emails/${alertEmailId}`, {
      method: 'DELETE',
    });
  },
};

// Godadmin API
export const godadminAPI = {
  getAllUsers: async () => {
    return apiRequest<{
      message: string;
      users: Array<{
        id: string;
        username: string;
        email: string;
        role: string;
        plantAccess: Array<{
          plantId: string;
          plantName: string;
          accessType: string;
        }>;
        emailVerified: boolean;
        createdAt: string;
      }>;
      totalUsers: number;
    }>('/godadmin/users');
  },

  addAdminUser: async (plantId: string, data: { username?: string; email?: string; password?: string; userId?: string }) => {
    return apiRequest<{
      message: string;
      user: {
        id: string;
        username: string;
        email: string;
        role: string;
        plantAccess: {
          plantId: string;
          plantName: string;
          accessType: string;
        };
      };
    }>(`/godadmin/plants/${plantId}/admins`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  removeAdminAccess: async (plantId: string, userId: string) => {
    return apiRequest<{
      message: string;
      user: {
        id: string;
        username: string;
        email: string;
        role: string;
      };
    }>(`/godadmin/plants/${plantId}/admins/${userId}`, {
      method: 'DELETE',
    });
  },
};
