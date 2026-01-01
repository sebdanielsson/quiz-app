// Re-export the OpenGraph image for Twitter
export { default, size, contentType, generateImageMetadata } from "./opengraph-image";

// Revalidation must be defined directly (can't be re-exported)
// This should match ogImageRevalidateSeconds in lib/config.ts
export const revalidate = 900;
