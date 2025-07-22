import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storageService, type MonthlyBilling } from '../services/StorageService'

export const useBillingStore = defineStore('billing', () => {
  // State
  const billing = ref<MonthlyBilling[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const getBillingByClient = computed(() => (clientId: string) => 
    billing.value.filter(b => b.clienteId === clientId)
  )

  const getBillingByMonth = computed(() => (month: string) => 
    billing.value.filter(b => b.mes === month)
  )

  const overdueBilling = computed(() => 
    billing.value.filter(b => b.estado === 'vencido')
  )

  const pendingBilling = computed(() => 
    billing.value.filter(b => b.estado === 'pendiente')
  )

  const totalBilled = computed(() => 
    billing.value.reduce((sum, b) => sum + b.montoFacturado, 0)
  )

  const totalPaid = computed(() => 
    billing.value.reduce((sum, b) => sum + b.montoPagado, 0)
  )

  const totalPending = computed(() => 
    totalBilled.value - totalPaid.value
  )

  const paymentPercentage = computed(() => {
    if (totalBilled.value === 0) return 0
    return Math.round((totalPaid.value / totalBilled.value) * 100)
  })

  // Actions
  const loadBilling = async () => {
    loading.value = true
    error.value = null
    
    try {
      // Always use fresh sample data (localStorage is cleared in clients store)
      billing.value = getSampleBilling()
      await saveBilling()
    } catch (err) {
      error.value = 'Error al cargar facturación'
      console.error('Error loading billing:', err)
      // Fallback to sample data
      billing.value = getSampleBilling()
    } finally {
      loading.value = false
    }
  }

  const addBilling = async (billingData: Omit<MonthlyBilling, 'id'>) => {
    loading.value = true
    error.value = null

    try {
      const newBilling: MonthlyBilling = {
        ...billingData,
        id: generateId()
      }

      billing.value.push(newBilling)
      await saveBilling()
      return newBilling
    } catch (err) {
      error.value = 'Error al agregar facturación'
      console.error('Error adding billing:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateBilling = async (updatedBilling: MonthlyBilling) => {
    loading.value = true
    error.value = null

    try {
      const index = billing.value.findIndex(b => b.id === updatedBilling.id)
      if (index !== -1) {
        billing.value[index] = updatedBilling
        await saveBilling()
        return updatedBilling
      } else {
        throw new Error('Facturación no encontrada')
      }
    } catch (err) {
      error.value = 'Error al actualizar facturación'
      console.error('Error updating billing:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteBilling = async (billingId: string) => {
    loading.value = true
    error.value = null

    try {
      billing.value = billing.value.filter(b => b.id !== billingId)
      await saveBilling()
    } catch (err) {
      error.value = 'Error al eliminar facturación'
      console.error('Error deleting billing:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const markAsPaid = async (billingId: string, paymentAmount: number, paymentDate: Date) => {
    loading.value = true
    error.value = null

    try {
      const billingItem = billing.value.find(b => b.id === billingId)
      if (billingItem) {
        billingItem.montoPagado = paymentAmount
        billingItem.fechaUltimoPago = paymentDate
        billingItem.estado = paymentAmount >= billingItem.montoFacturado ? 'pagado' : 'pendiente'
        await saveBilling()
        return billingItem
      } else {
        throw new Error('Facturación no encontrada')
      }
    } catch (err) {
      error.value = 'Error al marcar como pagado'
      console.error('Error marking as paid:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const saveBilling = async () => {
    try {
      storageService.saveBilling(billing.value)
    } catch (err) {
      console.error('Error saving billing:', err)
      throw err
    }
  }

  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  const getSampleBilling = (): MonthlyBilling[] => {
    return [
      // CENTRO MEDICO CAROLINA DE JESUS (Cliente 1) - 4 facturas de 40,000
      {
        id: '1',
        clienteId: '1',
        mes: '2024-01',
        montoFacturado: 40000,
        montoPagado: 0,
        fechaUltimoPago: null,
        fechaVencimiento: new Date('2024-01-31'),
        cuotasVencidas: 15,
        fechaCompromiso: null,
        estado: 'vencido',
        notas: 'Primera facturación del año'
      },
      {
        id: '2',
        clienteId: '1',
        mes: '2024-02',
        montoFacturado: 40000,
        montoPagado: 20000,
        fechaUltimoPago: new Date('2024-02-15'),
        fechaVencimiento: new Date('2024-02-29'),
        cuotasVencidas: 8,
        fechaCompromiso: new Date('2024-07-15'),
        estado: 'pendiente',
        notas: 'Pago parcial realizado'
      },
      {
        id: '3',
        clienteId: '1',
        mes: '2024-03',
        montoFacturado: 40000,
        montoPagado: 40000,
        fechaUltimoPago: new Date('2024-03-10'),
        fechaVencimiento: new Date('2024-03-31'),
        cuotasVencidas: 0,
        fechaCompromiso: null,
        estado: 'pagado',
        notas: 'Pago completo realizado'
      },
      {
        id: '4',
        clienteId: '1',
        mes: '2024-04',
        montoFacturado: 40000,
        montoPagado: 0,
        fechaUltimoPago: null,
        fechaVencimiento: new Date('2024-04-30'),
        cuotasVencidas: 5,
        fechaCompromiso: new Date('2024-07-20'),
        estado: 'pendiente',
        notas: 'Pendiente de pago'
      },
      
      // INEMED (Cliente 2) - 2 facturas de 60,000
      {
        id: '5',
        clienteId: '2',
        mes: '2024-01',
        montoFacturado: 60000,
        montoPagado: 0,
        fechaUltimoPago: null,
        fechaVencimiento: new Date('2024-01-31'),
        cuotasVencidas: 22,
        fechaCompromiso: new Date('2024-07-08'),
        estado: 'vencido',
        notas: 'Cliente con múltiples cuotas vencidas'
      },
      {
        id: '6',
        clienteId: '2',
        mes: '2024-02',
        montoFacturado: 60000,
        montoPagado: 60000,
        fechaUltimoPago: new Date('2024-02-20'),
        fechaVencimiento: new Date('2024-02-29'),
        cuotasVencidas: 0,
        fechaCompromiso: null,
        estado: 'pagado',
        notas: 'Pago completo realizado'
      },
      
      // CLINICA DR MONTESINO (Cliente 3) - 3 facturas de 50,000
      {
        id: '7',
        clienteId: '3',
        mes: '2024-01',
        montoFacturado: 50000,
        montoPagado: 0,
        fechaUltimoPago: null,
        fechaVencimiento: new Date('2024-01-31'),
        cuotasVencidas: 10,
        fechaCompromiso: new Date('2024-07-06'),
        estado: 'vencido',
        notas: 'Cliente cancelado - factura vencida'
      },
      {
        id: '8',
        clienteId: '3',
        mes: '2024-02',
        montoFacturado: 50000,
        montoPagado: 0,
        fechaUltimoPago: null,
        fechaVencimiento: new Date('2024-02-29'),
        cuotasVencidas: 8,
        fechaCompromiso: null,
        estado: 'vencido',
        notas: 'Cliente cancelado - factura vencida'
      },
      {
        id: '9',
        clienteId: '3',
        mes: '2024-03',
        montoFacturado: 50000,
        montoPagado: 0,
        fechaUltimoPago: null,
        fechaVencimiento: new Date('2024-03-31'),
        cuotasVencidas: 6,
        fechaCompromiso: null,
        estado: 'vencido',
        notas: 'Cliente cancelado - factura vencida'
      }
    ]
  }

  return {
    // State
    billing,
    loading,
    error,
    
    // Getters
    getBillingByClient,
    getBillingByMonth,
    overdueBilling,
    pendingBilling,
    totalBilled,
    totalPaid,
    totalPending,
    paymentPercentage,
    
    // Actions
    loadBilling,
    addBilling,
    updateBilling,
    deleteBilling,
    markAsPaid,
    saveBilling
  }
})