<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/client"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ stage?.name || "Detalle de Etapa" }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="showAddSubStageModal = true">
            <ion-icon :icon="add"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div v-if="loading" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Cargando detalles de la etapa...</p>
      </div>

      <div v-else-if="!stage" class="error-container">
        <ion-icon :icon="alert" size="large" color="danger"></ion-icon>
        <h3>Etapa no encontrada</h3>
        <ion-button @click="$router.push('/client')">
          Volver al Cliente
        </ion-button>
      </div>

      <div v-else class="stage-detail-container">
        <!-- Stage Header -->
        <ion-card class="stage-header-card">
          <ion-card-header>
            <div class="stage-header-content">
              <div class="stage-icon" :style="{ backgroundColor: stage.color }">
                <ion-icon :icon="getIcon(stage.icon)" size="large"></ion-icon>
              </div>
              <div class="stage-info">
                <h2>{{ stage.name }}</h2>
                <p>{{ stage.description }}</p>
                <div class="stage-progress">
                  <ion-progress-bar
                    :value="completedSubStages / totalSubStages"
                    color="primary"
                  ></ion-progress-bar>
                  <span class="progress-text"
                    >{{ completedSubStages }} de
                    {{ totalSubStages }} completadas</span
                  >
                </div>
              </div>
            </div>
          </ion-card-header>
        </ion-card>

        <!-- Sub Stages List -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Sub-etapas</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item
                v-for="subStage in sortedSubStages"
                :key="subStage.id"
                :class="{ completed: subStage.completed }"
                button
                @click="toggleSubStage(subStage)"
              >
                <ion-checkbox
                  slot="start"
                  :checked="subStage.completed"
                  @ionChange="toggleSubStage(subStage)"
                ></ion-checkbox>

                <ion-label>
                  <h3>{{ subStage.name }}</h3>
                  <p>{{ subStage.description }}</p>
                  <div
                    v-if="subStage.completed && subStage.completedDate"
                    class="completion-date"
                  >
                    <ion-icon :icon="checkmarkCircle" size="small"></ion-icon>
                    <span
                      >Completada:
                      {{ formatDate(subStage.completedDate) }}</span
                    >
                  </div>
                  <div v-if="subStage.notes" class="sub-stage-notes">
                    <ion-icon :icon="documentText" size="small"></ion-icon>
                    <span>{{ subStage.notes }}</span>
                  </div>
                </ion-label>

                <ion-button
                  slot="end"
                  fill="clear"
                  size="small"
                  @click.stop="editSubStage(subStage)"
                >
                  <ion-icon :icon="create"></ion-icon>
                </ion-button>
              </ion-item>
            </ion-list>

            <!-- Empty State -->
            <div v-if="sortedSubStages.length === 0" class="empty-state">
              <ion-icon :icon="list" size="large"></ion-icon>
              <h3>No hay sub-etapas</h3>
              <p>Agrega sub-etapas para organizar mejor el proceso</p>
              <ion-button @click="showAddSubStageModal = true">
                Agregar Sub-etapa
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Stage Notes -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Notas de la Etapa</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-textarea
              v-model="stageNotes"
              placeholder="Agregar notas sobre esta etapa..."
              rows="4"
              auto-grow
              @ionInput="saveStageNotes"
            ></ion-textarea>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>

    <!-- Add Sub Stage Modal -->
    <ion-modal
      :is-open="showAddSubStageModal"
      @didDismiss="showAddSubStageModal = false"
    >
      <ion-header>
        <ion-toolbar>
          <ion-title>Agregar Sub-etapa</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showAddSubStageModal = false"
              >Cancelar</ion-button
            >
            <ion-button @click="saveSubStage" color="primary"
              >Guardar</ion-button
            >
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <div class="form-container">
          <ion-item>
            <ion-label position="stacked">Nombre</ion-label>
            <ion-input
              v-model="newSubStage.name"
              placeholder="Nombre de la sub-etapa"
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Descripción</ion-label>
            <ion-textarea
              v-model="newSubStage.description"
              placeholder="Descripción de la sub-etapa"
              rows="3"
              auto-grow
            ></ion-textarea>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Notas (opcional)</ion-label>
            <ion-textarea
              v-model="newSubStage.notes"
              placeholder="Notas adicionales..."
              rows="2"
              auto-grow
            ></ion-textarea>
          </ion-item>
        </div>
      </ion-content>
    </ion-modal>

    <!-- Edit Sub Stage Modal -->
    <ion-modal
      :is-open="showEditSubStageModal"
      @didDismiss="showEditSubStageModal = false"
    >
      <ion-header>
        <ion-toolbar>
          <ion-title>Editar Sub-etapa</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showEditSubStageModal = false"
              >Cancelar</ion-button
            >
            <ion-button @click="updateSubStage" color="primary"
              >Guardar</ion-button
            >
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <div class="form-container">
          <ion-item>
            <ion-label position="stacked">Nombre</ion-label>
            <ion-input
              v-model="editingSubStage.name"
              placeholder="Nombre de la sub-etapa"
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Descripción</ion-label>
            <ion-textarea
              v-model="editingSubStage.description"
              placeholder="Descripción de la sub-etapa"
              rows="3"
              auto-grow
            ></ion-textarea>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Notas</ion-label>
            <ion-textarea
              v-model="editingSubStage.notes"
              placeholder="Notas adicionales..."
              rows="2"
              auto-grow
            ></ion-textarea>
          </ion-item>
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
  IonButton,
  IonIcon,
  IonBackButton,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonCheckbox,
  IonTextarea,
  IonInput,
  IonModal,
  IonSpinner,
  IonProgressBar,
} from "@ionic/vue";
import {
  add,
  create,
  alert,
  checkmarkCircle,
  documentText,
  list,
  person,
  documentText as documentTextIcon,
  chatbubbles,
  checkmarkCircle as checkmarkCircleIcon,
  card,
  playCircle,
  checkmarkDoneCircle,
  trendingUp as trendingUpIcon,
} from "ionicons/icons";
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { NegotiationStage, SubStage } from "../types/negotiation";
import { NegotiationService } from "../services/NegotiationService";

