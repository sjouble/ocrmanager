import { createWorker, Worker, PSM, OEM } from 'tesseract.js';

let worker: Worker | null = null;

export async function initializeOCR(): Promise<void> {
  if (worker) {
    return;
  }

  try {
    worker = await createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    // Configure OCR for better number recognition
    await worker.setParameters({
      tessedit_char_whitelist: '0123456789',
      tessedit_pageseg_mode: PSM.SINGLE_WORD, // Single word mode
      tessedit_ocr_engine_mode: OEM.LSTM_ONLY, // LSTM mode
    });
  } catch (error) {
    console.error('OCR initialization error:', error);
    throw new Error('OCR 초기화에 실패했습니다.');
  }
}

export async function performOCR(imageData: string): Promise<string> {
  try {
    // Initialize worker if not already done
    if (!worker) {
      await initializeOCR();
    }

    if (!worker) {
      throw new Error('OCR worker not initialized');
    }

    // Preprocess image for better OCR results
    const processedImageData = await preprocessImage(imageData);
    
    const { data: { text } } = await worker.recognize(processedImageData);
    
    // Clean up the OCR result
    const cleanedText = cleanOCRResult(text);
    
    return cleanedText;
  } catch (error) {
    console.error('OCR processing error:', error);
    throw new Error('텍스트 인식에 실패했습니다.');
  }
}

function preprocessImage(imageData: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve(imageData);
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Get image data for processing
      const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageDataObj.data;
      
      // Convert to grayscale and increase contrast
      for (let i = 0; i < data.length; i += 4) {
        const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        
        // Increase contrast
        const contrast = 1.5;
        const enhanced = Math.min(255, Math.max(0, (gray - 128) * contrast + 128));
        
        data[i] = enhanced;     // Red
        data[i + 1] = enhanced; // Green  
        data[i + 2] = enhanced; // Blue
        // Alpha channel remains unchanged
      }
      
      // Put processed data back to canvas
      ctx.putImageData(imageDataObj, 0, 0);
      
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    
    img.src = imageData;
  });
}

function cleanOCRResult(text: string): string {
  // Remove whitespace and non-numeric characters
  let cleaned = text.replace(/\s+/g, '').replace(/[^0-9]/g, '');
  
  // Filter out results that are too short or too long for typical product numbers
  if (cleaned.length < 4 || cleaned.length > 20) {
    return '';
  }
  
  return cleaned;
}

export async function terminateOCR(): Promise<void> {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}

// Clean up OCR worker when page unloads
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    terminateOCR();
  });
}
