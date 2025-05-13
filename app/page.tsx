'use client'

import { useEffect, useRef } from 'react'
import { MindMap } from '@/components/mindmap'
import mapData from '../data/mapdata'

export default function Home() {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (svgRef.current) {
      const mindmap = new MindMap(svgRef.current, mapData)
      mindmap.renderMap()
    }
  }, [])

  return (
    <main>
      <svg ref={svgRef} className='mindmap-svg'></svg>
    </main>
  )
}