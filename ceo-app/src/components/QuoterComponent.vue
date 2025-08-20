<template>
  <div class="quoter-component">
    <!-- Información del Cliente (pre-llenada) -->
    <ion-card>
      <ion-card-header>
        <ion-card-title>
          <ion-icon :icon="calculator" slot="start"></ion-icon>
          Cotizador para {{ clientName }}
        </ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <ion-item>
          <ion-label position="stacked">Tipo de Institución</ion-label>
          <ion-select
            v-model="institutionType"
            placeholder="Seleccione el tipo"
            @ion-change="updatePricePerBed"
          >
            <ion-select-option value="clinica">Clínica</ion-select-option>
            <ion-select-option value="hospital">Hospital</ion-select-option>
            <ion-select-option value="centro_atencion_primaria"
              >Centro de Atención Primaria</ion-select-option
            >
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Número de Camas</ion-label>
          <ion-input
            v-model="numberOfBeds"
            type="number"
            placeholder="0"
            min="1"
            max="1000"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Precio por Cama (RD$)</ion-label>
          <ion-input
            v-model="pricePerBed"
            type="number"
            placeholder="Seleccione el tipo de institución"
            min="0"
            step="0.01"
            readonly
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Descuento (%)</ion-label>
          <ion-input
            v-model="discountPercentage"
            type="number"
            placeholder="0"
            min="0"
            max="100"
          ></ion-input>
        </ion-item>
      </ion-card-content>
    </ion-card>

    <!-- Botón de Calcular -->
    <ion-button
      expand="block"
      @click="calculateQuote"
      :disabled="!canCalculate"
      class="calculate-button"
    >
      <ion-icon :icon="calculator" slot="start"></ion-icon>
      Calcular Cotización
    </ion-button>

    <!-- Resultado de la Cotización -->
    <ion-card v-if="showResults" class="results-card">
      <ion-card-header>
        <ion-card-title>
          <ion-icon :icon="document" slot="start"></ion-icon>
          Resultado de Cotización
        </ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <div class="quote-summary">
          <div class="quote-item">
            <span class="label">Cliente:</span>
            <span class="value">{{ clientName }}</span>
          </div>
          <div class="quote-item">
            <span class="label">Institución:</span>
            <span class="value">{{
              getInstitutionTypeName(institutionType)
            }}</span>
          </div>
          <div class="quote-item">
            <span class="label">Camas:</span>
            <span class="value">{{ numberOfBeds }}</span>
          </div>
          <div class="quote-item">
            <span class="label">Precio por cama:</span>
            <span class="value">{{ formatCurrency(pricePerBed) }}</span>
          </div>

          <hr class="divider" />

          <div class="quote-item total">
            <span class="label">Subtotal:</span>
            <span class="value">{{ formatCurrency(subtotal) }}</span>
          </div>

          <div v-if="discountPercentage > 0" class="quote-item">
            <span class="label">Descuento ({{ discountPercentage }}%):</span>
            <span class="value discount"
              >-{{ formatCurrency(discountAmount) }}</span
            >
          </div>

          <div class="quote-item grand-total">
            <span class="label">Total Mensual:</span>
            <span class="value">{{ formatCurrency(total) }}</span>
          </div>

          <hr class="divider" />

          <div class="quote-item implementation">
            <span class="label">Costo de Implementación (5x):</span>
            <span class="value">{{ formatCurrency(implementationCost) }}</span>
          </div>

          <!-- Items adicionales -->
          <div class="add-item-container">
            <ion-button
              fill="clear"
              size="small"
              @click="addItem"
              class="add-item-btn"
            >
              <ion-icon :icon="add" slot="start"></ion-icon>
              Agregar Item
            </ion-button>
          </div>

          <div v-if="additionalItems.length > 0" class="additional-items">
            <div
              class="quote-item"
              v-for="item in additionalItems"
              :key="item.id"
            >
              <span class="label">{{ item.name }}:</span>
              <ion-button
                fill="clear"
                size="small"
                @click="removeItem(item.id)"
                color="danger"
                class="remove-item-btn"
              >
                <ion-icon :icon="trash" slot="icon-only"></ion-icon>
              </ion-button>
              <span class="value">{{ formatCurrency(item.value) }}</span>
            </div>
          </div>

          <div
            v-if="additionalItems.length > 0"
            class="quote-item implementation-total"
          >
            <span class="label">Total Implementación:</span>
            <span class="value">{{
              formatCurrency(totalImplementationCost)
            }}</span>
          </div>
        </div>
      </ion-card-content>
    </ion-card>

    <!-- Acciones -->
    <div v-if="showResults" class="actions-container">
      <ion-button
        expand="block"
        fill="outline"
        @click="saveQuoteToClient"
        color="success"
        class="save-button"
      >
        <ion-icon :icon="save" slot="start"></ion-icon>
        Actualizar Cotización del Cliente
      </ion-button>

      <ion-button
        expand="block"
        fill="clear"
        @click="clearForm"
        class="clear-button"
      >
        <ion-icon :icon="refresh" slot="start"></ion-icon>
        Limpiar Formulario
      </ion-button>
    </div>

    <!-- Modal para agregar items -->
    <ion-modal
      :is-open="showAddItemModal"
      @did-dismiss="showAddItemModal = false"
    >
      <ion-header>
        <ion-toolbar>
          <ion-title>Agregar Item</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showAddItemModal = false">Cancelar</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <div class="modal-content">
          <ion-item>
            <ion-label position="stacked">Nombre del Item</ion-label>
            <ion-input
              v-model="newItemName"
              placeholder="Ej: Instalación de equipos"
              clear-input
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Valor (RD$)</ion-label>
            <ion-input
              v-model="newItemValue"
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
            ></ion-input>
          </ion-item>
          <div class="modal-actions">
            <ion-button
              expand="block"
              @click="saveItem"
              :disabled="!newItemName.trim() || newItemValue <= 0"
            >
              Guardar Item
            </ion-button>
          </div>
        </div>
      </ion-content>
    </ion-modal>
  </div>
