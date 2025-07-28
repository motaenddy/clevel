<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/clients"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ client?.nombre || "Detalle del Cliente" }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div v-if="loading" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Cargando información del cliente...</p>
      </div>

      <div v-else-if="!client" class="error-container">
        <ion-icon :icon="alert" size="large" color="danger"></ion-icon>
        <h3>Cliente no encontrado</h3>
        <ion-button @click="$router.push('/clients')">
          Volver a Clientes
        </ion-button>
      </div>

      <div v-else class="client-detail-container">
        <!-- Client Information Card -->
        <ion-card>
          <ion-card-header>
            <div class="card-header-content">
              <ion-card-title>Información del Cliente</ion-card-title>
              <ion-button
                fill="clear"
                @click="editClientInfo"
                class="edit-button"
              >
                <ion-icon :icon="create" color="primary"></ion-icon>
                Editar
              </ion-button>
            </div>
          </ion-card-header>
          <ion-card-content>
            <div class="client-info-compact">
              <div class="info-line">
                <span class="info-value">{{ client.nombre }}</span>
              </div>

              <div v-if="client.email" class="info-line">
                <span class="info-value">{{ client.email }}</span>
              </div>

              <div v-if="client.telefono" class="info-line">
                <span class="info-value">{{ client.telefono }}</span>
              </div>

              <div v-if="client.direccion" class="info-line">
                <span class="info-value">{{ client.direccion }}</span>
              </div>

              <div v-if="client.notas" class="info-line">
                <span class="info-value">{{ client.notas }}</span>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Financial Summary Card -->
        <ion-card
          button
          @click="navigateToBillingHistory"
          class="financial-summary-card"
        >
          <ion-card-header>
            <ion-card-title>Resumen Financiero</ion-card-title>
            <ion-icon slot="end" :icon="document" color="medium"></ion-icon>
          </ion-card-header>
          <ion-card-content>
            <ion-grid>
              <ion-row>
                <ion-col size="6">
                  <div class="financial-item">
                    <h4>Total Facturado</h4>
                    <p class="amount total">
                      RD$ {{ totalFacturado.toLocaleString("es-DO") }}
                    </p>
                  </div>
                </ion-col>
                <ion-col size="6">
                  <div class="financial-item">
                    <h4>Total Pagado</h4>
                    <p class="amount paid">
                      RD$ {{ totalPagado.toLocaleString("es-DO") }}
                    </p>
                  </div>
                </ion-col>
              </ion-row>
              <ion-row>
                <ion-col size="6">
                  <div class="financial-item">
                    <h4>Monto Pendiente</h4>
                    <p class="amount pending">
                      RD$ {{ montoPendiente.toLocaleString("es-DO") }}
                    </p>
                  </div>
                </ion-col>
                <ion-col size="6">
                  <div class="financial-item">
                    <h4>Cuotas Vencidas</h4>
                    <p class="amount overdue">
                      {{ cuotasVencidas }}
                    </p>
                  </div>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-card-content>
        </ion-card>

        <!-- Negotiation Pipeline Card -->
        <div v-if="clientNegotiation">
          <NegotiationPipeline
            :negotiation="clientNegotiation"
            @update="onNegotiationUpdated"
          />
        </div>

        <!-- No Negotiation Card -->
        <ion-card v-else class="no-negotiation-card">
          <ion-card-header>
            <ion-card-title>
              <ion-icon :icon="trendingUp" slot="start"></ion-icon>
              Estado de Negociación
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="no-negotiation-content">
              <ion-icon
                :icon="addCircle"
                size="large"
                color="medium"
              ></ion-icon>
              <h3>No hay negociación activa</h3>
              <p>Inicia una nueva negociación para este cliente</p>
              <ion-button @click="createNewNegotiation" fill="outline">
                <ion-icon :icon="add" slot="start"></ion-icon>
                Crear Negociación
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>
      </div>

      <!-- Floating Action Button for Billing -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="openBillingModal">
          <ion-icon :icon="card"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>

    <!-- Edit Field Modal -->
    <ion-modal
      :is-open="showEditFieldModal"
      @didDismiss="showEditFieldModal = false"
    >
      <ion-header>
        <ion-toolbar>
          <ion-title>Editar {{ getFieldLabel(editingField) }}</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showEditFieldModal = false"
              >Cancelar</ion-button
            >
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <div class="edit-field-container">
          <ion-item>
            <ion-label position="stacked">{{
              getFieldLabel(editingField)
            }}</ion-label>
            <ion-input
              v-if="editingField !== 'estado'"
              v-model="editingValue"
              :type="getInputType(editingField)"
              :placeholder="getFieldPlaceholder(editingField)"
            ></ion-input>
            <ion-select
              v-else
              v-model="editingValue"
              placeholder="Selecciona el estado"
            >
              <ion-select-option value="activo">Activo</ion-select-option>
              <ion-select-option value="inactivo">Inactivo</ion-select-option>
            </ion-select>
          </ion-item>
          <div class="edit-actions">
            <ion-button expand="block" @click="saveField">
              Guardar Cambios
            </ion-button>
          </div>
        </div>
      </ion-content>
    </ion-modal>

    <!-- Edit Client Modal -->
    <ion-modal
      :is-open="showEditClientModal"
      @didDismiss="showEditClientModal = false"
    >
      <ion-header>
        <ion-toolbar>
          <ion-title>Editar Cliente</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showEditClientModal = false"
              >Cancelar</ion-button
            >
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ClientForm :client="editingClient" @client-saved="onClientUpdated" />
      </ion-content>
    </ion-modal>

    <!-- Billing Modal -->
    <ion-modal
      :is-open="showBillingModal"
      @didDismiss="showBillingModal = false"
    >
      <ion-header>
        <ion-toolbar>
          <ion-title>Facturar - {{ client?.nombre }}</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showBillingModal = false">Cancelar</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <BillingForm
          v-if="client"
          :client-id="client.id"
          @billing-saved="onBillingSaved"
        />
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
  IonButton,
  IonIcon,
  IonBackButton,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonModal,
  IonSpinner,
  IonFab,
  IonFabButton,
} from "@ionic/vue";
import {
  create,
  alert,
  document,
  card,
  trendingUp,
  addCircle,
  add,
} from "ionicons/icons";
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useClientsStore } from "../stores/clients";
import { useBillingStore } from "../stores/billing";
import ClientForm from "../components/ClientForm.vue";
import BillingForm from "../components/BillingForm.vue";
import NegotiationPipeline from "../components/NegotiationPipeline.vue";
import { NegotiationService } from "../services/NegotiationService";
import { Negotiation } from "../types/negotiation";