// Route and router
const route = useRoute();

// Services
const negotiationService = new NegotiationService();

// Reactive data
const loading = ref(true);
const stage = ref<NegotiationStage | null>(null);
const stageNotes = ref("");
const showAddSubStageModal = ref(false);
const showEditSubStageModal = ref(false);

// Form data
const newSubStage = ref({
  name: "",
  description: "",
  notes: "",
});

const editingSubStage = ref<SubStage | null>(null);

// Computed properties
const negotiationId = computed(() => route.params.negotiationId as string);
const stageId = computed(() => route.params.stageId as string);

const sortedSubStages = computed(() => {
  if (!stage.value || !stage.value.subStages) return [];
  return [...stage.value.subStages].sort((a, b) => a.order - b.order);
});

const completedSubStages = computed(() => {
  return sortedSubStages.value.filter((subStage) => subStage.completed).length;
});

const totalSubStages = computed(() => {
  return sortedSubStages.value.length;
});

// Methods
const getIcon = (iconName: string) => {
  const iconMap: Record<string, any> = {
    person,
    "document-text": documentTextIcon,
    chatbubbles,
    "checkmark-circle": checkmarkCircleIcon,
    card,
    "play-circle": playCircle,
    "checkmark-done-circle": checkmarkDoneCircle,
    "trending-up": trendingUpIcon,
  };
  return iconMap[iconName] || person;
};

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString("es-DO");
};

const loadStage = async () => {
  try {
    const negotiation = await negotiationService.getNegotiationById(
      negotiationId.value
    );
    if (negotiation) {
      const foundStage = negotiation.stages.find((s) => s.id === stageId.value);
      if (foundStage) {
        // Asegurar que la etapa tenga sub-etapas
        const stageWithSubStages = {
          ...foundStage,
          subStages: foundStage.subStages || [],
        };
        stage.value = stageWithSubStages;
        stageNotes.value = foundStage.notes || "";
      }
    }
  } catch (error) {
    console.error("Error loading stage:", error);
  } finally {
    loading.value = false;
  }
};

const toggleSubStage = async (subStage: SubStage) => {
  try {
    subStage.completed = !subStage.completed;
    if (subStage.completed) {
      subStage.completedDate = new Date();
    } else {
      subStage.completedDate = undefined;
    }

    // Update the negotiation using the new method that handles auto-advance
    if (stage.value) {
      await negotiationService.updateStageSubStages(
        negotiationId.value,
        stageId.value,
        stage.value.subStages
      );

      // Recargar la etapa para asegurar que los datos estén actualizados
      await loadStage();
    }
  } catch (error) {
    console.error("Error toggling sub stage:", error);
  }
};

