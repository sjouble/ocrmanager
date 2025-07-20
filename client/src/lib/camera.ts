export interface CameraConstraints {
  video: {
    width?: { ideal: number };
    height?: { ideal: number };
    facingMode?: string;
  };
  audio: boolean;
}

export class CameraManager {
  private stream: MediaStream | null = null;

  async getDefaultConstraints(): Promise<CameraConstraints> {
    return {
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        facingMode: 'environment' // Back camera on mobile
      },
      audio: false
    };
  }

  async requestCameraAccess(constraints?: CameraConstraints): Promise<MediaStream> {
    try {
      const defaultConstraints = await this.getDefaultConstraints();
      const finalConstraints = constraints || defaultConstraints;
      
      this.stream = await navigator.mediaDevices.getUserMedia(finalConstraints);
      return this.stream;
    } catch (error) {
      console.error('Camera access error:', error);
      
      if (error instanceof Error) {
        switch (error.name) {
          case 'NotAllowedError':
            throw new Error('카메라 접근이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.');
          case 'NotFoundError':
            throw new Error('카메라를 찾을 수 없습니다.');
          case 'NotReadableError':
            throw new Error('카메라에 접근할 수 없습니다. 다른 앱에서 사용 중일 수 있습니다.');
          case 'OverconstrainedError':
            throw new Error('카메라가 요청된 설정을 지원하지 않습니다.');
          default:
            throw new Error('카메라 접근 중 오류가 발생했습니다.');
        }
      }
      
      throw new Error('알 수 없는 카메라 오류가 발생했습니다.');
    }
  }

  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop();
      });
      this.stream = null;
    }
  }

  async switchCamera(): Promise<MediaStream> {
    // Stop current stream
    this.stopCamera();
    
    // Try different facing mode
    const constraints: CameraConstraints = {
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        facingMode: this.stream ? 'user' : 'environment'
      },
      audio: false
    };
    
    return this.requestCameraAccess(constraints);
  }

  captureFrame(video: HTMLVideoElement): string {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Canvas context를 생성할 수 없습니다.');
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0);
    
    return canvas.toDataURL('image/jpeg', 0.95);
  }

  async checkCameraSupport(): Promise<boolean> {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  async getAvailableDevices(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'videoinput');
    } catch (error) {
      console.error('Error getting camera devices:', error);
      return [];
    }
  }
}

export const cameraManager = new CameraManager();
