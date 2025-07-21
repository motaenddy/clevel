import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storageService, type Client } from '../services/StorageService'

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

  // Actions
  const loadClients = async () => {
    loading.value = true
    error.value = null
    
    try {
      const loadedClients = storageService.loadClients()
      
      // If no clients in storage, load sample data
      if (loadedClients.length === 0) {
        clients.value = getSampleClients()
        await saveClients()
      } else {
        clients.value = loadedClients
      }
    } catch (err) {
      error.value = 'Error al cargar clientes'
      console.error('Error loading clients:', err)
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
        nombre: 'GRUPO MEDICO UNIDO',
        email: 'contacto@grupomedico.com',
        telefono: '809-555-0103',
        direccion: 'La Romana, RD',
        estado: 'activo',
        notas: 'Nuevo cliente',
        montoPendiente: 60000,
        cuotasVencidas: 10,
        fechaCreacion: new Date('2024-02-01')
      },
      {
        id: '4',
        nombre: 'CLINICA DR MONTESINO',
        email: 'dr.montesino@clinica.com',
        telefono: '809-555-0104',
        direccion: 'San Pedro de Macorís, RD',
        estado: 'activo',
        notas: 'Cliente estable',
        montoPendiente: 33898,
        cuotasVencidas: 8,
        fechaCreacion: new Date('2024-02-15')
      },
      {
        id: '5',
        nombre: 'Hospital San Vicente de Paul',
        email: 'admin@sanvicente.com',
        telefono: '809-555-0105',
        direccion: 'San Francisco de Macorís, RD',
        estado: 'activo',
        notas: 'Hospital grande',
        montoPendiente: 120000,
        cuotasVencidas: 0,
        fechaCreacion: new Date('2024-03-01')
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
    
    // Actions
    loadClients,
    addClient,
    updateClient,
    deleteClient,
    saveClients
  }
}) 