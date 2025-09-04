import { useCallback, useLayoutEffect, RefObject } from 'react';
import Quagga from '@ericblade/quagga2';
import { useTheme } from '@mui/material/styles';
import { isValidEAN8, isValidEAN13 } from './barcodeValidation';

function getMedian(arr: number[]): number {
    const newArr = [...arr]; // copy the array before sorting, otherwise it mutates the array passed in, which is generally undesireable
    newArr.sort((a, b) => a - b);
    const half = Math.floor(newArr.length / 2);
    if (newArr.length % 2 === 1) {
        return newArr[half];
    }
    return (newArr[half - 1] + newArr[half]) / 2;
}

type DecodedCode = { error: number };
function getMedianOfCodeErrors(decodedCodes: DecodedCode[]): number {
    const errors = decodedCodes.map(x => x.error);
    return getMedian(errors);
}

const defaultConstraints: MediaTrackConstraints = {
    width: 640,
    height: 480,
};

const defaultLocatorSettings = {
    patchSize: 'medium',
    halfSample: true,
    willReadFrequently: true,
};

const defaultDecoders = ['ean_reader'];


interface Quagga2Scanner {
    onDetected: (code: string) => void;
    scannerRef: React.RefObject<HTMLDivElement>;
    onScannerReady?: () => void;
    cameraId?: string;
    facingMode?: string;
    constraints?: MediaTrackConstraints;
    locator?: typeof defaultLocatorSettings;
    decoders?: string[];
    locate?: boolean;
}

const Quagga2Scanner = ({
    onDetected,
    scannerRef,
    onScannerReady,
    cameraId,
    facingMode,
    constraints = defaultConstraints,
    locator = defaultLocatorSettings,
    decoders = defaultDecoders,
    locate = true,
}: Quagga2Scanner): null => {
    const theme = useTheme();
    const primaryColor = theme.palette.primary.main;
    const fontFamily = theme.typography.fontFamily;
    console.debug('[Quagga2Scanner] Component mounted');
    
    const errorCheck = useCallback((result) => {
        if (!onDetected) {
            return;
        }
        // Debug: log raw scan result before error check
        console.log('[Quagga2Scanner] Raw scan result:', result.codeResult?.code, result);
        const err = getMedianOfCodeErrors(result.codeResult.decodedCodes);
        // Debug: log when Quagga is 75% sure (err < 0.25)
        if (err < 0.25) {
            console.log('[Quagga2Scanner] Quagga is >=75% sure, median error:', err, 'code:', result.codeResult.code);
            const code = result.codeResult.code;
            // Debug: log after validation logic
            const valid = (code.length === 8 && isValidEAN8(code)) || (code.length === 13 && isValidEAN13(code));
            console.log('[Quagga2Scanner] Validation result:', valid, 'code:', code);
            if (valid) {
                onDetected(code);
            }
        }
    }, [onDetected]);

    const handleProcessed = (result: any) => {
        const drawingCtx = Quagga.canvas.ctx.overlay;
        const drawingCanvas = Quagga.canvas.dom.overlay;
        drawingCtx.font = `24px ${fontFamily}`;
        drawingCtx.fillStyle = primaryColor;

        if (result) {
            // console.warn('* quagga onProcessed', result);
            if (result.boxes) {
                drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute('width')!), parseInt(drawingCanvas.getAttribute('height')!));
                result.boxes.filter((box) => box !== result.box).forEach((box) => {
                    Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: theme.palette.secondary.main, lineWidth: 2 });
                });
            }
            if (result.box) {
                Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: theme.palette.primary.main, lineWidth: 2 });
            }
            if (result.codeResult && result.codeResult.code) {
                drawingCtx.font = `24px ${fontFamily}`;
                drawingCtx.fillText(result.codeResult.code, 10, 20);
            }
        }
    };

    useLayoutEffect(() => {
        // if this component gets unmounted in the same tick that it is mounted, then all hell breaks loose,
        // so we need to wait 1 tick before calling init().  I'm not sure how to fix that, if it's even possible,
        // given the asynchronous nature of the camera functions, the non asynchronous nature of React, and just how
        // awful browsers are at dealing with cameras.
        let ignoreStart = false;
        const init = async () => {
            // wait for one tick to see if we get unmounted before we can possibly even begin cleanup
            await new Promise((resolve) => setTimeout(resolve, 1));
            if (ignoreStart) {
                return;
            }
            // begin scanner initialization
            await Quagga.init({
                inputStream: {
                    type: 'LiveStream',
                    constraints: {
                        ...constraints,
                        ...(cameraId && { deviceId: cameraId }),
                        ...(!cameraId && { facingMode }),
                    },
                    target: scannerRef.current,
                    willReadFrequently: true,
                },
                locator,
                decoder: { readers: decoders as unknown as (any[]) },
                locate,
            }, async (err) => {
                Quagga.onProcessed(handleProcessed);

                if (err) {
                    return console.error('Error starting Quagga:', err);
                }
                if (scannerRef && scannerRef.current) {
                    await Quagga.start();
                    if (onScannerReady) {
                        onScannerReady();
                    }
                }
            });
            Quagga.onDetected(errorCheck);
        };
        init();
        // cleanup by turning off the camera and any listeners
        return () => {
            ignoreStart = true;
            Quagga.stop();
            Quagga.offDetected(errorCheck);
            Quagga.offProcessed(handleProcessed);
            console.debug('[Quagga2Scanner] Component unmounted, quagga stopped');
        };
    }, [cameraId, onDetected, onScannerReady, scannerRef, errorCheck, constraints, locator, decoders, locate, facingMode]);
    return null;
};

export default Quagga2Scanner;
