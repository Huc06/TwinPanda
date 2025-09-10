"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

// Dynamically import Canvas to avoid SSR issues
const Canvas = dynamic(
  () => import("@react-three/fiber").then((mod) => ({ default: mod.Canvas })),
  { ssr: false }
)

const OrbitControls = dynamic(
  () => import("@react-three/drei").then((mod) => ({ default: mod.OrbitControls })),
  { ssr: false }
)

interface ARCanvasProps {
  children: React.ReactNode
  camera?: { position: [number, number, number]; fov: number }
}

export function ARCanvas({ children, camera = { position: [0, 0, 5], fov: 50 } }: ARCanvasProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading 3D Scene...</div>
      </div>
    )
  }

  return (
    <Canvas camera={camera}>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, 10]} intensity={0.5} color="#4f46e5" />
      {children}
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  )
}