</template>

<script setup lang="ts">
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent,
} from "@ionic/vue";
import {
  calculator,
  document,
  save,
  refresh,
  add,
  trash,
} from "ionicons/icons";
import { ref, computed, watch } from "vue";

// Props
interface Props {
  clientName: string;
  currentCotizado?: number;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  "quote-updated": [amount: number, details: any];
}>();

// Reactive data
const institutionType = ref("");
const numberOfBeds = ref(0);
const pricePerBed = ref(0);
const discountPercentage = ref(0);
const showResults = ref(false);
const additionalItems = ref<Array<{ id: number; name: string; value: number }>>(
  []
);
const showAddItemModal = ref(false);
const newItemName = ref("");
const newItemValue = ref(0);

// Computed properties
const canCalculate = computed(() => {
  return institutionType.value !== "" && numberOfBeds.value > 0;
});

const subtotal = computed(() => {
  return numberOfBeds.value * pricePerBed.value;
});

const discountAmount = computed(() => {
  return (subtotal.value * discountPercentage.value) / 100;
});

const total = computed(() => {
  return subtotal.value - discountAmount.value;
});

const implementationCost = computed(() => {
  return total.value * 5;
});

const totalImplementationCost = computed(() => {
  const additionalItemsTotal = additionalItems.value.reduce(
    (sum, item) => sum + item.value,
    0
  );
  return implementationCost.value + additionalItemsTotal;
});

// Methods (declared before watch to avoid reference errors)
const getInstitutionTypeName = (type: string): string => {
  const types: Record<string, string> = {
    clinica: "Clínica",
    hospital: "Hospital",
    centro_atencion_primaria: "Centro de Atención Primaria",
  };
  return types[type] || type;
};

const updatePricePerBed = () => {
  const prices: Record<string, number> = {
    clinica: 1800,
    hospital: 1500,
    centro_atencion_primaria: 1000,
  };

  if (institutionType.value && prices[institutionType.value]) {
    pricePerBed.value = prices[institutionType.value];
  }
};

