<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/employees"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ employee?.nombre }} {{ employee?.apellido }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="editEmployee">
            <ion-icon :icon="create"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div v-if="employee" class="employee-detail">
        <!-- Employee Header -->
        <ion-card class="employee-header">
          <ion-card-content>
            <div class="employee-avatar">
              <ion-avatar>
                <ion-icon :icon="person" size="large"></ion-icon>
              </ion-avatar>
              <div class="employee-info">
                <h1>{{ employee.nombre }} {{ employee.apellido }}</h1>
                <h2>{{ employee.cargo }}</h2>
                <p>{{ employee.departamento }}</p>
                <ion-chip :color="getStatusColor(employee.estado)">
                  <ion-label>{{ getStatusText(employee.estado) }}</ion-label>
                </ion-chip>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Segment Navigation -->
        <ion-segment v-model="selectedSegment" @ionChange="onSegmentChange">
          <ion-segment-button value="general">
            <ion-label>General</ion-label>
          </ion-segment-button>
          <ion-segment-button value="details">
            <ion-label>Detalles</ion-label>
          </ion-segment-button>
        </ion-segment>

        <!-- General Tab Content -->
        <div v-show="selectedSegment === 'general'">
          <!-- Tasks -->
          <ion-card>
            <ion-card-header>
              <ion-card-title>
                <ion-icon :icon="list" slot="start"></ion-icon>
                Tareas
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <ion-button expand="block" @click="showTaskModal = true">
                <ion-icon :icon="add" slot="start"></ion-icon>
                Nueva tarea
              </ion-button>
              <EmployeeTaskList
                :tasks="employee.tareas"
                @toggle-status="onToggleTaskStatus"
                @edit-task="onEditTask"
                @delete-task="onDeleteTask"
              />
            </ion-card-content>
          </ion-card>

          <!-- Current Activity -->
          <ion-card>
            <ion-card-header>
              <ion-card-title>
                <ion-icon :icon="timeOutline" slot="start"></ion-icon>
                Actividad actual
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <p v-if="employee.actividadActual">
                {{ 'Ahora: "' + employee.actividadActual + '"' }}
                <span
                  v-if="employee.actividadActualUpdatedAt"
                  class="activity-updated"
                >
                  (actualizado
                  {{ formatDate(employee.actividadActualUpdatedAt) }})
                </span>
              </p>
              <p v-else>Sin actividad registrada</p>
              <ion-button size="small" @click="promptActivity"
                >Actualizar actividad</ion-button
              >
            </ion-card-content>
          </ion-card>

          <!-- Projects -->
          <ion-card v-if="employee.proyectos.length > 0">
            <ion-card-header>
              <ion-card-title>
                <ion-icon :icon="folder" slot="start"></ion-icon>
                Proyectos
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <ion-list>
                <ion-item v-for="project in employee.proyectos" :key="project">
                  <ion-icon :icon="folder" slot="start"></ion-icon>
                  <ion-label>
                    <p>{{ project }}</p>
                  </ion-label>
                </ion-item>
              </ion-list>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Details Tab Content -->
        <div v-show="selectedSegment === 'details'">
          <!-- Contact Information -->
          <ion-card>
            <ion-card-header>
              <ion-card-title>
                <ion-icon :icon="call" slot="start"></ion-icon>
                Información de Contacto
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <ion-list>
                <ion-item>
                  <ion-icon :icon="mail" slot="start"></ion-icon>
                  <ion-label>
                    <h3>Email</h3>
                    <p>{{ employee.email }}</p>
                  </ion-label>
                </ion-item>
                <ion-item>
                  <ion-icon :icon="call" slot="start"></ion-icon>
                  <ion-label>
                    <h3>Teléfono</h3>
                    <p>{{ employee.telefono }}</p>
                  </ion-label>
                </ion-item>
                <ion-item v-if="employee.direccion">
                  <ion-icon :icon="location" slot="start"></ion-icon>
                  <ion-label>
                    <h3>Dirección</h3>
                    <p>{{ employee.direccion }}</p>
                  </ion-label>
                </ion-item>
              </ion-list>
            </ion-card-content>
          </ion-card>

          <!-- Work Information -->
          <ion-card>
            <ion-card-header>
              <ion-card-title>
                <ion-icon :icon="briefcase" slot="start"></ion-icon>
                Información Laboral
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <ion-list>
                <ion-item>
                  <ion-icon :icon="calendar" slot="start"></ion-icon>
                  <ion-label>
                    <h3>Fecha de Contratación</h3>
                    <p>{{ formatDate(employee.fechaContratacion) }}</p>
                  </ion-label>
                </ion-item>
                <ion-item>
                  <ion-icon :icon="card" slot="start"></ion-icon>
                  <ion-label>
                    <h3>Salario</h3>
                    <p>RD$ {{ formatCurrency(employee.salario) }}</p>
                  </ion-label>
                </ion-item>
                <ion-item v-if="employee.supervisor">
                  <ion-icon :icon="person" slot="start"></ion-icon>
                  <ion-label>
                    <h3>Supervisor</h3>
                    <p>{{ getSupervisorName(employee.supervisor) }}</p>
                  </ion-label>
                </ion-item>
                <ion-item v-if="employee.documentoIdentidad">
                  <ion-icon :icon="idCard" slot="start"></ion-icon>
                  <ion-label>
                    <h3>Documento de Identidad</h3>
                    <p>{{ employee.documentoIdentidad }}</p>
                  </ion-label>
                </ion-item>
                <ion-item v-if="employee.fechaNacimiento">
                  <ion-icon :icon="calendar" slot="start"></ion-icon>
                  <ion-label>
                    <h3>Fecha de Nacimiento</h3>
                    <p>{{ formatDate(employee.fechaNacimiento) }}</p>
                  </ion-label>
                </ion-item>
              </ion-list>
            </ion-card-content>
          </ion-card>

          <!-- Skills -->
          <ion-card v-if="employee.habilidades.length > 0">
            <ion-card-header>
              <ion-card-title>
                <ion-icon :icon="star" slot="start"></ion-icon>
                Habilidades
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <div class="skills-container">
                <ion-chip
                  v-for="skill in employee.habilidades"
                  :key="skill"
                  color="primary"
                >
                  <ion-label>{{ skill }}</ion-label>
                </ion-chip>
              </div>
            </ion-card-content>
          </ion-card>

          <!-- Notes -->
          <ion-card v-if="employee.notas">
            <ion-card-header>
              <ion-card-title>
                <ion-icon :icon="document" slot="start"></ion-icon>
                Notas
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <p>{{ employee.notas }}</p>
            </ion-card-content>
          </ion-card>

          <!-- Evaluations -->
          <ion-card v-if="employee.evaluaciones.length > 0">
            <ion-card-header>
              <ion-card-title>
                <ion-icon :icon="analytics" slot="start"></ion-icon>
                Evaluaciones
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <ion-list>
                <ion-item
                  v-for="evaluation in employee.evaluaciones"
                  :key="evaluation.id"
                >
                  <ion-label>
                    <h3>Evaluación - {{ formatDate(evaluation.fecha) }}</h3>
                    <p>Calificación: {{ evaluation.calificacion }}/5</p>
                    <p>{{ evaluation.comentarios }}</p>
                    <div v-if="evaluation.areasFortaleza.length > 0">
                      <h4>Áreas de Fortaleza:</h4>
                      <ion-chip
                        v-for="area in evaluation.areasFortaleza"
                        :key="area"
                        color="success"
                        size="small"
                      >
                        <ion-label>{{ area }}</ion-label>
                      </ion-chip>
                    </div>
                    <div v-if="evaluation.areasMejora.length > 0">
                      <h4>Áreas de Mejora:</h4>
                      <ion-chip
                        v-for="area in evaluation.areasMejora"
                        :key="area"
                        color="warning"
                        size="small"
                      >
                        <ion-label>{{ area }}</ion-label>
                      </ion-chip>
                    </div>
                  </ion-label>
                </ion-item>
              </ion-list>
            </ion-card-content>
          </ion-card>

          <!-- Quick Actions -->
          <ion-card>
            <ion-card-header>
              <ion-card-title>Acciones Rápidas</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <ion-button expand="block" @click="editEmployee">
                <ion-icon :icon="create" slot="start"></ion-icon>
                Editar Empleado
              </ion-button>
              <ion-button
                expand="block"
                color="danger"
                @click="confirmDeleteEmployee"
              >
                <ion-icon :icon="trash" slot="start"></ion-icon>
                Eliminar Empleado
              </ion-button>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Task Modal -->
        <ion-modal :is-open="showTaskModal" @didDismiss="closeTaskModal">
          <ion-header>
            <ion-toolbar>
              <ion-title>{{
                editingTask ? "Editar Tarea" : "Nueva Tarea"
              }}</ion-title>
              <ion-buttons slot="end">
                <ion-button @click="closeTaskModal">Cerrar</ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content>
            <EmployeeTaskForm
              :task="editingTask || undefined"
              @task-saved="onTaskSaved"
            />
          </ion-content>
        </ion-modal>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="loading-state">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Cargando información del empleado...</p>
      </div>

      <!-- Error State -->
      <div v-else class="error-state">
        <ion-icon :icon="alert - circle" size="large"></ion-icon>
        <h3>Empleado no encontrado</h3>
        <p>El empleado que buscas no existe o ha sido eliminado.</p>
        <ion-button @click="goBack">Volver</ion-button>
      </div>
    </ion-content>

    <!-- Edit Employee Modal -->
    <ion-modal :is-open="showEditModal" @didDismiss="showEditModal = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>Editar Empleado</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showEditModal = false">Cancelar</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <EmployeeForm
          v-if="employee"
          :employee="employee"
          @employee-saved="onEmployeeUpdated"
        />
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonBackButton,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonChip,
  IonSegment,
  IonSegmentButton,
  IonModal,
  IonSpinner,
  alertController,
} from "@ionic/vue";
import {
  person,
  create,
  trash,
  call,
  mail,
  location,
  briefcase,
  calendar,
  card,
  idCard,
  star,
  folder,
  document,
  analytics,
  alertCircle,
  add,
  checkmarkCircle,
  closeCircle,
  timeOutline,
  flag,
  list,
} from "ionicons/icons";
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useEmployeesStore } from "../stores/employees";
import EmployeeForm from "../components/EmployeeForm.vue";
import EmployeeTaskList from "../components/EmployeeTaskList.vue";
import EmployeeTaskForm from "../components/EmployeeTaskForm.vue";
import type { Employee } from "../types/employee";

