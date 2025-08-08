<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Empleados</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="showAddEmployeeModal = true">
            <ion-icon :icon="add"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Empleados</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="employees-container">
        <!-- Search and Filters -->
        <ion-searchbar
          v-model="searchTerm"
          placeholder="Buscar empleados..."
          @ionInput="filterEmployees"
        ></ion-searchbar>

        <!-- Filter Chips -->
        <ion-segment v-model="selectedFilter" @ionChange="filterEmployees">
          <ion-segment-button value="all">
            <ion-label>Todos</ion-label>
          </ion-segment-button>
          <ion-segment-button value="active">
            <ion-label>Activos</ion-label>
          </ion-segment-button>
          <ion-segment-button value="vacations">
            <ion-label>Vacaciones</ion-label>
          </ion-segment-button>
        </ion-segment>

        <!-- Department Filter -->
        <ion-item>
          <ion-label>Departamento</ion-label>
          <ion-select
            v-model="selectedDepartment"
            placeholder="Todos los departamentos"
            @ionChange="filterEmployees"
          >
            <ion-select-option value=""
              >Todos los departamentos</ion-select-option
            >
            <ion-select-option
              v-for="dept in departments"
              :key="dept.id"
              :value="dept.id"
            >
              {{ dept.nombre }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <!-- Employees List -->
        <ion-list>
          <ion-item
            v-for="empleado in filteredEmployees"
            :key="empleado.id"
            @click="viewEmployeeDetail(empleado)"
            button
          >
            <ion-avatar slot="start">
              <ion-icon :icon="person" size="large"></ion-icon>
            </ion-avatar>

            <ion-label>
              <h2>{{ empleado.nombre }} {{ empleado.apellido }}</h2>
              <p>{{ empleado.cargo }}</p>
              <p>{{ empleado.departamento }}</p>
              <p class="salary-info">
                RD$ {{ formatCurrency(empleado.salario) }}
              </p>

              <ion-chip color="medium" class="tasks-chip">
                <ion-icon :icon="list"></ion-icon>
                <ion-label>
                  {{ employeesStore.getPendingTaskCount(empleado.id) }}
                  Pendientes
                  <template
                    v-if="employeesStore.getOldestPendingTask(empleado.id)"
                  >
                    : "{{
                      employeesStore.getOldestPendingTask(empleado.id)?.titulo
                    }}"
                  </template>
                </ion-label>
              </ion-chip>
              <div class="activity-row" @click.stop="promptActivity(empleado)">
                <ion-chip color="tertiary" outline>
                  <ion-label>
                    {{
                      empleado.actividadActual
                        ? "Ahora: " + '"' + empleado.actividadActual + '"'
                        : "Añadir actividad actual"
                    }}
                  </ion-label>
                </ion-chip>
              </div>
            </ion-label>

            <ion-note slot="end">
              <div class="employee-actions">
                <ion-button
                  fill="clear"
                  size="small"
                  @click.stop="editEmployee(empleado)"
                >
                  <ion-icon :icon="create"></ion-icon>
                </ion-button>
                <ion-button
                  fill="clear"
                  size="small"
                  color="danger"
                  @click.stop="confirmDeleteEmployee(empleado)"
                >
                  <ion-icon :icon="trash"></ion-icon>
                </ion-button>
              </div>
            </ion-note>
          </ion-item>
        </ion-list>

        <!-- Empty State -->
        <div v-if="filteredEmployees.length === 0" class="empty-state">
          <ion-icon :icon="people" size="large"></ion-icon>
          <h3>No hay empleados</h3>
          <p>Agrega tu primer empleado para comenzar</p>
          <ion-button @click="showAddEmployeeModal = true">
            Agregar Empleado
          </ion-button>
        </div>
      </div>
    </ion-content>

    <!-- Add Employee Modal -->
    <ion-modal
      :is-open="showAddEmployeeModal"
      @didDismiss="showAddEmployeeModal = false"
    >
      <ion-header>
        <ion-toolbar>
          <ion-title>Agregar Empleado</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showAddEmployeeModal = false">
              Cancelar
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <EmployeeForm @employee-saved="onEmployeeSaved" />
      </ion-content>
    </ion-modal>

    <!-- Edit Employee Modal -->
    <ion-modal
      :is-open="showEditEmployeeModal"
      @didDismiss="showEditEmployeeModal = false"
    >
      <ion-header>
        <ion-toolbar>
          <ion-title>Editar Empleado</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showEditEmployeeModal = false">
              Cancelar
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <EmployeeForm
          v-if="selectedEmployee"
          :employee="selectedEmployee"
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
  IonMenuButton,
  IonContent,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonItem,
  IonAvatar,
  IonNote,
  IonModal,
  IonChip,
  IonSelect,
  IonSelectOption,
  alertController,
} from "@ionic/vue";
import { add, person, people, create, trash, list } from "ionicons/icons";
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useEmployeesStore } from "../stores/employees";
import EmployeeForm from "../components/EmployeeForm.vue";
import type { Employee } from "../types/employee";

