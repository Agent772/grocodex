# App Configuration System

## Overview
The Grocodex app now includes a configuration system that stores user preferences locally in the database. This is implemented as a singleton collection (`app_config`) with a single document that holds all app-wide settings.

## Features
- **Household Name**: Customize the name of your household (displayed in the top app bar)
- **Language**: Set the app language (currently supports English and German)
- **AI Token**: Optional field for future AI integrations (stored locally, never shared)

## Database Schema

### app_config (singleton collection)
```typescript
{
  id: string;              // Always 'config'
  household_name: string;  // User's household name
  language: string;        // ISO language code (e.g., 'en', 'de')
  ai_token?: string;       // Optional AI token for future use
  created_at: string;      // ISO timestamp
  updated_at: string;      // ISO timestamp
}
```

## Implementation Details

### Files Created
- `frontend/src/db/schemas/app_config.schema.ts` - RxDB schema definition
- `frontend/src/db/hooks/logic/appConfigDBHooks.ts` - Database hooks for reading/updating config
- `frontend/src/ui/pages/SettingsPage.tsx` - Settings UI page
- `frontend/src/ui/hooks/useLanguageSync.ts` - Hook to sync i18n with config language

### Files Modified
- `frontend/src/types/dbCollections.ts` - Added AppConfigDocType interface
- `frontend/src/types/rxdb.d.ts` - Added app_config to collections type
- `frontend/src/db/initRxdb.ts` - Added collection initialization with default values
- `frontend/src/ui/components/nav/TopAppBar.tsx` - Display household name
- `frontend/src/ui/components/nav/BottomNav.tsx` - Added Settings navigation
- `frontend/src/ui/components/nav/SideDrawer.tsx` - Added Settings navigation
- `frontend/src/App.tsx` - Added Settings route and language sync
- `frontend/locales/en.json` - Added settings translations
- `frontend/locales/de.json` - Added settings translations
- `DATABASE_SCHEMA.md` - Documented app_config table

## Usage

### Accessing Configuration
```typescript
import { useAppConfig } from '@/db/hooks/logic/appConfigDBHooks';

function MyComponent() {
  const config = useAppConfig();
  
  return (
    <div>
      <p>Household: {config?.household_name}</p>
      <p>Language: {config?.language}</p>
    </div>
  );
}
```

### Updating Configuration
```typescript
import { useUpdateAppConfig } from '@/db/hooks/logic/appConfigDBHooks';

function SettingsComponent() {
  const { updateConfig } = useUpdateAppConfig();
  
  const handleSave = async () => {
    await updateConfig({
      household_name: 'New Name',
      language: 'de'
    });
  };
}
```

### Individual Update Hooks
```typescript
import { 
  useUpdateHouseholdName,
  useUpdateLanguage,
  useUpdateAIToken 
} from '@/db/hooks/logic/appConfigDBHooks';

// Use specific hooks for targeted updates
const { updateHouseholdName } = useUpdateHouseholdName();
const { updateLanguage } = useUpdateLanguage();
const { updateAIToken } = useUpdateAIToken();
```

## Default Values
When the database is first initialized, a default configuration is created:
```typescript
{
  id: 'config',
  household_name: 'My Household',
  language: 'en',
  ai_token: null,
  created_at: <current_timestamp>,
  updated_at: <current_timestamp>
}
```

## Language Sync
The app automatically syncs the i18n language with the stored configuration. When the user changes the language in settings, the app's UI language updates immediately.

## Privacy & Security
- All configuration data is stored locally in the browser's IndexedDB
- **AI tokens are encrypted with AES-256-GCM** using device-specific keys
- Encrypted data syncs to your private CouchDB backend (encrypted at rest)
- Encryption/decryption is transparent and automatic
- The AI token never transmitted to third parties in plaintext
- No configuration data is sent to external services
- See `SECURITY.md` for detailed security implementation

## Future Extensions
The configuration system is designed to be extensible. Potential additions:
- Theme preferences (light/dark mode)
- Default units for measurements
- Notification settings
- Data export/import preferences
- AI assistant integration settings