// Stores
const employeesStore = useEmployeesStore();

// Route and Router
const route = useRoute();
const router = useRouter();

// Reactive data
const loading = ref(false);
const showEditModal = ref(false);
const selectedSegment = ref("general");

// Computed properties
const employeeId = computed(() => route.params.id as string);
const employee = computed(() =>
  employeesStore.getEmployeeById(employeeId.value)
);

// Methods
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    activo: "success",
    inactivo: "medium",
    vacaciones: "warning",
    licencia: "secondary",
  };
  return colors[status] || "medium";
};

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    activo: "Activo",
    inactivo: "Inactivo",
    vacaciones: "Vacaciones",
    licencia: "Licencia",
  };
  return texts[status] || status;
};

const getSupervisorName = (supervisorId: string) => {
  const supervisor = employeesStore.getEmployeeById(supervisorId);
  return supervisor
    ? `${supervisor.nombre} ${supervisor.apellido}`
    : "No asignado";
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString("es-DO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatCurrency = (amount: number) => {
  return amount.toLocaleString("es-DO");
};

const onSegmentChange = (event: any) => {
  selectedSegment.value = event.detail.value;
};

const editEmployee = () => {
  showEditModal.value = true;
};

const promptActivity = async () => {
  if (!employee.value) return;
  const alert = await alertController.create({
    header: "Actividad actual",
    inputs: [
      {
        name: "actividad",
        type: "text",
        placeholder: "Ej: Almuerzo, Llamada con cliente, Preparando reporte",
        value: employee.value.actividadActual || "",
      },
    ],
    buttons: [
      { text: "Cancelar", role: "cancel" },
      {
        text: "Guardar",
        handler: async (data) => {
          try {
            await employeesStore.setCurrentActivity(
              employee.value!.id,
              (data.actividad || "").trim()
            );
          } catch (e) {
            console.error("Error setting activity", e);
          }
        },
      },
    ],
  });
  await alert.present();
};

// Tasks state
const showTaskModal = ref(false);
const editingTask = ref<any | null>(null);

const closeTaskModal = () => {
  showTaskModal.value = false;
  editingTask.value = null;
};

const onTaskSaved = async (payload: any) => {
  if (!employee.value) return;
  try {
    if (editingTask.value) {
      const updated = { ...editingTask.value, ...payload };
      await employeesStore.updateTask(employee.value.id, updated);
    } else {
      await employeesStore.addTask(employee.value.id, payload);
    }
    closeTaskModal();
  } catch (e) {
    console.error("Error saving task", e);
  }
};

const onToggleTaskStatus = async (task: any) => {
  if (!employee.value) return;
  const newStatus = task.estado === "completada" ? "pendiente" : "completada";
  try {
    await employeesStore.updateTaskStatus(
      employee.value.id,
      task.id,
      newStatus
    );
  } catch (e) {
    console.error("Error updating status", e);
  }
};

const onEditTask = (task: any) => {
  editingTask.value = task;
  showTaskModal.value = true;
};

const onDeleteTask = async (task: any) => {
  if (!employee.value) return;
  try {
    await employeesStore.deleteTask(employee.value.id, task.id);
  } catch (e) {
    console.error("Error deleting task", e);
  }
};

const confirmDeleteEmployee = async () => {
  if (!employee.value) return;

  const alert = await alertController.create({
    header: "Confirmar eliminación",
    message: `¿Estás seguro de que quieres eliminar a ${employee.value.nombre} ${employee.value.apellido}?`,
    buttons: [
      {
        text: "Cancelar",
        role: "cancel",
      },
      {
        text: "Eliminar",
        role: "destructive",
        handler: () => deleteEmployee(),
      },
    ],
  });

  await alert.present();
};

const deleteEmployee = async () => {
  if (!employee.value) return;

  try {
    await employeesStore.deleteEmployee(employee.value.id);
    router.push("/employees");
  } catch (error) {
    console.error("Error deleting employee:", error);
  }
};

const onEmployeeUpdated = async (updatedEmployee: Employee) => {
  try {
    await employeesStore.updateEmployee(updatedEmployee);
    showEditModal.value = false;
  } catch (error) {
    console.error("Error updating employee:", error);
  }
};

const goBack = () => {
  router.push("/employees");
};

// Load initial data
onMounted(async () => {
  loading.value = true;
  try {
    await employeesStore.loadEmployees();
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.employee-detail {
  padding: 16px;
}

.employee-header {
  margin-bottom: 16px;
}

.employee-avatar {
  display: flex;
  align-items: center;
  gap: 16px;
}

.employee-info h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--ion-color-dark);
}

.employee-info h2 {
  margin: 8px 0 4px 0;
  font-size: 1.1rem;
  color: var(--ion-color-primary);
}

.employee-info p {
  margin: 4px 0;
  color: var(--ion-color-medium);
}

.skills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--ion-color-medium);
}

.loading-state ion-spinner {
  font-size: 2rem;
  margin-bottom: 16px;
}

.error-state ion-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  color: var(--ion-color-danger);
}

.error-state h3 {
  margin: 16px 0 8px 0;
  color: var(--ion-color-dark);
}

.error-state p {
  margin-bottom: 24px;
}

ion-card {
  margin-bottom: 16px;
}

ion-item h3 {
  font-weight: bold;
  margin-bottom: 4px;
}

ion-item p {
  margin: 0;
  color: var(--ion-color-medium);
}

ion-chip {
  margin: 4px;
}

ion-segment {
  margin: 16px 0;
  position: sticky;
  top: 0;
  background: var(--ion-background-color);
  z-index: 10;
}

.activity-updated {
  font-size: 0.8em;
  color: var(--ion-color-medium);
  font-style: italic;
}
</style>