// Stores
const employeesStore = useEmployeesStore();

// Reactive data
const searchTerm = ref("");
const selectedFilter = ref("all");
const selectedDepartment = ref("");
const showAddEmployeeModal = ref(false);
const showEditEmployeeModal = ref(false);
const selectedEmployee = ref<Employee | null>(null);

const router = useRouter();

// Computed properties
const employees = computed(() => employeesStore.employees);
const departments = computed(() => employeesStore.departments);

const filteredEmployees = computed(() => {
  let filtered = employees.value;

  // Filter by search term
  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase();
    filtered = filtered.filter(
      (empleado) =>
        empleado.nombre.toLowerCase().includes(search) ||
        empleado.apellido.toLowerCase().includes(search) ||
        empleado.cargo.toLowerCase().includes(search) ||
        empleado.email.toLowerCase().includes(search)
    );
  }

  // Filter by status
  if (selectedFilter.value === "active") {
    filtered = filtered.filter((empleado) => empleado.estado === "activo");
  } else if (selectedFilter.value === "vacations") {
    filtered = filtered.filter((empleado) => empleado.estado === "vacaciones");
  }

  // Filter by department
  if (selectedDepartment.value) {
    filtered = filtered.filter(
      (empleado) => empleado.departamento === selectedDepartment.value
    );
  }

  return filtered;
});

// Methods
const filterEmployees = () => {
  // This will trigger the computed property
  console.log("Filtering employees...");
};

const viewEmployeeDetail = (empleado: Employee) => {
  router.push(`/employee/${empleado.id}`);
};

const editEmployee = (empleado: Employee) => {
  selectedEmployee.value = empleado;
  showEditEmployeeModal.value = true;
};

const confirmDeleteEmployee = async (empleado: Employee) => {
  const alert = await alertController.create({
    header: "Confirmar eliminación",
    message: `¿Estás seguro de que quieres eliminar a ${empleado.nombre} ${empleado.apellido}?`,
    buttons: [
      {
        text: "Cancelar",
        role: "cancel",
      },
      {
        text: "Eliminar",
        role: "destructive",
        handler: () => deleteEmployee(empleado.id),
      },
    ],
  });

  await alert.present();
};

const deleteEmployee = async (employeeId: string) => {
  try {
    await employeesStore.deleteEmployee(employeeId);
  } catch (error) {
    console.error("Error deleting employee:", error);
  }
};

const promptActivity = async (empleado: Employee) => {
  const alert = await alertController.create({
    header: "Actividad actual",
    inputs: [
      {
        name: "actividad",
        type: "text",
        placeholder: "Ej: Almuerzo, Llamada con cliente, Preparando reporte",
        value: empleado.actividadActual || "",
      },
    ],
    buttons: [
      { text: "Cancelar", role: "cancel" },
      {
        text: "Guardar",
        handler: async (data) => {
          try {
            await employeesStore.setCurrentActivity(
              empleado.id,
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

const onEmployeeSaved = async (newEmployee: Employee) => {
  try {
    await employeesStore.addEmployee(newEmployee);
    showAddEmployeeModal.value = false;
  } catch (error) {
    console.error("Error saving employee:", error);
  }
};

const onEmployeeUpdated = async (updatedEmployee: Employee) => {
  try {
    await employeesStore.updateEmployee(updatedEmployee);
    showEditEmployeeModal.value = false;
    selectedEmployee.value = null;
  } catch (error) {
    console.error("Error updating employee:", error);
  }
};

const formatCurrency = (amount: number) => {
  return amount.toLocaleString("es-DO");
};

// Removed status label utilities

// Load initial data
onMounted(async () => {
  await employeesStore.loadEmployees();
});
</script>

<style scoped>
.employees-container {
  padding: 16px;
}

.salary-info {
  font-weight: bold;
  color: var(--ion-color-primary);
}

.status-chip {
  margin-top: 8px;
}

.activity-row {
  margin-top: 6px;
}

.employee-actions {
  display: flex;
  gap: 8px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--ion-color-medium);
}

.empty-state ion-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 16px 0 8px 0;
  color: var(--ion-color-dark);
}

.empty-state p {
  margin-bottom: 24px;
}

ion-item {
  margin-bottom: 8px;
}

ion-segment {
  margin: 16px 0;
}

ion-select {
  max-width: 100%;
}
</style>
