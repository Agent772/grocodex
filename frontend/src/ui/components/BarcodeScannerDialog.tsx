import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, IconButton } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import FlashlightOnIcon from '@mui/icons-material/FlashlightOn';
import FlashlightOffIcon from '@mui/icons-material/FlashlightOff';
import Quagga from '@ericblade/quagga2';
import Quagga2Scanner from '../../utils/quagga2scanner';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const getResponsiveSize = () => {
  const isPortrait = window.innerHeight > window.innerWidth;
  const isMobile = window.innerWidth < 700;
  if (isMobile && isPortrait) {
    return {
      width: Math.round(window.innerWidth * 0.9),
      height: Math.round(window.innerHeight * 0.75),
    };
  } else if (isMobile && !isPortrait) {
    return {
      width: Math.round(window.innerWidth * 0.95),
      height: Math.round(window.innerHeight * 0.7),
    };
  } else {
    return {
      width: 640,
      height: 480,
    };
  }
};

interface BarcodeScannerDialogProps {
  open: boolean;
  onClose: () => void;
  onScan: (result: string) => void;
}

const BarcodeScannerDialog: React.FC<BarcodeScannerDialogProps> = ({ open, onClose, onScan }) => {
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [size, setSize] = useState(getResponsiveSize());
  const [scanning, setScanning] = useState<boolean>(open);
  const [cameras, setCameras] = useState<any[]>([]);
  const [cameraId, setCameraId] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<any>(null);
  const [torchOn, setTorch] = useState<boolean>(false);
  const scannerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const {t} = useTranslation();

  useEffect(() => {
    setScanning(open);
  }, [open]);

  useEffect(() => {
    const handleResize = () => setSize(getResponsiveSize());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const enableCamera = async () => { await Quagga.CameraAccess.request(null, {}); };
    const disableCamera = async () => { await Quagga.CameraAccess.release(); };
    const enumerateCameras = async () => {
      const cameras = await Quagga.CameraAccess.enumerateVideoDevices();
      return cameras;
    };
    enableCamera()
      .then(disableCamera)
      .then(enumerateCameras)
      .then(setCameras)
      .then(() => Quagga.CameraAccess.disableTorch())
      .catch(setCameraError);
    return () => { disableCamera(); };
  }, []);

  const onTorchClick = useCallback(() => {
    const torch = !torchOn;
    setTorch(torch);
    if (torch) Quagga.CameraAccess.enableTorch();
    else Quagga.CameraAccess.disableTorch();
  }, [torchOn]);

  const handleScan = (result: string) => {
    setScannedCode(result);
    onScan(result);
    setScanning(false);
    onClose();
  };

  const handleDialogClose = () => {
    setScanning(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      slotProps={{
        paper: {
          sx: {
            width: size.width + 300,
            maxWidth: size.width + 300,
            height: size.height + 300,
            maxHeight: size.height + 300,
            margin: 0,
          },
        }
      }}
    >
      <DialogTitle>{t('barcodescanner.title','Scan Barcode')}</DialogTitle>
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: size.height,
          padding: 0,
        }}
      >
        {scannedCode && (
          <div style={{ marginBottom: 16, color: theme.palette.success.main, fontWeight: 'bold', fontSize: 18 }}>
            Scanned Result: {scannedCode}
          </div>
        )}
        
          <div style={{position: 'relative'}} ref={scannerRef}>
            <canvas className="drawingBuffer" style={{
              position: 'absolute',
              top: '0px',
              // border: `3px solid ${theme.palette.primary.main}`,
            }}
              width={size.width}
              height={size.height}
            />
            {scanning ? (
                <>
                <Quagga2Scanner
                  scannerRef={scannerRef as React.RefObject<HTMLDivElement>}
                  cameraId={cameraId ?? undefined}
                  onDetected={handleScan}
                  constraints={{
                      width: size.width,
                      height: size.height,
                  }}
                />
                <Box
                  sx={{
                      position: 'absolute',
                      bottom: 16,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      flexDirection: 'row',
                      gap: 1,
                      zIndex: 2,
                      background: theme.palette.background.paper,
                      borderRadius: 2,
                      boxShadow: 2,
                      p: 0.5,
                  }}
                >
                  {cameras.length >= 2 && (
                      <IconButton
                        color="primary"
                        aria-label={t('barcodescanner.aria.switchcamera','Switch Camera')}
                        onClick={() => {
                            const currentIdx = cameras.findIndex(cam => cam.deviceId === cameraId);
                            const nextIdx = (currentIdx + 1) % cameras.length;
                            setCameraId(cameras[nextIdx].deviceId);
                        }}
                        size="large"
                      >
                        <CameraAltIcon />
                      </IconButton>
                  )}
                  <IconButton
                      color={torchOn ? 'warning' : 'primary'}
                      aria-label={t('barcodescanner.aria.toggleflashlight','Toggle Flashlight')}
                      onClick={onTorchClick}
                      size="large"
                  >
                      {torchOn ? <FlashlightOnIcon /> : <FlashlightOffIcon />}
                  </IconButton>
                </Box>
                </>
            ) : null}
          </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose} color="primary">Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BarcodeScannerDialog;