const editSubStage = (subStage: SubStage) => {
  editingSubStage.value = { ...subStage };
  showEditSubStageModal.value = true;
};

const updateSubStage = async () => {
  if (!editingSubStage.value || !stage.value) return;

  try {
    const subStageIndex = stage.value.subStages.findIndex(
      (s) => s.id === editingSubStage.value!.id
    );
    if (subStageIndex !== -1) {
      stage.value.subStages[subStageIndex] = { ...editingSubStage.value };

      // Update the negotiation
      const negotiation = await negotiationService.getNegotiationById(
        negotiationId.value
      );
      if (negotiation) {
        const updatedNegotiation = { ...negotiation };
        const stageIndex = updatedNegotiation.stages.findIndex(
          (s) => s.id === stageId.value
        );
        if (stageIndex !== -1) {
          updatedNegotiation.stages[stageIndex] = stage.value;
          await negotiationService.updateNegotiation(negotiationId.value, {
            stages: updatedNegotiation.stages,
          });
        }
      }
    }
    showEditSubStageModal.value = false;
  } catch (error) {
    console.error("Error updating sub stage:", error);
  }
};

const saveSubStage = async () => {
  if (!newSubStage.value.name || !stage.value) return;

  try {
    const newSubStageData: SubStage = {
      id: `${stageId.value}_${Date.now()}`,
      name: newSubStage.value.name,
      description: newSubStage.value.description,
      notes: newSubStage.value.notes,
      completed: false,
      order: (stage.value.subStages?.length || 0) + 1,
    };

    if (!stage.value.subStages) {
      stage.value.subStages = [];
    }
    stage.value.subStages.push(newSubStageData);

    // Update the negotiation
    const negotiation = await negotiationService.getNegotiationById(
      negotiationId.value
    );
    if (negotiation) {
      const updatedNegotiation = { ...negotiation };
      const stageIndex = updatedNegotiation.stages.findIndex(
        (s) => s.id === stageId.value
      );
      if (stageIndex !== -1) {
        updatedNegotiation.stages[stageIndex] = stage.value;
        await negotiationService.updateNegotiation(negotiationId.value, {
          stages: updatedNegotiation.stages,
        });
      }
    }

    // Reset form
    newSubStage.value = { name: "", description: "", notes: "" };
    showAddSubStageModal.value = false;
  } catch (error) {
    console.error("Error saving sub stage:", error);
  }
};

const saveStageNotes = async () => {
  if (!stage.value) return;

  try {
    stage.value.notes = stageNotes.value;

    // Update the negotiation
    const negotiation = await negotiationService.getNegotiationById(
      negotiationId.value
    );
    if (negotiation) {
      const updatedNegotiation = { ...negotiation };
      const stageIndex = updatedNegotiation.stages.findIndex(
        (s) => s.id === stageId.value
      );
      if (stageIndex !== -1) {
        updatedNegotiation.stages[stageIndex] = stage.value;
        await negotiationService.updateNegotiation(negotiationId.value, {
          stages: updatedNegotiation.stages,
        });
      }
    }
  } catch (error) {
    console.error("Error saving stage notes:", error);
  }
};

// Load data on mount
onMounted(async () => {
  await loadStage();
});
</script>

<style scoped>
.stage-detail-container {
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

.stage-header-card {
  margin-bottom: 16px;
}

.stage-header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stage-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stage-info {
  flex: 1;
}

.stage-info h2 {
  margin: 0 0 8px 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.stage-info p {
  margin: 0 0 16px 0;
  color: var(--ion-color-medium);
}

.stage-progress {
  margin-top: 12px;
}

.progress-text {
  font-size: 0.9rem;
  color: var(--ion-color-medium);
  margin-top: 4px;
  display: block;
}

ion-item.completed {
  --background: #e8f5e8;
  opacity: 0.9;
}

.completion-date {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  font-size: 0.8rem;
  color: var(--ion-color-success);
}

.sub-stage-notes {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  font-size: 0.8rem;
  color: var(--ion-color-medium);
  font-style: italic;
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

.form-container {
  padding: 16px;
}

.form-container ion-item {
  margin-bottom: 16px;
}
</style>
