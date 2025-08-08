// Storage keys
const CLIENTS_KEY = 'ceo-app-clients';
const BILLING_KEY = 'ceo-app-billing';
const SETTINGS_KEY = 'ceo-app-settings';
const USER_PROFILE_KEY = 'ceo-app-user-profile';

// Types
export interface Client {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  fechaCreacion: Date;
  estado: 'activo' | 'inactivo';
  notas: string;
  montoPendiente?: number;
  cuotasVencidas?: number;
}

export interface BillingItem {
  descripcion: string;
  monto: number;
}

export interface MonthlyBilling {
  id: string;
  clienteId: string;
  mes: string; // "2024-01", "2024-02", etc.
  montoFacturado: number;
  montoPagado: number;
  fechaUltimoPago: Date | null;
  fechaVencimiento: Date;
  cuotasVencidas: number;
  fechaCompromiso: Date | null;
  estado: 'pendiente' | 'pagado' | 'vencido';
  notas: string;
  items?: BillingItem[]; // Optional items for detailed billing
}

export interface AppSettings {
  currency: string;
  dateFormat: string;
  notifications: boolean;
}

export interface UserProfile {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  cargo?: string; // Ej: CEO, Director, etc.
  empresa?: string;
  avatarUrl?: string;
}

// Employee types
export interface EmployeeTask {
  id: string
  titulo: string
  descripcion?: string
  prioridad: 'baja' | 'media' | 'alta'
  estado: 'pendiente' | 'en_progreso' | 'completada'
  fechaCreacion: Date
  fechaVencimiento?: Date
  fechaCompletado?: Date
  asignadoPor?: string
}

export interface Employee {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  cargo: string
  departamento: string
  fechaContratacion: Date
  salario: number
  estado: 'activo' | 'inactivo' | 'vacaciones' | 'licencia'
  supervisor?: string
  direccion?: string
  documentoIdentidad?: string
  fechaNacimiento?: Date
  notas?: string
  actividadActual?: string
  actividadActualUpdatedAt?: Date
  habilidades: string[]
  proyectos: string[]
  evaluaciones: EmployeeEvaluation[]
  tareas?: EmployeeTask[]
}

export interface EmployeeEvaluation {
  id: string
  fecha: Date
  evaluador: string
  calificacion: number
  comentarios: string
  areasMejora: string[]
  areasFortaleza: string[]
}

export interface Department {
  id: string
  nombre: string
  descripcion: string
  jefeDepartamento?: string
  presupuesto?: number
  empleados: string[]
}

export interface Position {
  id: string
  titulo: string
  departamento: string
  descripcion: string
  salarioMinimo: number
  salarioMaximo: number
  requisitos: string[]
  responsabilidades: string[]
}

class StorageService {
  // Client operations
  saveClients(clients: Client[]): void {
    try {
      localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
    } catch (error) {
      console.error('Error saving clients:', error);
    }
  }

  loadClients(): Client[] {
    try {
      const data = localStorage.getItem(CLIENTS_KEY);
      if (data) {
        const clients = JSON.parse(data);
        // Convert date strings back to Date objects
        return clients.map((client: any) => ({
          ...client,
          fechaCreacion: new Date(client.fechaCreacion)
        }));
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    }
    return [];
  }

  addClient(client: Client): void {
    const clients = this.loadClients();
    clients.push(client);
    this.saveClients(clients);
  }

  updateClient(updatedClient: Client): void {
    const clients = this.loadClients();
    const index = clients.findIndex(c => c.id === updatedClient.id);
    if (index !== -1) {
      clients[index] = updatedClient;
      this.saveClients(clients);
    }
  }

  deleteClient(clientId: string): void {
    const clients = this.loadClients();
    const filteredClients = clients.filter(c => c.id !== clientId);
    this.saveClients(filteredClients);
  }

  getClientById(clientId: string): Client | null {
    const clients = this.loadClients();
    return clients.find(c => c.id === clientId) || null;
  }

  // Billing operations
  saveBilling(billing: MonthlyBilling[]): void {
    try {
      localStorage.setItem(BILLING_KEY, JSON.stringify(billing));
    } catch (error) {
      console.error('Error saving billing:', error);
    }
  }

  loadBilling(): MonthlyBilling[] {
    try {
      const data = localStorage.getItem(BILLING_KEY);
      if (data) {
        const billing = JSON.parse(data);
        // Convert date strings back to Date objects
        return billing.map((item: any) => ({
          ...item,
          fechaUltimoPago: item.fechaUltimoPago ? new Date(item.fechaUltimoPago) : null,
          fechaVencimiento: new Date(item.fechaVencimiento),
          fechaCompromiso: item.fechaCompromiso ? new Date(item.fechaCompromiso) : null
        }));
      }
    } catch (error) {
      console.error('Error loading billing:', error);
    }
    return [];
  }

  addBilling(billing: MonthlyBilling): void {
    const allBilling = this.loadBilling();
    allBilling.push(billing);
    this.saveBilling(allBilling);
  }

  updateBilling(updatedBilling: MonthlyBilling): void {
    const allBilling = this.loadBilling();
    const index = allBilling.findIndex(b => b.id === updatedBilling.id);
    if (index !== -1) {
      allBilling[index] = updatedBilling;
      this.saveBilling(allBilling);
    }
  }

  getBillingByClient(clientId: string): MonthlyBilling[] {
    const allBilling = this.loadBilling();
    return allBilling.filter(b => b.clienteId === clientId);
  }

  getBillingByMonth(month: string): MonthlyBilling[] {
    const allBilling = this.loadBilling();
    return allBilling.filter(b => b.mes === month);
  }

  // Settings operations
  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  loadSettings(): AppSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
    return {
      currency: 'RD$',
      dateFormat: 'DD/MM/YYYY',
      notifications: true
    };
  }