const formatCurrency = (value: number): string => {
  return value.toLocaleString("es-DO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const calculateQuote = () => {
  if (canCalculate.value) {
    showResults.value = true;
  }
};

const saveQuoteToClient = () => {
  const quoteDetails = {
    clientName: props.clientName,
    institutionType: institutionType.value,
    numberOfBeds: numberOfBeds.value,
    pricePerBed: pricePerBed.value,
    discountPercentage: discountPercentage.value,
    subtotal: subtotal.value,
    discountAmount: discountAmount.value,
    total: total.value,
    implementationCost: implementationCost.value,
    additionalItems: additionalItems.value,
    totalImplementationCost: totalImplementationCost.value,
  };

  emit("quote-updated", total.value, quoteDetails);
};

const clearForm = () => {
  institutionType.value = "";
  numberOfBeds.value = 0;
  pricePerBed.value = 0;
  discountPercentage.value = 0;
  showResults.value = false;
  additionalItems.value = [];
};

const addItem = () => {
  showAddItemModal.value = true;
};

const saveItem = () => {
  if (newItemName.value.trim() && newItemValue.value > 0) {
    additionalItems.value.push({
      id: Date.now(),
      name: newItemName.value.trim(),
      value: Number(newItemValue.value),
    });
    newItemName.value = "";
    newItemValue.value = 0;
    showAddItemModal.value = false;
  }
};

const removeItem = (id: number) => {
  additionalItems.value = additionalItems.value.filter(
    (item) => item.id !== id
  );
};

// Watch for current cotizado to pre-fill if available
watch(
  () => props.currentCotizado,
  (newValue) => {
    if (newValue && newValue > 0) {
      // Try to reverse engineer some values from current cotizado
      // This is a simple estimation
      if (newValue <= 50000) {
        institutionType.value = "centro_atencion_primaria";
        numberOfBeds.value = Math.round(newValue / 1000);
      } else if (newValue <= 150000) {
        institutionType.value = "clinica";
        numberOfBeds.value = Math.round(newValue / 1800);
      } else {
        institutionType.value = "hospital";
        numberOfBeds.value = Math.round(newValue / 1500);
      }
      updatePricePerBed();
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.quoter-component {
  padding: 16px 0;
}

.results-card {
  margin-top: 16px;
}

.quote-summary {
  padding: 8px 0;
}

.quote-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
}

.quote-item .label {
  font-weight: 500;
  color: var(--ion-color-medium);
  font-size: 0.9rem;
}

.quote-item .value {
  font-weight: 600;
  color: var(--ion-color-dark);
  font-size: 0.9rem;
}

.quote-item.total {
  border-top: 1px solid var(--ion-color-light);
  padding-top: 8px;
  margin-top: 8px;
}

.quote-item .discount {
  color: var(--ion-color-danger);
}

.quote-item.grand-total {
  border-top: 2px solid var(--ion-color-primary);
  padding-top: 8px;
  margin-top: 8px;
  font-size: 1rem;
}

.quote-item.grand-total .value {
  color: var(--ion-color-primary);
  font-size: 1.1rem;
  font-weight: bold;
}

.quote-item.implementation {
  border-top: 2px solid var(--ion-color-warning);
  padding-top: 8px;
  margin-top: 8px;
}

.quote-item.implementation .value {
  color: var(--ion-color-warning);
  font-weight: bold;
}

.quote-item.implementation-total {
  border-top: 2px solid var(--ion-color-success);
  padding-top: 8px;
  margin-top: 8px;
}

.quote-item.implementation-total .value {
  color: var(--ion-color-success);
  font-weight: bold;
}

.add-item-container {
  margin: 12px 0;
  text-align: center;
}

.add-item-btn {
  --color: var(--ion-color-primary);
  font-size: 0.8rem;
}

.remove-item-btn {
  --color: var(--ion-color-danger);
  font-size: 0.7rem;
  margin: 0 8px;
}

.additional-items {
  margin-top: 8px;
}

.actions-container {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.calculate-button {
  --background: var(--ion-color-primary);
  margin: 16px 0;
}

.save-button {
  --color: var(--ion-color-success);
  --border-color: var(--ion-color-success);
}

.clear-button {
  --color: var(--ion-color-medium);
}

.divider {
  border: none;
  height: 1px;
  background-color: var(--ion-color-light);
  margin: 8px 0;
}

.modal-content {
  padding: 16px;
}

.modal-actions {
  margin-top: 16px;
}

/* Compact styles for modal */
ion-card {
  margin-bottom: 12px;
}

ion-item {
  margin-bottom: 4px;
  --min-height: 44px;
}

ion-card-title {
  font-size: 1rem;
}
</style>