// Route and router
const route = useRoute();
const router = useRouter();

// Stores
const clientsStore = useClientsStore();
const billingStore = useBillingStore();

// Reactive data
const loading = ref(true);
const showEditFieldModal = ref(false);
const showEditClientModal = ref(false);
const showBillingModal = ref(false);
const editingField = ref("");
const editingValue = ref("");
const editingClient = ref(null);

// Negotiation service and data
const negotiationService = new NegotiationService();
const clientNegotiation = ref<Negotiation | null>(null);

// Computed properties
const clientId = computed(() => route.params.id as string);
const client = computed(() => {
  const baseClient = clientsStore.getClientById(clientId.value);
  if (!baseClient) return null;

  // Get dynamic financial data
  const financial = clientsStore.getClientFinancialSummary(clientId.value);
  return {
    ...baseClient,
    montoPendiente: financial.montoPendiente,
    cuotasVencidas: financial.cuotasVencidas,
  };
});

// Financial summary computed properties
const billingHistory = computed(() =>
  billingStore.getBillingByClient(clientId.value)
);

const totalFacturado = computed(() =>
  billingHistory.value.reduce((sum, billing) => sum + billing.montoFacturado, 0)
);

const totalPagado = computed(() =>
  billingHistory.value.reduce((sum, billing) => sum + billing.montoPagado, 0)
);

const montoPendiente = computed(() => totalFacturado.value - totalPagado.value);

const cuotasVencidas = computed(
  () =>
    billingHistory.value.filter((billing) => billing.estado === "vencido")
      .length
);

// Methods

const getFieldLabel = (field: string) => {
  const labels: { [key: string]: string } = {
    nombre: "Nombre",
    email: "Email",
    telefono: "Teléfono",
    direccion: "Dirección",
    estado: "Estado",
    notas: "Notas",
  };
  return labels[field] || field;
};

const getInputType = (field: string) => {
  const types: { [key: string]: string } = {
    nombre: "text",
    email: "email",
    telefono: "tel",
    direccion: "text",
    notas: "text",
  };
  return types[field] || "text";
};

const getFieldPlaceholder = (field: string) => {
  const placeholders: { [key: string]: string } = {
    nombre: "Ingresa el nombre del cliente",
    email: "ejemplo@cliente.com",
    telefono: "809-555-0000",
    direccion: "Dirección completa del cliente",
    notas: "Notas adicionales sobre el cliente",
  };
  return placeholders[field] || "";
};

const saveField = async () => {
  if (!client.value || !editingField.value) return;

  try {
    const updatedClient = { ...client.value };
    updatedClient[editingField.value] = editingValue.value;

    await clientsStore.updateClient(updatedClient);
    showEditFieldModal.value = false;
  } catch (error) {
    console.error("Error updating client field:", error);
  }
};

const navigateToBillingHistory = () => {
  router.push(`/client/${clientId.value}/billing`);
};

const editClientInfo = () => {
  editingClient.value = { ...client.value };
  showEditClientModal.value = true;
};

const onClientUpdated = async (updatedClient: any) => {
  try {
    await clientsStore.updateClient(updatedClient);
    showEditClientModal.value = false;
    editingClient.value = null;
  } catch (error) {
    console.error("Error updating client:", error);
  }
};