  // User profile operations
  saveUserProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  }

  loadUserProfile(): UserProfile {
    try {
      const data = localStorage.getItem(USER_PROFILE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
    // Default mock profile
    const defaultProfile: UserProfile = {
      id: 'me',
      nombre: 'María',
      apellido: 'González',
      email: 'maria.gonzalez@empresa.com',
      telefono: '809-555-0101',
      cargo: 'CEO',
      empresa: 'Tu Empresa',
    };
    this.saveUserProfile(defaultProfile);
    return defaultProfile;
  }

  // Employee storage methods
  saveEmployees(employees: Employee[]): void {
    try {
      localStorage.setItem('employees', JSON.stringify(employees))
    } catch (error) {
      console.error('Error saving employees:', error)
      throw error
    }
  }

  loadEmployees(): Employee[] {
    try {
      const data = localStorage.getItem('employees')
      if (!data) return []
      
      const employees = JSON.parse(data)
      // Convert date strings back to Date objects
      return employees.map((emp: any) => ({
        ...emp,
        fechaContratacion: new Date(emp.fechaContratacion),
        fechaNacimiento: emp.fechaNacimiento ? new Date(emp.fechaNacimiento) : undefined,
        actividadActualUpdatedAt: emp.actividadActualUpdatedAt ? new Date(emp.actividadActualUpdatedAt) : undefined,
        evaluaciones: emp.evaluaciones?.map((evaluation: any) => ({
          ...evaluation,
          fecha: new Date(evaluation.fecha)
        })) || [],
        tareas: (emp.tareas || []).map((t: any) => ({
          ...t,
          fechaCreacion: new Date(t.fechaCreacion),
          fechaVencimiento: t.fechaVencimiento ? new Date(t.fechaVencimiento) : undefined,
          fechaCompletado: t.fechaCompletado ? new Date(t.fechaCompletado) : undefined
        }))
      }))
    } catch (error) {
      console.error('Error loading employees:', error)
      return []
    }
  }

  saveDepartments(departments: Department[]): void {
    try {
      localStorage.setItem('departments', JSON.stringify(departments))
    } catch (error) {
      console.error('Error saving departments:', error)
      throw error
    }
  }

  loadDepartments(): Department[] {
    try {
      const data = localStorage.getItem('departments')
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Error loading departments:', error)
      return []
    }
  }

  savePositions(positions: Position[]): void {
    try {
      localStorage.setItem('positions', JSON.stringify(positions))
    } catch (error) {
      console.error('Error saving positions:', error)
      throw error
    }
  }

  loadPositions(): Position[] {
    try {
      const data = localStorage.getItem('positions')
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Error loading positions:', error)
      return []
    }
  }

  clearEmployeeData(): void {
    try {
      localStorage.removeItem('employees')
      localStorage.removeItem('departments')
      localStorage.removeItem('positions')
    } catch (error) {
      console.error('Error clearing employee data:', error)
    }
  }

  // Utility methods
  clearAllData(): void {
    localStorage.removeItem(CLIENTS_KEY);
    localStorage.removeItem(BILLING_KEY);
    localStorage.removeItem(SETTINGS_KEY);
  }

  exportData(): { clients: Client[], billing: MonthlyBilling[], settings: AppSettings } {
    return {
      clients: this.loadClients(),
      billing: this.loadBilling(),
      settings: this.loadSettings()
    };
  }

  importData(data: { clients: Client[], billing: MonthlyBilling[], settings: AppSettings }): void {
    this.saveClients(data.clients);
    this.saveBilling(data.billing);
    this.saveSettings(data.settings);
  }
}

// Export singleton instance
export const storageService = new StorageService();
export default storageService; 