const API_URL = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'x-token': token } : {};
}

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw { status: response.status, message: data.mensaje || data.error || 'Error desconocido', data };
  }

  return data;
}

// ============ AUTH ============
export async function login(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(nombreCompleto, email, password, fechaNacimiento) {
  return request('/auth/registro', {
    method: 'POST',
    body: JSON.stringify({ nombreCompleto, email, password, fechaNacimiento }),
  });
}

// ============ USUARIOS ============
export async function obtenerUsuarios() {
  return request('/usuarios');
}

export async function obtenerUsuario(id) {
  return request(`/usuarios/${id}`);
}

export async function actualizarUsuario(id, datos) {
  return request(`/usuarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  });
}

export async function eliminarUsuario(id) {
  return request(`/usuarios/${id}`, {
    method: 'DELETE',
  });
}

// ============ PERFILES NUMEROLÓGICOS ============
export async function obtenerPerfiles() {
  return request('/perfiles-numerologicos');
}

export async function obtenerPerfil(id) {
  return request(`/perfiles-numerologicos/${id}`);
}

export async function crearPerfil(datos) {
  return request('/perfiles-numerologicos', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

export async function actualizarPerfil(id, datos) {
  return request(`/perfiles-numerologicos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  });
}

export async function eliminarPerfil(id) {
  return request(`/perfiles-numerologicos/${id}`, {
    method: 'DELETE',
  });
}

// ============ LECTURAS ============
export async function obtenerLecturas() {
  return request('/lecturas');
}

export async function obtenerLectura(id) {
  return request(`/lecturas/${id}`);
}

export async function crearLectura(datos) {
  return request('/lecturas', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

export async function actualizarLectura(id, datos) {
  return request(`/lecturas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  });
}

export async function eliminarLectura(id) {
  return request(`/lecturas/${id}`, {
    method: 'DELETE',
  });
}

// ============ COMPATIBILIDAD ============
export async function obtenerCompatibilidades() {
  return request('/compatibilidades');
}

export async function obtenerCompatibilidad(id) {
  return request(`/compatibilidades/${id}`);
}

export async function crearCompatibilidad(datos) {
  return request('/compatibilidades', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

export async function actualizarCompatibilidad(id, datos) {
  return request(`/compatibilidades/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  });
}

export async function eliminarCompatibilidad(id) {
  return request(`/compatibilidades/${id}`, {
    method: 'DELETE',
  });
}
