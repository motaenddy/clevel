export interface EmployeeTask {
  id: string
  titulo: string
  descripcion?: string
  prioridad: 'baja' | 'media' | 'alta'
  estado: 'pendiente' | 'en_progreso' | 'completada'
  fechaCreacion: Date
  fechaVencimiento?: Date
  fechaCompletado?: Date
  asignadoPor?: string // ID del usuario/CEO
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
  supervisor?: string // ID del supervisor
  direccion?: string
  documentoIdentidad?: string
  fechaNacimiento?: Date
  notas?: string
  actividadActual?: string
  actividadActualUpdatedAt?: Date
  habilidades: string[]
  proyectos: string[]
  evaluaciones: EmployeeEvaluation[]
  tareas: EmployeeTask[]
}

export interface EmployeeEvaluation {
  id: string
  fecha: Date
  evaluador: string // ID del evaluador
  calificacion: number // 1-5
  comentarios: string
  areasMejora: string[]
  areasFortaleza: string[]
}

export interface Department {
  id: string
  nombre: string
  descripcion: string
  jefeDepartamento?: string // ID del empleado
  presupuesto?: number
  empleados: string[] // IDs de empleados
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

export interface EmployeeFilter {
  departamento?: string
  estado?: string
  cargo?: string
  fechaContratacion?: {
    desde: Date
    hasta: Date
  }
  salario?: {
    minimo: number
    maximo: number
  }
} 