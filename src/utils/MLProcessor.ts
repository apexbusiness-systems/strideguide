/**
 * MLProcessor - On-device machine learning for lost item finding
 * Uses ONNX Runtime Web with WebGPU/WebGL fallback
 */

interface MLModel {
  session: any; // ONNX InferenceSession
  inputName: string;
  outputName: string;
}

interface EmbeddingResult {
  embedding: Float32Array;
  confidence: number;
}

interface DetectionResult {
  bbox: [number, number, number, number]; // [x, y, width, height]
  confidence: number;
  embedding: Float32Array;
}

class MLProcessorClass {
  private embeddingModel: MLModel | null = null;
  private isInitialized = false;
  private isLoading = false;

  async initialize(): Promise<void> {
    if (this.isInitialized || this.isLoading) return;
    
    this.isLoading = true;

    try {
      // Dynamic import to avoid bundling ONNX Runtime Web if not needed
      const ort = await import('onnxruntime-web');
      
      // Configure execution providers (WebGPU preferred, WebGL fallback)
      const providers = [];
      
      if ('gpu' in navigator) {
        providers.push('webgpu');
      }
      providers.push('webgl', 'wasm');

      ort.env.wasm.wasmPaths = '/models/';
      
      // Load lightweight embedding model (MobileNet-style)
      const modelUrl = '/models/mobile_embedding_model.onnx';
      
      try {
        const session = await ort.InferenceSession.create(modelUrl, {
          executionProviders: providers
        });

        this.embeddingModel = {
          session,
          inputName: session.inputNames[0],
          outputName: session.outputNames[0]
        };

        this.isInitialized = true;
        console.log('ML Processor initialized with providers:', providers);
      } catch (error) {
        console.warn('Failed to load ONNX model, using simulated embeddings:', error);
        // Fall back to simulated processing for demo
        this.isInitialized = true;
      }
    } catch (error) {
      console.error('Failed to initialize ML processor:', error);
      // Still mark as initialized for demo purposes
      this.isInitialized = true;
    } finally {
      this.isLoading = false;
    }
  }

  async computeEmbedding(imageData: ImageData): Promise<EmbeddingResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      if (this.embeddingModel) {
        return await this.computeRealEmbedding(imageData);
      } else {
        return this.computeSimulatedEmbedding(imageData);
      }
    } catch (error) {
      console.error('Embedding computation failed:', error);
      return this.computeSimulatedEmbedding(imageData);
    }
  }

  private async computeRealEmbedding(imageData: ImageData): Promise<EmbeddingResult> {
    if (!this.embeddingModel) {
      throw new Error('Model not loaded');
    }

    // Preprocess image data
    const preprocessed = this.preprocessImage(imageData);
    
    // Run inference
    const feeds = { [this.embeddingModel.inputName]: preprocessed };
    const results = await this.embeddingModel.session.run(feeds);
    const output = results[this.embeddingModel.outputName];

    return {
      embedding: new Float32Array(output.data),
      confidence: 0.95 // High confidence for real model
    };
  }

  private computeSimulatedEmbedding(imageData: ImageData): EmbeddingResult {
    // Create a simulated embedding based on image characteristics
    const { data, width, height } = imageData;
    const embedding = new Float32Array(128); // 128-dimensional embedding

    // Compute basic image statistics for simulation
    let avgR = 0, avgG = 0, avgB = 0;
    let contrast = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      avgR += data[i];
      avgG += data[i + 1];
      avgB += data[i + 2];
    }
    
    const pixelCount = data.length / 4;
    avgR /= pixelCount;
    avgG /= pixelCount;
    avgB /= pixelCount;

    // Fill embedding with deterministic but varied values
    for (let i = 0; i < 128; i++) {
      const colorComponent = (avgR + avgG + avgB) / 3;
      const spatial = Math.sin(i * 0.1 + colorComponent * 0.01);
      const contrast_component = Math.cos(i * 0.05 + contrast * 0.02);
      
      embedding[i] = (spatial + contrast_component) * 0.5;
    }

    return {
      embedding,
      confidence: 0.8 // Moderate confidence for simulation
    };
  }

  private preprocessImage(imageData: ImageData): any {
    // Convert ImageData to model input format (224x224 RGB)
    const targetSize = 224;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = targetSize;
    canvas.height = targetSize;
    
    // Draw and resize image
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCanvas.width = imageData.width;
    tempCanvas.height = imageData.height;
    tempCtx.putImageData(imageData, 0, 0);
    
    ctx.drawImage(tempCanvas, 0, 0, targetSize, targetSize);
    const resizedData = ctx.getImageData(0, 0, targetSize, targetSize);

    // Convert to normalized float array [1, 3, 224, 224] format
    const float32Data = new Float32Array(3 * targetSize * targetSize);
    
    for (let i = 0; i < targetSize * targetSize; i++) {
      const pixel = i * 4;
      // Normalize RGB values to [0, 1] and separate channels
      float32Data[i] = resizedData.data[pixel] / 255.0; // R
      float32Data[i + targetSize * targetSize] = resizedData.data[pixel + 1] / 255.0; // G
      float32Data[i + 2 * targetSize * targetSize] = resizedData.data[pixel + 2] / 255.0; // B
    }

    // Return as ONNX tensor format
    const ort = require('onnxruntime-web');
    return new ort.Tensor('float32', float32Data, [1, 3, targetSize, targetSize]);
  }

  computeCosineSimilarity(embedding1: Float32Array, embedding2: Float32Array): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same length');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);

    if (norm1 === 0 || norm2 === 0) {
      return 0;
    }

    return dotProduct / (norm1 * norm2);
  }

  // Simulate object detection for demo (would use real detection model in production)
  simulateDetection(imageData: ImageData, targetEmbedding: Float32Array): DetectionResult[] {
    const results: DetectionResult[] = [];
    
    // Simulate 1-3 detections in different parts of the image
    const numDetections = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numDetections; i++) {
      const x = Math.random() * (imageData.width - 100);
      const y = Math.random() * (imageData.height - 100);
      const width = 50 + Math.random() * 100;
      const height = 50 + Math.random() * 100;
      
      // Extract region and compute embedding
      const regionData = this.extractRegion(imageData, x, y, width, height);
      const { embedding } = this.computeSimulatedEmbedding(regionData);
      
      // Compute similarity to target
      const similarity = this.computeCosineSimilarity(embedding, targetEmbedding);
      
      if (similarity > 0.3) { // Only return if somewhat similar
        results.push({
          bbox: [x, y, width, height],
          confidence: similarity,
          embedding
        });
      }
    }

    return results.sort((a, b) => b.confidence - a.confidence);
  }

  private extractRegion(imageData: ImageData, x: number, y: number, width: number, height: number): ImageData {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    ctx.putImageData(imageData, 0, 0);
    
    return ctx.getImageData(Math.floor(x), Math.floor(y), Math.floor(width), Math.floor(height));
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  dispose(): void {
    if (this.embeddingModel) {
      this.embeddingModel.session.dispose?.();
      this.embeddingModel = null;
    }
    this.isInitialized = false;
  }
}

export const MLProcessor = new MLProcessorClass();