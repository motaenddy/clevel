<template>
  <ion-list>
    <ion-item v-for="task in tasks" :key="task.id" lines="full">
      <ion-icon
        slot="start"
        :icon="getPriorityIcon(task.prioridad)"
        :color="getPriorityColor(task.prioridad)"
      ></ion-icon>
      <ion-label>
        <h2 :class="{ done: task.estado === 'completada' }">
          {{ task.titulo }}
        </h2>
        <p v-if="task.descripcion">{{ task.descripcion }}</p>
        <p class="meta">
          <ion-icon :icon="timeOutline"></ion-icon>
          <span>Vence: {{ formatDue(task.fechaVencimiento) }}</span>
          <ion-chip
            v-if="task.estado !== 'completada'"
            color="warning"
            size="small"
            >{{ task.estado.replace("_", " ") }}</ion-chip
          >
          <ion-chip v-else color="success" size="small">completada</ion-chip>
        </p>
      </ion-label>
      <ion-buttons slot="end">
        <ion-button @click="$emit('toggle-status', task)">
          <ion-icon
            :icon="task.estado === 'completada' ? closeCircle : checkmarkCircle"
          ></ion-icon>
        </ion-button>
        <ion-button color="medium" @click="$emit('edit-task', task)">
          <ion-icon :icon="create"></ion-icon>
        </ion-button>
        <ion-button color="danger" @click="$emit('delete-task', task)">
          <ion-icon :icon="trash"></ion-icon>
        </ion-button>
      </ion-buttons>
    </ion-item>
  </ion-list>
</template>

<script setup lang="ts">
import {
  IonList,
  IonItem,
  IonLabel,
  IonButtons,
  IonButton,
  IonIcon,
  IonChip,
} from "@ionic/vue";
import {
  checkmarkCircle,
  closeCircle,
  alert,
  warning,
  flag,
  timeOutline,
  create,
  trash,
} from "ionicons/icons";
import type { EmployeeTask } from "../types/employee";

const props = defineProps<{ tasks: EmployeeTask[] }>();

const formatDue = (date?: Date) => {
  return date ? new Date(date).toLocaleDateString("es-DO") : "Sin fecha";
};

const getPriorityIcon = (p: EmployeeTask["prioridad"]) => {
  return p === "alta" ? flag : p === "media" ? warning : alert;
};

const getPriorityColor = (p: EmployeeTask["prioridad"]) => {
  return p === "alta" ? "danger" : p === "media" ? "warning" : "medium";
};
</script>

<style scoped>
.meta {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--ion-color-medium);
}
.done {
  text-decoration: line-through;
  color: var(--ion-color-medium);
}
</style>
