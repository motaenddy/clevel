<template>
  <ion-modal :is-open="isOpen" @didDismiss="closeModal">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ client?.nombre || "Detalles del Centro" }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="closeModal">
            <ion-icon :icon="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content v-if="client" class="ion-padding">
      <!-- Status Badge -->
      <div class="status-header">
        <ion-chip
          :color="getStatusChipColor(client.colorStatus)"
          size="large"
          class="status-chip"
        >
          <ion-icon :icon="flag"></ion-icon>
          <ion-label>{{ getStatusLabel(client.colorStatus) }}</ion-label>
        </ion-chip>

        <div class="cotizado-amount">
          <span class="amount-label">Cotizado:</span>
          <span class="amount-value"
            >RD$ {{ formatCurrency(client.cotizado || 0) }}</span
          >
        </div>
      </div>

      <!-- Información Principal -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>
            <ion-icon :icon="business"></ion-icon>
            Información del Centro
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div class="info-grid">
            <div class="info-item">
              <ion-label class="info-label">Cliente:</ion-label>
              <ion-input
                v-model="editableClient.nombre"
                :readonly="!isEditing"
                class="info-value"
              ></ion-input>
            </div>

            <div class="info-item">
              <ion-label class="info-label">Sistema:</ion-label>
              <ion-input
                v-model="editableClient.sistema"
                :readonly="!isEditing"
                class="info-value"
              ></ion-input>
            </div>

            <div class="info-item">
              <ion-label class="info-label">Contacto Cliente:</ion-label>
              <ion-input
                v-model="editableClient.contactoCliente"
                :readonly="!isEditing"
                class="info-value"
              ></ion-input>
            </div>

            <div class="info-item">
              <ion-label class="info-label">Responsable:</ion-label>
              <ion-input
                v-model="editableClient.responsable"
                :readonly="!isEditing"
                class="info-value"
              ></ion-input>
            </div>

            <div class="info-item">
              <ion-label class="info-label">Email:</ion-label>
              <ion-input
                v-model="editableClient.email"
                :readonly="!isEditing"
                class="info-value"
              ></ion-input>
            </div>

            <div class="info-item">
              <ion-label class="info-label">Teléfono:</ion-label>
              <ion-input
                v-model="editableClient.telefono"
                :readonly="!isEditing"
                class="info-value"
              ></ion-input>
            </div>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Status y Seguimiento -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>
            <ion-icon :icon="clipboard"></ion-icon>
            Status y Seguimiento
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div class="status-grid">
            <div class="status-item full-width">
              <ion-label class="info-label">Status Actual:</ion-label>
              <ion-textarea
                v-model="editableClient.status"
                :readonly="!isEditing"
                rows="3"
                class="status-textarea"
              ></ion-textarea>
            </div>

            <div class="status-item">
              <ion-label class="info-label">Fecha Actualización:</ion-label>
              <ion-datetime-button
                v-if="isEditing"
                datetime="fecha-actualizacion"
              ></ion-datetime-button>
              <ion-datetime
                v-if="isEditing"
                id="fecha-actualizacion"
                v-model="editableClient.fechaUltimaActualizacion"
                presentation="date"
              ></ion-datetime>
              <span v-else class="date-display">
                {{ formatDate(editableClient.fechaUltimaActualizacion) }}
              </span>
            </div>

            <div class="status-item">
              <ion-label class="info-label">Color Status:</ion-label>
              <ion-select
                v-model="editableClient.colorStatus"
                :disabled="!isEditing"
                interface="popover"
              >
                <ion-select-option value="verde"
                  >🟢 Verde - Propuesta aceptada</ion-select-option
                >
                <ion-select-option value="amarillo"
                  >🟡 Amarillo - En implementación</ion-select-option
                >
                <ion-select-option value="azul"
                  >🔵 Azul - Implementado y seguimiento</ion-select-option
                >
                <ion-select-option value="rojo"
                  >🔴 Rojo - Esperando respuesta</ion-select-option
                >
                <ion-select-option value="azul-oscuro"
                  >🔵 Azul Oscuro - Propuesta no aceptada</ion-select-option
                >
                <ion-select-option value="morado"
                  >🟣 Morado - Implementación concluida</ion-select-option
                >
              </ion-select>
            </div>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Próximo Paso -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>
            <ion-icon :icon="arrowForward"></ion-icon>
            Próximo Paso
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div class="next-step-grid">
            <div class="next-step-item full-width">
              <ion-label class="info-label">Próximo Paso:</ion-label>
              <ion-textarea
                v-model="editableClient.proximoPaso"
                :readonly="!isEditing"
                rows="2"
                class="next-step-textarea"
              ></ion-textarea>
            </div>

            <div class="next-step-item">
              <ion-label class="info-label">Fecha Próximo Paso:</ion-label>
              <ion-datetime-button
                v-if="isEditing"
                datetime="fecha-proximo-paso"
              ></ion-datetime-button>
              <ion-datetime
                v-if="isEditing"
                id="fecha-proximo-paso"
                v-model="editableClient.fechaProximoPaso"
                presentation="date"
              ></ion-datetime>
              <span v-else class="date-display">
                {{ formatDate(editableClient.fechaProximoPaso) }}
              </span>
            </div>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Información Financiera -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>
            <ion-icon :icon="cash"></ion-icon>
            Información Financiera
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div class="financial-grid">
            <div class="financial-item">
              <ion-label class="info-label">Monto Cotizado:</ion-label>
              <ion-input
                v-model.number="editableClient.cotizado"
                :readonly="!isEditing"
                type="number"
                class="financial-input"
              ></ion-input>
            </div>

            <div class="financial-item">
              <ion-label class="info-label">Etapa de Venta:</ion-label>
              <ion-select
                v-model="editableClient.etapaVenta"
                :disabled="!isEditing"
                interface="popover"
              >
                <ion-select-option value="contacto"
                  >📞 Contacto</ion-select-option
                >
                <ion-select-option value="propuesta"
                  >📋 Propuesta</ion-select-option
                >
                <ion-select-option value="negociacion"
                  >🤝 Negociación</ion-select-option
                >
                <ion-select-option value="cierre">✅ Cierre</ion-select-option>
              </ion-select>
            </div>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Notas -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>
            <ion-icon :icon="document"></ion-icon>
            Notas Adicionales
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-textarea
            v-model="editableClient.notas"
            :readonly="!isEditing"
            rows="4"
            placeholder="Agregar notas adicionales..."
          ></ion-textarea>
        </ion-card-content>
      </ion-card>

      <!-- Botones de Acción -->
      <div class="action-buttons">
        <ion-button
          v-if="!isEditing"
          @click="startEditing"
          expand="block"
          color="primary"
        >
          <ion-icon :icon="create" slot="start"></ion-icon>
          Editar Información
        </ion-button>

        <div v-else class="edit-buttons">
          <ion-button @click="saveChanges" expand="block" color="success">
            <ion-icon :icon="checkmark" slot="start"></ion-icon>
            Guardar Cambios
          </ion-button>

          <ion-button
            @click="cancelEditing"
            expand="block"
            color="medium"
            fill="outline"
          >
            <ion-icon :icon="close" slot="start"></ion-icon>
            Cancelar
          </ion-button>
        </div>
      </div>
    </ion-content>
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
  IonIcon,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonChip,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonDatetimeButton,
} from "@ionic/vue";
import {
  close,
  flag,
  business,
  clipboard,
  arrowForward,
  cash,
  document,
  create,
  checkmark,
} from "ionicons/icons";
import { ref, watch } from "vue";
import type { Client } from "../services/StorageService";

