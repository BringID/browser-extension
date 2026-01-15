import { TNotarizationGroup, TNotarizationStep } from "./"

export type TTask = {
  id: string;
  title: string;
  description?: string;
  icon: string;
  groups: TNotarizationGroup[];
  steps: TNotarizationStep[];
  permissionUrl: string[];
  service: string;
  additionalInfo?: {
    title: string;
    text: string;
    showBeforeStep?: number;
  };
}

