<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/client/:id"></ion-back-button>
        </ion-buttons>
        <ion-title>Historial de Facturación</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="showAddBillingModal = true">
            <ion-icon :icon="add"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div v-if="loading" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Cargando historial de facturación...</p>
      </div>

      <div v-else-if="!client" class="error-container">
        <ion-icon :icon="alert" size="large" color="danger"></ion-icon>
        <h3>Cliente no encontrado</h3>
        <ion-button @click="$router.push('/clients')">
          Volver a Clientes
        </ion-button>
      </div>

      <div v-else class="billing-history-container">
        <!-- Client Info Header -->
        <ion-card class="client-info-card">
          <ion-card-content>
            <div class="client-header">
              <ion-avatar slot="start">
                <ion-icon :icon="business" size="large"></ion-icon>
              </ion-avatar>
              <div class="client-details">
                <h2>{{ client.nombre }}</h2>
                <p>{{ client.email }}</p>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Financial Summary -->
        <ion-card class="summary-card">
          <ion-card-header>
            <ion-card-title>Resumen Financiero</ion-card-title>
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

        <!-- Billing History -->
        <div class="billing-history-section">
          <h2 class="section-title">Historial de Facturación</h2>

          <div v-if="billingHistory.length === 0" class="empty-state">
            <ion-icon :icon="document" size="large"></ion-icon>
            <p>No hay facturación registrada</p>
            <ion-button @click="showAddBillingModal = true">
              Agregar Primera Facturación
            </ion-button>
          </div>

          <div v-else class="billing-cards-container">
            <ion-card
              v-for="billing in billingHistory"
              :key="billing.id"
              class="billing-card"
              button
              @click="editBilling(billing)"
            >
              <ion-card-content>
                <div class="billing-card-header">
                  <h3>{{ formatMonth(billing.mes) }}</h3>
                  <div class="status-section">
                    <ion-badge :color="getStatusColor(billing.estado)">
                      {{ getStatusLabel(billing.estado) }}
                    </ion-badge>
                    <ion-button
                      fill="clear"
                      size="small"
                      @click.stop="editBilling(billing)"
                      class="edit-status-button"
                    >
                      <ion-icon :icon="create" size="medium"></ion-icon>
                    </ion-button>
                  </div>
                </div>

                <div class="billing-card-details">
                  <div class="billing-amount">
                    <span class="label">Facturado:</span>
                    <span class="amount"
                      >RD$
                      {{ billing.montoFacturado.toLocaleString("es-DO") }}</span
                    >
                  </div>

                  <div class="billing-amount">
                    <span class="label">Pagado:</span>
                    <span class="amount paid"
                      >RD$
                      {{ billing.montoPagado.toLocaleString("es-DO") }}</span
                    >
                  </div>

                  <div class="billing-amount">
                    <span class="label">Pendiente:</span>
                    <span class="amount pending"
                      >RD$
                      {{
                        (
                          billing.montoFacturado - billing.montoPagado
                        ).toLocaleString("es-DO")
                      }}</span
                    >
                  </div>
                </div>

                <div class="billing-card-footer">
                  <ion-button
                    v-if="billing.estado !== 'pagado'"
                    fill="clear"
                    size="small"
                    @click.stop="markAsPaid(billing)"
                  >
                    <ion-icon :icon="checkmark"></ion-icon>
                    Pago
                  </ion-button>

                  <ion-button
                    fill="clear"
                    size="small"
                    color="primary"
                    @click.stop="copyBilling(billing)"
                  >
                    <ion-icon :icon="copy"></ion-icon>
                    Copiar
                  </ion-button>

                  <ion-button
                    fill="clear"
                    size="small"
                    color="danger"
                    @click.stop="deleteBilling(billing)"
                  >
                    <ion-icon :icon="trash"></ion-icon>
                    Eliminar
                  </ion-button>
                </div>
              </ion-card-content>
            </ion-card>
          </div>
        </div>
      </div>
    </ion-content>

    <!-- Add Billing Modal -->
    <ion-modal
      :is-open="showAddBillingModal"
      @didDismiss="showAddBillingModal = false"
    >
      <ion-header>
        <ion-toolbar>
          <ion-title>Agregar Facturación</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showAddBillingModal = false"
              >Cancelar</ion-button
            >
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <BillingForm :client-id="clientId" @billing-saved="onBillingAdded" />
      </ion-content>
    </ion-modal>

    <!-- Edit Billing Modal -->
    <ion-modal
      :is-open="showEditBillingModal"
      @didDismiss="showEditBillingModal = false"
    >
      <ion-header>
        <ion-toolbar>
          <ion-title>Editar Facturación</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showEditBillingModal = false"
              >Cancelar</ion-button
            >
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <BillingForm
          :client-id="clientId"
          :billing="selectedBilling"
          @billing-saved="onBillingUpdated"
        />
      </ion-content>
    </ion-modal>

    <!-- Copy Billing Modal -->
    <ion-modal
      :is-open="showCopyBillingModal"
      @didDismiss="showCopyBillingModal = false"
    >
      <ion-header>
        <ion-toolbar>
          <ion-title>Copiar Facturación</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showCopyBillingModal = false"
              >Cancelar</ion-button
            >
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <div class="copy-billing-container">
          <ion-item>
            <ion-label position="stacked"
              >Fecha de la Nueva Facturación *</ion-label
            >
            <ion-input
              v-model="newBillingDate"
              type="date"
              :min="new Date().toISOString().split('T')[0]"
            ></ion-input>
          </ion-item>

          <div class="copy-preview">
            <h4>Vista Previa de la Facturación a Copiar:</h4>
            <div v-if="selectedBillingForCopy" class="preview-content">
              <p>
                <strong>Monto Facturado:</strong> RD$
                {{
                  selectedBillingForCopy.montoFacturado?.toLocaleString("es-DO")
                }}
              </p>
              <p><strong>Items:</strong></p>
              <ul>
                <li
                  v-for="(item, index) in selectedBillingForCopy.items"
                  :key="index"
                >
                  {{ item.descripcion }} - RD$
                  {{ item.monto?.toLocaleString("es-DO") }}
                </li>
              </ul>
              <p v-if="selectedBillingForCopy.notas">
                <strong>Notas:</strong> {{ selectedBillingForCopy.notas }}
              </p>
            </div>
          </div>

          <div class="copy-actions">
            <ion-button
              expand="block"
              @click="confirmCopyBilling"
              :disabled="!newBillingDate"
            >
              Crear Copia de Facturación
            </ion-button>
          </div>
        </div>
      </ion-content>
    </ion-modal>

    <!-- Payment Modal -->
    <PaymentModal
      :is-open="showPaymentModal"
      :billing="selectedBillingForPayment"
      :client-name="client?.nombre || ''"
      @payment-processed="onPaymentProcessed"
      @modal-closed="onPaymentModalClosed"
    />

    <!-- Toast Notification -->
    <ion-toast
      :is-open="showToast"
      :message="toastMessage"
      :color="toastColor"
      duration="3000"
      @didDismiss="showToast = false"
    />

    <!-- Delete Confirmation Alert -->
    <ion-alert
      :is-open="showDeleteAlert"
      header="Eliminar Facturación"
      message="¿Estás seguro de que quieres eliminar esta facturación? Esta acción no se puede deshacer."
      :buttons="[
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => confirmDelete(),
        },
      ]"
      @didDismiss="showDeleteAlert = false"
    />
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
  IonBadge,
  IonGrid,
  IonRow,
  IonCol,
  IonModal,
  IonSpinner,
  IonAvatar,
  IonToast,
  IonAlert,
} from "@ionic/vue";
import {
  alert,
  add,
  document,
  checkmark,
  business,
  mail,
  trash,
  copy,
  create,
} from "ionicons/icons";
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useClientsStore } from "../stores/clients";
import { useBillingStore } from "../stores/billing";
import BillingForm from "../components/BillingForm.vue";
import PaymentModal from "../components/PaymentModal.vue";

