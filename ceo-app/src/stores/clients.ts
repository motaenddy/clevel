import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storageService, type Client } from '../services/StorageService'
import { useBillingStore } from './billing'

export const useClientsStore = defineStore('clients', () => {
  // State
  const clients = ref<Client[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const activeClients = computed(() => 
    clients.value.filter(client => client.estado === 'activo')
  )

  const overdueClients = computed(() => 
    clients.value.filter(client => (client.cuotasVencidas || 0) > 0)
  )

  const totalClients = computed(() => clients.value.length)

  const getClientById = computed(() => (id: string) => 
    clients.value.find(client => client.id === id)
  )

  // Dynamic calculations based on billing data
  const getClientFinancialSummary = computed(() => (clientId: string) => {
    const billingStore = useBillingStore()
    const clientBilling = billingStore.getBillingByClient(clientId)
    
    const totalFacturado = clientBilling.reduce((sum, billing) => sum + billing.montoFacturado, 0)
    const totalPagado = clientBilling.reduce((sum, billing) => sum + billing.montoPagado, 0)
    const montoPendiente = totalFacturado - totalPagado
    const cuotasVencidas = clientBilling.filter(billing => billing.estado === 'vencido').length
    
    return {
      totalFacturado,
      totalPagado,
      montoPendiente,
      cuotasVencidas
    }
  })

  const getClientsWithFinancialData = computed(() => {
    return clients.value.map(client => {
      const financial = getClientFinancialSummary.value(client.id)
      return {
        ...client,
        montoPendiente: financial.montoPendiente,
        cuotasVencidas: financial.cuotasVencidas
      }
    })
  })

  // Actions
  const loadClients = async () => {
    loading.value = true
    error.value = null
    
    try {
      // Always clear localStorage and use fresh sample data
      storageService.clearAllData()
      clients.value = getSampleClients()
      await saveClients()
    } catch (err) {
      error.value = 'Error al cargar clientes'
      console.error('Error loading clients:', err)
      // Fallback to sample data
      clients.value = getSampleClients()
    } finally {
      loading.value = false
    }
  }

  const addClient = async (client: Omit<Client, 'id' | 'fechaCreacion'>) => {
    loading.value = true
    error.value = null

    try {
      const newClient: Client = {
        ...client,
        id: generateId(),
        fechaCreacion: new Date(),
        montoPendiente: 0,
        cuotasVencidas: 0
      }

      clients.value.push(newClient)
      await saveClients()
      return newClient
    } catch (err) {
      error.value = 'Error al agregar cliente'
      console.error('Error adding client:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateClient = async (updatedClient: Client) => {
    loading.value = true
    error.value = null

    try {
      const index = clients.value.findIndex(c => c.id === updatedClient.id)
      if (index !== -1) {
        clients.value[index] = updatedClient
        await saveClients()
        return updatedClient
      } else {
        throw new Error('Cliente no encontrado')
      }
    } catch (err) {
      error.value = 'Error al actualizar cliente'
      console.error('Error updating client:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteClient = async (clientId: string) => {
    loading.value = true
    error.value = null

    try {
      clients.value = clients.value.filter(c => c.id !== clientId)
      await saveClients()
    } catch (err) {
      error.value = 'Error al eliminar cliente'
      console.error('Error deleting client:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const saveClients = async () => {
    try {
      storageService.saveClients(clients.value)
    } catch (err) {
      console.error('Error saving clients:', err)
      throw err
    }
  }

  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  const getSampleClients = (): Client[] => {
    return [
      {
        id: '1',
        nombre: 'CENTRO MEDICO CAROLINA DE JESUS',
        email: 'carolina@medico.com',
        telefono: '809-555-0101',
        direccion: 'Santo Domingo, RD',
        estado: 'activo',
        notas: 'Cliente importante',
        montoPendiente: 40000,
        cuotasVencidas: 15,
        fechaCreacion: new Date('2024-01-01')
      },
      {
        id: '2',
        nombre: 'INEMED',
        email: 'info@inemed.com',
        telefono: '809-555-0102',
        direccion: 'Santiago, RD',
        estado: 'activo',
        notas: 'Cliente regular',
        montoPendiente: 45000,
        cuotasVencidas: 22,
        fechaCreacion: new Date('2024-01-15')
      },
      {
        id: '3',
        nombre: 'CLINICA DR MONTESINO',
        email: 'dr.montesino@clinica.com',
        telefono: '809-555-0104',
        direccion: 'San Pedro de Macorís, RD',
        estado: 'inactivo',
        notas: 'Cliente cancelado',
        montoPendiente: 0,
        cuotasVencidas: 0,
        fechaCreacion: new Date('2024-02-15')
      }
    ]
  }

  return {
    // State
    clients,
    loading,
    error,
    
    // Getters
    activeClients,
    overdueClients,
    totalClients,
    getClientById,
    getClientFinancialSummary,
    getClientsWithFinancialData,
    
    // Actions
    loadClients,
    addClient,
    updateClient,
    deleteClient,
    saveClients
  }
}) 