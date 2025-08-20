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
      // ETAPA CONTACTO - Centros recién identificados
      {
        id: 'cnt-001',
        nombre: 'CENTRO MEDICO CAROLINA DE JESUS',
        email: 'carolina@centromedico.com',
        telefono: '809-555-0101',
        direccion: 'Av. Winston Churchill #47, Piantini, Santo Domingo',
        estado: 'activo',
        notas: 'Contacto inicial realizado. Centro especializado en medicina general y pediatría. Interesados en sistema de gestión completo. Próxima reunión programada para el 25/08.',
        montoPendiente: 0,
        cuotasVencidas: 0,
        etapaVenta: 'contacto',
        fechaCreacion: new Date('2024-08-15'),
        // Nuevos campos del Excel
        cotizado: 45000,
        sistema: 'CLI-ADM',
        contactoCliente: 'Dra Edilia',
        responsable: 'GR',
        status: 'Propuesta enviada',
        fechaUltimaActualizacion: new Date('2024-08-21'),
        proximoPaso: 'en espera de respuesta de aprobación',
        fechaProximoPaso: new Date('2024-08-24'),
        colorStatus: 'rojo'
      },
      {
        id: 'cnt-002', 
        nombre: 'Dr Grullon',
        email: 'info@drgrullon.com',
        telefono: '809-555-0201',
        direccion: 'Santiago',
        estado: 'activo',
        notas: 'Datos actualizados',
        montoPendiente: 0,
        cuotasVencidas: 0,
        etapaVenta: 'propuesta',
        fechaCreacion: new Date('2024-08-18'),
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

      // ETAPA PROPUESTA - Centros evaluando nuestra oferta
      {
        id: 'prp-001',
        nombre: 'Mao clinic',
        email: 'info@maoclinic.com',
        telefono: '809-555-0102',
        direccion: 'Mao',
        estado: 'activo',
        notas: 'enviar levantamiento tecnico',
        montoPendiente: 0,
        cuotasVencidas: 0,
        etapaVenta: 'propuesta',
        fechaCreacion: new Date('2024-07-20'),
        cotizado: 90000,
        sistema: 'CLI-ADM',
        contactoCliente: 'ING. Carlos Manuel',
        responsable: 'GR',
        status: 'enviar levantamiento tecnico',
        fechaUltimaActualizacion: new Date('2024-08-18'),
        proximoPaso: 'inicio de entrenamientos',
        fechaProximoPaso: new Date('2024-08-14'),
        colorStatus: 'amarillo'
      },
      {
        id: 'prp-002',
        nombre: 'Centro Galeno Integral (Herrera)',
        email: 'admin@galenoint.com',
        telefono: '809-555-0301',
        direccion: 'Herrera',
        estado: 'activo',
        notas: 'estan en proceso de cambio de administracion',
        montoPendiente: 0,
        cuotasVencidas: 0,
        etapaVenta: 'negociacion',
        fechaCreacion: new Date('2024-07-25'),
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

      // ETAPA NEGOCIACION - Centros negociando términos y condiciones
      {
        id: 'neg-001',
        nombre: 'Hospital Estrella Urea',
        email: 'info@estrellaurea.com',
        telefono: '809-555-0104',
        direccion: 'Santiago',
        estado: 'activo',
        notas: 'Llame al ing Henry me dijo que me iba a enviar la propuesta el 8 de enero',
        montoPendiente: 0,
        cuotasVencidas: 0,
        etapaVenta: 'negociacion',
        fechaCreacion: new Date('2024-06-15'),
        cotizado: 150000,
        sistema: 'CLI-ADM',
        contactoCliente: 'Ing Henry Cornelio',
        responsable: 'GR',
        status: 'Llame al ing Henry me dijo que me iba a enviar la propuesta el 8 de enero',
        fechaUltimaActualizacion: new Date('2024-08-17'),
        proximoPaso: 'visita al centro para saber que ha pasado',
        fechaProximoPaso: new Date('2024-08-13'),
        colorStatus: 'rojo'
      },
      {
        id: 'neg-002',
        nombre: 'Hospital Pedro Emilio Marchena',
        email: 'info@marchena.com',
        telefono: '809-555-0401',
        direccion: 'Bonao',
        estado: 'activo',
        notas: 'se les envio una propuesta actualizada',
        montoPendiente: 0,
        cuotasVencidas: 0,
        etapaVenta: 'negociacion',
        fechaCreacion: new Date('2024-06-10'),
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

      // ETAPA CIERRE - Centros listos para firmar contrato
      {
        id: 'cls-001',
        nombre: 'COCEN SFM',
        email: 'info@cocensfm.com',
        telefono: '809-555-0105',
        direccion: 'San Francisco de Macoris',
        estado: 'activo',
        notas: 'contacto enviado',
        montoPendiente: 0,
        cuotasVencidas: 0,
        etapaVenta: 'contacto',
        fechaCreacion: new Date('2024-05-01'),
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
      {
        id: 'cls-002',
        nombre: 'Dispensario Medico parroquial san agustin',
        email: 'info@sanagustin.com',
        telefono: '809-555-0501',
        direccion: 'Villa Altagracia',
        estado: 'activo',
        notas: 'inicio la implementacion',
        montoPendiente: 0,
        cuotasVencidas: 0,
        etapaVenta: 'cierre',
        fechaCreacion: new Date('2024-04-20'),
        cotizado: 25000,
        sistema: 'CLI-ADM',
        contactoCliente: 'Pedro Gregorio Rivas',
        responsable: 'GR',
        status: 'inicio la implementacion',
        fechaUltimaActualizacion: new Date('2024-08-21'),
        proximoPaso: 'cierre de implementacion',
        fechaProximoPaso: new Date('2024-08-23'),
        colorStatus: 'amarillo'
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