const openBillingModal = () => {
  showBillingModal.value = true;
};

const onBillingSaved = async (billing: any) => {
  try {
    await billingStore.addBilling(billing);
    showBillingModal.value = false;
  } catch (error) {
    console.error("Error saving billing:", error);
  }
};

// Negotiation methods
const loadClientNegotiation = async () => {
  if (!clientId.value) return;

  try {
    const negotiations = await negotiationService.getNegotiationsByClient(
      clientId.value
    );
    // Get the most recent negotiation or create a new one
    clientNegotiation.value = negotiations.length > 0 ? negotiations[0] : null;
  } catch (error) {
    console.error("Error loading client negotiation:", error);
  }
};

const onNegotiationUpdated = async (updatedNegotiation: Negotiation) => {
  try {
    clientNegotiation.value = updatedNegotiation;
  } catch (error) {
    console.error("Error updating negotiation:", error);
  }
};

const createNewNegotiation = async () => {
  if (!clientId.value) return;

  try {
    const newNegotiation = await negotiationService.createNegotiation({
      clientId: clientId.value,
      currentStage: "contact",
      startDate: new Date(),
      notes: "Nueva negociación iniciada",
      probability: 10,
      estimatedValue: 0,
      stages: [], // Will be set by the service
      stageDates: { contact: new Date() }, // Fecha inicial para contacto
    });

    clientNegotiation.value = newNegotiation;
  } catch (error) {
    console.error("Error creating new negotiation:", error);
  }
};

// Load data on mount
onMounted(async () => {
  try {
    console.log("Loading data...");
    await clientsStore.loadClients();
    console.log("Clients loaded");
    await billingStore.loadBilling();
    console.log("Billing loaded");
    await loadClientNegotiation();
    console.log("Negotiation loaded");
  } catch (error) {
    console.error("Error loading data:", error);
  } finally {
    loading.value = false;
  }
});

// Recargar negociación cuando se regresa de la vista de sub-etapas
const handleFocus = async () => {
  await loadClientNegotiation();
};

onMounted(() => {
  window.addEventListener("focus", handleFocus);
});

onUnmounted(() => {
  window.removeEventListener("focus", handleFocus);
});
</script>

<style scoped>
.client-detail-container {
  padding: 16px;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  text-align: center;
}

.financial-item {
  text-align: center;
  padding: 8px;
}

.financial-item h4 {
  margin: 0 0 8px 0;
  font-size: 0.9rem;
  color: var(--ion-color-medium);
}

.amount {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
}

.amount.total {
  color: var(--ion-color-primary);
}

.amount.paid {
  color: var(--ion-color-success);
}

.amount.pending {
  color: var(--ion-color-warning);
}

.amount.overdue {
  color: var(--ion-color-danger);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--ion-color-medium);
}

.empty-state ion-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.empty-state p {
  margin-bottom: 24px;
}

ion-card {
  margin-bottom: 16px;
}

ion-item h3 {
  font-weight: 600;
  margin-bottom: 4px;
}

ion-item p {
  margin: 0;
  color: var(--ion-color-medium);
}

.edit-field-container {
  padding: 16px;
}

.edit-actions {
  margin-top: 24px;
  padding: 0 16px;
}

ion-item[button] {
  cursor: pointer;
}

ion-item[button]:hover {
  background-color: var(--ion-color-light);
}

.billing-cards-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.billing-card {
  margin: 0;
  border: 1px solid var(--ion-color-light);
  transition: all 0.2s ease;
}

.no-negotiation-card {
  margin: 16px;
}

.no-negotiation-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px;
}

.no-negotiation-content h3 {
  margin: 16px 0 8px 0;
  color: var(--ion-color-medium);
}

.no-negotiation-content p {
  margin: 0 0 20px 0;
  color: var(--ion-color-medium);
}

.billing-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.billing-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.billing-card-header h3 {
  margin: 0;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.billing-card-details {
  margin-bottom: 16px;
}

.billing-amount {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.billing-amount .label {
  font-weight: 500;
  color: var(--ion-color-medium);
}

.billing-amount .amount {
  font-weight: 600;
  color: var(--ion-color-dark);
}

.billing-amount .amount.paid {
  color: var(--ion-color-success);
}

.billing-amount .amount.pending {
  color: var(--ion-color-warning);
}

.billing-card-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  border-top: 1px solid var(--ion-color-light);
  padding-top: 12px;
}

.client-info-compact {
  padding: 8px 0;
}

.info-line {
  margin-bottom: 12px;
  line-height: 1.4;
}

.info-line:last-child {
  margin-bottom: 0;
}

.info-value {
  font-size: 1rem;
  color: var(--ion-color-dark);
  display: block;
}

.card-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.edit-button {
  --padding-start: 12px;
  --padding-end: 12px;
  min-width: 80px;
  height: 36px;
  font-size: 0.9rem;
}

.financial-summary-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.financial-summary-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}
</style>
