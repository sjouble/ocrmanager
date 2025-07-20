import { useState, useCallback, useRef } from 'react';
import { cameraManager } from '@/lib/camera';

export interface UseCameraReturn {
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  captureImage: () => string | null;
  switchCamera: () => Promise<void>;
  isActive: boolean;
  error: Error | null;
  stream: MediaStream | null;
}

export function useCamera(videoRef: React.RefObject<HTMLVideoElement>): UseCameraReturn {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      
      // Check if camera is supported
      const isSupported = await cameraManager.checkCameraSupport();
      if (!isSupported) {
        throw new Error('브라우저에서 카메라를 지원하지 않습니다.');
      }

      const stream = await cameraManager.requestCameraAccess();
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('카메라 시작 중 오류가 발생했습니다.');
      setError(error);
      setIsActive(false);
    }
  }, [videoRef]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      cameraManager.stopCamera();
      streamRef.current = null;
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      setIsActive(false);
    }
  }, [videoRef]);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !isActive) {
      return null;
    }

    try {
      return cameraManager.captureFrame(videoRef.current);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('이미지 캡처 중 오류가 발생했습니다.');
      setError(error);
      return null;
    }
  }, [videoRef, isActive]);

  const switchCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await cameraManager.switchCamera();
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('카메라 전환 중 오류가 발생했습니다.');
      setError(error);
    }
  }, [videoRef]);

  return {
    startCamera,
    stopCamera,
    captureImage,
    switchCamera,
    isActive,
    error,
    stream: streamRef.current,
  };
}
