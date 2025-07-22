<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Clientes</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="showAddClientModal = true">
            <ion-icon :icon="add"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Clientes</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="clients-container">
        <!-- Search and Filters -->
        <ion-searchbar
          v-model="searchTerm"
          placeholder="Buscar clientes..."
          @ionInput="filterClients"
        ></ion-searchbar>

        <!-- Filter Chips -->
        <ion-segment v-model="selectedFilter" @ionChange="filterClients">
          <ion-segment-button value="active">
            <ion-label>Activos</ion-label>
          </ion-segment-button>
          <ion-segment-button value="inactive">
            <ion-label>Cancelados</ion-label>
          </ion-segment-button>
          <ion-segment-button value="all">
            <ion-label>Todos</ion-label>
          </ion-segment-button>
        </ion-segment>

        <!-- Clients List -->
        <ion-list>
          <ion-item
            v-for="cliente in filteredClients"
            :key="cliente.id"
            @click="viewClientDetail(cliente)"
            button
          >
            <ion-avatar slot="start">
              <ion-icon :icon="business" size="large"></ion-icon>
            </ion-avatar>

            <ion-label>
              <h2>{{ cliente.nombre }}</h2>
              <p>{{ cliente.email }}</p>
              <p v-if="cliente.montoPendiente > 0" class="pending-amount">
                Pendiente: RD$ {{ formatCurrency(cliente.montoPendiente) }}
              </p>
              <ion-chip
                color="primary"
                @click.stop="quickBillClient(cliente)"
                class="quick-bill-chip"
              >
                <ion-icon :icon="card"></ion-icon>
                <ion-label>Facturar</ion-label>
              </ion-chip>
            </ion-label>

            <ion-note slot="end">
              <div v-if="cliente.cuotasVencidas > 0" class="overdue-badge">
                {{ cliente.cuotasVencidas }} vencidas
              </div>
              <div v-else class="status-badge" :class="cliente.estado">
                {{ cliente.estado }}
              </div>
            </ion-note>
          </ion-item>
        </ion-list>

        <!-- Empty State -->
        <div v-if="filteredClients.length === 0" class="empty-state">
          <ion-icon :icon="people" size="large"></ion-icon>
          <h3>No hay clientes</h3>
          <p>Agrega tu primer cliente para comenzar</p>
          <ion-button @click="showAddClientModal = true">
            Agregar Cliente
          </ion-button>
        </div>
      </div>
    </ion-content>

    <!-- Add Client Modal -->
    <ion-modal
      :is-open="showAddClientModal"
      @didDismiss="showAddClientModal = false"
    >
      <ion-header>
        <ion-toolbar>
          <ion-title>Agregar Cliente</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showAddClientModal = false"
              >Cancelar</ion-button
            >
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ClientForm @client-saved="onClientSaved" />
      </ion-content>
    </ion-modal>

    <!-- Quick Billing Modal -->
    <ion-modal
      :is-open="showBillingModal"
      @didDismiss="showBillingModal = false"
    >
      <ion-header>
        <ion-toolbar>
          <ion-title
            >Facturar - {{ selectedClientForBilling?.nombre }}</ion-title
          >
          <ion-buttons slot="end">
            <ion-button @click="showBillingModal = false">Cancelar</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <BillingForm
          v-if="selectedClientForBilling"
          :client-id="selectedClientForBilling.id"
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
  IonMenuButton,
  IonContent,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonItem,
  IonAvatar,
  IonNote,
  IonModal,
  IonChip,
} from "@ionic/vue";
import { add, business, people, card } from "ionicons/icons";
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useClientsStore } from "../stores/clients";
import { useBillingStore } from "../stores/billing";
import ClientForm from "../components/ClientForm.vue";
import BillingForm from "../components/BillingForm.vue";

// Stores
const clientsStore = useClientsStore();
const billingStore = useBillingStore();

// Reactive data
const searchTerm = ref("");
const selectedFilter = ref("active");
const showAddClientModal = ref(false);
const showBillingModal = ref(false);
const selectedClientForBilling = ref(null);

const router = useRouter();

// Computed properties
const filteredClients = computed(() => {
  // Use clients with dynamic financial data
  let filtered = clientsStore.getClientsWithFinancialData;

  // Filter by search term
  if (searchTerm.value) {
    filtered = filtered.filter(
      (cliente) =>
        cliente.nombre.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        cliente.email.toLowerCase().includes(searchTerm.value.toLowerCase())
    );
  }

  // Filter by status
  if (selectedFilter.value === "active") {
    filtered = filtered.filter((cliente) => cliente.estado === "activo");
  } else if (selectedFilter.value === "inactive") {
    filtered = filtered.filter((cliente) => cliente.estado === "inactivo");
  }

  return filtered;
});

// Methods
const filterClients = () => {
  // This will trigger the computed property
  console.log("Filtering clients...");
};

const viewClientDetail = (cliente: any) => {
  router.push(`/client/${cliente.id}`);
};

const quickBillClient = (cliente: any) => {
  // Store the selected client for billing
  selectedClientForBilling.value = cliente;
  showBillingModal.value = true;
};

const onClientSaved = async (newClient: any) => {
  try {
    await clientsStore.addClient(newClient);
    showAddClientModal.value = false;
  } catch (error) {
    console.error("Error saving client:", error);
  }
};

const onBillingSaved = async (billing: any) => {
  try {
    await billingStore.addBilling(billing);
    showBillingModal.value = false;
    selectedClientForBilling.value = null;
  } catch (error) {
    console.error("Error saving billing:", error);
  }
};

const formatCurrency = (amount: number) => {
  return amount.toLocaleString("es-DO");
};

// Load initial data
onMounted(async () => {
  await clientsStore.loadClients();
});
</script>

<style scoped>
.clients-container {
  padding: 16px;
}

.pending-amount {
  color: var(--ion-color-warning);
  font-weight: bold;
}

.overdue-badge {
  background: var(--ion-color-danger);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.status-badge.activo {
  background: var(--ion-color-success);
  color: white;
}

.status-badge.inactivo {
  background: var(--ion-color-medium);
  color: white;
}

.quick-bill-chip {
  margin-top: 8px;
  cursor: pointer;
}

.quick-bill-chip:hover {
  opacity: 0.8;
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

.empty-state h3 {
  margin: 16px 0 8px 0;
  color: var(--ion-color-dark);
}

.empty-state p {
  margin-bottom: 24px;
}
</style>
