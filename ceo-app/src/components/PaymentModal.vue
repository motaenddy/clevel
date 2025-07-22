<template>
  <ion-modal
    :is-open="isOpen"
    @didDismiss="closeModal"
    :breakpoints="[0, 0.5, 0.75, 1]"
    :initial-breakpoint="0.75"
  >
    <ion-header>
      <ion-toolbar>
        <ion-title>Cobrar Factura</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="closeModal">Cancelar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="payment-modal-content">
        <!-- Client and Billing Info -->
        <ion-card class="info-card">
          <ion-card-content>
            <div class="info-section">
              <h3>Información de la Factura</h3>
              <div class="info-row">
                <span class="label">Cliente:</span>
                <span class="value">{{ clientName }}</span>
              </div>
              <div class="info-row">
                <span class="label">Factura:</span>
                <span class="value">{{ formatMonth(billing?.mes) }}</span>
              </div>
              <div class="info-row">
                <span class="label">Monto Facturado:</span>
                <span class="value"
                  >RD$
                  {{ billing?.montoFacturado?.toLocaleString("es-DO") }}</span
                >
              </div>
              <div class="info-row">
                <span class="label">Ya Pagado:</span>
                <span class="value paid"
                  >RD$ {{ billing?.montoPagado?.toLocaleString("es-DO") }}</span
                >
              </div>
              <div class="info-row">
                <span class="label">Pendiente:</span>
                <span class="value pending"
                  >RD$ {{ pendingAmount.toLocaleString("es-DO") }}</span
                >
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Payment Type Selection -->
        <ion-card class="payment-type-card">
          <ion-card-content>
            <h3>Tipo de Pago</h3>
            <ion-radio-group
              v-model="paymentType"
              @ionChange="onPaymentTypeChange"
            >
              <ion-item>
                <ion-radio value="complete" label-placement="end">
                  Pago Completo
                </ion-radio>
              </ion-item>
              <ion-item>
                <ion-radio value="partial" label-placement="end">
                  Abono a Factura
                </ion-radio>
              </ion-item>
            </ion-radio-group>
          </ion-card-content>
        </ion-card>

        <!-- Payment Amount Input -->
        <ion-card v-if="paymentType === 'partial'" class="amount-card">
          <ion-card-content>
            <h3>Monto a Abonar</h3>
            <ion-item>
              <ion-label position="stacked">Monto (RD$)</ion-label>
              <ion-input
                v-model="paymentAmount"
                type="number"
                placeholder="0.00"
                :min="0"
                :max="pendingAmount"
                @ionInput="validateAmount"
                :class="{ 'ion-invalid': amountError }"
              ></ion-input>
              <ion-note slot="error" v-if="amountError">{{
                amountError
              }}</ion-note>
            </ion-item>
            <div class="amount-info">
              <p>
                Monto máximo: RD$ {{ pendingAmount.toLocaleString("es-DO") }}
              </p>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Payment Date -->
        <ion-card class="date-card">
          <ion-card-content>
            <h3>Fecha de Pago</h3>
            <ion-item>
              <ion-label position="stacked">Fecha</ion-label>
              <ion-input
                v-model="paymentDate"
                type="date"
                :max="today"
              ></ion-input>
            </ion-item>
          </ion-card-content>
        </ion-card>

        <!-- Payment Summary -->
        <ion-card v-if="paymentType" class="summary-card">
          <ion-card-content>
            <h3>Resumen del Pago</h3>
            <div class="summary-row">
              <span class="label">Tipo:</span>
              <span class="value">{{
                paymentType === "complete" ? "Pago Completo" : "Abono"
              }}</span>
            </div>
            <div class="summary-row">
              <span class="label">Monto:</span>
              <span class="value"
                >RD$ {{ displayAmount.toLocaleString("es-DO") }}</span
              >
            </div>
            <div class="summary-row">
              <span class="label">Fecha:</span>
              <span class="value">{{ formatDate(paymentDate) }}</span>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-button
          expand="block"
          @click="processPayment"
          :disabled="!isFormValid"
          color="primary"
        >
          Confirmar Pago
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  </ion-modal>
</template>

