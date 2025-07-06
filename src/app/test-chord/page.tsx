'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { chord as d3Chord, ribbon } from 'd3-chord';
import { arc } from 'd3-shape';
import { 
  processChordData, 
  chordConfig, 
  cyclingModes, 
  getChordColor,
  chordAnimations,
  type ChordMatrix,
  type ChordGroup,
  type ChordLink
} from '@/components/DataVisualization/shared/chordUtils';

// Mock data for testing
const mockData = [
  { years_at_medtronic: 10, learning_style: 'kinesthetic', shaped_by: 'mentor', peak_performance: 'Extrovert, Morning', motivation: 'autonomy' },
  { years_at_medtronic: 0, learning_style: 'reading_writing', shaped_by: 'other', peak_performance: 'Introvert, Morning', motivation: 'autonomy' },
  { years_at_medtronic: 6, learning_style: 'auditory', shaped_by: 'other', peak_performance: 'Extrovert, Evening', motivation: 'autonomy' },
  { years_at_medtronic: 22, learning_style: 'kinesthetic', shaped_by: 'mentor', peak_performance: 'Extrovert, Morning', motivation: 'autonomy' },
  { years_at_medtronic: 19, learning_style: 'auditory', shaped_by: 'mentor', peak_performance: 'Introvert, Evening', motivation: 'recognition' },
  { years_at_medtronic: 15, learning_style: 'visual', shaped_by: 'mentor', peak_performance: 'Ambivert, Morning', motivation: 'impact' },
  { years_at_medtronic: 24, learning_style: 'reading_writing', shaped_by: 'mentor', peak_performance: 'Introvert, Morning', motivation: 'impact' },
  { years_at_medtronic: 14, learning_style: 'auditory', shaped_by: 'failure', peak_performance: 'Extrovert, Evening', motivation: 'autonomy' },
  { years_at_medtronic: 5, learning_style: 'auditory', shaped_by: 'other', peak_performance: 'Introvert, Night', motivation: 'purpose' },
  { years_at_medtronic: 15, learning_style: 'visual', shaped_by: 'other', peak_performance: 'Ambivert, Night', motivation: 'purpose' },
  { years_at_medtronic: 24, learning_style: 'visual', shaped_by: 'failure', peak_performance: 'Extrovert, Morning', motivation: 'recognition' },
  { years_at_medtronic: 8, learning_style: 'auditory', shaped_by: 'failure', peak_performance: 'Extrovert, Evening', motivation: 'autonomy' },
  { years_at_medtronic: 13, learning_style: 'reading_writing', shaped_by: 'other', peak_performance: 'Introvert, Morning', motivation: 'autonomy' },
  { years_at_medtronic: 4, learning_style: 'kinesthetic', shaped_by: 'other', peak_performance: 'Extrovert, Morning', motivation: 'autonomy' },
  { years_at_medtronic: 18, learning_style: 'visual', shaped_by: 'challenge', peak_performance: 'Introvert, Evening', motivation: 'growth' },
  { years_at_medtronic: 7, learning_style: 'reading_writing', shaped_by: 'success', peak_performance: 'Ambivert, Morning', motivation: 'impact' },
  { years_at_medtronic: 12, learning_style: 'kinesthetic', shaped_by: 'team', peak_performance: 'Extrovert, Evening', motivation: 'recognition' },
  { years_at_medtronic: 3, learning_style: 'auditory', shaped_by: 'mentor', peak_performance: 'Introvert, Night', motivation: 'purpose' },
  { years_at_medtronic: 20, learning_style: 'visual', shaped_by: 'challenge', peak_performance: 'Extrovert, Morning', motivation: 'growth' },
  { years_at_medtronic: 9, learning_style: 'reading_writing', shaped_by: 'failure', peak_performance: 'Ambivert, Night', motivation: 'autonomy' },
];

