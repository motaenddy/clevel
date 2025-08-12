<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Mi Perfil</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="enableEdit = !enableEdit">
            <ion-icon :icon="enableEdit ? close : create"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-list>
        <ion-item lines="full">
          <ion-avatar slot="start">
            <ion-icon :icon="person" size="large"></ion-icon>
          </ion-avatar>
          <ion-label>
            <h2>{{ fullName }}</h2>
            <p>{{ profile.cargo || "—" }}</p>
            <p>{{ profile.empresa || "—" }}</p>
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Nombre</ion-label>
          <ion-input
            v-model="profile.nombre"
            :readonly="!enableEdit"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Apellido</ion-label>
          <ion-input
            v-model="profile.apellido"
            :readonly="!enableEdit"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Email</ion-label>
          <ion-input
            v-model="profile.email"
            type="email"
            :readonly="!enableEdit"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Teléfono</ion-label>
          <ion-input
            v-model="profile.telefono"
            :readonly="!enableEdit"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Cargo</ion-label>
          <ion-input
            v-model="profile.cargo"
            :readonly="!enableEdit"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Empresa</ion-label>
          <ion-input
            v-model="profile.empresa"
            :readonly="!enableEdit"
          ></ion-input>
        </ion-item>

        <ion-item lines="full">
          <ion-label position="stacked">Actividad actual</ion-label>
          <ion-input
            v-model="activityInput"
            placeholder="Ej: Almuerzo, Llamada con cliente, Preparando reporte"
          ></ion-input>
        </ion-item>
      </ion-list>

      <ion-button expand="block" @click="save" :disabled="!enableEdit"
        >Guardar</ion-button
      >
      <ion-button
        expand="block"
        color="tertiary"
        @click="saveActivity"
        :disabled="!canUpdateActivity"
      >
        Actualizar actividad
      </ion-button>

      <!-- Tasks Section -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Mis tareas</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-button
            size="small"
            @click="openNewTask"
            :disabled="!canUpdateActivity"
          >
            Nueva tarea
          </ion-button>
          <EmployeeTaskList
            v-if="tasks && tasks.length > 0"
            :tasks="tasks"
            @toggle-status="onToggleTaskStatus"
            @edit-task="onEditTask"
            @delete-task="onDeleteTask"
          />
          <p v-else class="empty-tasks">No tienes tareas</p>
        </ion-card-content>
      </ion-card>

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
    </ion-content>
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
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonAvatar,
  IonModal,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from "@ionic/vue";
import { create, close, person } from "ionicons/icons";
import { ref, computed, onMounted } from "vue";
import { storageService, type UserProfile } from "../services/StorageService";
import { useEmployeesStore } from "../stores/employees";
import EmployeeTaskList from "../components/EmployeeTaskList.vue";
import EmployeeTaskForm from "../components/EmployeeTaskForm.vue";

const enableEdit = ref(false);
const profile = ref<UserProfile>({
  id: "me",
  nombre: "",
  apellido: "",
  email: "",
});

const fullName = computed(() =>
  `${profile.value.nombre} ${profile.value.apellido}`.trim()
);

// Employees linkage
const employeesStore = useEmployeesStore();
const activityInput = ref<string>("");
const matchedEmployee = computed(() => {
  const email = profile.value.email?.toLowerCase();
  const byEmail = employeesStore.employees.find(
    (e: any) => e.email?.toLowerCase() === email
  );
  if (byEmail) return byEmail;
  const full = fullName.value.trim().toLowerCase();
  return employeesStore.employees.find(
    (e: any) => `${e.nombre} ${e.apellido}`.trim().toLowerCase() === full
  );
});
const canUpdateActivity = computed(() => !!matchedEmployee.value);
const tasks = computed(() => matchedEmployee.value?.tareas || []);

const load = async () => {
  profile.value = storageService.loadUserProfile();
  if (employeesStore.employees.length === 0) {
    await employeesStore.loadEmployees();
  }
  activityInput.value = matchedEmployee.value?.actividadActual || "";
};

const save = () => {
  storageService.saveUserProfile(profile.value);
  enableEdit.value = false;
};

const saveActivity = async () => {
  if (!matchedEmployee.value) return;
  await employeesStore.setCurrentActivity(
    matchedEmployee.value.id,
    (activityInput.value || "").trim()
  );
};

// Tasks handlers
const showTaskModal = ref(false);
const editingTask = ref<any | null>(null);
const openNewTask = () => {
  editingTask.value = null;
  showTaskModal.value = true;
};
const closeTaskModal = () => {
  showTaskModal.value = false;
  editingTask.value = null;
};
const onTaskSaved = async (payload: any) => {
  if (!matchedEmployee.value) return;
  try {
    if (editingTask.value) {
      const updated = { ...editingTask.value, ...payload };
      await employeesStore.updateTask(matchedEmployee.value.id, updated);
    } else {
      await employeesStore.addTask(matchedEmployee.value.id, payload);
    }
    closeTaskModal();
  } catch (e) {
    console.error("Error saving task", e);
  }
};
const onToggleTaskStatus = async (task: any) => {
  if (!matchedEmployee.value) return;
  const newStatus = task.estado === "completada" ? "pendiente" : "completada";
  await employeesStore.updateTaskStatus(
    matchedEmployee.value.id,
    task.id,
    newStatus
  );
};
const onEditTask = (task: any) => {
  editingTask.value = task;
  showTaskModal.value = true;
};
const onDeleteTask = async (task: any) => {
  if (!matchedEmployee.value) return;
  await employeesStore.deleteTask(matchedEmployee.value.id, task.id);
};

onMounted(async () => {
  await load();
});
</script>

<style scoped>
ion-item h2 {
  margin: 0 0 4px 0;
}
.empty-tasks {
  color: var(--ion-color-medium);
}
</style>
