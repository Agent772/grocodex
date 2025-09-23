// src/utils/getUnitLabel.ts
import { TFunction } from 'i18next';

export function getUnitLabel(unit: string, t: TFunction): string {
  return t(`unit.${unit}`, unit);
}