// Props
interface Props {
  isOpen: boolean;
  client: Client | null;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  close: [];
  save: [client: Client];
}>();

// Reactive data
const isEditing = ref(false);
const editableClient = ref<Client>({} as Client);

// Watch for client changes
watch(
  () => props.client,
  (newClient) => {
    if (newClient) {
      editableClient.value = { ...newClient };
    }
  },
  { immediate: true }
);

// Methods
const closeModal = () => {
  isEditing.value = false;
  emit("close");
};

const startEditing = () => {
  isEditing.value = true;
};

const cancelEditing = () => {
  if (props.client) {
    editableClient.value = { ...props.client };
  }
  isEditing.value = false;
};

const saveChanges = () => {
  emit("save", editableClient.value);
  isEditing.value = false;
};

const formatCurrency = (amount: number) => {
  return amount.toLocaleString("es-DO");
};

const formatDate = (date?: Date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getStatusChipColor = (colorStatus?: string) => {
  const colorMap = {
    verde: "success",
    amarillo: "warning",
    azul: "primary",
    rojo: "danger",
    "azul-oscuro": "tertiary",
    morado: "secondary",
  };
  return colorMap[colorStatus as keyof typeof colorMap] || "medium";
};

const getStatusLabel = (colorStatus?: string) => {
  const labelMap = {
    verde: "Propuesta Aceptada",
    amarillo: "En Implementación",
    azul: "Implementado y Seguimiento",
    rojo: "Esperando Respuesta",
    "azul-oscuro": "Propuesta No Aceptada",
    morado: "Implementación Concluida",
  };
  return labelMap[colorStatus as keyof typeof labelMap] || "Sin Status";
};
</script>

<style scoped>
.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px;
  background: var(--ion-color-light);
  border-radius: 8px;
}

.status-chip {
  font-size: 1rem;
}

.cotizado-amount {
  text-align: right;
}

.amount-label {
  display: block;
  font-size: 0.9rem;
  color: var(--ion-color-medium-shade);
}

.amount-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--ion-color-success);
}

.info-grid,
.status-grid,
.next-step-grid,
.financial-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-item,
.status-item,
.next-step-item,
.financial-item {
  display: flex;
  flex-direction: column;
}

.full-width {
  grid-column: 1 / -1;
}

.info-label {
  font-weight: 600;
  color: var(--ion-color-dark);
  margin-bottom: 4px;
  font-size: 0.9rem;
}

.info-value,
.financial-input {
  --background: var(--ion-color-light);
  --color: var(--ion-color-dark);
  font-weight: 500;
}

.status-textarea,
.next-step-textarea {
  --background: var(--ion-color-light);
  --color: var(--ion-color-dark);
}

.date-display {
  padding: 12px;
  background: var(--ion-color-light);
  border-radius: 4px;
  color: var(--ion-color-dark);
}

.action-buttons {
  margin-top: 24px;
  padding-bottom: 16px;
}

.edit-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Responsive design */
@media (max-width: 768px) {
  .info-grid,
  .status-grid,
  .next-step-grid,
  .financial-grid {
    grid-template-columns: 1fr;
  }

  .status-header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
}
</style>
