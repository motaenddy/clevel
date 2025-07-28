<template>
  <ion-card class="negotiation-pipeline">
    <ion-card-header>
      <ion-card-title>
        <ion-icon :icon="trendingUp" slot="start"></ion-icon>
        Estado de Negociación
      </ion-card-title>
    </ion-card-header>

    <ion-card-content>
      <!-- Pipeline Visual -->
      <div class="pipeline-container">
        <div
          v-for="stage in negotiation.stages"
          :key="stage.id"
          class="stage-item"
          :class="{
            completed: isStageCompleted(stage.id),
            current: isCurrentStage(stage.id),
            upcoming: isUpcomingStage(stage.id),
          }"
          @click="selectStage(stage.id)"
        >
          <div class="stage-icon" :style="{ backgroundColor: stage.color }">
            <ion-icon :icon="getIcon(stage.icon)"></ion-icon>
          </div>
          <div class="stage-info">
            <h4>{{ stage.name }}</h4>
            <p>{{ stage.description }}</p>
            <div v-if="getStageDate(stage.id)" class="stage-date">
              <ion-icon :icon="calendar" size="small"></ion-icon>
              <span>{{ formatDate(getStageDate(stage.id)!) }}</span>
            </div>
            <div
              v-else
              class="stage-date-placeholder"
              @click.stop="setStageDate(stage.id)"
            >
              <ion-icon :icon="calendarOutline" size="small"></ion-icon>
              <span>Establecer fecha</span>
            </div>
          </div>
          <div class="stage-status">
            <ion-icon
              v-if="isStageCompleted(stage.id)"
              :icon="checkmarkCircle"
              color="success"
            ></ion-icon>
            <ion-icon
              v-else-if="isCurrentStage(stage.id)"
              :icon="ellipse"
              color="primary"
            ></ion-icon>
            <ion-icon v-else :icon="ellipseOutline" color="medium"></ion-icon>
          </div>
        </div>
      </div>

      <!-- Información de la Negociación -->
      <div class="negotiation-info">
        <ion-grid>
          <ion-row>
            <ion-col size="6">
              <div class="info-item">
                <ion-label>Probabilidad</ion-label>
                <ion-progress-bar
                  :value="negotiation.probability / 100"
                  :color="getProgressColor(negotiation.probability)"
                ></ion-progress-bar>
                <span class="progress-text"
                  >{{ negotiation.probability }}%</span
                >
              </div>
            </ion-col>
            <ion-col size="6">
              <div class="info-item">
                <ion-label>Valor Estimado</ion-label>
                <span class="value-text"
                  >RD$ {{ formatCurrency(negotiation.estimatedValue) }}</span
                >
              </div>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col size="6">
              <div class="info-item">
                <ion-label>Fecha Inicio</ion-label>
                <span class="date-text">{{
                  formatDate(negotiation.startDate)
                }}</span>
              </div>
            </ion-col>
            <ion-col size="6">
              <div class="info-item">
                <ion-label>Última Actualización</ion-label>
                <span class="date-text">{{
                  formatDate(negotiation.lastUpdate)
                }}</span>
              </div>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>

      <!-- Acciones -->
      <div class="negotiation-actions">
        <ion-button fill="outline" size="small" @click="showStageModal = true">
          <ion-icon :icon="settings" slot="start"></ion-icon>
          Cambiar Etapa
        </ion-button>

        <ion-button fill="outline" size="small" @click="showNotesModal = true">
          <ion-icon :icon="create" slot="start"></ion-icon>
          Agregar Nota
        </ion-button>

        <ion-button v-if="canAdvance" size="small" @click="advanceToNextStage">
          <ion-icon :icon="arrowForward" slot="start"></ion-icon>
          Avanzar
        </ion-button>
      </div>
    </ion-card-content>

    <!-- Modal para cambiar etapa -->
    <ion-modal :is-open="showStageModal" @didDismiss="showStageModal = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>Cambiar Etapa</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showStageModal = false">Cerrar</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <ion-item
            v-for="stage in negotiation.stages"
            :key="stage.id"
            button
            @click="changeStage(stage.id)"
            :color="isCurrentStage(stage.id) ? 'primary' : undefined"
          >
            <ion-icon
              :icon="getIcon(stage.icon)"
              slot="start"
              :color="stage.color"
            ></ion-icon>
            <ion-label>
              <h3>{{ stage.name }}</h3>
              <p>{{ stage.description }}</p>
            </ion-label>
            <ion-icon
              v-if="isCurrentStage(stage.id)"
              :icon="checkmark"
              slot="end"
              color="primary"
            ></ion-icon>
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-modal>

    <!-- Modal para agregar nota -->
    <ion-modal :is-open="showNotesModal" @didDismiss="showNotesModal = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>Agregar Nota</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showNotesModal = false">Cancelar</ion-button>
            <ion-button @click="saveNote" color="primary">Guardar</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-item>
          <ion-textarea
            v-model="newNote"
            placeholder="Escribe una nota sobre esta negociación..."
            rows="4"
            auto-grow
          ></ion-textarea>
        </ion-item>
      </ion-content>
    </ion-modal>

    <!-- Modal para establecer fecha de etapa -->
    <ion-modal :is-open="showDateModal" @didDismiss="showDateModal = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>Establecer Fecha - {{ selectedStageName }}</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showDateModal = false">Cancelar</ion-button>
            <ion-button @click="saveStageDate" color="primary"
              >Guardar</ion-button
            >
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <div class="date-picker-container">
          <ion-item>
            <ion-label position="stacked">Fecha de la etapa</ion-label>
            <ion-datetime
              v-model="selectedDate"
              presentation="date"
              :prefer-wheel="true"
              :show-default-buttons="false"
            ></ion-datetime>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Nota (opcional)</ion-label>
            <ion-textarea
              v-model="dateNote"
              placeholder="Agregar nota sobre esta fecha..."
              rows="3"
              auto-grow
            ></ion-textarea>
          </ion-item>
        </div>
      </ion-content>
    </ion-modal>
  </ion-card>
