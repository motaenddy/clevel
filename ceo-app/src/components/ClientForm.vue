<template>
  <div class="client-form">
    <ion-list>
      <ion-item>
        <ion-label position="stacked">Nombre del Cliente *</ion-label>
        <ion-input
          v-model="form.nombre"
          placeholder="Ingresa el nombre del cliente"
          :class="{ 'ion-invalid': errors.nombre }"
        ></ion-input>
        <ion-note slot="error" v-if="errors.nombre">{{
          errors.nombre
        }}</ion-note>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Email</ion-label>
        <ion-input
          v-model="form.email"
          type="email"
          placeholder="ejemplo@cliente.com"
          :class="{ 'ion-invalid': errors.email }"
        ></ion-input>
        <ion-note slot="error" v-if="errors.email">{{ errors.email }}</ion-note>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Teléfono</ion-label>
        <ion-input
          v-model="form.telefono"
          type="tel"
          placeholder="809-555-0000"
        ></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Dirección</ion-label>
        <ion-textarea
          v-model="form.direccion"
          placeholder="Dirección completa del cliente"
          rows="3"
        ></ion-textarea>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Estado</ion-label>
        <ion-select v-model="form.estado" placeholder="Selecciona el estado">
          <ion-select-option value="activo">Activo</ion-select-option>
          <ion-select-option value="inactivo">Inactivo</ion-select-option>
        </ion-select>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Notas</ion-label>
        <ion-textarea
          v-model="form.notas"
          placeholder="Notas adicionales sobre el cliente"
          rows="3"
        ></ion-textarea>
      </ion-item>
    </ion-list>

    <div class="form-actions">
      <ion-button expand="block" @click="saveClient" :disabled="!isFormValid">
        {{ isEditing ? "Actualizar Cliente" : "Agregar Cliente" }}
      </ion-button>
    </div>
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
  IonNote,
  IonButton,
} from "@ionic/vue";
import { ref, computed, defineEmits, defineProps } from "vue";

// Props
const props = defineProps<{
  client?: any; // For editing existing client
}>();

// Emits
const emit = defineEmits<{
  "client-saved": [client: any];
}>();

// Form data
const form = ref({
  nombre: "",
  email: "",
  telefono: "",
  direccion: "",
  estado: "activo",
  notas: "",
});

// Validation errors
const errors = ref({
  nombre: "",
  email: "",
});

// Computed properties
const isEditing = computed(() => !!props.client);
const isFormValid = computed(() => {
  return (
    form.value.nombre.trim().length > 0 &&
    (!form.value.email || isValidEmail(form.value.email))
  );
});

// Methods
const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateForm = () => {
  errors.value = {
    nombre: "",
    email: "",
  };

  let isValid = true;

  // Validate nombre
  if (!form.value.nombre.trim()) {
    errors.value.nombre = "El nombre es requerido";
    isValid = false;
  }

  // Validate email if provided
  if (form.value.email && !isValidEmail(form.value.email)) {
    errors.value.email = "Email inválido";
    isValid = false;
  }

  return isValid;
};

const saveClient = () => {
  if (!validateForm()) {
    return;
  }

  const clientData = {
    id: props.client?.id || generateId(),
    ...form.value,
    fechaCreacion: props.client?.fechaCreacion || new Date(),
    montoPendiente: props.client?.montoPendiente || 0,
    cuotasVencidas: props.client?.cuotasVencidas || 0,
  };

  emit("client-saved", clientData);

  // Reset form
  if (!isEditing.value) {
    resetForm();
  }
};

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const resetForm = () => {
  form.value = {
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    estado: "activo",
    notas: "",
  };
  errors.value = {
    nombre: "",
    email: "",
  };
};

// Initialize form with client data if editing
if (props.client) {
  form.value = {
    nombre: props.client.nombre || "",
    email: props.client.email || "",
    telefono: props.client.telefono || "",
    direccion: props.client.direccion || "",
    estado: props.client.estado || "activo",
    notas: props.client.notas || "",
  };
}
</script>

<style scoped>
.client-form {
  padding: 16px;
}

.form-actions {
  margin-top: 24px;
  padding: 0 16px;
}

ion-item {
  margin-bottom: 8px;
}

ion-label[position="stacked"] {
  font-weight: 500;
  margin-bottom: 8px;
}
</style>
