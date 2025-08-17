import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'
import sharp from 'sharp'
import type { Plugin } from 'vite'

// Image processing plugin
function imageProcessingPlugin(): Plugin {
  return {
    name: 'image-processing',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next()
        
        // Only log image processing, not every request
        
        // Check if this is a request for a processed image (medium, small, avatar)
        const imageMatch = req.url.match(/^\/(?:album|artist)\/([^/]+)\/([^/]+)-(medium|small|avatar)\.jpg$/)
        if (imageMatch) {
          const [, folder, baseName, size] = imageMatch
          const type = req.url.startsWith('/album') ? 'album' : 'artist'
          const hiResPath = path.join(process.cwd(), 'public', type, folder, `${baseName}-hi-res.jpg`)
          
          try {
            // Check if hi-res source exists
            if (fs.existsSync(hiResPath)) {
              console.log(`🖼️  Processing image on-demand: ${type}/${folder}/${baseName}-${size}.jpg`)
              
              // Define target dimensions
              const dimensions = {
                'medium': 800,
                'small': 400,
                'avatar': 128
              }
              
              const targetSize = dimensions[size as keyof typeof dimensions]
              if (!targetSize) {
                res.statusCode = 400
                res.end('Invalid image size')
                return
              }
              
              // Process image directly to buffer (no file writing)
              const processedBuffer = await sharp(hiResPath)
                .resize(targetSize, targetSize, {
                  fit: 'cover',
                  position: 'center'
                })
                .jpeg({ quality: 85 })
                .toBuffer()
              
              // Serve the processed image directly from memory
              res.setHeader('Content-Type', 'image/jpeg')
              res.setHeader('Content-Length', processedBuffer.length.toString())
              // In development, use shorter cache or no-cache for easier testing
              const isDev = process.env.NODE_ENV === 'development'
              res.setHeader('Cache-Control', isDev ? 'no-cache, no-store, must-revalidate' : 'public, max-age=31536000')
              res.statusCode = 200
              res.end(processedBuffer)
              return
            } else {
              // Hi-res source doesn't exist, return 404
              console.log(`❌ Hi-res image not found: ${hiResPath}`)
              res.statusCode = 404
              res.end('Image not found')
              return
            }
          } catch (error) {
            console.warn(`Warning: Could not process image ${req.url}:`, error)
            res.statusCode = 500
            res.end('Image processing error')
            return
          }
        }
        
        next()
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), imageProcessingPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Ensure static assets are served correctly
    fs: {
      strict: false
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-separator', '@radix-ui/react-slot', '@radix-ui/react-switch', '@radix-ui/react-tabs', '@radix-ui/react-tooltip', '@radix-ui/react-progress'],
          'animation-vendor': ['framer-motion'],
          'chart-vendor': ['d3', 'recharts'],
          'utils-vendor': ['clsx', 'tailwind-merge', 'class-variance-authority', 'fuse.js', 'use-debounce']
        }
      }
    },
    // Optimize CSS
    cssCodeSplit: true,
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
