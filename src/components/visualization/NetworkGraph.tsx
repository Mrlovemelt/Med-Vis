import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';
import { useVisualizationStore } from '@/store/visualizationStore';
import type { NodeData, EdgeData, YearsCategory } from '@/types/visualization';

const getNodeColor = (yearsCategory: YearsCategory): string => {
  switch (yearsCategory) {
    case '0-5':
      return '#FF6B6B';
    case '6-10':
      return '#4ECDC4';
    case '11-15':
      return '#45B7D1';
    case '16-20':
      return '#96CEB4';
    case '20+':
      return '#FFEEAD';
    default:
      return '#CCCCCC';
  }
};

interface NodeProps {
  data: NodeData;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onHover: (hovered: boolean) => void;
}

const Node: React.FC<NodeProps> = ({ data, isSelected, isHovered, onClick, onHover }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { scale, opacity } = useSpring({
    scale: isSelected ? 1.5 : isHovered ? 1.2 : 1,
    opacity: isSelected ? 1 : isHovered ? 0.8 : 0.6,
    config: { mass: 1, tension: 280, friction: 60 },
  });

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <animated.mesh
      ref={meshRef}
      position={data.position}
      scale={scale}
      onClick={onClick}
      onPointerOver={() => onHover(true)}
      onPointerOut={() => onHover(false)}
    >
      <sphereGeometry args={[0.5, 32, 32]} />
      <animated.meshStandardMaterial
        color={getNodeColor(data.yearsCategory)}
        transparent
        opacity={opacity}
      />
      <Text
        position={[0, 0.8, 0]}
        fontSize={0.3}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {data.attendee.is_anonymous ? 'Anonymous' : data.attendee.first_name}
      </Text>
    </animated.mesh>
  );
};

interface EdgeProps {
  data: EdgeData;
  nodes: NodeData[];
}

const Edge: React.FC<EdgeProps> = ({ data, nodes }) => {
  const sourceNode = nodes.find((n: NodeData) => n.id === data.source);
  const targetNode = nodes.find((n: NodeData) => n.id === data.target);

  if (!sourceNode || !targetNode) return null;

  return (
    <Line
      points={[sourceNode.position, targetNode.position]}
      color="gray"
      lineWidth={data.strength}
      opacity={data.opacity}
      transparent
    />
  );
};

const Scene: React.FC = () => {
  const { nodes, edges, selectedNode, hoveredNode, setSelectedNode, setHoveredNode } = useVisualizationStore();
  const { camera } = useThree();

  useEffect(() => {
    if (selectedNode) {
      const node = nodes.find((n: NodeData) => n.id === selectedNode);
      if (node) {
        camera.lookAt(node.position);
      }
    }
  }, [selectedNode, nodes, camera]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <OrbitControls enableDamping dampingFactor={0.05} />
      
      {edges.map((edge: EdgeData) => (
        <Edge key={edge.id} data={edge} nodes={nodes} />
      ))}
      
      {nodes.map((node: NodeData) => (
        <Node
          key={node.id}
          data={node}
          isSelected={node.id === selectedNode}
          isHovered={node.id === hoveredNode}
          onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
          onHover={(hovered) => setHoveredNode(hovered ? node.id : null)}
        />
      ))}
    </>
  );
};

interface NetworkGraphProps {
  width: number;
  height: number;
  onNodeClick?: (nodeId: string) => void;
  onNodeHover?: (nodeId: string | null) => void;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  width,
  height,
  onNodeClick,
  onNodeHover,
}) => {
  return (
    <div style={{ width, height }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        style={{ background: '#f0f0f0' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}; 