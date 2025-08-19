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
        fechaCreacion: new Date('2024-08-15')
      },
      {
        id: 'cnt-002', 
        nombre: 'CLINICA DENTAL SONRISA PERFECTA',
        email: 'info@sonrisaperfecta.com',
        telefono: '809-555-0201',
        direccion: 'C/ José Amado Soler #23, Santiago',
        estado: 'activo',
        notas: 'Referido por INEMED. Clínica dental con 3 consultorios. Buscan digitalizar procesos de citas y facturación. Contacto: Dr. María Rodríguez.',
        montoPendiente: 0,
        cuotasVencidas: 0,
        etapaVenta: 'contacto',
        fechaCreacion: new Date('2024-08-18')
      },

      // ETAPA PROPUESTA - Centros evaluando nuestra oferta
      {
        id: 'prp-001',
        nombre: 'INEMED INSTITUTO MEDICO',
        email: 'direccion@inemed.com',
        telefono: '809-555-0102',
        direccion: 'Av. 27 de Febrero #1762, Bella Vista, Santo Domingo',
        estado: 'activo',
        notas: 'Propuesta técnica y económica enviada el 10/08. Incluye: Sistema ERP médico, módulo de facturación, gestión de inventario. Valor: RD$850,000. Esperando respuesta del comité directivo.',
        montoPendiente: 0,
        cuotasVencidas: 0,
        etapaVenta: 'propuesta',
        fechaCreacion: new Date('2024-07-20')
      },
      {
        id: 'prp-002',
        nombre: 'CENTRO OFTALMOLOGICO DEL CARIBE',
        email: 'admin@oftalmologico.com',
        telefono: '809-555-0301',
        direccion: 'Plaza de la Salud, Torre B, Piso 8, Santo Domingo',
        estado: 'activo',
        notas: 'Propuesta especializada para centro oftalmológico. Incluye módulo de historiales clínicos digitales y sistema de citas online. Valor: RD$650,000. Reunión de seguimiento el 22/08.',
        montoPendiente: 0,
        cuotasVencidas: 0,
        etapaVenta: 'propuesta',
        fechaCreacion: new Date('2024-07-25')
      },

      // ETAPA NEGOCIACION - Centros negociando términos y condiciones
      {
        id: 'neg-001',
        nombre: 'CLINICA DR. MONTESINO',
        email: 'dr.montesino@clinicamontesino.com',
        telefono: '809-555-0104',
        direccion: 'C/ Duarte #156, San Pedro de Macorís',
        estado: 'activo',
        notas: 'Negociando términos de pago y cronograma de implementación. Solicitan descuento del 15% y pago en 6 cuotas. Implementación gradual por módulos. Decisión final esperada para el 30/08.',
        montoPendiente: 0,
        cuotasVencidas: 0,
        etapaVenta: 'negociacion',
        fechaCreacion: new Date('2024-06-15')
      },
      {
        id: 'neg-002',
        nombre: 'POLICLINICA METROPOLITANA',
        email: 'gerencia@polimetropolitana.com',
        telefono: '809-555-0401',
        direccion: 'Av. Independencia #304, Santiago',
        estado: 'activo',
        notas: 'Negociando integración con su sistema actual de laboratorio. Requieren capacitación extendida para 25 usuarios. Ajustando cronograma de implementación a 4 meses. Valor final: RD$1,200,000.',
        montoPendiente: 0,
        cuotasVencidas: 0,
        etapaVenta: 'negociacion',
        fechaCreacion: new Date('2024-06-10')
      },

      // ETAPA CIERRE - Centros listos para firmar contrato
      {
        id: 'cls-001',
        nombre: 'HOSPITAL GENERAL DEL NORTE',
        email: 'direccion@hospitalnorte.com',
        telefono: '809-555-0105',
        direccion: 'Autopista Duarte Km 8, Puerto Plata',
        estado: 'activo',
        notas: 'Contrato aprobado por junta directiva. Firma programada para el 21/08. Implementación inicia septiembre 2024. Valor total: RD$2,500,000. Incluye soporte 24/7 primer año.',
        montoPendiente: 0,
        cuotasVencidas: 0,
        etapaVenta: 'cierre',
        fechaCreacion: new Date('2024-05-01')
      },
      {
        id: 'cls-002',
        nombre: 'CENTRO DE ESPECIALIDADES MEDICAS DEL ESTE',
        email: 'info@cemeste.com',
        telefono: '809-555-0501',
        direccion: 'Av. España #45, La Romana',
        estado: 'activo',
        notas: 'Documentos legales en revisión final. Pago inicial del 40% confirmado. Inicio de implementación: 1 de septiembre. Sistema completo con módulos de cardiología, neurología y radiología.',
        montoPendiente: 0,
        cuotasVencidas: 0,
        etapaVenta: 'cierre',
        fechaCreacion: new Date('2024-04-20')
      },

      // CLIENTES EXISTENTES (ya cerrados y facturando)
      {
        id: 'act-001',
        nombre: 'CLINICA CORAZONES UNIDOS',
        email: 'facturacion@corazonesunidos.com',
        telefono: '809-555-0601',
        direccion: 'C/ Máximo Gómez #89, Santo Domingo',
        estado: 'activo',
        notas: 'Cliente activo desde enero 2024. Sistema implementado exitosamente. Facturación mensual regular.',
        montoPendiente: 125000,
        cuotasVencidas: 2,
        etapaVenta: 'cierre', // Ya cerrado, cliente activo
        fechaCreacion: new Date('2024-01-01')
      },
      {
        id: 'act-002',
        nombre: 'CENTRO RADIOLOGICO IMAGEN TOTAL',
        email: 'admin@imagentotal.com',
        telefono: '809-555-0701',
        direccion: 'Plaza Central, Local 2B, Santiago',
        estado: 'activo',
        notas: 'Cliente activo desde febrero 2024. Especializado en radiología e imágenes médicas. Excelente historial de pagos.',
        montoPendiente: 85000,
        cuotasVencidas: 1,
        etapaVenta: 'cierre', // Ya cerrado, cliente activo
        fechaCreacion: new Date('2024-02-01')
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