function TestChordDiagram() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [currentSource, setCurrentSource] = useState('years_at_medtronic');
  const [currentTarget, setCurrentTarget] = useState('learning_style');
  const [rotationAngle, setRotationAngle] = useState(0);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: React.ReactNode } | null>(null);

  const width = 1000;
  const height = 800;

  // Gentle rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setRotationAngle(prev => (prev + 0.5) % 360);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Render chord diagram
  useEffect(() => {
    if (!svgRef.current || !mockData.length) return;

    const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);
    
    // Clear previous visualization
    svg.selectAll('*').remove();

    // Set up dimensions
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const radius = Math.min(chartWidth, chartHeight) / 2;

    // Create chord layout
    const chordLayout = d3Chord()
      .padAngle(0.05)
      .sortSubgroups(d3.descending);

    // Process data
    const chordData = processChordData(mockData, currentSource, currentTarget);
    
    // Create matrix for chord layout
    const matrix = chordData.matrix;
    const chordResult = chordLayout(matrix);

    // Create arc generator
    const arcGenerator = arc<ChordGroup>()
      .innerRadius(radius * chordConfig.innerRadius)
      .outerRadius(radius * chordConfig.outerRadius);

    // Create ribbon generator
    const ribbonGenerator = ribbon<ChordLink>()
      .radius(radius * chordConfig.innerRadius);

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2}) rotate(${rotationAngle})`);

    // Add gradients for chords
    const defs = svg.append('defs');
    chordData.chords.forEach((chord, i) => {
      const gradient = defs
        .append('linearGradient')
        .attr('id', `chord-gradient-${i}`)
        .attr('gradientUnits', 'userSpaceOnUse');

      gradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', chord.source.color);

      gradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', chord.target.color);
    });

    // Draw chords
    g.selectAll('path.chord')
      .data(chordResult)
      .enter()
      .append('path')
      .attr('class', 'chord')
      .attr('d', ribbonGenerator)
      .attr('fill', (d, i) => `url(#chord-gradient-${i})`)
      .attr('opacity', chordConfig.chordOpacity)
      .attr('stroke', '#0A0A0F')
      .attr('stroke-width', 1)
      .on('mouseover', function(event, d) {
        const chord = chordData.chords.find(c => 
          c.source.index === d.source.index && c.target.index === d.target.index
        );
        if (chord) {
          setTooltip({
            x: event.offsetX,
            y: event.offsetY,
            content: (
              <div>
                <div className="font-bold">{chord.source.name} ↔ {chord.target.name}</div>
                <div>{chord.value} connections</div>
                <div>Strength: {chord.strength}</div>
              </div>
            ),
          });
        }
        d3.select(this)
          .attr('opacity', chordConfig.chordHoverOpacity)
          .attr('stroke-width', 2);
      })
      .on('mouseout', function() {
        setTooltip(null);
        d3.select(this)
          .attr('opacity', chordConfig.chordOpacity)
          .attr('stroke-width', 1);
      });

    // Draw arcs
    g.selectAll('path.arc')
      .data(chordResult.groups)
      .enter()
      .append('path')
      .attr('class', 'arc')
      .attr('d', arcGenerator)
      .attr('fill', (d, i) => chordData.groups[i].color)
      .attr('opacity', chordConfig.arcOpacity)
      .attr('stroke', '#0A0A0F')
      .attr('stroke-width', chordConfig.arcStroke)
      .on('mouseover', function(event, d) {
        const group = chordData.groups[d.index];
        setTooltip({
          x: event.offsetX,
          y: event.offsetY,
          content: (
            <div>
              <div className="font-bold">{group.name}</div>
              <div>Category: {group.question}</div>
              <div>Total: {group.value}</div>
            </div>
          ),
        });
        d3.select(this)
          .attr('opacity', 1)
          .attr('stroke-width', chordConfig.arcStroke + 2);
      })
      .on('mouseout', function() {
        setTooltip(null);
        d3.select(this)
          .attr('opacity', chordConfig.arcOpacity)
          .attr('stroke-width', chordConfig.arcStroke);
      });

    // Add labels
    g.selectAll('text.label')
      .data(chordResult.groups)
      .enter()
      .append('text')
      .attr('class', 'label')
      .each(function(d) {
        const group = chordData.groups[d.index];
        const centroid = arcGenerator.centroid(d);
        const angle = (d.startAngle + d.endAngle) / 2;
        
        d3.select(this)
          .attr('x', centroid[0])
          .attr('y', centroid[1])
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-family', 'Avenir Next World, -apple-system, BlinkMacSystemFont, "SF Pro", "Roboto", sans-serif')
          .attr('font-weight', 700)
          .attr('font-size', 18)
          .attr('fill', '#170F5F')
          .attr('transform', `rotate(${(angle * 180) / Math.PI - 90})`)
          .text(group.name);
      });

  }, [currentSource, currentTarget, rotationAngle]);

  // Tooltip rendering
  const tooltipEl = tooltip ? (
    <div
      style={{
        position: 'absolute',
        left: tooltip.x + 16,
        top: tooltip.y + 16,
        background: 'rgba(20,20,30,0.98)',
        color: '#fff',
        padding: '10px 16px',
        borderRadius: 8,
        pointerEvents: 'none',
        zIndex: 100,
        fontFamily: 'Avenir Next World, sans-serif',
        fontWeight: 600,
        fontSize: 16,
        boxShadow: '0 4px 24px 0 rgba(16, 16, 235, 0.12)',
        maxWidth: 320,
      }}
      role="tooltip"
      aria-live="polite"
    >
      {tooltip.content}
    </div>
  ) : null;

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-white">
      <div className="w-full flex flex-col items-center" style={{ maxWidth: 1600, margin: '0 auto' }}>
        <div style={{ marginTop: 48, marginBottom: 32, width: '100%' }}>
          <div className="w-full flex flex-row justify-between items-end mb-6 gap-8" style={{ maxWidth: 1600, margin: '0 auto', padding: '0 48px' }}>
            <div className="flex-1 flex flex-col items-start" style={{ marginLeft: 48 }}>
              <label className="w-full">
                <div className="relative w-fit">
                  <select 
                    value={currentSource}
                    onChange={(e) => setCurrentSource(e.target.value)}
                    style={{
                      minWidth: 320,
                      fontSize: '1.5rem',
                      lineHeight: 1.1,
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      background: 'none',
                      color: '#170F5F',
                      border: 0,
                      borderBottom: '4px solid #170F5F',
                      fontWeight: 700,
                      paddingRight: 48,
                      paddingLeft: 0,
                      paddingTop: 8,
                      paddingBottom: 8,
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    className="custom-select"
                  >
                    <option value="years_at_medtronic">Years at Medtronic</option>
                    <option value="learning_style">Learning Style</option>
                    <option value="shaped_by">Shaped By</option>
                    <option value="peak_performance">Peak Performance</option>
                    <option value="motivation">Motivation</option>
                  </select>
                </div>
              </label>
            </div>
            <div className="flex-1 flex flex-col items-end" style={{ marginRight: 48 }}>
              <label className="w-full flex justify-end">
                <div className="relative w-fit">
                  <select 
                    value={currentTarget}
                    onChange={(e) => setCurrentTarget(e.target.value)}
                    style={{
                      minWidth: 320,
                      fontSize: '1.5rem',
                      lineHeight: 1.1,
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      background: 'none',
                      color: '#170F5F',
                      border: 0,
                      borderBottom: '4px solid #170F5F',
                      fontWeight: 700,
                      paddingRight: 48,
                      paddingLeft: 0,
                      paddingTop: 8,
                      paddingBottom: 8,
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    className="custom-select"
                  >
                    <option value="years_at_medtronic">Years at Medtronic</option>
                    <option value="learning_style">Learning Style</option>
                    <option value="shaped_by">Shaped By</option>
                    <option value="peak_performance">Peak Performance</option>
                    <option value="motivation">Motivation</option>
                  </select>
                </div>
              </label>
            </div>
          </div>
        </div>
        <div
          style={{
            position: 'relative',
            width: width,
            height: height,
            overflow: 'visible',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            aspectRatio: '16/9',
            background: 'transparent',
            borderRadius: 0,
            boxShadow: 'none',
            margin: '0 auto',
          }}
          className="my-4"
        >
          <svg ref={svgRef} width={width} height={height} style={{ overflow: 'visible', display: 'block', margin: '0 auto' }} />
          {tooltipEl}
        </div>
      </div>
    </div>
  );
}

export default function TestChordPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Chord Diagram Test (Mock Data)
        </h1>
        <TestChordDiagram />
      </div>
    </div>
  );
} 