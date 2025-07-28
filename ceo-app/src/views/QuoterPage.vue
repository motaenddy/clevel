<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Cotizador</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="quoter-container">
        <!-- Información del Cliente -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>
              <ion-icon :icon="business" slot="start"></ion-icon>
              Información del Cliente
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-item>
              <ion-label position="stacked">Nombre del Cliente</ion-label>
              <ion-input
                v-model="clientName"
                placeholder="Ingrese el nombre del cliente"
                clear-input
              ></ion-input>
            </ion-item>

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
          </ion-card-content>
        </ion-card>

        <!-- Configuración de Precios -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>
              <ion-icon :icon="settings" slot="start"></ion-icon>
              Configuración de Precios
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
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

        <!-- Resultado de la Cotización -->
        <ion-card v-if="showResults" class="results-card">
          <ion-card-header>
            <ion-card-title>
              <ion-icon :icon="calculator" slot="start"></ion-icon>
              Cotización
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
                <span class="label"
                  >Descuento ({{ discountPercentage }}%):</span
                >
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
                <span class="value">{{
                  formatCurrency(implementationCost)
                }}</span>
              </div>

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

              <!-- Items adicionales de implementación -->
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
        <div class="actions-container">
          <ion-button
            expand="block"
            @click="calculateQuote"
            :disabled="!canCalculate"
            class="calculate-button"
          >
            <ion-icon :icon="calculator" slot="start"></ion-icon>
            Calcular Cotización
          </ion-button>

          <ion-button
            expand="block"
            fill="outline"
            @click="saveQuote"
            :disabled="!showResults"
            class="save-button"
          >
            <ion-icon :icon="save" slot="start"></ion-icon>
            Guardar Cotización
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
      </div>
    </ion-content>

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
              @ion-input="newItemValue = Number($event.target.value)"
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
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonContent,
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
} from "@ionic/vue";
import {
  business,
  settings,
  calculator,
  save,
  refresh,
  add,
  trash,
} from "ionicons/icons";
import { ref, computed } from "vue";

// Reactive data
const clientName = ref("");
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
  return (
    clientName.value.trim() !== "" &&
    institutionType.value !== "" &&
    numberOfBeds.value > 0
  );
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
  const total = implementationCost.value + additionalItemsTotal;
  console.log("Debug - Implementation Cost:", implementationCost.value);
  console.log("Debug - Additional Items Total:", additionalItemsTotal);
  console.log("Debug - Total Implementation Cost:", total);
  return total;
});

// Methods
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

const saveQuote = () => {
  // Aquí se implementaría la lógica para guardar la cotización
  console.log("Guardando cotización:", {
    clientName: clientName.value,
    institutionType: institutionType.value,
    numberOfBeds: numberOfBeds.value,
    pricePerBed: pricePerBed.value,
    discountPercentage: discountPercentage.value,
    subtotal: subtotal.value,
    discountAmount: discountAmount.value,
    total: total.value,
    implementationCost: implementationCost.value,
  });

  // Mostrar mensaje de éxito
  alert("Cotización guardada exitosamente");
};

const clearForm = () => {
  clientName.value = "";
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
</script>

<style scoped>
.quoter-container {
  padding: 16px;
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
  padding: 8px 0;
}

.quote-item .label {
  font-weight: 500;
  color: var(--ion-color-medium);
}

.quote-item .value {
  font-weight: 600;
  color: var(--ion-color-dark);
}

.quote-item.total {
  border-top: 1px solid var(--ion-color-light);
  padding-top: 12px;
  margin-top: 12px;
}

.quote-item .discount {
  color: var(--ion-color-danger);
}

.quote-item.grand-total {
  border-top: 2px solid var(--ion-color-primary);
  padding-top: 12px;
  margin-top: 12px;
  font-size: 1.1em;
}

.quote-item.grand-total .value {
  color: var(--ion-color-primary);
  font-size: 1.2em;
}

.quote-item.implementation {
  border-top: 2px solid var(--ion-color-warning);
  padding-top: 12px;
  margin-top: 12px;
  font-size: 1.1em;
}

.quote-item.implementation .value {
  color: var(--ion-color-warning);
  font-size: 1.2em;
}

.add-item-btn {
  margin-left: 8px;
  --color: var(--ion-color-primary);
  font-size: 0.8em;
  --padding-start: 4px;
  --padding-end: 4px;
  height: 24px;
}

.modal-content {
  padding: 16px;
}

.modal-actions {
  margin-top: 24px;
  padding: 0 16px;
}

.additional-items {
  margin-top: 8px;
}

.implementation-total {
  border-top: 2px solid var(--ion-color-success);
  padding-top: 12px;
  margin-top: 12px;
  font-size: 1.1em;
}

.implementation-total .value {
  color: var(--ion-color-success);
  font-size: 1.2em;
}

.remove-item-btn {
  margin-left: 8px;
  --color: var(--ion-color-danger);
  font-size: 0.8em;
}

.actions-container {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.calculate-button {
  --background: var(--ion-color-primary);
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
  margin: 16px 0;
}

ion-card {
  margin-bottom: 16px;
}

ion-item {
  margin-bottom: 8px;
}
</style>
