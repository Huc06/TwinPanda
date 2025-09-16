"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Text, Box, Sphere, Ring, useTexture } from "@react-three/drei"
import type * as THREE from "three"

interface ARSceneProps {
  isVisible: boolean
  detectionConfidence: number
  itemName?: string
  serialNumber?: string
}

export function ARScene({ isVisible, detectionConfidence, itemName, serialNumber }: ARSceneProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)

  useFrame((state: any) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.1
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.5
    }
  })

  if (!isVisible) return null

  const confidence = Math.max(0.3, detectionConfidence)
  const glowColor = confidence > 0.8 ? "#00ff88" : confidence > 0.5 ? "#ffaa00" : "#ff6600"

  return (
    <group>
      {/* Animated scanning ring */}
      <Ring ref={ringRef} args={[1.8, 2.0, 32]} position={[0, 0, 0.1]}>
        <meshBasicMaterial color={glowColor} transparent opacity={0.6} />
      </Ring>

      {/* Main detection frame */}
      <Box ref={meshRef} args={[2.2, 2.2, 0.1]} position={[0, 0, -0.1]}>
        <meshBasicMaterial color={glowColor} transparent opacity={0.3} />
      </Box>

      {/* Corner markers */}
      {[-1, 1].map((x) =>
        [-1, 1].map((y) => (
          <Box key={`${x}-${y}`} args={[0.3, 0.3, 0.05]} position={[x * 1.2, y * 1.2, 0.05]}>
            <meshBasicMaterial color={glowColor} transparent opacity={0.8} />
          </Box>
        )),
      )}

      {/* Confidence indicator spheres */}
      {Array.from({ length: Math.floor(confidence * 5) }, (_, i) => (
        <Sphere key={i} args={[0.05]} position={[-1.5 + i * 0.3, 1.8, 0]}>
          <meshBasicMaterial color={glowColor} />
        </Sphere>
      ))}

      {/* Info text with confidence */}
      <Text position={[0, 1.8, 0]} fontSize={0.2} color={glowColor} anchorX="center" anchorY="middle">
        RWA Detected: {itemName || "Item"}
      </Text>

      <Text position={[0, 1.5, 0]} fontSize={0.15} color="#ffffff" anchorX="center" anchorY="middle">
        Confidence: {Math.round(confidence * 100)}%
      </Text>

      <Text position={[0, -1.5, 0]} fontSize={0.15} color="#ffffff" anchorX="center" anchorY="middle">
        Serial: {serialNumber || "N/A"}
      </Text>

      <Text position={[0, -1.8, 0]} fontSize={0.12} color="#cccccc" anchorX="center" anchorY="middle">
        Ready to mint NFT
      </Text>
    </group>
  )
}

export function WatchModel({ isDetected }: { isDetected: boolean }) {
  const watchRef = useRef<THREE.Group>(null)

  useFrame((state: any) => {
    if (watchRef.current && isDetected) {
      watchRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
      watchRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1
    }
  })

  return (
    <group ref={watchRef}>
      {/* Watch face */}
      <Box args={[1.5, 1.5, 0.2]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} envMapIntensity={1} />
      </Box>

      {/* Watch face glass */}
      <Box args={[1.4, 1.4, 0.05]} position={[0, 0, 0.15]}>
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.1} transmission={0.9} roughness={0} />
      </Box>

      {/* Watch band */}
      <Box args={[0.3, 2.5, 0.1]} position={[0, 0, -0.2]}>
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
      </Box>

      {/* Watch crown */}
      <Box args={[0.1, 0.2, 0.1]} position={[0.8, 0, 0]}>
        <meshStandardMaterial color="#c0c0c0" metalness={1} roughness={0} />
      </Box>

      {/* Hour markers */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * Math.PI * 2) / 12
        const x = Math.sin(angle) * 0.6
        const y = Math.cos(angle) * 0.6
        return (
          <Box key={i} args={[0.05, 0.15, 0.02]} position={[x, y, 0.12]}>
            <meshStandardMaterial color="#ffffff" />
          </Box>
        )
      })}

      {/* Watch hands */}
      <Box args={[0.02, 0.4, 0.01]} position={[0, 0.2, 0.13]} rotation={[0, 0, Math.PI / 4]}>
        <meshStandardMaterial color="#ffffff" />
      </Box>
      <Box args={[0.02, 0.3, 0.01]} position={[0, 0.15, 0.13]} rotation={[0, 0, -Math.PI / 6]}>
        <meshStandardMaterial color="#ffffff" />
      </Box>
    </group>
  )
}

export function PhotoModel({ imageUrl, isVisible }: { imageUrl: string; isVisible: boolean }) {
  if (!isVisible || !imageUrl) return null

  const texture = useTexture(imageUrl)

  // Default plane size; preserve aspect ratio if available
  const imageWidth = (texture as any)?.image?.width || 1280
  const imageHeight = (texture as any)?.image?.height || 720
  const baseWidth = 2.5
  const aspect = imageHeight > 0 ? imageWidth / imageHeight : 16 / 9
  const width = baseWidth
  const height = baseWidth / aspect

  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      {/* Thin frame */}
      <Box args={[width + 0.1, height + 0.1, 0.02]} position={[0, 0, -0.02]}>
        <meshBasicMaterial color="#222222" transparent opacity={0.6} />
      </Box>
    </group>
  )
}
