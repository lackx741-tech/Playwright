export interface ComponentsConfig {
  maxDepth: number;
  minConfidence: number;
  autoRegisterDetected: boolean;
  defaultCategory: string;
}

export const componentsConfig: ComponentsConfig = {
  maxDepth: 12,
  minConfidence: 0.4,
  autoRegisterDetected: true,
  defaultCategory: 'layout',
};
