// Asset and image-related types

export type ImageSize = 'hi-res' | 'medium' | 'small';

export interface AssetConfig {
  baseUrl: string;
  useR2: boolean;
  fallbackUrl: string;
}

export interface ImageUrls {
  'hi-res': string;
  medium: string;
  small: string;
}

// For responsive images
export interface ImageSrcSet {
  srcSet: string;
  sizes: string;
}

// R2 upload configuration
export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicDomain?: string;
}

// Upload progress tracking
export interface UploadProgress {
  total: number;
  completed: number;
  failed: number;
  current?: string;
}