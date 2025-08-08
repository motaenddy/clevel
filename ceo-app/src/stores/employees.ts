import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storageService } from '../services/StorageService'
import type { Employee, EmployeeFilter, Department, Position, EmployeeTask } from '../types/employee'

export const useEmployeesStore = defineStore('employees', () => {
  // State
  const employees = ref<Employee[]>([])
  const departments = ref<Department[]>([])
  const positions = ref<Position[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const activeEmployees = computed(() => 
    employees.value.filter(emp => emp.estado === 'activo')
  )

  const employeesByDepartment = computed(() => (deptId: string) =>
    employees.value.filter(emp => emp.departamento === deptId)
  )

  const getEmployeeById = (id: string) =>
    employees.value.find(emp => emp.id === id)

  const getDepartmentById = (id: string) =>
    departments.value.find(dept => dept.id === id)

  const getPositionById = (id: string) =>
    positions.value.find(pos => pos.id === id)

  const totalEmployees = computed(() => employees.value.length)

  const totalSalary = computed(() =>
    employees.value.reduce((sum, emp) => sum + emp.salario, 0)
  )

  const averageSalary = computed(() => {
    if (employees.value.length === 0) return 0
    return totalSalary.value / employees.value.length
  })

  const employeesByStatus = computed(() => {
    const statusCount = {
      activo: 0,
      inactivo: 0,
      vacaciones: 0,
      licencia: 0
    }
    
    employees.value.forEach(emp => {
      statusCount[emp.estado]++
    })
    
    return statusCount
  })

  const getTasksByEmployee = (employeeId: string): EmployeeTask[] => {
    const employee = getEmployeeById(employeeId)
    return employee ? employee.tareas : []
  }

  const getPendingTaskCount = (employeeId: string): number => {
    return getTasksByEmployee(employeeId).filter(t => t.estado !== 'completada').length
  }

  const getOldestPendingTask = (employeeId: string) => {
    const tasks = getTasksByEmployee(employeeId).filter(t => t.estado !== 'completada')
    if (tasks.length === 0) return null
    return tasks.reduce((oldest, current) =>
      current.fechaCreacion < oldest.fechaCreacion ? current : oldest
    )
  }

  // Actions
  const loadEmployees = async () => {
    loading.value = true
    error.value = null
    
    try {
      storageService.clearEmployeeData()
      employees.value = getSampleEmployees()
      departments.value = getSampleDepartments()
      positions.value = getSamplePositions()
      await saveEmployees()
    } catch (err) {
      error.value = 'Error al cargar empleados'
      console.error('Error loading employees:', err)
      employees.value = getSampleEmployees()
      departments.value = getSampleDepartments()
      positions.value = getSamplePositions()
    } finally {
      loading.value = false
    }
  }

  const addEmployee = async (employee: Omit<Employee, 'id' | 'evaluaciones' | 'tareas'>) => {
    loading.value = true
    error.value = null

    try {
      const newEmployee: Employee = {
        ...employee,
        id: generateId(),
        evaluaciones: [],
        tareas: []
      }

      employees.value.push(newEmployee)
      await saveEmployees()
      return newEmployee
    } catch (err) {
      error.value = 'Error al agregar empleado'
      console.error('Error adding employee:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateEmployee = async (updatedEmployee: Employee) => {
    loading.value = true
    error.value = null

    try {
      const index = employees.value.findIndex(emp => emp.id === updatedEmployee.id)
      if (index !== -1) {
        employees.value[index] = updatedEmployee
        await saveEmployees()
        return updatedEmployee
      } else {
        throw new Error('Empleado no encontrado')
      }
    } catch (err) {
      error.value = 'Error al actualizar empleado'
      console.error('Error updating employee:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteEmployee = async (employeeId: string) => {
    loading.value = true
    error.value = null

    try {
      employees.value = employees.value.filter(emp => emp.id !== employeeId)
      await saveEmployees()
    } catch (err) {
      error.value = 'Error al eliminar empleado'
      console.error('Error deleting employee:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const addTask = async (employeeId: string, taskInput: Omit<EmployeeTask, 'id' | 'fechaCreacion' | 'estado'>) => {
    const employee = getEmployeeById(employeeId)
    if (!employee) throw new Error('Empleado no encontrado')

    const newTask: EmployeeTask = {
      ...taskInput,
      id: generateId(),
      fechaCreacion: new Date(),
      estado: 'pendiente'
    }

    employee.tareas.unshift(newTask)
    await saveEmployees()
    return newTask
  }

  const updateTask = async (employeeId: string, updatedTask: EmployeeTask) => {
    const employee = getEmployeeById(employeeId)
    if (!employee) throw new Error('Empleado no encontrado')

    const idx = employee.tareas.findIndex(t => t.id === updatedTask.id)
    if (idx === -1) throw new Error('Tarea no encontrada')

    employee.tareas[idx] = { ...updatedTask }
    await saveEmployees()
    return employee.tareas[idx]
  }

  const updateTaskStatus = async (employeeId: string, taskId: string, newStatus: EmployeeTask['estado']) => {
    const employee = getEmployeeById(employeeId)
    if (!employee) throw new Error('Empleado no encontrado')

    const task = employee.tareas.find(t => t.id === taskId)
    if (!task) throw new Error('Tarea no encontrada')

    task.estado = newStatus
    task.fechaCompletado = newStatus === 'completada' ? new Date() : undefined
    await saveEmployees()
    return task
  }

  const deleteTask = async (employeeId: string, taskId: string) => {
    const employee = getEmployeeById(employeeId)
    if (!employee) throw new Error('Empleado no encontrado')

    employee.tareas = employee.tareas.filter(t => t.id !== taskId)
    await saveEmployees()
  }

  const setCurrentActivity = async (employeeId: string, activity: string) => {
    const employee = getEmployeeById(employeeId)
    if (!employee) throw new Error('Empleado no encontrado')
    employee.actividadActual = activity
    employee.actividadActualUpdatedAt = new Date()
    await saveEmployees()
    return employee
  }

  const filterEmployees = (filters: EmployeeFilter) => {
    let filtered = employees.value

    if (filters.departamento) {
      filtered = filtered.filter(emp => emp.departamento === filters.departamento)
    }

    if (filters.estado) {
      filtered = filtered.filter(emp => emp.estado === filters.estado)
    }

    if (filters.cargo) {
      filtered = filtered.filter(emp => emp.cargo.toLowerCase().includes(filters.cargo!.toLowerCase()))
    }

    if (filters.fechaContratacion) {
      filtered = filtered.filter(emp => {
        const fecha = new Date(emp.fechaContratacion)
        return fecha >= filters.fechaContratacion!.desde && fecha <= filters.fechaContratacion!.hasta
      })
    }

    if (filters.salario) {
      filtered = filtered.filter(emp => 
        emp.salario >= filters.salario!.minimo && emp.salario <= filters.salario!.maximo
      )
    }

    return filtered
  }

  const saveEmployees = async () => {
    try {
      storageService.saveEmployees(employees.value)
      storageService.saveDepartments(departments.value)
      storageService.savePositions(positions.value)
    } catch (err) {
      console.error('Error saving employees:', err)
      throw err
    }
  }

  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  const getSampleEmployees = (): Employee[] => {
    return [
      {
        id: '1',
        nombre: 'María',
        apellido: 'González',
        email: 'maria.gonzalez@empresa.com',
        telefono: '809-555-0101',
        cargo: 'CEO',
        departamento: 'Dirección Ejecutiva',
        fechaContratacion: new Date('2020-01-15'),
        salario: 150000,
        estado: 'activo',
        direccion: 'Santo Domingo, RD',
        documentoIdentidad: '402-1234567-8',
        fechaNacimiento: new Date('1985-03-20'),
        notas: 'Fundadora de la empresa',
        actividadActual: 'Revisión de KPIs',
        habilidades: ['Liderazgo', 'Estrategia', 'Finanzas', 'Gestión'],
        proyectos: ['Expansión Regional', 'Digitalización'],
        evaluaciones: [],
        tareas: []
      },
      {
        id: '2',
        nombre: 'Carlos',
        apellido: 'Rodríguez',
        email: 'carlos.rodriguez@empresa.com',
        telefono: '809-555-0102',
        cargo: 'Director de Ventas',
        departamento: 'Ventas',
        fechaContratacion: new Date('2021-03-10'),
        salario: 85000,
        estado: 'activo',
        supervisor: '1',
        direccion: 'Santiago, RD',
        documentoIdentidad: '402-2345678-9',
        fechaNacimiento: new Date('1988-07-15'),
        notas: 'Excelente track record en ventas',
        actividadActual: 'Llamadas a clientes clave',
        habilidades: ['Ventas', 'Negociación', 'Gestión de Equipos'],
        proyectos: ['Expansión Regional'],
        evaluaciones: [],
        tareas: []
      },
      {
        id: '3',
        nombre: 'Ana',
        apellido: 'Martínez',
        email: 'ana.martinez@empresa.com',
        telefono: '809-555-0103',
        cargo: 'Contadora Senior',
        departamento: 'Finanzas',
        fechaContratacion: new Date('2021-06-20'),
        salario: 65000,
        estado: 'activo',
        supervisor: '1',
        direccion: 'Santo Domingo, RD',
        documentoIdentidad: '402-3456789-0',
        fechaNacimiento: new Date('1990-11-08'),
        notas: 'Especialista en contabilidad empresarial',
        actividadActual: 'Conciliación bancaria',
        habilidades: ['Contabilidad', 'Análisis Financiero', 'Excel'],
        proyectos: ['Auditoría Anual'],
        evaluaciones: [],
        tareas: []
      },
      {
        id: '4',
        nombre: 'Luis',
        apellido: 'Hernández',
        email: 'luis.hernandez@empresa.com',
        telefono: '809-555-0104',
        cargo: 'Desarrollador Full Stack',
        departamento: 'Tecnología',
        fechaContratacion: new Date('2022-01-15'),
        salario: 75000,
        estado: 'activo',
        supervisor: '1',
        direccion: 'Santo Domingo, RD',
        documentoIdentidad: '402-4567890-1',
        fechaNacimiento: new Date('1992-05-12'),
        notas: 'Experto en Vue.js y Node.js',
        actividadActual: 'Implementando módulo de tareas',
        habilidades: ['JavaScript', 'Vue.js', 'Node.js', 'MongoDB'],
        proyectos: ['Digitalización', 'CEO App'],
        evaluaciones: [],
        tareas: []
      },
      {
        id: '5',
        nombre: 'Patricia',
        apellido: 'López',
        email: 'patricia.lopez@empresa.com',
        telefono: '809-555-0105',
        cargo: 'Asistente Administrativa',
        departamento: 'Administración',
        fechaContratacion: new Date('2022-08-10'),
        salario: 45000,
        estado: 'vacaciones',
        supervisor: '1',
        direccion: 'San Pedro de Macorís, RD',
        documentoIdentidad: '402-5678901-2',
        fechaNacimiento: new Date('1995-09-25'),
        notas: 'Muy organizada y eficiente',
        actividadActual: 'Organizando archivos',
        habilidades: ['Office', 'Organización', 'Atención al Cliente'],
        proyectos: ['Gestión Documental'],
        evaluaciones: [],
        tareas: []
      }
    ]
  }

  const getSampleDepartments = (): Department[] => {
    return [
      {
        id: '1',
        nombre: 'Dirección Ejecutiva',
        descripcion: 'Dirección estratégica de la empresa',
        jefeDepartamento: '1',
        presupuesto: 500000,
        empleados: ['1']
      },
      {
        id: '2',
        nombre: 'Ventas',
        descripcion: 'Gestión de ventas y relaciones con clientes',
        jefeDepartamento: '2',
        presupuesto: 300000,
        empleados: ['2']
      },
      {
        id: '3',
        nombre: 'Finanzas',
        descripcion: 'Gestión financiera y contable',
        jefeDepartamento: '1',
        presupuesto: 200000,
        empleados: ['3']
      },
      {
        id: '4',
        nombre: 'Tecnología',
        descripcion: 'Desarrollo de software y sistemas',
        jefeDepartamento: '1',
        presupuesto: 400000,
        empleados: ['4']
      },
      {
        id: '5',
        nombre: 'Administración',
        descripcion: 'Gestión administrativa y operativa',
        jefeDepartamento: '1',
        presupuesto: 150000,
        empleados: ['5']
      }
    ]
  }

  const getSamplePositions = (): Position[] => {
    return [
      {
        id: '1',
        titulo: 'CEO',
        departamento: 'Dirección Ejecutiva',
        descripcion: 'Director ejecutivo de la empresa',
        salarioMinimo: 120000,
        salarioMaximo: 200000,
        requisitos: ['Maestría en Administración', '10+ años experiencia', 'Liderazgo'],
        responsabilidades: ['Estrategia empresarial', 'Gestión general', 'Relaciones con stakeholders']
      },
      {
        id: '2',
        titulo: 'Director de Ventas',
        departamento: 'Ventas',
        descripcion: 'Responsable del equipo de ventas',
        salarioMinimo: 70000,
        salarioMaximo: 100000,
        requisitos: ['Licenciatura en Ventas', '5+ años experiencia', 'Gestión de equipos'],
        responsabilidades: ['Estrategia de ventas', 'Gestión de clientes', 'Desarrollo de equipo']
      },
      {
        id: '3',
        titulo: 'Contador Senior',
        departamento: 'Finanzas',
        descripcion: 'Especialista en contabilidad empresarial',
        salarioMinimo: 50000,
        salarioMaximo: 80000,
        requisitos: ['Licenciatura en Contabilidad', 'Certificación CPA', '3+ años experiencia'],
        responsabilidades: ['Contabilidad general', 'Reportes financieros', 'Cumplimiento fiscal']
      },
      {
        id: '4',
        titulo: 'Desarrollador Full Stack',
        departamento: 'Tecnología',
        descripcion: 'Desarrollo de aplicaciones web',
        salarioMinimo: 60000,
        salarioMaximo: 90000,
        requisitos: ['Licenciatura en Informática', 'JavaScript', 'Vue.js/React'],
        responsabilidades: ['Desarrollo frontend/backend', 'Mantenimiento de sistemas', 'Code reviews']
      },
      {
        id: '5',
        titulo: 'Asistente Administrativa',
        departamento: 'Administración',
        descripcion: 'Soporte administrativo general',
        salarioMinimo: 35000,
        salarioMaximo: 55000,
        requisitos: ['Bachillerato', 'Office', 'Organización'],
        responsabilidades: ['Gestión documental', 'Atención al cliente', 'Soporte administrativo']
      }
    ]
  }

  return {
    // State
    employees,
    departments,
    positions,
    loading,
    error,
    
    // Getters
    activeEmployees,
    employeesByDepartment,
    getEmployeeById,
    getDepartmentById,
    getPositionById,
    totalEmployees,
    totalSalary,
    averageSalary,
    employeesByStatus,
    getTasksByEmployee,
    getPendingTaskCount,
    getOldestPendingTask,
    
    // Actions
    loadEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    filterEmployees,
    saveEmployees,
    addTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    setCurrentActivity
  }
}) 