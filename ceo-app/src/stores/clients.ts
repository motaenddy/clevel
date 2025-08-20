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
      // Fila 1 - Centro medico Dr Perez (ROJO)
      {
        id: 'cmp-001',
        nombre: 'Centro medico Dr Perez',
        email: 'drperez@centromedico.com',
        telefono: '809-555-0001',
        direccion: 'Santo Domingo',
        estado: 'activo',
        notas: 'Propuesta enviada',
        montoPendiente: 0,
        cuotasVencidas: 0,
        etapaVenta: 'propuesta',
        fechaCreacion: new Date('2024-08-21'),
        cotizado: 45000,
        sistema: 'CLI-ADM',
        contactoCliente: 'DRA Edilia',
        responsable: 'GR',
        status: 'Propuesta enviada',
        fechaUltimaActualizacion: new Date('2024-08-21'),
        proximoPaso: 'en espera de respuesta de aprobacion',
        fechaProximoPaso: new Date('2024-08-24'),
        colorStatus: 'rojo'
      },

      // Fila 2 - Policlinica Bautista (VERDE)
      {
        id: 'pb-001',
        nombre: 'Policlinica Bautista',
        email: 'info@policlinicabautista.com',
        telefono: '809-555-0002',
        direccion: 'Santo Domingo',
        estado: 'activo',
        notas: 'Datos actualizados',
        montoPendiente: 0,
        cuotasVencidas: 0,
        etapaVenta: 'cierre',
        fechaCreacion: new Date('2024-08-12'),
        cotizado: 90000,
        sistema: 'CLI-ADM',
        contactoCliente: 'Dr Grullon',
        responsable: 'GR',
        status: 'Datos actualizados',
        fechaUltimaActualizacion: new Date('2024-08-12'),
        proximoPaso: 'Datos actualizados',
        fechaProximoPaso: new Date('2024-08-14'),
        colorStatus: 'verde'
      },

      // Fila 3 - Dr Grullon (VERDE)
      {
        id: 'dg-001',
        nombre: 'Dr Grullon',
        email: 'drgrullon@clinica.com',
        telefono: '809-555-0003',
        direccion: 'Santiago',
        estado: 'activo',
        notas: 'enviar levantamiento tecnico',
        montoPendiente: 0,
        cuotasVencidas: 0,
        etapaVenta: 'propuesta',
        fechaCreacion: new Date('2024-08-18'),
        cotizado: 90000,
        sistema: 'CLI-ADM',
        contactoCliente: 'ING. Carlos Manuel',
        responsable: 'GR',
        status: 'enviar levantamiento tecnico',
        fechaUltimaActualizacion: new Date('2024-08-18'),
        proximoPaso: 'inicio de entrenamientos',
        fechaProximoPaso: new Date('2024-08-14'),
        colorStatus: 'verde'
      },

      // Fila 4 - Mao clinic (VERDE)
      {
        id: 'mc-001',
        nombre: 'Mao clinic',
        email: 'info@maoclinic.com',
        telefono: '809-555-0004',
        direccion: 'Mao',
        estado: 'activo',
        notas: 'implementacion de sistema de citas',
        montoPendiente: 0,
        cuotasVencidas: 0,
        etapaVenta: 'negociacion',
        fechaCreacion: new Date('2024-08-19'),
        cotizado: 90000,
        sistema: 'CLI-ADM',
        contactoCliente: 'Dr Sosa',
        responsable: 'GR',
        status: 'implementacion de sistema de citas',
        fechaUltimaActualizacion: new Date('2024-08-19'),
        proximoPaso: 'implementacion de sistema de citas',
        fechaProximoPaso: new Date('2024-08-14'),
        colorStatus: 'verde'
      },

      // Fila 5 - Centro Galeno Integral (Herrera) (ROJO)
      {
        id: 'cgi-001',
        nombre: 'Centro Galeno Integral (Herrera)',
        email: 'galeno@herrera.com',
        telefono: '809-555-0005',
        direccion: 'Herrera',
        estado: 'activo',
        notas: 'estan en proceso de cambio de administracion',
        montoPendiente: 0,
        cuotasVencidas: 0,
        etapaVenta: 'negociacion',
        fechaCreacion: new Date('2024-08-17'),
        cotizado: 90000,
        sistema: 'CLI-ADM',
        contactoCliente: 'Dr Lenin Luna',
        responsable: 'GR',
        status: 'estan en proceso de cambio de administracion',
        fechaUltimaActualizacion: new Date('2024-08-17'),
        proximoPaso: 'espera de confirmacion',
        fechaProximoPaso: new Date('2024-08-24'),
        colorStatus: 'rojo'
      },

      // Fila 6 - Hospital Estrella Urea (ROJO)
      {
        id: 'heu-001',
        nombre: 'Hospital Estrella Urea',
        email: 'info@estrellaurea.com',
        telefono: '809-555-0006',
        direccion: 'Santiago',
        estado: 'activo',
        notas: 'Llame al ing Henry me dijo que me iba a enviar la propuesta el 8 de enero',
        montoPendiente: 0,
        cuotasVencidas: 0,
        etapaVenta: 'negociacion',
        fechaCreacion: new Date('2024-08-17'),
        cotizado: 160000,
        sistema: 'CLI-ADM',
        contactoCliente: 'Ing Henry Cornelio',
        responsable: 'GR',
        status: 'Llame al ing Henry me dijo que me iba a enviar la propuesta el 8 de enero',
        fechaUltimaActualizacion: new Date('2024-08-17'),
        proximoPaso: 'visita al centro para saber que ha pasado',
        fechaProximoPaso: new Date('2024-08-13'),
        colorStatus: 'rojo'
      },

      // Fila 7 - Hospital Pedro Emilio Marchena (ROJO)
      {
        id: 'hpem-001',
        nombre: 'Hospital Pedro Emilio Marchena',
        email: 'marchena@hospital.com',
        telefono: '809-555-0007',
        direccion: 'Bonao',
        estado: 'activo',
        notas: 'se les envio una propuesta actualizada',
        montoPendiente: 0,
        cuotasVencidas: 0,
        etapaVenta: 'negociacion',
        fechaCreacion: new Date('2024-08-13'),
        cotizado: 160000,
        sistema: 'CLI-ADM',
        contactoCliente: 'Dr Genao',
        responsable: 'GR',
        status: 'se les envio una propuesta actualizada',
        fechaUltimaActualizacion: new Date('2024-08-13'),
        proximoPaso: 'en espera de respuesta de aprobacion',
        fechaProximoPaso: new Date('2024-08-25'),
        colorStatus: 'rojo'
      },

      // Fila 8 - COCEN SFM (VERDE)
      {
        id: 'cocen-001',
        nombre: 'COCEN SFM',
        email: 'cocen@sfm.com',
        telefono: '809-555-0008',
        direccion: 'San Francisco de Macoris',
        estado: 'activo',
        notas: 'contacto enviado',
        montoPendiente: 0,
        cuotasVencidas: 0,
        etapaVenta: 'contacto',
        fechaCreacion: new Date('2024-08-09'),
        cotizado: 25000,
        sistema: 'CLI-ADM',
        contactoCliente: 'LIC GAMALIEL',
        responsable: 'GR',
        status: 'contacto enviado',
        fechaUltimaActualizacion: new Date('2024-08-09'),
        proximoPaso: 'llamar de contacto',
        fechaProximoPaso: new Date('2024-08-27'),
        colorStatus: 'verde'
      },

      // Fila 9 - Dispensario Medico parroquial san agustin (AMARILLO)
      {
        id: 'dm-001',
        nombre: 'Dispensario Medico parroquial san agustin',
        email: 'dispensario@sanagustin.com',
        telefono: '809-555-0009',
        direccion: 'Villa Altagracia',
        estado: 'activo',
        notas: 'inicio la implementacion',
        montoPendiente: 0,
        cuotasVencidas: 0,
        etapaVenta: 'cierre',
        fechaCreacion: new Date('2024-08-21'),
        cotizado: 25000,
        sistema: 'CLI-ADM',
        contactoCliente: 'Pedro Gregorio Rivas',
        responsable: 'GR',
        status: 'inicio la implementacion',
        fechaUltimaActualizacion: new Date('2024-08-21'),
        proximoPaso: 'cierre de implementacion',
        fechaProximoPaso: new Date('2024-08-23'),
        colorStatus: 'amarillo'
      },

      // Filas AZULES (Implementados)
      // Fila 10 - Clinica Corominas Pepin (AZUL)
      {
        id: 'ccp-001',
        nombre: 'Clinica Corominas Pepin',
        email: 'corominas@pepin.com',
        telefono: '809-555-0010',
        direccion: 'Santo Domingo',
        estado: 'activo',
        notas: 'implementado y funcionando',
        montoPendiente: 0,
        cuotasVencidas: 0,
        etapaVenta: 'cierre',
        fechaCreacion: new Date('2024-08-20'),
        cotizado: 90000,
        sistema: 'CLI-ADM',
        contactoCliente: 'Dr Corominas',
        responsable: 'GR',
        status: 'implementado y funcionando',
        fechaUltimaActualizacion: new Date('2024-08-20'),
        proximoPaso: 'seguimiento mensual',
        fechaProximoPaso: new Date('2024-09-20'),
        colorStatus: 'azul'
      },

      // Fila 11 - Centro Medico Familiar Espaillat (AZUL)
      {
        id: 'cmfe-001',
        nombre: 'Centro Medico Familiar Espaillat',
        email: 'familiar@espaillat.com',
        telefono: '809-555-0011',
        direccion: 'Espaillat',
        estado: 'activo',
        notas: 'sistema funcionando correctamente',
        montoPendiente: 0,
        cuotasVencidas: 0,
        etapaVenta: 'cierre',
        fechaCreacion: new Date('2024-08-15'),
        cotizado: 90000,
        sistema: 'CLI-ADM',
        contactoCliente: 'Dr Espaillat',
        responsable: 'GR',
        status: 'sistema funcionando correctamente',
        fechaUltimaActualizacion: new Date('2024-08-15'),
        proximoPaso: 'revision trimestral',
        fechaProximoPaso: new Date('2024-11-15'),
        colorStatus: 'azul'
      },

      // Filas ROJAS adicionales
      // Fila 12 - Centro Medico Familiar Bonao (ROJO)
      {
        id: 'cmfb-001',
        nombre: 'Centro Medico Familiar Bonao',
        email: 'familiar@bonao.com',
        telefono: '809-555-0012',
        direccion: 'Bonao',
        estado: 'activo',
        notas: 'esperando respuesta de propuesta',
        montoPendiente: 0,
        cuotasVencidas: 0,
        etapaVenta: 'propuesta',
        fechaCreacion: new Date('2024-08-10'),
        cotizado: 90000,
        sistema: 'CLI-ADM',
        contactoCliente: 'Dr Bonao',
        responsable: 'GR',
        status: 'esperando respuesta de propuesta',
        fechaUltimaActualizacion: new Date('2024-08-10'),
        proximoPaso: 'seguimiento de propuesta',
        fechaProximoPaso: new Date('2024-08-30'),
        colorStatus: 'rojo'
      },

      // Fila 13 - Centro Medico Familiar Azua (ROJO)
      {
        id: 'cmfa-001',
        nombre: 'Centro Medico Familiar Azua',
        email: 'familiar@azua.com',
        telefono: '809-555-0013',
        direccion: 'Azua',
        estado: 'activo',
        notas: 'revision de propuesta pendiente',
        montoPendiente: 0,
        cuotasVencidas: 0,
        etapaVenta: 'propuesta',
        fechaCreacion: new Date('2024-08-05'),
        cotizado: 90000,
        sistema: 'CLI-ADM',
        contactoCliente: 'Dr Azua',
        responsable: 'GR',
        status: 'revision de propuesta pendiente',
        fechaUltimaActualizacion: new Date('2024-08-05'),
        proximoPaso: 'llamada de seguimiento',
        fechaProximoPaso: new Date('2024-08-28'),
        colorStatus: 'rojo'
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