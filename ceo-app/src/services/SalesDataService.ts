import centrosMedicosData from '../data/centros-medicos.json';

export interface ContactoCliente {
  nombre: string;
  cargo: string;
  telefono: string;
  email: string;
  esDecisionPrincipal: boolean;
}

export interface InteraccionCliente {
  fecha: string;
  tipo: 'Llamada' | 'Reunión' | 'Email' | 'Propuesta' | 'Negociación' | 'Contrato' | 'Referido';
  descripcion: string;
  resultado: string;
}

export interface InformacionGeneral {
  nombre: string;
  tipoEstablecimiento: string;
  especialidades: string[];
  numeroConsultorios: number;
  numeroMedicos: number;
  pacientesMensuales: number;
  añosOperacion: number;
}

export interface CentroMedicoDetallado {
  id: string;
  informacionGeneral: InformacionGeneral;
  contactos: ContactoCliente[];
  historialInteracciones: InteraccionCliente[];
  necesidades: string[];
  presupuestoEstimado: number;
  probabilidadCierre: number;
  fechaEstimadaCierre: string;
}

export interface MetricasVentas {
  totalProspectos: number;
  valorTotalPipeline: number;
  promedioTiempoCierre: number;
  tasaConversionGeneral: number;
  etapas: {
    [key: string]: {
      cantidad: number;
      valor: number;
      tasaConversion: number;
    };
  };
}

class SalesDataService {
  private centrosData: { [key: string]: CentroMedicoDetallado };
  private metricas: MetricasVentas;

  constructor() {
    this.centrosData = centrosMedicosData.centrosMedicos;
    this.metricas = centrosMedicosData.metricas;
  }

  // Obtener información detallada de un centro
  getCentroDetallado(clienteId: string): CentroMedicoDetallado | null {
    return this.centrosData[clienteId] || null;
  }

  // Obtener todos los centros
  getAllCentros(): CentroMedicoDetallado[] {
    return Object.values(this.centrosData);
  }

  // Obtener centros por etapa
  getCentrosPorEtapa(etapa: string): CentroMedicoDetallado[] {
    return Object.values(this.centrosData).filter(centro => {
      // Mapear etapas basado en el ID del centro
      if (centro.id.startsWith('cnt-')) return etapa === 'contacto';
      if (centro.id.startsWith('prp-')) return etapa === 'propuesta';
      if (centro.id.startsWith('neg-')) return etapa === 'negociacion';
      if (centro.id.startsWith('cls-')) return etapa === 'cierre';
      return false;
    });
  }

  // Obtener métricas de ventas
  getMetricasVentas(): MetricasVentas {
    return this.metricas;
  }

  // Obtener contacto principal de un centro
  getContactoPrincipal(clienteId: string): ContactoCliente | null {
    const centro = this.getCentroDetallado(clienteId);
    if (!centro) return null;
    
    return centro.contactos.find(contacto => contacto.esDecisionPrincipal) || centro.contactos[0] || null;
  }

  // Obtener última interacción de un centro
  getUltimaInteraccion(clienteId: string): InteraccionCliente | null {
    const centro = this.getCentroDetallado(clienteId);
    if (!centro || centro.historialInteracciones.length === 0) return null;
    
    // Ordenar por fecha y obtener la más reciente
    const interacciones = [...centro.historialInteracciones].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
    
    return interacciones[0];
  }

  // Agregar nueva interacción
  agregarInteraccion(clienteId: string, interaccion: Omit<InteraccionCliente, 'fecha'>): boolean {
    const centro = this.centrosData[clienteId];
    if (!centro) return false;

    const nuevaInteraccion: InteraccionCliente = {
      ...interaccion,
      fecha: new Date().toISOString().split('T')[0] // Formato YYYY-MM-DD
    };

    centro.historialInteracciones.push(nuevaInteraccion);
    return true;
  }

  // Actualizar probabilidad de cierre
  actualizarProbabilidadCierre(clienteId: string, nuevaProbabilidad: number): boolean {
    const centro = this.centrosData[clienteId];
    if (!centro) return false;

    centro.probabilidadCierre = Math.max(0, Math.min(100, nuevaProbabilidad));
    return true;
  }

  // Calcular valor total por etapa
  getValorTotalPorEtapa(etapa: string): number {
    const centros = this.getCentrosPorEtapa(etapa);
    return centros.reduce((total, centro) => total + centro.presupuestoEstimado, 0);
  }

  // Obtener próximas actividades (basado en fechas estimadas de cierre)
  getProximasActividades(): Array<{
    clienteId: string;
    nombreCliente: string;
    fechaEstimada: string;
    diasRestantes: number;
    probabilidad: number;
  }> {
    const hoy = new Date();
    
    return Object.values(this.centrosData)
      .map(centro => {
        const fechaCierre = new Date(centro.fechaEstimadaCierre);
        const diasRestantes = Math.ceil((fechaCierre.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          clienteId: centro.id,
          nombreCliente: centro.informacionGeneral.nombre,
          fechaEstimada: centro.fechaEstimadaCierre,
          diasRestantes,
          probabilidad: centro.probabilidadCierre
        };
      })
      .filter(actividad => actividad.diasRestantes >= 0 && actividad.diasRestantes <= 30)
      .sort((a, b) => a.diasRestantes - b.diasRestantes);
  }

  // Generar reporte de pipeline
  getReportePipeline(): {
    totalValor: number;
    valorPonderado: number;
    distribucionPorEtapa: Array<{
      etapa: string;
      cantidad: number;
      valor: number;
      porcentaje: number;
    }>;
  } {
    const etapas = ['contacto', 'propuesta', 'negociacion', 'cierre'];
    const totalValor = Object.values(this.centrosData).reduce(
      (total, centro) => total + centro.presupuestoEstimado, 0
    );
    
    const valorPonderado = Object.values(this.centrosData).reduce(
      (total, centro) => total + (centro.presupuestoEstimado * centro.probabilidadCierre / 100), 0
    );

    const distribucionPorEtapa = etapas.map(etapa => {
      const centros = this.getCentrosPorEtapa(etapa);
      const valor = centros.reduce((sum, centro) => sum + centro.presupuestoEstimado, 0);
      
      return {
        etapa,
        cantidad: centros.length,
        valor,
        porcentaje: totalValor > 0 ? (valor / totalValor) * 100 : 0
      };
    });

    return {
      totalValor,
      valorPonderado,
      distribucionPorEtapa
    };
  }

  // Buscar centros por criterio
  buscarCentros(criterio: string): CentroMedicoDetallado[] {
    const criterioBajo = criterio.toLowerCase();
    
    return Object.values(this.centrosData).filter(centro => 
      centro.informacionGeneral.nombre.toLowerCase().includes(criterioBajo) ||
      centro.informacionGeneral.especialidades.some(esp => 
        esp.toLowerCase().includes(criterioBajo)
      ) ||
      centro.contactos.some(contacto => 
        contacto.nombre.toLowerCase().includes(criterioBajo) ||
        contacto.email.toLowerCase().includes(criterioBajo)
      )
    );
  }
}

// Exportar instancia singleton
export const salesDataService = new SalesDataService();
export default salesDataService;