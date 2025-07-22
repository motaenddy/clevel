<template>
  <div class="billing-form">
    <ion-list>
      <!-- Fecha de Facturación -->
      <ion-item>
        <ion-label position="stacked">Fecha de Facturación *</ion-label>
        <ion-input
          v-model="form.fechaFacturacion"
          type="date"
          :class="{ 'ion-invalid': errors.fechaFacturacion }"
        ></ion-input>
        <ion-note slot="error" v-if="errors.fechaFacturacion">{{
          errors.fechaFacturacion
        }}</ion-note>
      </ion-item>

      <!-- Items de Facturación -->
      <ion-item-divider>
        <ion-label>Items de Facturación</ion-label>
        <ion-button slot="end" fill="clear" size="small" @click="addItem">
          <ion-icon :icon="add"></ion-icon>
          Agregar Item
        </ion-button>
      </ion-item-divider>

      <div
        v-for="(item, index) in form.items"
        :key="index"
        class="item-container"
      >
        <ion-item>
          <ion-label position="stacked">Descripción</ion-label>
          <ion-input
            v-model="item.descripcion"
            placeholder="Descripción del servicio/producto"
            :class="{
              'ion-invalid': errors.items && errors.items[index]?.descripcion,
            }"
          ></ion-input>
          <ion-note
            slot="error"
            v-if="errors.items && errors.items[index]?.descripcion"
          >
            {{ errors.items[index].descripcion }}
          </ion-note>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Monto (RD$)</ion-label>
          <ion-input
            v-model="item.monto"
            type="number"
            placeholder="0.00"
            @ionInput="calculateTotal"
            :class="{
              'ion-invalid': errors.items && errors.items[index]?.monto,
            }"
          ></ion-input>
          <ion-note
            slot="error"
            v-if="errors.items && errors.items[index]?.monto"
          >
            {{ errors.items[index].monto }}
          </ion-note>
          <ion-button
            slot="end"
            fill="clear"
            color="danger"
            @click="removeItem(index)"
          >
            <ion-icon :icon="trash"></ion-icon>
          </ion-button>
        </ion-item>
      </div>

      <!-- Total -->
      <ion-item>
        <ion-label>
          <h2>Total Facturado</h2>
        </ion-label>
        <ion-note slot="end">
          <h2 class="total-amount">
            RD$ {{ totalAmount.toLocaleString("es-DO") }}
          </h2>
        </ion-note>
      </ion-item>

      <!-- Notas -->
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
        {{ isEditing ? "Actualizar Facturación" : "Crear Facturación" }}
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
  IonNote,
  IonButton,
  IonItemDivider,
} from "@ionic/vue";
import { ref, computed, defineEmits, defineProps, watch } from "vue";
import { add, trash } from "ionicons/icons";
import type { MonthlyBilling } from "../services/StorageService";

// Interface for billing items
interface BillingItem {
  descripcion: string;
  monto: number;
}

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
  fechaFacturacion: "",
  items: [] as BillingItem[],
  notas: "",
});

// Validation errors
const errors = ref({
  fechaFacturacion: "",
  items: {} as { [key: number]: { descripcion?: string; monto?: string } },
});

// Computed properties
const isEditing = computed(() => !!props.billing);
const totalAmount = computed(() => {
  return form.value.items.reduce(
    (sum, item) => sum + (parseFloat(item.monto.toString()) || 0),
    0
  );
});

const isFormValid = computed(() => {
  return (
    form.value.fechaFacturacion &&
    form.value.items.length > 0 &&
    form.value.items.every((item) => item.descripcion && item.monto > 0)
  );
});

// Methods
const addItem = () => {
  form.value.items.push({
    descripcion: "",
    monto: 0,
  });
};

const removeItem = (index: number) => {
  form.value.items.splice(index, 1);
  calculateTotal();
};

const calculateTotal = () => {
  // Total is calculated automatically by computed property
};

const validateForm = () => {
  errors.value = {
    fechaFacturacion: "",
    items: {},
  };

  let isValid = true;

  // Validate fechaFacturacion
  if (!form.value.fechaFacturacion) {
    errors.value.fechaFacturacion = "La fecha de facturación es requerida";
    isValid = false;
  }

  // Validate items
  form.value.items.forEach((item, index) => {
    if (!item.descripcion) {
      errors.value.items[index] = {
        ...errors.value.items[index],
        descripcion: "La descripción es requerida",
      };
      isValid = false;
    }
    if (!item.monto || item.monto <= 0) {
      errors.value.items[index] = {
        ...errors.value.items[index],
        monto: "El monto debe ser mayor a 0",
      };
      isValid = false;
    }
  });

  return isValid;
};

const saveBilling = () => {
  if (!validateForm()) {
    return;
  }

  const billingData: MonthlyBilling = {
    id: props.billing?.id || generateId(),
    clienteId: props.clientId,
    mes: new Date(form.value.fechaFacturacion).toISOString().slice(0, 7), // YYYY-MM format
    montoFacturado: totalAmount.value,
    montoPagado: 0, // Default to 0 for new billing
    fechaUltimoPago: null,
    fechaVencimiento: new Date(form.value.fechaFacturacion), // Use billing date as due date
    cuotasVencidas: 0,
    fechaCompromiso: null,
    estado: "pendiente",
    notas: form.value.notas,
    items: form.value.items, // Add items to billing data
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
    fechaFacturacion: "",
    items: [],
    notas: "",
  };
  errors.value = {
    fechaFacturacion: "",
    items: {},
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

.item-container {
  border: 1px solid var(--ion-color-light);
  border-radius: 8px;
  margin-bottom: 16px;
  padding: 8px;
  background-color: var(--ion-color-light-tint);
}

.total-amount {
  color: var(--ion-color-primary);
  font-weight: bold;
}

ion-item-divider {
  margin-top: 16px;
  margin-bottom: 8px;
}
</style>
