import { useRxData } from 'rxdb-hooks';
import { useRxDB } from 'rxdb-hooks';
import { AppConfigDocType } from '../../../types/dbCollections';
import { decryptValue, encryptValue } from '../../../utils/encryption';
import { useEffect, useState } from 'react';

/**
 * Hook to get the app configuration (singleton)
 * Automatically decrypts the AI token if present
 */
export function useAppConfig() {
  const db = useRxDB();
  const { result: configs } = useRxData<AppConfigDocType>(
    'app_config',
    (collection) => collection.findOne({ selector: { id: 'config' } })
  );

  const [decryptedConfig, setDecryptedConfig] = useState<AppConfigDocType | null>(null);

  useEffect(() => {
    const decryptConfig = async () => {
      const config = configs[0];
      if (!config) {
        setDecryptedConfig(null);
        return;
      }

      // Decrypt AI token if present
      if (config.ai_token) {
        try {
          const decryptedToken = await decryptValue(config.ai_token);
          setDecryptedConfig({
            ...config,
            ai_token: decryptedToken
          });
        } catch (error) {
          console.error('Failed to decrypt AI token:', error);
          setDecryptedConfig(config);
        }
      } else {
        setDecryptedConfig(config);
      }
    };

    decryptConfig();
  }, [configs]);

  return decryptedConfig;
}

/**
 * Hook to update the app configuration
 * Automatically encrypts the AI token before storing
 */
export function useUpdateAppConfig() {
  const db = useRxDB();

  const updateConfig = async (updates: Partial<Omit<AppConfigDocType, 'id' | 'created_at'>>) => {
    const collection = db?.app_config;
    if (!collection) {
      throw new Error('Database not initialized');
    }

    const config = await collection.findOne({ selector: { id: 'config' } }).exec();
    if (!config) {
      throw new Error('Config document not found');
    }

    // Encrypt AI token if present in updates
    const processedUpdates = { ...updates };
    if ('ai_token' in processedUpdates) {
      if (processedUpdates.ai_token) {
        try {
          processedUpdates.ai_token = await encryptValue(processedUpdates.ai_token);
        } catch (error) {
          console.error('Failed to encrypt AI token:', error);
          throw new Error('Failed to encrypt AI token');
        }
      } else {
        processedUpdates.ai_token = null;
      }
    }

    await config.update({
      $set: {
        ...processedUpdates,
        updated_at: new Date().toISOString()
      }
    });
  };

  return { updateConfig };
}

/**
 * Hook to update household name
 */
export function useUpdateHouseholdName() {
  const { updateConfig } = useUpdateAppConfig();

  const updateHouseholdName = async (householdName: string) => {
    await updateConfig({ household_name: householdName });
  };

  return { updateHouseholdName };
}

/**
 * Hook to update language
 */
export function useUpdateLanguage() {
  const { updateConfig } = useUpdateAppConfig();

  const updateLanguage = async (language: string) => {
    await updateConfig({ language });
  };

  return { updateLanguage };
}

/**
 * Hook to update AI token
 */
export function useUpdateAIToken() {
  const { updateConfig } = useUpdateAppConfig();

  const updateAIToken = async (aiToken: string | null) => {
    await updateConfig({ ai_token: aiToken });
  };

  return { updateAIToken };
}

/**
 * Hook to update current shopping list ID
 */
export function useUpdateCurrentShoppingList() {
  const { updateConfig } = useUpdateAppConfig();

  const updateCurrentShoppingList = async (listId: string | null) => {
    await updateConfig({ current_shopping_list_id: listId });
  };

  return { updateCurrentShoppingList };
}
