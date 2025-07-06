'use client';

import React, { useEffect, useRef, useState } from 'react';
import { VisualizationContainer } from '../shared/VisualizationContainer';
import { ModeToggle } from '../shared/ModeToggle';
import { DataInsightPanel } from '../shared/DataInsightPanel';
import { useVisualizationData } from '../shared/useVisualizationData';
import { createResponsiveSVG, createForceSimulation, addDragBehavior } from '../shared/d3Utils';
import { yearsColorScale, learningStyleColors, shapedByColors, peakPerformanceColors, motivationColors } from '../shared/colorUtils';
import { useConstellationStore } from '@/store/constellationStore';
import type { NodeData, EdgeData, VisualizationMode, YearsCategory } from '@/types/visualization';
import type { LearningStyle, ShapedBy, PeakPerformanceType, MotivationType } from '@/lib/supabase/types';
import { Vector3 } from 'three';
import type { SimulationNodeDatum, SimulationLinkDatum } from 'd3-force';
import { Selection } from 'd3-selection';

type SimulationNode = NodeData & SimulationNodeDatum;
interface SimulationLink extends SimulationLinkDatum<SimulationNode> {
  id: string;
  strength: number;
  opacity: number;
}

interface ConstellationViewProps {
  width: number;
  height: number;
}

export function ConstellationView({ width, height }: ConstellationViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { data, isLoading, error } = useVisualizationData();
  const { mode, isAutoPlay, setMode, setIsAutoPlay } = useConstellationStore();
  const [insights, setInsights] = useState<Array<{ title: string; value: string | number; description?: string }>>([]);

  useEffect(() => {
    if (!containerRef.current || !data.length) return;

    const { svg, g, width: svgWidth, height: svgHeight } = createResponsiveSVG(
      containerRef.current,
      width,
      height
    );

    // Process data for visualization
    const nodes: SimulationNode[] = data.map((response) => ({
      id: response.id,
      position: new Vector3(
        Math.random() * svgWidth - svgWidth / 2,
        Math.random() * svgHeight - svgHeight / 2,
        0
      ),
      attendee: {
        first_name: response.attendee.first_name,
        last_name: response.attendee.last_name,
        is_anonymous: response.attendee.is_anonymous,
      },
      years_at_medtronic: response.years_at_medtronic || 0,
      yearsCategory: getYearsCategory(response.years_at_medtronic || 0),
      learning_style: response.learning_style as LearningStyle | null,
      shaped_by: response.shaped_by as ShapedBy | null,
      peak_performance: response.peak_performance as PeakPerformanceType | null,
      motivation: response.motivation as MotivationType | null,
      unique_quality: response.unique_quality,
      connections: [],
      opacity: 1,
      scale: 1,
    }));

    const edges: SimulationLink[] = [];
    // Add edges based on shared attributes
    nodes.forEach((node1, i) => {
      nodes.slice(i + 1).forEach((node2) => {
        if (
          node1[mode as keyof NodeData] === node2[mode as keyof NodeData] ||
          node1.yearsCategory === node2.yearsCategory
        ) {
          edges.push({
            id: `${node1.id}-${node2.id}`,
            source: node1.id,
            target: node2.id,
            strength: 0.5,
            opacity: 0.2,
          });
        }
      });
    });

    // Create force simulation
    const simulation = createForceSimulation(nodes, edges, svgWidth, svgHeight);

    // Draw nodes
    const nodeGroup = g
      .selectAll<SVGGElement, SimulationNode>('.node')
      .data(nodes)
      .join('g')
      .attr('class', 'node');

    // Add drag behavior
    addDragBehavior(nodeGroup, simulation);

    nodeGroup
      .append('circle')
      .attr('r', 5)
      .attr('fill', (d) => {
        switch (mode) {
          case 'learning_style':
            return learningStyleColors(d.learning_style as NonNullable<LearningStyle>);
          case 'shaped_by':
            return shapedByColors(d.shaped_by as NonNullable<ShapedBy>);
          case 'peak_performance':
            return peakPerformanceColors(d.peak_performance as NonNullable<PeakPerformanceType>);
          case 'motivation':
            return motivationColors(d.motivation as NonNullable<MotivationType>);
          default:
            return yearsColorScale(d.yearsCategory);
        }
      });

    // Draw edges
    const edgeGroup = g
      .selectAll<SVGLineElement, SimulationLink>('.edge')
      .data(edges)
      .join('line')
      .attr('class', 'edge')
      .attr('stroke', '#2A2A2F')
      .attr('stroke-opacity', (d) => d.opacity);

    // Update positions on simulation tick
    simulation.on('tick', () => {
      edgeGroup
        .attr('x1', (d) => (d.source as any).position.x + svgWidth / 2)
        .attr('y1', (d) => (d.source as any).position.y + svgHeight / 2)
        .attr('x2', (d) => (d.target as any).position.x + svgWidth / 2)
        .attr('y2', (d) => (d.target as any).position.y + svgHeight / 2);

      nodeGroup.attr(
        'transform',
        (d) => `translate(${d.position.x + svgWidth / 2},${d.position.y + svgHeight / 2})`
      );
    });

    // Update insights
    const modeCounts = nodes.reduce((acc, node) => {
      const value = node[mode as keyof NodeData];
      if (value) {
        acc[value as string] = (acc[value as string] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const totalNodes = nodes.length;
    setInsights([
      {
        title: 'Total Attendees',
        value: totalNodes,
      },
      {
        title: 'Most Common',
        value: Object.entries(modeCounts).reduce((a, b) => (b[1] > a[1] ? b : a))[0],
        description: `${Math.round(
          (Object.entries(modeCounts).reduce((a, b) => (b[1] > a[1] ? b : a))[1] / totalNodes) * 100
        )}% of attendees`,
      },
    ]);

    return () => {
      simulation.stop();
      svg.remove();
    };
  }, [data, width, height, mode]);

  return (
    <VisualizationContainer
      title="Constellation View"
      description="Explore how attendees cluster differently based on various attributes. Watch as the same people group together in new ways when viewed through different lenses."
      isLoading={isLoading}
      error={error}
    >
      <div ref={containerRef} className="w-full h-full" />
      <ModeToggle isAutoPlay={isAutoPlay} onToggle={() => setIsAutoPlay(!isAutoPlay)} />
      <DataInsightPanel insights={insights} isVisible={true} />
    </VisualizationContainer>
  );
}

function getYearsCategory(years: number): YearsCategory {
  if (years <= 5) return '0-5';
  if (years <= 10) return '6-10';
  if (years <= 15) return '11-15';
  if (years <= 20) return '16-20';
  return '20+';
} 