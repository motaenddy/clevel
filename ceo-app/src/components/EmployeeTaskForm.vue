<template>
  <div class="task-form">
    <ion-list>
      <ion-item>
        <ion-label position="stacked">Título</ion-label>
        <ion-input
          v-model="titulo"
          placeholder="Describe la tarea"
          clear-input
        ></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Descripción</ion-label>
        <ion-textarea
          v-model="descripcion"
          placeholder="Detalles adicionales"
        ></ion-textarea>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Prioridad</ion-label>
        <ion-select v-model="prioridad">
          <ion-select-option value="baja">Baja</ion-select-option>
          <ion-select-option value="media">Media</ion-select-option>
          <ion-select-option value="alta">Alta</ion-select-option>
        </ion-select>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Fecha de vencimiento</ion-label>
        <ion-datetime
          v-model="fechaVencimiento"
          presentation="date"
        ></ion-datetime>
      </ion-item>
    </ion-list>

    <ion-button expand="block" @click="saveTask" :disabled="!titulo"
      >Guardar</ion-button
    >
  </div>
</template>

<script setup lang="ts">
import {
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonButton,
} from "@ionic/vue";
import { ref, computed } from "vue";
import type { EmployeeTask } from "../types/employee";

const props = defineProps<{ task?: EmployeeTask }>();
const emit = defineEmits<{
  (
    e: "task-saved",
    task: Omit<EmployeeTask, "id" | "fechaCreacion" | "estado">
  ): void;
}>();

const titulo = ref(props.task?.titulo || "");
const descripcion = ref(props.task?.descripcion || "");
const prioridad = ref<EmployeeTask["prioridad"]>(
  props.task?.prioridad || "media"
);
const fechaVencimiento = ref<string | undefined>(
  props.task?.fechaVencimiento
    ? props.task!.fechaVencimiento.toISOString()
    : undefined
);

const saveTask = () => {
  const payload = {
    titulo: titulo.value,
    descripcion: descripcion.value || undefined,
    prioridad: prioridad.value,
    fechaVencimiento: fechaVencimiento.value
      ? new Date(fechaVencimiento.value)
      : undefined,
  };
  emit("task-saved", payload);
};
</script>

<style scoped>
.task-form {
  padding: 8px 12px;
}
</style>
