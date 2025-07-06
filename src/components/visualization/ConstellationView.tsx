'use client';

import React, { useRef, useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useVisualizationStore } from '@/store/visualizationStore';
import type { VisualizationMode, NodeData, EdgeData } from '@/types/visualization';
import ClientOnly from '@/components/shared/three/ClientOnly';
import BaseScene from '@/components/shared/three/BaseScene';
import type { Vector3 } from 'three';
import { Line } from '@react-three/drei';
import * as d3 from 'd3-force';
import { Canvas } from '@react-three/fiber';

// Dynamically import Three.js specific components with proper loading states
const DynamicText = dynamic(
  () => import('@react-three/drei').then((mod) => mod.Text),
  { 
    ssr: false,
    loading: () => null
  }
);

const DynamicLine = dynamic(
  () => import('@react-three/drei').then((mod) => mod.Line),
  { 
    ssr: false,
    loading: () => null
  }
);

interface ConstellationViewProps {
  width: number;
  height: number;
  onNodeClick?: (nodeId: string) => void;
  onNodeHover?: (nodeId: string | null) => void;
}

const ConstellationView: React.FC<ConstellationViewProps> = ({
  width,
  height,
  onNodeClick,
  onNodeHover,
}) => {
  console.log("ConstellationView rendered");
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const { mode, setMode, nodes, edges, selectedNode, hoveredNode, setSelectedNode, setHoveredNode, isLoading, error, showTestData, toggleShowTestData, updateVisualization } = useVisualizationStore();
  const modes: VisualizationMode[] = ['learning_style', 'shaped_by', 'peak_performance', 'motivation'];
  const autoPlayInterval = useRef<NodeJS.Timeout>();
  const [nodePositions, setNodePositions] = useState<{ [id: string]: [number, number, number] }>({});
  const [currentAttribute, setCurrentAttribute] = useState('learning_style');
  const [transition, setTransition] = useState(false);

  // Available attributes for cycling
  const availableAttributes = ['learning_style', 'shaped_by', 'peak_performance', 'motivation'];

  // Calculate 16:9 aspect ratio dimensions
  const containerAspectRatio = 16 / 9;
  const availableWidth = width;
  const availableHeight = height;
  
  let canvasWidth, canvasHeight;
  if (availableWidth / availableHeight > containerAspectRatio) {
    // Constrain by height
    canvasHeight = availableHeight * 0.9; // Use 90% of available height
    canvasWidth = canvasHeight * containerAspectRatio;
  } else {
    // Constrain by width  
    canvasWidth = availableWidth * 0.9; // Use 90% of available width
    canvasHeight = canvasWidth / containerAspectRatio;
  }

  // Defensive filtering for nodes and edges
  const validNodes = Array.isArray(nodes)
    ? nodes.filter(
        (node) =>
          node &&
          typeof node.opacity === 'number' &&
          typeof node.scale === 'number' &&
          node.position
      )
    : [];

  const validEdges = Array.isArray(edges)
    ? edges.filter(
        (edge) =>
          edge &&
          typeof edge.opacity === 'number' &&
          typeof edge.strength === 'number'
      )
    : [];

  // Calculate similarity between two nodes based on all attributes
  const calculateSimilarity = (node1: NodeData, node2: NodeData): number => {
    const attributes = ['learning_style', 'work_environment', 'communication_style', 'decision_making'];
    let matches = 0;
    let total = 0;

    attributes.forEach(attr => {
      const val1 = node1[attr as keyof NodeData];
      const val2 = node2[attr as keyof NodeData];
      if (val1 !== undefined && val2 !== undefined) {
        total++;
        if (val1 === val2) matches++;
      }
    });

    return total > 0 ? matches / total : 0;
  };

  // All useEffect hooks must be here, before any conditional logic
  useEffect(() => {
    console.log('ConstellationView mounted');
    console.log('Current state:', { mode, nodes, edges, isLoading, error });
  }, [mode, nodes, edges, isLoading, error]);

  useEffect(() => {
    updateVisualization();
  }, [showTestData]);

  useEffect(() => {
    if (isAutoPlay) {
      let currentIndex = availableAttributes.indexOf(currentAttribute);
      autoPlayInterval.current = setInterval(() => {
        setTransition(true);
        setTimeout(() => {
          currentIndex = (currentIndex + 1) % availableAttributes.length;
          setCurrentAttribute(availableAttributes[currentIndex]);
          setTransition(false);
        }, 500); // Half second transition
      }, 15000); // 15 seconds per attribute
    } else {
      if (autoPlayInterval.current) {
        clearInterval(autoPlayInterval.current);
      }
    }

    return () => {
      if (autoPlayInterval.current) {
        clearInterval(autoPlayInterval.current);
      }
    };
  }, [isAutoPlay, currentAttribute, availableAttributes]);

  // Calculate positions once when data loads - never recalculate
  useEffect(() => {
    if (!validNodes.length) return;

    // Only run if we don't already have positions
    if (Object.keys(nodePositions).length > 0) return;

    // Build similarity network first
    const links: Array<{source: string, target: string, strength: number}> = [];
    const nodeMetrics = new Map<string, {totalSimilarity: number, connections: number}>();
    
    // Initialize metrics
    validNodes.forEach(node => {
      nodeMetrics.set(node.id, {totalSimilarity: 0, connections: 0});
    });

    // Calculate similarities (only strong ones to reduce complexity)
    for (let i = 0; i < validNodes.length; i++) {
      for (let j = i + 1; j < validNodes.length; j++) {
        const node1 = validNodes[i];
        const node2 = validNodes[j];
        const similarity = calculateSimilarity(node1, node2);
        
        if (similarity > 0.4) { // Higher threshold for stability
          links.push({
            source: node1.id,
            target: node2.id,
            strength: similarity
          });
          
          const metrics1 = nodeMetrics.get(node1.id)!;
          const metrics2 = nodeMetrics.get(node2.id)!;
          metrics1.totalSimilarity += similarity;
          metrics1.connections += 1;
          metrics2.totalSimilarity += similarity;
          metrics2.connections += 1;
        }
      }
    }

    // Create simulation nodes with meaningful starting positions
    const simNodes = validNodes.map((node, index) => {
      const metrics = nodeMetrics.get(node.id)!;
      const centrality = metrics.connections > 0 ? metrics.totalSimilarity / metrics.connections : 0;
      
      // Group nodes by current attribute for better initial positioning
      const groups = Array.from(new Set(validNodes.map(n => n[currentAttribute as keyof NodeData])));
      const groupIndex = groups.indexOf(node[currentAttribute as keyof NodeData]);
      const nodesInGroup = validNodes.filter(n => n[currentAttribute as keyof NodeData] === node[currentAttribute as keyof NodeData]);
      const positionInGroup = nodesInGroup.findIndex(n => n.id === node.id);
      
      // Create cluster-based layout with separation
      const clusterAngle = (groupIndex / groups.length) * 2 * Math.PI;
      const clusterRadius = 80; // Base distance from center
      const clusterX = Math.cos(clusterAngle) * clusterRadius;
      const clusterY = Math.sin(clusterAngle) * clusterRadius;
      
      // Spread nodes within each cluster in a spiral pattern
      const intraClusterAngle = (positionInGroup / nodesInGroup.length) * 2 * Math.PI * 2; // Multiple spirals
      const intraClusterRadius = 20 + (positionInGroup % 3) * 15; // Vary distance
      const intraX = Math.cos(intraClusterAngle) * intraClusterRadius;
      const intraY = Math.sin(intraClusterAngle) * intraClusterRadius;
      
      return {
        id: node.id,
        x: clusterX + intraX,
        y: clusterY + intraY,
        z: 0,
        group: node[currentAttribute as keyof NodeData],
        centrality: centrality,
        size: 2 + (centrality * 3),
        originalNode: node
      };
    });

    // Run simulation to completion, then stop forever
    const simulation = d3.forceSimulation(simNodes)
      .force('link', d3.forceLink(links)
        .id((d: any) => d.id)
        .distance(60)
        .strength(0.3)
      )
      .force('charge', d3.forceManyBody()
        .strength(-20)
      )
      .force('center', d3.forceCenter(0, 0))
      .force('collision', d3.forceCollide()
        .radius((d: any) => d.size + 5)
        .strength(0.5)
      )
      .alpha(0.3)
      .alphaDecay(0.01)
      .velocityDecay(0.8);

    // Let it run for exactly 100 ticks, then stop and set final positions
    let tickCount = 0;
    const targetTicks = 100;
    
    simulation.on('tick', () => {
      tickCount++;
      
      // After target ticks, set final positions and stop
      if (tickCount === targetTicks) {
        const finalPositions: { [id: string]: [number, number, number] } = {};
        simNodes.forEach(node => {
          finalPositions[node.id] = [node.x || 0, node.y || 0, 0];
        });
        
        // Set positions once and stop everything
        setNodePositions(finalPositions);
        simulation.stop();
      }
    });

    // Store data
    (window as any).currentSimulation = {
      nodes: simNodes,
      links: links.slice(0, 30),
      nodeMetrics: nodeMetrics
    };

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [validNodes]); // Only depend on validNodes, NOT currentAttribute

  // Helper functions
  const getNodePosition = (node: NodeData): [number, number, number] => {
    return nodePositions[node.id] || [node.position.x, node.position.y, node.position.z];
  };

  const getEdgePoints = (edge: EdgeData, nodes: NodeData[]): [number, number, number][] | null => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    if (!sourceNode || !targetNode) return null;
    return [
      getNodePosition(sourceNode),
      getNodePosition(targetNode)
    ];
  };

  // Remove name from label - privacy focused
  const getNodeLabel = (node: NodeData) => {
    if (!node.attendee) {
      console.warn('Node missing attendee:', node);
      return `Unknown (${node.yearsCategory})`;
    }
    return node.attendee.is_anonymous 
      ? `Anonymous (${node.yearsCategory})`
      : `${node.attendee.first_name} ${node.attendee.last_name || ''} (${node.yearsCategory})`;
  };

  // Color scheme for different attribute values
  const getGroupColor = (group: any, attribute: string): string => {
    const colors = {
      learning_style: {
        visual: '#60a5fa',
        auditory: '#f87171', 
        kinesthetic: '#34d399',
        reading_writing: '#fbbf24'
      },
      work_environment: {
        collaborative: '#8b5cf6',
        independent: '#10b981',
        hybrid: '#f59e0b'
      },
      communication_style: {
        direct: '#ef4444',
        diplomatic: '#3b82f6',
        analytical: '#06b6d4'
      },
      decision_making: {
        intuitive: '#f97316',
        analytical: '#6366f1',
        collaborative: '#84cc16'
      }
    };

    const attributeColors = colors[attribute as keyof typeof colors];
    if (attributeColors && group in attributeColors) {
      return attributeColors[group as keyof typeof attributeColors];
    }
    
    return '#6b7280';
  };

  const getGroupCounts = (): Record<string, number> => {
    const counts: Record<string, number> = {};
    validNodes.forEach(node => {
      const group = String(node[currentAttribute as keyof NodeData] || 'Unknown');
      counts[group] = (counts[group] || 0) + 1;
    });
    return counts;
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(selectedNode === nodeId ? null : nodeId);
    onNodeClick?.(nodeId);
  };

  const handleNodeHover = (nodeId: string | null) => {
    setHoveredNode(nodeId);
    onNodeHover?.(nodeId);
  };

  // Handle manual attribute change with transition
  const handleAttributeChange = (attr: string) => {
    if (attr !== currentAttribute) {
      setTransition(true);
      setTimeout(() => {
        setCurrentAttribute(attr);
        setTransition(false);
      }, 300);
    }
  };

  // Debug logging disabled to prevent strobing
  // console.log('=== ConstellationView Debug ===');

  // Early returns after all hooks
  if (isLoading) {
    return <div className="flex items-center justify-center w-full h-full">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center w-full h-full text-red-500">{error}</div>;
  }

  if (!validNodes.length || !validEdges.length) {
    return <div className="flex items-center justify-center w-full h-full">No data to display</div>;
  }

  // Edge logging disabled to prevent strobing

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
      {/* Full-screen Canvas */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 300], fov: 75 }}
          style={{ background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%)' }}
          gl={{ antialias: true, alpha: false }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} />
          
          <Suspense fallback={null}>
            {/* Render Nodes - Simple, stable design */}
            {validNodes.map((node, index) => {
              const position = nodePositions[node.id];
              if (!position) return null;
              
              const isSelected = selectedNode === node.id;
              const isHovered = hoveredNode === node.id;
              const nodeColor = getGroupColor(node[currentAttribute as keyof NodeData], currentAttribute);
              
              // Get node metrics from the simulation
              const simData = (window as any).currentSimulation;
              const simNode = simData?.nodes?.find((n: any) => n.id === node.id);
              const centrality = simNode?.centrality || 0;
              const nodeSize = Math.max(1.5, Math.min(4, simNode?.size || 2)); // Clamp size
              const connections = simData?.nodeMetrics?.get(node.id)?.connections || 0;
              
              return (
                <group key={node.id} position={position}>
                  {/* Simple core node */}
                  <mesh
                    onClick={() => handleNodeClick(node.id)}
                    onPointerOver={() => handleNodeHover(node.id)}
                    onPointerOut={() => handleNodeHover(null)}
                  >
                    <sphereGeometry args={[nodeSize, 16, 16]} />
                    <meshStandardMaterial
                      color={isSelected ? '#ffffff' : nodeColor}
                      opacity={0.9}
                      transparent={false}
                      roughness={0.5}
                      metalness={0.2}
                    />
                  </mesh>
                  
                  {/* Simple glow for selected/hovered only */}
                  {(isSelected || isHovered) && (
                    <mesh>
                      <sphereGeometry args={[nodeSize * 1.4, 16, 16]} />
                      <meshBasicMaterial
                        color={nodeColor}
                        transparent
                        opacity={isSelected ? 0.3 : 0.2}
                      />
                    </mesh>
                  )}
                  
                  {/* Simple label */}
                  {(isSelected || isHovered) && (
                    <DynamicText
                      position={[0, nodeSize + 2, 0]}
                      fontSize={1.2}
                      color="#ffffff"
                      anchorX="center"
                      anchorY="bottom"
                    >
                      {`${String(node[currentAttribute as keyof NodeData] || 'Unknown')}`}
                    </DynamicText>
                  )}
                </group>
              );
            })}

            {/* Simple connections */}
            {(() => {
              const simData = (window as any).currentSimulation;
              if (!simData?.links) return null;
              
              return simData.links
                .filter((link: any) => link.strength > 0.6) // Only very strong connections
                .slice(0, 20) // Limit to 20 connections
                .map((link: any) => {
                  const sourcePos = nodePositions[link.source];
                  const targetPos = nodePositions[link.target];
                  
                  if (!sourcePos || !targetPos) return null;
                  
                  return (
                    <Line
                      key={`${link.source}-${link.target}`}
                      points={[sourcePos, targetPos]}
                      color="#888888"
                      lineWidth={1}
                      opacity={0.3}
                    />
                  );
                });
            })()}
          </Suspense>
        </Canvas>
      </div>

      {/* Fixed UI Layout - Top Left */}
      <div className="absolute top-6 left-6 space-y-4 z-10">
        {/* Cluster Control */}
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
          <h3 className="text-white font-medium mb-3">CLUSTER BY</h3>
          <div className="flex flex-wrap gap-2">
            {availableAttributes.map((attr) => (
              <button
                key={attr}
                onClick={() => setCurrentAttribute(attr)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentAttribute === attr
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {attr.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
          <h3 className="text-white font-medium mb-3">
            GROUPS ({currentAttribute.replace(/_/g, ' ').toUpperCase()})
          </h3>
          <div className="space-y-2">
            {Object.entries(getGroupCounts()).map(([group, count]) => (
              <div key={group} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor: getGroupColor(group, currentAttribute)
                  }}
                />
                <span className="text-gray-300 text-sm">
                  {group} ({count})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Auto-play Control - Top Right */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={() => setIsAutoPlay(!isAutoPlay)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isAutoPlay
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isAutoPlay ? '⏸ Stop Auto-play' : '▶ Start Auto-play'}
        </button>
      </div>
    </div>
  );
};

export { ConstellationView };
export default ConstellationView; 