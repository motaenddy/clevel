<template>
  <div class="billing-form">
    <ion-list>
      <ion-item>
        <ion-label position="stacked">Mes/Año *</ion-label>
        <ion-input
          v-model="form.mes"
          type="month"
          :class="{ 'ion-invalid': errors.mes }"
        ></ion-input>
        <ion-note slot="error" v-if="errors.mes">{{ errors.mes }}</ion-note>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Monto Facturado (RD$) *</ion-label>
        <ion-input
          v-model="form.montoFacturado"
          type="number"
          placeholder="0.00"
          :class="{ 'ion-invalid': errors.montoFacturado }"
        ></ion-input>
        <ion-note slot="error" v-if="errors.montoFacturado">{{
          errors.montoFacturado
        }}</ion-note>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Monto Pagado (RD$)</ion-label>
        <ion-input
          v-model="form.montoPagado"
          type="number"
          placeholder="0.00"
        ></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Fecha de Vencimiento *</ion-label>
        <ion-input
          v-model="form.fechaVencimiento"
          type="date"
          :class="{ 'ion-invalid': errors.fechaVencimiento }"
        ></ion-input>
        <ion-note slot="error" v-if="errors.fechaVencimiento">{{
          errors.fechaVencimiento
        }}</ion-note>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Fecha de Compromiso</ion-label>
        <ion-input v-model="form.fechaCompromiso" type="date"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Cuotas Vencidas</ion-label>
        <ion-input
          v-model="form.cuotasVencidas"
          type="number"
          placeholder="0"
        ></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Estado</ion-label>
        <ion-select v-model="form.estado" placeholder="Selecciona el estado">
          <ion-select-option value="pendiente">Pendiente</ion-select-option>
          <ion-select-option value="pagado">Pagado</ion-select-option>
          <ion-select-option value="vencido">Vencido</ion-select-option>
        </ion-select>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Notas</ion-label>
        <ion-textarea
          v-model="form.notas"
          placeholder="Notas adicionales sobre la facturación"
          rows="3"
        ></ion-textarea>
      </ion-item>
    </ion-list>

    <div class="form-actions">
      <ion-button expand="block" @click="saveBilling" :disabled="!isFormValid">
        {{ isEditing ? "Actualizar Facturación" : "Agregar Facturación" }}
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
import { ref, computed, defineEmits, defineProps, watch } from "vue";
import type { MonthlyBilling } from "../services/StorageService";

// Props
const props = defineProps<{
  clientId: string;
  billing?: MonthlyBilling; // For editing existing billing
}>();

// Emits
const emit = defineEmits<{
  "billing-saved": [billing: MonthlyBilling];
}>();

// Form data
const form = ref({
  mes: "",
  montoFacturado: "",
  montoPagado: "",
  fechaVencimiento: "",
  fechaCompromiso: "",
  cuotasVencidas: "",
  estado: "pendiente" as "pendiente" | "pagado" | "vencido",
  notas: "",
});

// Validation errors
const errors = ref({
  mes: "",
  montoFacturado: "",
  fechaVencimiento: "",
});

// Computed properties
const isEditing = computed(() => !!props.billing);
const isFormValid = computed(() => {
  return (
    form.value.mes &&
    form.value.montoFacturado &&
    parseFloat(form.value.montoFacturado) > 0 &&
    form.value.fechaVencimiento
  );
});

// Methods
const validateForm = () => {
  errors.value = {
    mes: "",
    montoFacturado: "",
    fechaVencimiento: "",
  };

  let isValid = true;

  // Validate mes
  if (!form.value.mes) {
    errors.value.mes = "El mes es requerido";
    isValid = false;
  }

  // Validate montoFacturado
  if (!form.value.montoFacturado) {
    errors.value.montoFacturado = "El monto facturado es requerido";
    isValid = false;
  } else if (parseFloat(form.value.montoFacturado) <= 0) {
    errors.value.montoFacturado = "El monto debe ser mayor a 0";
    isValid = false;
  }

  // Validate fechaVencimiento
  if (!form.value.fechaVencimiento) {
    errors.value.fechaVencimiento = "La fecha de vencimiento es requerida";
    isValid = false;
  }

  return isValid;
};

const saveBilling = () => {
  if (!validateForm()) {
    return;
  }

  const billingData: MonthlyBilling = {
    id: props.billing?.id || generateId(),
    clienteId: props.clientId,
    mes: form.value.mes,
    montoFacturado: parseFloat(form.value.montoFacturado),
    montoPagado: parseFloat(form.value.montoPagado) || 0,
    fechaUltimoPago: null, // Will be set when payment is made
    fechaVencimiento: new Date(form.value.fechaVencimiento),
    cuotasVencidas: parseInt(form.value.cuotasVencidas) || 0,
    fechaCompromiso: form.value.fechaCompromiso
      ? new Date(form.value.fechaCompromiso)
      : null,
    estado: form.value.estado,
    notas: form.value.notas,
  };

  emit("billing-saved", billingData);

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
    mes: "",
    montoFacturado: "",
    montoPagado: "",
    fechaVencimiento: "",
    fechaCompromiso: "",
    cuotasVencidas: "",
    estado: "pendiente",
    notas: "",
  };
  errors.value = {
    mes: "",
    montoFacturado: "",
    fechaVencimiento: "",
  };
};

// Auto-calculate estado based on payment amount
watch(
  () => form.value.montoPagado,
  (newValue) => {
    const montoPagado = parseFloat(newValue) || 0;
    const montoFacturado = parseFloat(form.value.montoFacturado) || 0;

    if (montoPagado >= montoFacturado && montoFacturado > 0) {
      form.value.estado = "pagado";
    } else if (montoPagado > 0) {
      form.value.estado = "pendiente";
    } else {
      form.value.estado = "pendiente";
    }
  }
);

// Initialize form with billing data if editing
if (props.billing) {
  form.value = {
    mes: props.billing.mes,
    montoFacturado: props.billing.montoFacturado.toString(),
    montoPagado: props.billing.montoPagado.toString(),
    fechaVencimiento: props.billing.fechaVencimiento
      .toISOString()
      .split("T")[0],
    fechaCompromiso: props.billing.fechaCompromiso
      ? props.billing.fechaCompromiso.toISOString().split("T")[0]
      : "",
    cuotasVencidas: props.billing.cuotasVencidas.toString(),
    estado: props.billing.estado,
    notas: props.billing.notas,
  };
}
</script>

<style scoped>
.billing-form {
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
