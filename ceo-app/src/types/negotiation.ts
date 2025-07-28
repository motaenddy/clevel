export interface SubStage {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  completedDate?: Date;
  notes: string;
  order: number;
}

export interface NegotiationStage {
  id: string;
  name: string;
  order: number;
  color: string;
  icon: string;
  description: string;
  subStages: SubStage[];
  notes?: string; // Notas opcionales para la etapa
}

export interface Negotiation {
  id: string;
  clientId: string;
  currentStage: string;
  stages: NegotiationStage[];
  startDate: Date;
  lastUpdate: Date;
  expectedCloseDate?: Date;
  actualCloseDate?: Date;
  notes: string;
  probability: number; // 0-100%
  estimatedValue: number;
  actualValue?: number;
  stageDates: Record<string, Date>; // Fechas por etapa
}

export interface NegotiationHistory {
  id: string;
  negotiationId: string;
  stageId: string;
  stageName: string;
  date: Date;
  notes: string;
  userId: string;
}

// Etapas predefinidas del pipeline de ventas
export const DEFAULT_NEGOTIATION_STAGES: NegotiationStage[] = [
  {
    id: 'contact',
    name: 'Contacto',
    order: 1,
    color: '#6c757d',
    icon: 'person',
    description: 'Primer contacto con el cliente',
    subStages: [
      {
        id: 'contact_1',
        name: 'Identificar prospecto',
        description: 'Identificar y validar el prospecto',
        completed: false,
        notes: '',
        order: 1
      },
      {
        id: 'contact_2',
        name: 'Primer contacto',
        description: 'Realizar primer contacto telefónico o email',
        completed: false,
        notes: '',
        order: 2
      },
      {
        id: 'contact_3',
        name: 'Agendar reunión',
        description: 'Programar reunión inicial',
        completed: false,
        notes: '',
        order: 3
      },
      {
        id: 'contact_4',
        name: 'Reunión inicial',
        description: 'Realizar reunión de descubrimiento',
        completed: false,
        notes: '',
        order: 4
      }
    ]
  },
  {
    id: 'proposal',
    name: 'Propuesta Enviada',
    order: 2,
    color: '#007bff',
    icon: 'document-text',
    description: 'Propuesta comercial enviada',
    subStages: [
      {
        id: 'proposal_1',
        name: 'Análisis de necesidades',
        description: 'Analizar requerimientos del cliente',
        completed: false,
        notes: '',
        order: 1
      },
      {
        id: 'proposal_2',
        name: 'Elaborar propuesta',
        description: 'Crear propuesta comercial personalizada',
        completed: false,
        notes: '',
        order: 2
      },
      {
        id: 'proposal_3',
        name: 'Revisar propuesta',
        description: 'Revisar y aprobar propuesta internamente',
        completed: false,
        notes: '',
        order: 3
      },
      {
        id: 'proposal_4',
        name: 'Enviar propuesta',
        description: 'Enviar propuesta al cliente',
        completed: false,
        notes: '',
        order: 4
      }
    ]
  },
  {
    id: 'negotiation',
    name: 'Negociación',
    order: 3,
    color: '#ffc107',
    icon: 'chatbubbles',
    description: 'En proceso de negociación',
    subStages: [
      {
        id: 'negotiation_1',
        name: 'Presentar propuesta',
        description: 'Presentar propuesta al cliente',
        completed: false,
        notes: '',
        order: 1
      },
      {
        id: 'negotiation_2',
        name: 'Recibir feedback',
        description: 'Recibir comentarios y ajustes del cliente',
        completed: false,
        notes: '',
        order: 2
      },
      {
        id: 'negotiation_3',
        name: 'Ajustar propuesta',
        description: 'Realizar ajustes según feedback',
        completed: false,
        notes: '',
        order: 3
      },
      {
        id: 'negotiation_4',
        name: 'Negociar términos',
        description: 'Negociar precio, plazos y condiciones',
        completed: false,
        notes: '',
        order: 4
      }
    ]
  },
  {
    id: 'closing',
    name: 'Cierre',
    order: 4,
    color: '#90EE90',
    icon: 'checkmark-circle',
    description: 'Negociación cerrada',
    subStages: [
      {
        id: 'closing_1',
        name: 'Acuerdo final',
        description: 'Llegar a acuerdo final con el cliente',
        completed: false,
        notes: '',
        order: 1
      },
      {
        id: 'closing_2',
        name: 'Preparar contrato',
        description: 'Elaborar contrato o acuerdo',
        completed: false,
        notes: '',
        order: 2
      },
      {
        id: 'closing_3',
        name: 'Firmar contrato',
        description: 'Firmar contrato con el cliente',
        completed: false,
        notes: '',
        order: 3
      },
      {
        id: 'closing_4',
        name: 'Confirmar cierre',
        description: 'Confirmar cierre de la negociación',
        completed: false,
        notes: '',
        order: 4
      }
    ]
  },
  {
    id: 'implementation_invoice',
    name: 'Factura Implementación',
    order: 5,
    color: '#17a2b8',
    icon: 'card',
    description: 'Factura de implementación enviada',
    subStages: [
      {
        id: 'implementation_invoice_1',
        name: 'Generar factura',
        description: 'Crear factura de implementación',
        completed: false,
        notes: '',
        order: 1
      },
      {
        id: 'implementation_invoice_2',
        name: 'Revisar factura',
        description: 'Revisar detalles de la factura',
        completed: false,
        notes: '',
        order: 2
      },
      {
        id: 'implementation_invoice_3',
        name: 'Enviar factura',
        description: 'Enviar factura al cliente',
        completed: false,
        notes: '',
        order: 3
      },
      {
        id: 'implementation_invoice_4',
        name: 'Confirmar recepción',
        description: 'Confirmar recepción de la factura',
        completed: false,
        notes: '',
        order: 4
      }
    ]
  },
  {
    id: 'implementation_started',
    name: 'Implementación Iniciada',
    order: 6,
    color: '#fd7e14',
    icon: 'play-circle',
    description: 'Implementación en curso',
    subStages: [
      {
        id: 'implementation_started_1',
        name: 'Planificar implementación',
        description: 'Crear plan de implementación',
        completed: false,
        notes: '',
        order: 1
      },
      {
        id: 'implementation_started_2',
        name: 'Asignar equipo',
        description: 'Asignar recursos para implementación',
        completed: false,
        notes: '',
        order: 2
      },
      {
        id: 'implementation_started_3',
        name: 'Iniciar implementación',
        description: 'Comenzar proceso de implementación',
        completed: false,
        notes: '',
        order: 3
      },
      {
        id: 'implementation_started_4',
        name: 'Seguimiento inicial',
        description: 'Realizar seguimiento inicial del progreso',
        completed: false,
        notes: '',
        order: 4
      }
    ]
  },
  {
    id: 'implementation_completed',
    name: 'Implementación Finalizada',
    order: 7,
    color: '#98FB98',
    icon: 'checkmark-done-circle',
    description: 'Implementación completada',
    subStages: [
      {
        id: 'implementation_completed_1',
        name: 'Finalizar implementación',
        description: 'Completar proceso de implementación',
        completed: false,
        notes: '',
        order: 1
      },
      {
        id: 'implementation_completed_2',
        name: 'Pruebas finales',
        description: 'Realizar pruebas de funcionamiento',
        completed: false,
        notes: '',
        order: 2
      },
      {
        id: 'implementation_completed_3',
        name: 'Entrenamiento cliente',
        description: 'Capacitar al cliente en el uso',
        completed: false,
        notes: '',
        order: 3
      },
      {
        id: 'implementation_completed_4',
        name: 'Entrega final',
        description: 'Entregar proyecto al cliente',
        completed: false,
        notes: '',
        order: 4
      }
    ]
  },
  {
    id: 'post_implementation',
    name: 'Seguimiento Post-Implementación',
    order: 8,
    color: '#6f42c1',
    icon: 'trending-up',
    description: 'Seguimiento y soporte continuo',
    subStages: [
      {
        id: 'post_implementation_1',
        name: 'Seguimiento inicial',
        description: 'Realizar seguimiento inicial post-entrega',
        completed: false,
        notes: '',
        order: 1
      },
      {
        id: 'post_implementation_2',
        name: 'Soporte técnico',
        description: 'Brindar soporte técnico al cliente',
        completed: false,
        notes: '',
        order: 2
      },
      {
        id: 'post_implementation_3',
        name: 'Recopilar feedback',
        description: 'Recopilar feedback del cliente',
        completed: false,
        notes: '',
        order: 3
      },
      {
        id: 'post_implementation_4',
        name: 'Planificar mejoras',
        description: 'Planificar mejoras basadas en feedback',
        completed: false,
        notes: '',
        order: 4
      }
    ]
  }
]; 