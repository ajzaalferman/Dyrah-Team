'use client';

import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, X } from 'lucide-react';
import imageCompression from 'browser-image-compression';

interface Props {
    onCapture: (photo: string) => void;
}

export default function WebcamCapture({ onCapture }: Props) {
    const webcamRef = useRef<Webcam>(null);
    const [captured, setCaptured] = useState<string | null>(null);
    const [isCompressing, setIsCompressing] = useState(false);

    const capture = useCallback(async () => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setIsCompressing(true);
            try {
                // Convert base64 to blob
                const response = await fetch(imageSrc);
                const blob = await response.blob();

                // Convert blob to file
                const file = new File([blob], 'webcam-capture.jpg', { type: 'image/jpeg' });

                // Compress the image
                const options = {
                    maxSizeMB: 0.3,          // Max file size 300KB
                    maxWidthOrHeight: 800,    // Max dimension
                    useWebWorker: true,
                    fileType: 'image/jpeg' as const
                };

                const compressedBlob = await imageCompression(file, options);

                // Convert back to base64
                const reader = new FileReader();
                reader.onloadend = () => {
                    setCaptured(reader.result as string);
                    setIsCompressing(false);
                };
                reader.readAsDataURL(compressedBlob);
            } catch (error) {
                console.error('Error compressing image:', error);
                // Fallback to original image
                setCaptured(imageSrc);
                setIsCompressing(false);
            }
        }
    }, [webcamRef]);

    const handleConfirm = () => {
        if (captured) {
            onCapture(captured);
        }
    };

    const retake = () => setCaptured(null);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
        }}>
            <div style={{ maxWidth: '500px', width: '100%', padding: '1rem' }}>
                <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Verify Your Identity</h3>
                    </div>

                    <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1rem' }}>
                        {!captured ? (
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                width="100%"
                                videoConstraints={{ facingMode: 'user' }}
                            />
                        ) : (
                            <img src={captured} alt="Captured" style={{ width: '100%', display: 'block' }} />
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {!captured ? (
                            <>
                                <button
                                    onClick={capture}
                                    className="btn btn-primary"
                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    disabled={isCompressing}
                                >
                                    <Camera size={18} />
                                    {isCompressing ? 'Compressing...' : 'Capture Photo'}
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={retake} className="btn btn-outline" style={{ flex: 1 }}>
                                    Retake
                                </button>
                                <button onClick={handleConfirm} className="btn btn-primary" style={{ flex: 1 }}>
                                    Confirm
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