</template>

<script setup lang="ts">
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonButton,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonTextarea,
  IonGrid,
  IonRow,
  IonCol,
  IonProgressBar,
  IonDatetime,
} from "@ionic/vue";
import {
  trendingUp,
  checkmarkCircle,
  ellipse,
  ellipseOutline,
  settings,
  create,
  arrowForward,
  checkmark,
  person,
  documentText,
  chatbubbles,
  checkmarkCircle as checkmarkCircleIcon,
  card,
  playCircle,
  checkmarkDoneCircle,
  trendingUp as trendingUpIcon,
  calendar,
  calendarOutline,
} from "ionicons/icons";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { Negotiation } from "../types/negotiation";
import { NegotiationService } from "../services/NegotiationService";

const props = defineProps<{
  negotiation: Negotiation;
}>();

const emit = defineEmits<{
  update: [negotiation: Negotiation];
}>();

const router = useRouter();
const negotiationService = new NegotiationService();
const showStageModal = ref(false);
const showNotesModal = ref(false);
const newNote = ref("");

// Variables para el modal de fecha
const showDateModal = ref(false);
const selectedStageId = ref("");
const selectedStageName = ref("");
const selectedDate = ref(new Date().toISOString());
const dateNote = ref("");

// Computed properties
const canAdvance = computed(() => {
  const currentIndex = props.negotiation.stages.findIndex(
    (s) => s.id === props.negotiation.currentStage
  );
  return currentIndex < props.negotiation.stages.length - 1;
});

// Methods
const isStageCompleted = (stageId: string): boolean => {
  const currentIndex = props.negotiation.stages.findIndex(
    (s) => s.id === props.negotiation.currentStage
  );
  const stageIndex = props.negotiation.stages.findIndex(
    (s) => s.id === stageId
  );
  return stageIndex < currentIndex;
};

const isCurrentStage = (stageId: string): boolean => {
  return stageId === props.negotiation.currentStage;
};

const isUpcomingStage = (stageId: string): boolean => {
  const currentIndex = props.negotiation.stages.findIndex(
    (s) => s.id === props.negotiation.currentStage
  );
  const stageIndex = props.negotiation.stages.findIndex(
    (s) => s.id === stageId
  );
  return stageIndex > currentIndex;
};

const getIcon = (iconName: string) => {
  const iconMap: Record<string, any> = {
    person,
    "document-text": documentText,
    chatbubbles,
    "checkmark-circle": checkmarkCircleIcon,
    card,
    "play-circle": playCircle,
    "checkmark-done-circle": checkmarkDoneCircle,
    "trending-up": trendingUpIcon,
  };
  return iconMap[iconName] || person;
};