// Route
const route = useRoute();

// Stores
const clientsStore = useClientsStore();
const billingStore = useBillingStore();

// Reactive data
const loading = ref(true);
const showAddBillingModal = ref(false);
const showEditBillingModal = ref(false);
const showPaymentModal = ref(false);
const showDeleteAlert = ref(false);
const showCopyBillingModal = ref(false);
const selectedBilling = ref(null);
const selectedBillingForPayment = ref(null);
const selectedBillingForDelete = ref(null);
const selectedBillingForCopy = ref(null);
const newBillingDate = ref("");
const showToast = ref(false);
const toastMessage = ref("");
const toastColor = ref("success");

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
const formatMonth = (month: string) => {
  const [year, monthNum] = month.split("-");
  const date = new Date(parseInt(year), parseInt(monthNum) - 1);
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "pagado":
      return "success";
    case "pendiente":
      return "warning";
    case "vencido":
      return "danger";
    default:
      return "medium";
  }
};

const getStatusLabel = (status: string) => {
  const labels: { [key: string]: string } = {
    pagado: "Pagado",
    pendiente: "Pendiente",
    vencido: "Vencido",
  };
  return labels[status] || status;
};

const editBilling = (billing: any) => {
  selectedBilling.value = billing;
  showEditBillingModal.value = true;
};

