const API_BASE_URL = 'http://localhost:8080/api/v1';

export interface Professor {
  id?: string;
  _id?: string;
  name: string;
  registration_number: number;
  institucional_email: string;
  status: 'active' | 'inactive' | 'on_leave';
  // Campos extras que o backend possa retornar
  department?: string;
  hire_date?: string;
  phone_numbers?: string[];
  courses?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfessorCreateRequest {
  name: string;
  registration_number: number;
  institucional_email: string;
  status: 'active' | 'inactive' | 'on_leave';
}

export interface ProfessorUpdateRequest {
  name?: string;
  registration_number?: number;
  institucional_email?: string;
  status?: 'active' | 'inactive' | 'on_leave';
}

export interface PaginationParams {
  page?: number;
  size?: number;
  name?: string;
  status?: string;
}

function getAuthToken(): string | null {
  const savedTokens = localStorage.getItem('auth_tokens');
  if (!savedTokens) return null;

  try {
    const tokens = JSON.parse(savedTokens);
    return tokens.access_token || null;
  } catch {
    return null;
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as HeadersInit),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const text = await response.text();

  if (!response.ok) {
    let message = 'Erro ao chamar serviço de professores';
    try {
      const json = JSON.parse(text);
      message = json.detail || json.message || message;
    } catch {
      if (text && text.length < 200) {
        message = text;
      }
    }
    throw new Error(message);
  }

  if (!text) return undefined as T;

  try {
    const data = JSON.parse(text);
    // BFF pode embrulhar em { data: [...] }
    if (data && Array.isArray(data.data)) {
      return data.data as T;
    }
    return data as T;
  } catch {
    throw new Error('Resposta inválida do serviço de professores');
  }
}

export async function getProfessors(params?: PaginationParams): Promise<Professor[]> {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.size) queryParams.append('size', params.size.toString());
  if (params?.name) queryParams.append('name', params.name);
  if (params?.status) queryParams.append('status', params.status);

  const query = queryParams.toString();
  const endpoint = `/professors${query ? `?${query}` : ''}`;

  const response = await apiRequest<any>(endpoint);

  if (Array.isArray(response)) {
    return response as Professor[];
  }

  if (response && Array.isArray((response as any).professors)) {
    return (response as any).professors as Professor[];
  }

  console.warn('Estrutura inesperada na resposta de getProfessors:', response);
  return [];
}

export async function createProfessor(data: ProfessorCreateRequest): Promise<Professor> {
  return apiRequest<Professor>('/professors', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProfessor(id: string, data: ProfessorUpdateRequest): Promise<Professor> {
  return apiRequest<Professor>(`/professors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteProfessor(id: string): Promise<void> {
  await apiRequest<void>(`/professors/${id}`, {
    method: 'DELETE',
  });
}
