import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import ButtonBase from '@mui/material/ButtonBase';
import EditIndicator from './EditIndicator';
import { useTranslation } from 'react-i18next';
import { UI_TRANSLATION_KEYS } from '../../../types/uiTranslationKeys';

export interface AvatarUploadProps {
  avatar?: string;
  onChange: (newAvatar: string) => void;
  sx?: any;
}

/**
 * AvatarUpload component allows users to upload and preview an avatar image.
 *
 * @param {AvatarUploadProps} props - The props for the AvatarUpload component.
 * @param {string | undefined} props.avatar - The current avatar image source (data URL or image URL).
 * @param {(avatar: string) => void} props.onChange - Callback function called when a new avatar is selected. Receives the image as a data URL string.
 * @param {SxProps | undefined} props.sx - Optional style overrides for the ButtonBase and Avatar components.
 *
 * @returns {JSX.Element} The rendered AvatarUpload component.
 *
 * @remarks
 * - The component uses a hidden file input to allow image selection.
 * - The selected image is read as a data URL and passed to the `onChange` callback.
 * - Accessibility features include an `aria-label` and focus-visible outline.
 */
const AvatarUpload: React.FC<AvatarUploadProps> = ({ avatar, onChange, sx }) => {
  const { t } = useTranslation();
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <ButtonBase
      component="label"
      role={undefined}
      tabIndex={-1}
      aria-label={t(UI_TRANSLATION_KEYS.USER_PROFILE_AVATAR_LABEL, 'Avatar image')}
      sx={{
        borderRadius: '40px',
        position: 'relative',
        ...sx,
        '&:has(:focus-visible)': {
          outline: '2px solid',
          outlineOffset: '2px',
        },
      }}
    >
      <Avatar alt={t(UI_TRANSLATION_KEYS.USER_PROFILE_AVATAR_LABEL, 'Upload new avatar')} src={avatar} sx={{ width: sx?.width || 64, height: sx?.height || 64 }} />
      <EditIndicator />
      <input
        type="file"
        accept="image/*"
        style={{
          border: 0,
          clip: 'rect(0 0 0 0)',
          height: '1px',
          margin: '-1px',
          overflow: 'hidden',
          padding: 0,
          position: 'absolute',
          whiteSpace: 'nowrap',
          width: '1px',
        }}
        onChange={handleAvatarChange}
        aria-label={t(UI_TRANSLATION_KEYS.USER_PROFILE_AVATAR_LABEL, 'Upload avatar')}
      />
    </ButtonBase>
  );
};

export default AvatarUpload;