const markAsPaid = (billing: any) => {
  selectedBillingForPayment.value = billing;
  showPaymentModal.value = true;
};

const sendReminder = (billing: any) => {
  // TODO: Implement send reminder functionality
  console.log("Send reminder clicked for billing:", billing.id);
};

const deleteBilling = (billing: any) => {
  selectedBillingForDelete.value = billing;
  showDeleteAlert.value = true;
};

const confirmDelete = async () => {
  try {
    if (selectedBillingForDelete.value) {
      await billingStore.deleteBilling(selectedBillingForDelete.value.id);

      // Show success message
      toastMessage.value = "Facturación eliminada exitosamente";
      toastColor.value = "success";
      showToast.value = true;

      selectedBillingForDelete.value = null;
    }
  } catch (error) {
    console.error("Error deleting billing:", error);

    // Show error message
    toastMessage.value = "Error al eliminar la facturación";
    toastColor.value = "danger";
    showToast.value = true;
  }
};

const copyBilling = (billing: any) => {
  selectedBillingForCopy.value = billing;
  newBillingDate.value = new Date().toISOString().split("T")[0];
  showCopyBillingModal.value = true;
};

const confirmCopyBilling = async () => {
  try {
    if (selectedBillingForCopy.value && newBillingDate.value) {
      // Create a new billing based on the selected one
      const newBilling = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        clienteId: clientId.value,
        mes: new Date(newBillingDate.value).toISOString().slice(0, 7), // YYYY-MM format
        montoFacturado: selectedBillingForCopy.value.montoFacturado,
        montoPagado: 0, // Reset payment amount for new billing
        fechaUltimoPago: null,
        fechaVencimiento: new Date(newBillingDate.value),
        cuotasVencidas: 0,
        fechaCompromiso: null,
        estado: "pendiente", // Reset status to pending
        notas: selectedBillingForCopy.value.notas,
        items: selectedBillingForCopy.value.items
          ? [...selectedBillingForCopy.value.items]
          : [],
      };

      await billingStore.addBilling(newBilling);
      showCopyBillingModal.value = false;
      selectedBillingForCopy.value = null;
      newBillingDate.value = "";

      // Show success message
      toastMessage.value = "Facturación copiada exitosamente";
      toastColor.value = "success";
      showToast.value = true;
    }
  } catch (error) {
    console.error("Error copying billing:", error);

    // Show error message
    toastMessage.value = "Error al copiar la facturación";
    toastColor.value = "danger";
    showToast.value = true;
  }
};

