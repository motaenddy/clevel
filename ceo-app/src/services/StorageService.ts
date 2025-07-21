// Storage keys
const CLIENTS_KEY = 'ceo-app-clients';
const BILLING_KEY = 'ceo-app-billing';
const SETTINGS_KEY = 'ceo-app-settings';

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
}

export interface AppSettings {
  currency: string;
  dateFormat: string;
  notifications: boolean;
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