<script setup lang="ts">
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonNote,
  IonRadioGroup,
  IonRadio,
  IonFooter,
} from "@ionic/vue";
import { ref, computed, watch, defineProps, defineEmits } from "vue";
import type { MonthlyBilling } from "../services/StorageService";

// Props
const props = defineProps<{
  isOpen: boolean;
  billing: MonthlyBilling | null;
  clientName: string;
}>();

// Emits
const emit = defineEmits<{
  "payment-processed": [
    payment: {
      billingId: string;
      amount: number;
      date: string;
      type: "complete" | "partial";
    }
  ];
  "modal-closed": [];
}>();

// Reactive data
const paymentType = ref<"complete" | "partial" | "">("");
const paymentAmount = ref("");
const paymentDate = ref("");
const amountError = ref("");

// Computed properties
const pendingAmount = computed(() => {
  if (!props.billing) return 0;
  return props.billing.montoFacturado - props.billing.montoPagado;
});

const displayAmount = computed(() => {
  if (paymentType.value === "complete") {
    return pendingAmount.value;
  }
  return parseFloat(paymentAmount.value) || 0;
});

const isFormValid = computed(() => {
  if (!paymentType.value || !paymentDate.value) return false;
  if (paymentType.value === "partial") {
    const amount = parseFloat(paymentAmount.value);
    return amount > 0 && amount <= pendingAmount.value && !amountError.value;
  }
  return true;
});

const today = computed(() => {
  return new Date().toISOString().split("T")[0];
});

// Methods
const formatMonth = (month: string) => {
  if (!month) return "";
  const [year, monthNum] = month.split("-");
  const date = new Date(parseInt(year), parseInt(monthNum) - 1);
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
  });
};

const formatDate = (date: string) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const onPaymentTypeChange = () => {
  if (paymentType.value === "complete") {
    paymentAmount.value = "";
    amountError.value = "";
  }
};

const validateAmount = () => {
  const amount = parseFloat(paymentAmount.value);

  if (!amount || amount <= 0) {
    amountError.value = "El monto debe ser mayor a 0";
    return;
  }

  if (amount > pendingAmount.value) {
    amountError.value = `El monto no puede exceder RD$ ${pendingAmount.value.toLocaleString(
      "es-DO"
    )}`;
    return;
  }

  amountError.value = "";
};

const processPayment = () => {
  if (!isFormValid.value || !props.billing) return;

  const payment = {
    billingId: props.billing.id,
    amount: displayAmount.value,
    date: paymentDate.value,
    type: paymentType.value as "complete" | "partial",
  };

  emit("payment-processed", payment);
  resetForm();
};

const closeModal = () => {
  emit("modal-closed");
  resetForm();
};

const resetForm = () => {
  paymentType.value = "";
  paymentAmount.value = "";
  paymentDate.value = "";
  amountError.value = "";
};

// Initialize payment date to today
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      paymentDate.value = today.value;
    }
  }
);
</script>

<style scoped>
.payment-modal-content {
  max-width: 600px;
  margin: 0 auto;
}

.info-card,
.payment-type-card,
.amount-card,
.date-card,
.summary-card {
  margin-bottom: 16px;
}

.info-section h3,
.payment-type-card h3,
.amount-card h3,
.date-card h3,
.summary-card h3 {
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.info-row,
.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 4px 0;
}

.info-row:last-child,
.summary-row:last-child {
  margin-bottom: 0;
}

.label {
  font-weight: 500;
  color: var(--ion-color-medium);
}

.value {
  font-weight: 600;
  color: var(--ion-color-dark);
}

.value.paid {
  color: var(--ion-color-success);
}

.value.pending {
  color: var(--ion-color-warning);
}

.amount-info {
  margin-top: 8px;
  padding: 8px;
  background-color: var(--ion-color-light);
  border-radius: 4px;
}

.amount-info p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--ion-color-medium);
}

ion-radio-group {
  margin-top: 8px;
}

ion-item {
  --padding-start: 0;
  --inner-padding-end: 0;
}

ion-footer {
  padding: 16px;
}

@media (max-width: 768px) {
  .payment-modal-content {
    padding: 0 8px;
  }

  .info-row,
  .summary-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