const getProgressColor = (probability: number): string => {
  if (probability >= 80) return "success";
  if (probability >= 50) return "warning";
  return "danger";
};

const formatCurrency = (value: number): string => {
  return value.toLocaleString("es-DO");
};

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString("es-DO");
};

const selectStage = (stageId: string) => {
  // Navegar a la vista de sub-etapas
  router.push(`/negotiation/${props.negotiation.id}/stage/${stageId}`);
};

const changeStage = async (stageId: string) => {
  try {
    const updated = await negotiationService.goToStage(
      props.negotiation.id,
      stageId
    );
    if (updated) {
      emit("update", updated);
    }
    showStageModal.value = false;
  } catch (error) {
    console.error("Error changing stage:", error);
  }
};

const advanceToNextStage = async () => {
  try {
    const updated = await negotiationService.advanceToNextStage(
      props.negotiation.id
    );
    if (updated) {
      emit("update", updated);
    }
  } catch (error) {
    console.error("Error advancing stage:", error);
  }
};

const saveNote = async () => {
  if (!newNote.value.trim()) return;

  try {
    const updated = await negotiationService.updateNegotiation(
      props.negotiation.id,
      {
        notes:
          props.negotiation.notes +
          "\n\n" +
          new Date().toLocaleString() +
          ":\n" +
          newNote.value,
      }
    );
    if (updated) {
      emit("update", updated);
    }
    newNote.value = "";
    showNotesModal.value = false;
  } catch (error) {
    console.error("Error saving note:", error);
  }
};

// Métodos para manejar fechas de etapas
const getStageDate = (stageId: string): Date | null => {
  return props.negotiation.stageDates?.[stageId] || null;
};

const setStageDate = (stageId: string) => {
  const stage = props.negotiation.stages.find((s) => s.id === stageId);
  if (stage) {
    selectedStageId.value = stageId;
    selectedStageName.value = stage.name;
    selectedDate.value = new Date().toISOString();
    dateNote.value = "";
    showDateModal.value = true;
  }
};

const saveStageDate = async () => {
  try {
    const updated = await negotiationService.setStageDate(
      props.negotiation.id,
      selectedStageId.value,
      new Date(selectedDate.value),
      dateNote.value || `Fecha establecida para ${selectedStageName.value}`
    );
    if (updated) {
      emit("update", updated);
    }
    showDateModal.value = false;
  } catch (error) {
    console.error("Error setting stage date:", error);
  }
};
</script>

<style scoped>
.negotiation-pipeline {
  margin: 16px;
}

.pipeline-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.stage-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--ion-color-medium);
  cursor: pointer;
  transition: all 0.3s ease;
}

.stage-item:hover {
  background-color: var(--ion-color-light);
}

.stage-item.completed {
  background-color: var(--ion-color-success-tint);
  border-color: var(--ion-color-success);
}

.stage-item.current {
  background-color: var(--ion-color-primary-tint);
  border-color: var(--ion-color-primary);
}

.stage-item.upcoming {
  opacity: 0.6;
}

.stage-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: white;
}

.stage-info {
  flex: 1;
}

.stage-info h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.stage-info p {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: var(--ion-color-medium);
}

.stage-date {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  font-size: 11px;
  color: var(--ion-color-success);
}

.stage-date-placeholder {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  font-size: 11px;
  color: var(--ion-color-medium);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px dashed var(--ion-color-medium);
  transition: all 0.2s ease;
}

.stage-date-placeholder:hover {
  background-color: var(--ion-color-light);
  color: var(--ion-color-primary);
  border-color: var(--ion-color-primary);
}

.date-picker-container {
  padding: 16px;
}

.date-picker-container ion-item {
  margin-bottom: 16px;
}

.stage-status {
  margin-left: 8px;
}

.negotiation-info {
  margin: 20px 0;
}

.info-item {
  margin-bottom: 16px;
}

.info-item ion-label {
  font-size: 12px;
  color: var(--ion-color-medium);
  margin-bottom: 4px;
}

.progress-text {
  font-size: 12px;
  color: var(--ion-color-medium);
  margin-top: 4px;
}

.value-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--ion-color-primary);
}

.date-text {
  font-size: 12px;
  color: var(--ion-color-medium);
}

.negotiation-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 16px;
}

@media (max-width: 768px) {
  .negotiation-actions {
    flex-direction: column;
  }

  .negotiation-actions ion-button {
    width: 100%;
  }
}
</style>