const onBillingAdded = async (newBilling: any) => {
  try {
    await billingStore.addBilling(newBilling);
    showAddBillingModal.value = false;
  } catch (error) {
    console.error("Error adding billing:", error);
  }
};

const onBillingUpdated = async (updatedBilling: any) => {
  try {
    await billingStore.updateBilling(updatedBilling);
    showEditBillingModal.value = false;
    selectedBilling.value = null;
  } catch (error) {
    console.error("Error updating billing:", error);
  }
};

const onPaymentProcessed = async (payment: any) => {
  try {
    // Update the billing record with the payment
    const billing = selectedBillingForPayment.value;
    if (!billing) return;

    const updatedBilling = {
      ...billing,
      montoPagado: billing.montoPagado + payment.amount,
      fechaUltimoPago: new Date(payment.date),
      estado:
        billing.montoPagado + payment.amount >= billing.montoFacturado
          ? "pagado"
          : "pendiente",
    };

    await billingStore.updateBilling(updatedBilling);
    showPaymentModal.value = false;
    selectedBillingForPayment.value = null;

    // Show success message
    const paymentType = payment.type === "complete" ? "Pago completo" : "Abono";
    const message = `${paymentType} de RD$ ${payment.amount.toLocaleString(
      "es-DO"
    )} registrado el ${new Date(payment.date).toLocaleDateString("es-ES")}`;

    toastMessage.value = message;
    toastColor.value = "success";
    showToast.value = true;
  } catch (error) {
    console.error("Error processing payment:", error);
  }
};

const onPaymentModalClosed = () => {
  showPaymentModal.value = false;
  selectedBillingForPayment.value = null;
};

// Load data on mount
onMounted(async () => {
  try {
    console.log("Loading billing history data...");
    await clientsStore.loadClients();
    console.log("Clients loaded");
    await billingStore.loadBilling();
    console.log("Billing loaded");
  } catch (error) {
    console.error("Error loading data:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.billing-history-container {
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

.client-info-card {
  margin-bottom: 16px;
}

.client-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.client-details h2 {
  margin: 0 0 4px 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.client-details p {
  margin: 0;
  color: var(--ion-color-medium);
  font-size: 0.9rem;
}

.summary-card {
  margin-bottom: 16px;
}

.billing-history-section {
  margin-top: 24px;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--ion-color-dark);
  padding: 0 4px;
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

.status-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.edit-status-button {
  --padding-start: 4px;
  --padding-end: 4px;
  --color: var(--ion-color-medium);
  min-width: 24px;
  height: 24px;
}

.edit-status-button:hover {
  --color: var(--ion-color-primary);
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
  align-items: center;
  border-top: 1px solid var(--ion-color-light);
  padding-top: 12px;
}

.billing-card-footer ion-button {
  min-width: 80px;
  max-width: 120px;
  flex: 0 0 auto;
}

.billing-card-footer ion-button ion-icon {
  margin-right: 6px;
}

.empty-state {
  text-align: center;
  padding: 32px 16px;
}

.empty-state ion-icon {
  color: var(--ion-color-medium);
  margin-bottom: 16px;
}

.empty-state p {
  color: var(--ion-color-medium);
  margin-bottom: 16px;
}

.copy-billing-container {
  padding: 16px;
}

.copy-preview {
  margin: 24px 0;
  padding: 16px;
  background-color: var(--ion-color-light-tint);
  border-radius: 8px;
}

.copy-preview h4 {
  margin: 0 0 16px 0;
  color: var(--ion-color-dark);
  font-size: 1rem;
}

.preview-content p {
  margin: 8px 0;
  color: var(--ion-color-dark);
}

.preview-content ul {
  margin: 8px 0;
  padding-left: 20px;
}

.preview-content li {
  margin: 4px 0;
  color: var(--ion-color-dark);
}

.copy-actions {
  margin-top: 24px;
}
</style>
