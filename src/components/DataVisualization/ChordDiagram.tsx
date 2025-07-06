'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { arc } from 'd3-shape';
import { useVisualizationData } from './shared/useVisualizationData';
import { VisualizationContainer } from './shared/VisualizationContainer';
import { DataInsightPanel } from './shared/DataInsightPanel';
import { QuestionSelector } from './shared/QuestionSelector';
import { 
  processChordData, 
  chordConfig, 
  cyclingModes, 
  getChordColor,
  chordAnimations,
  filterConnectedCategories,
  type ChordMatrix,
  type ChordGroup,
  type ChordLink
} from './shared/chordUtils';
import { useAppContext } from '@/lib/context/AppContext';
import GlobalControlsNav from '@/components/shared/GlobalControlsNav';
import { getYearsCategory } from './shared/colorUtils';

interface ChordDiagramProps {
  width?: number;
  height?: number;
  autoPlay?: boolean;
  onRelationshipChange?: (source: string, target: string) => void;
  enableRotation?: boolean;
  showAllConnections?: boolean;
}

// Helper to get color for a node using global context (theme-aware)
function getNodeColor(nodeName: string, category: string, globalColors: any, isDarkMode: boolean = false): string {
  const themeColors = isDarkMode ? globalColors.dark : globalColors.light;
  
  if (category === 'years_at_medtronic') {
    return themeColors.years_at_medtronic?.[nodeName] || '#FF6B6B';
  }
  
  // Use global colors if available, otherwise fallback to defaults
  if (category === 'learning_style') {
    return themeColors.learning_style?.[nodeName] || '#60a5fa';
  }
  if (category === 'peak_performance') {
    return themeColors.peak_performance?.[nodeName] || '#4F8EF7';
  }
  if (category === 'motivation') {
    return themeColors.motivation?.[nodeName] || '#9467bd';
  }
  if (category === 'shaped_by') {
    return themeColors.shaped_by?.[nodeName] || '#1f77b4';
  }
  return '#8884d8';
}

export default function ChordDiagram({
  width = 1400,
  height = 1000,
  autoPlay = true,
  onRelationshipChange,
  enableRotation = true,
  showAllConnections = false,
}: ChordDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const secondarySvgRef = useRef<SVGSVGElement>(null);
  const { data, isLoading, error } = useVisualizationData();
  const [currentSource, setCurrentSource] = useState('years_at_medtronic');
  const [currentTarget, setCurrentTarget] = useState('learning_style');
  const [insights, setInsights] = useState<Array<{ title: string; value: string; description?: string }>>([]);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: React.ReactNode } | null>(null);
  const { settings } = useAppContext();
  const [lastCategoryChange, setLastCategoryChange] = useState<{ source: string; target: string }>({ source: currentSource, target: currentTarget });
  const [showSecondaryChord, setShowSecondaryChord] = useState(false);

  // Define available fields for the selector
  const availableFields = [
    { value: 'years_at_medtronic', label: 'Years at Medtronic' },
    { value: 'peak_performance', label: 'Peak Performance' },
    { value: 'learning_style', label: 'Learning Style' },
    { value: 'motivation', label: 'Motivation' },
    { value: 'shaped_by', label: 'Shaped By' }
  ];

  // Typography constants (theme-aware)
  const labelFontSize = 20;
  const labelFontWeight = 700;
  const labelColor = settings.isDarkMode ? '#ffffff' : '#170F5F';
  const labelFontFamily = 'Avenir Next World, -apple-system, BlinkMacSystemFont, "SF Pro", "Roboto", sans-serif';

  // Check if peak performance is involved and show secondary chord
  useEffect(() => {
    const isPeakPerformanceInvolved = currentSource === 'peak_performance' || currentTarget === 'peak_performance';
    setShowSecondaryChord(isPeakPerformanceInvolved);
  }, [currentSource, currentTarget]);

  // Secondary chord diagram for peak performance breakdown
  const renderSecondaryChord = () => {
    if (!secondarySvgRef.current || !data.length || isLoading) return;

    const svg = d3.select(secondarySvgRef.current);
    svg.selectAll('*').remove();

    const filteredData = settings.useTestData 
      ? data 
      : data.filter(item => !(item as any).test_data);

    // Get all data for secondary chord (Years at Medtronic vs Peak Performance categories)
    const secondaryData = filteredData.filter(d => (d as any).peak_performance);
    
    if (secondaryData.length < 5) return;

    // Use same dimensions as main chord for consistency
    const secondaryWidth = showSecondaryChord ? width * 0.45 : width;
    const secondaryHeight = showSecondaryChord ? height * 0.8 : height * 0.85;
    const secondaryMargin = { top: 80, right: 80, bottom: 100, left: 80 };
    const secondaryChartWidth = secondaryWidth - secondaryMargin.left - secondaryMargin.right;
    const secondaryChartHeight = secondaryHeight - secondaryMargin.top - secondaryMargin.bottom;
    const secondaryRadius = Math.max(120, Math.min(secondaryChartWidth, secondaryChartHeight) / 2 - 60);

    // Years categories and Peak Performance categories
    const yearsCategories = ['0-5', '6-10', '11-15', '16-20', '20+'];
    const peakPerfCategories = Array.from(new Set(secondaryData.map(d => (d as any).peak_performance))).filter(Boolean).sort();
    
    // Create bipartite matrix: Years vs Peak Performance
    const allCategories = [...yearsCategories, ...peakPerfCategories];
    const matrix = allCategories.map((sourceCategory, sourceIndex) => 
      allCategories.map((targetCategory, targetIndex) => {
        // Only create connections between years and peak performance (not within same type)
        const sourceIsYears = sourceIndex < yearsCategories.length;
        const targetIsYears = targetIndex < yearsCategories.length;
        
        // Only connect years to peak performance
        if (sourceIsYears === targetIsYears) return 0;
        
        // Count people who match this year + performance combination
        const yearsCat = sourceIsYears ? sourceCategory : targetCategory;
        const perfCat = sourceIsYears ? targetCategory : sourceCategory;
        
        return secondaryData.filter(d => {
          const years = getYearsCategory(d.years_at_medtronic || 0);
          const perf = (d as any).peak_performance;
          return years === yearsCat && perf === perfCat;
        }).length;
      })
    );

    // Create chord layout
    const chordLayout = d3.chord().padAngle(0.05);
    const chordData = chordLayout(matrix);

    const g = svg.append('g').attr('transform', `translate(${secondaryMargin.left + secondaryChartWidth / 2}, ${secondaryMargin.top + secondaryChartHeight / 2})`);

    // Draw arcs
    const arc = d3.arc()
      .innerRadius(secondaryRadius * 0.75)
      .outerRadius(secondaryRadius * 0.95);

    const ribbon = d3.ribbon().radius(secondaryRadius * 0.75);

    // Colors: different hues for years vs peak performance types
    const yearsColors = ['#0077CC', '#00A3E0', '#4FC3F7', '#81C784', '#AED581']; // Blues/Greens for years
    const perfColors = ['#FF6B6B', '#FFD166', '#06D6A0', '#118AB2', '#FF9F1C', '#4ECDC4']; // Various colors for performance types
    const colors = [...yearsColors, ...perfColors.slice(0, peakPerfCategories.length)];

    // Draw groups
    g.selectAll('.chord-group')
      .data(chordData.groups)
      .enter()
      .append('path')
      .attr('class', 'chord-group')
      .attr('d', arc as any)
      .style('fill', (d, i) => colors[i % colors.length])
      .style('opacity', 0.8);

    // Draw chords
    g.selectAll('.chord')
      .data(chordData)
      .enter()
      .append('path')
      .attr('class', 'chord')
      .attr('d', ribbon as any)
      .style('fill', d => colors[d.source.index % colors.length])
      .style('opacity', 0.6);

    // Add labels with proper spacing and rotation
    const secondaryLabelRadius = Math.max(120, secondaryRadius * 1.45);
    g.selectAll('.chord-label')
      .data(chordData.groups)
      .enter()
      .append('text')
      .attr('class', 'chord-label')
      .attr('transform', d => {
        const angle = (d.startAngle + d.endAngle) / 2 - Math.PI / 2;
        const x = secondaryLabelRadius * Math.cos(angle);
        const y = secondaryLabelRadius * Math.sin(angle);
        const rotation = angle * 180 / Math.PI;
        
        // Rotate text for better readability
        if (angle > Math.PI / 2 || angle < -Math.PI / 2) {
          return `translate(${x}, ${y}) rotate(${rotation + 180})`;
        } else {
          return `translate(${x}, ${y}) rotate(${rotation})`;
        }
      })
      .attr('text-anchor', d => {
        const angle = (d.startAngle + d.endAngle) / 2 - Math.PI / 2;
        if (angle > Math.PI / 2 || angle < -Math.PI / 2) {
          return 'end';
        } else {
          return 'start';
        }
      })
      .attr('alignment-baseline', 'middle')
      .style('font-family', labelFontFamily)
      .style('font-weight', labelFontWeight)
      .style('font-size', d => {
        // Dynamic font size based on number of labels
        const totalLabels = allCategories.length;
        if (totalLabels > 12) return '13px';
        if (totalLabels > 10) return '14px';
        if (totalLabels > 8) return '15px';
        return '16px';
      })
      .style('fill', labelColor)
      .style('text-transform', 'uppercase')
      .text((d, i) => {
        const text = allCategories[i]?.toString().replace(/_/g, ' ') || '';
        // Show full text for secondary chord labels
        return text;
      })
      .on('mouseenter', function(event, d) {
        const fullText = allCategories[d.index]?.toString().replace(/_/g, ' ') || '';
        setTooltip({
          x: event.pageX,
          y: event.pageY,
          content: (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{fullText}</div>
              <div>{d.index < yearsCategories.length ? 'Years at Medtronic' : 'Peak Performance Type'}</div>
            </div>
          )
        });
      })
      .on('mouseleave', () => setTooltip(null));


  };

  // Helper function to ensure source and target are different
  const ensureDifferentCategories = (source: string, target: string): { source: string; target: string } => {
    if (source === target) {
      // Find a different target
      const differentOption = availableFields.find(field => field.value !== source);
      return { source, target: differentOption ? differentOption.value : 'learning_style' };
    }
    return { source, target };
  };

  // Ensure initial state doesn't have same categories
  useEffect(() => {
    const corrected = ensureDifferentCategories(currentSource, currentTarget);
    if (corrected.source !== currentSource || corrected.target !== currentTarget) {
      setCurrentSource(corrected.source);
      setCurrentTarget(corrected.target);
    }
  }, []);

  // Auto-cycling logic
  useEffect(() => {
    console.log('🎵 ChordDiagram animation useEffect:', {
      autoPlay,
      isAutoPlayEnabled: settings.isAutoPlayEnabled,
      currentSource,
      currentTarget,
      autoPlaySpeed: settings.autoPlaySpeed
    });

    if (!autoPlay || !settings.isAutoPlayEnabled) {
      console.log('❌ ChordDiagram animation disabled:', { autoPlay, isAutoPlayEnabled: settings.isAutoPlayEnabled });
      return;
    }

    console.log('✅ ChordDiagram starting animation cycle');

    const interval = setInterval(() => {
      const currentModeIndex = cyclingModes.findIndex(
        mode => mode.source === currentSource && mode.target === currentTarget
      );
      const nextModeIndex = (currentModeIndex + 1) % cyclingModes.length;
      const nextMode = cyclingModes[nextModeIndex];
      
      // Safety check: ensure source and target are different
      if (nextMode.source === nextMode.target) {
        console.warn('Skipping invalid cycling mode with same source and target:', nextMode);
        return;
      }
      
      console.log('🔄 ChordDiagram cycling to:', {
        from: `${currentSource} → ${currentTarget}`,
        to: `${nextMode.source} → ${nextMode.target}`,
        modeIndex: nextModeIndex
      });
      
      setCurrentSource(nextMode.source);
      setCurrentTarget(nextMode.target);
      setLastCategoryChange({ source: nextMode.source, target: nextMode.target });
      onRelationshipChange?.(nextMode.source, nextMode.target);
    }, settings.autoPlaySpeed || 6000); // Use global setting

    return () => {
      console.log('🧹 ChordDiagram cleaning up animation interval');
      clearInterval(interval);
    };
  }, [autoPlay, onRelationshipChange, currentSource, currentTarget, settings.isAutoPlayEnabled, settings.autoPlaySpeed]);

  // Gentle rotation during auto-play
  useEffect(() => {
    if (!autoPlay || !enableRotation || !settings.isAutoPlayEnabled) return;

    const interval = setInterval(() => {
      setRotationAngle(prev => (prev + 0.5) % 360);
    }, 100);

    return () => clearInterval(interval);
  }, [autoPlay, enableRotation, settings.isAutoPlayEnabled]);

  // Check if container is too small
  const margin = { top: 80, right: 80, bottom: 100, left: 80 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const isContainerTooSmall = chartWidth < 200 || chartHeight < 200;

  // Render circular chord diagram
  useEffect(() => {
    if (!svgRef.current || !data.length || isLoading || isContainerTooSmall) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Filter data based on global settings
    const filteredData = settings.useTestData 
      ? data 
      : data.filter(item => !(item as any).test_data);

    const svg = d3.select(svgRef.current);
    
    // Adjust size based on whether we're showing two chords
    const effectiveWidth = showSecondaryChord ? width * 0.45 : width;
    const effectiveHeight = showSecondaryChord ? height * 0.8 : height * 0.85;
    const effectiveChartWidth = effectiveWidth - margin.left - margin.right;
    const effectiveChartHeight = effectiveHeight - margin.top - margin.bottom;
    
    const radius = Math.max(120, Math.min(effectiveChartWidth, effectiveChartHeight) / 2 - 60);

    // Create definitions for gradients
    const defs = svg.append('defs');

    // Define fixed order for years at Medtronic
    const YEARS_GROUPS = ['0-5', '6-10', '11-15', '16-20', '20+'];

    // Get unique values for left and right sides, using fixed order for years
    const leftValues = currentSource === 'years_at_medtronic'
      ? YEARS_GROUPS
      : Array.from(new Set(filteredData.map(d => (d as any)[currentSource]))).filter(Boolean);
    const rightValues = currentTarget === 'years_at_medtronic'
      ? YEARS_GROUPS
      : Array.from(new Set(filteredData.map(d => (d as any)[currentTarget]))).filter(Boolean);

    // Process data for chord layout
    const chordData = processChordData(filteredData, currentSource, currentTarget);
    
    // Separate source and target categories
    const sourceCategories = new Set<string>();
    const targetCategories = new Set<string>();
    
    filteredData.forEach((d: any) => {
      if (currentSource === 'years_at_medtronic') {
        sourceCategories.add(getYearsCategory(d.years_at_medtronic || 0));
      } else {
        sourceCategories.add(d[currentSource] || 'Unknown');
      }
      
      if (currentTarget === 'years_at_medtronic') {
        targetCategories.add(getYearsCategory(d.years_at_medtronic || 0));
      } else {
        targetCategories.add(d[currentTarget] || 'Unknown');
      }
    });

    // Convert to arrays and sort
    const sourceArray = Array.from(sourceCategories).sort() as string[];
    const targetArray = Array.from(targetCategories).sort() as string[];

    // Calculate totals for each category
    const leftTotals = sourceArray.map(cat => 
      filteredData.filter((d: any) => {
        const value = currentSource === 'years_at_medtronic' 
          ? getYearsCategory(d.years_at_medtronic || 0) 
          : d[currentSource];
        return value === cat;
      }).length
    );
    
    const rightTotals = targetArray.map(cat => 
      filteredData.filter((d: any) => {
        const value = currentTarget === 'years_at_medtronic' 
          ? getYearsCategory(d.years_at_medtronic || 0) 
          : d[currentTarget];
        return value === cat;
      }).length
    );

    const leftTotalSum = leftTotals.reduce((sum, val) => sum + val, 0);
    const rightTotalSum = rightTotals.reduce((sum, val) => sum + val, 0);

    // Create connection matrix
    const connectionMatrix = sourceArray.map(sourceCat => 
      targetArray.map(targetCat => {
        return filteredData.filter((d: any) => {
          const source = currentSource === 'years_at_medtronic' 
            ? getYearsCategory(d.years_at_medtronic || 0) 
            : d[currentSource];
          const target = currentTarget === 'years_at_medtronic' 
            ? getYearsCategory(d.years_at_medtronic || 0) 
            : d[currentTarget];
          return source === sourceCat && target === targetCat;
        }).length;
      })
    );

    // Check if this is a category change that should trigger animation
    const isCategoryChange = lastCategoryChange.source !== currentSource || lastCategoryChange.target !== currentTarget;

    // --- True left/right bipartite layout with better spacing ---
    // Left arcs: 180°+gap to 360°-gap (Math.PI+gap to 2*Math.PI-gap)
    // Right arcs: 0+gap to 180°-gap (0+gap to Math.PI-gap)
    const arcGap = Math.PI * 0.12; // Larger gap for better label spacing
    const leftStart = Math.PI + arcGap;      // 180° + gap
    const leftEnd = 2 * Math.PI - arcGap;    // 360° - gap
    const rightStart = 0 + arcGap;           // 0° + gap
    const rightEnd = Math.PI - arcGap;       // 180° - gap
    const leftArcSpan = leftEnd - leftStart;     // 180° - 2*gap
    const rightArcSpan = rightEnd - rightStart;  // 180° - 2*gap

    // Add minimum spacing between arcs to prevent label overlap
    const minArcSpacing = Math.PI * 0.02; // Minimum 2° between arcs

    // Assign arc angles for left arcs with proper spacing
    let leftAngle = leftStart;
    const leftArcs = leftValues.map((value, i) => {
      const count = filteredData.filter(d =>
        currentSource === 'years_at_medtronic'
          ? getYearsCategory(d.years_at_medtronic || 0) === value
          : (d as any)[currentSource] === value
      ).length;
      
      // Calculate arc span with spacing consideration
      const availableSpan = leftArcSpan - (minArcSpacing * (leftValues.length - 1));
      const arcSpan = currentSource === 'years_at_medtronic'
        ? availableSpan / leftValues.length
        : Math.max(minArcSpacing, availableSpan * (count / (leftTotalSum || 1)));
      
      const startAngle = leftAngle;
      const endAngle = leftAngle + arcSpan;
      leftAngle = endAngle + minArcSpacing; // Add spacing between arcs
      
      const color = getNodeColor(value, currentSource, settings.categoryColors, settings.isDarkMode);
      const opacity = count === 0 ? 0.15 : 0.8;
      return { name: value, value: count, startAngle, endAngle, color, opacity };
    });

    // Assign arc angles for right arcs with proper spacing
    let rightAngle = rightStart;
    const rightArcs = rightValues.map((value, i) => {
      const count = filteredData.filter(d =>
        currentTarget === 'years_at_medtronic'
          ? getYearsCategory(d.years_at_medtronic || 0) === value
          : (d as any)[currentTarget] === value
      ).length;
      
      // Calculate arc span with spacing consideration
      const availableSpan = rightArcSpan - (minArcSpacing * (rightValues.length - 1));
      const arcSpan = currentTarget === 'years_at_medtronic'
        ? availableSpan / rightValues.length
        : Math.max(minArcSpacing, availableSpan * (count / (rightTotalSum || 1)));
      
      const startAngle = rightAngle;
      const endAngle = rightAngle + arcSpan;
      rightAngle = endAngle + minArcSpacing; // Add spacing between arcs
      
      const color = getNodeColor(value, currentTarget, settings.categoryColors, settings.isDarkMode);
      const opacity = count === 0 ? 0.15 : 0.8;
      return { name: value, value: count, startAngle, endAngle, color, opacity };
    });

    // Draw arcs (use per-arc opacity)
    const innerRadius = Math.max(60, radius * 0.75);
    const outerRadius = Math.max(80, radius * 0.95);
    const arcGen = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .cornerRadius((d: any) => {
        // Only round the outer corners (outerRadius), not the inner
        // D3 v7+ supports cornerRadius as a function
        // We'll return 0 for inner, 8 for outer
        // But d3.arc() only supports one value, so we need to use custom path if we want true squared inner corners
        // As a workaround, set cornerRadius to 0 if the arc is small, else 8
        return 0;
      });
    
    // Position the chart group with margins to prevent cropping
    const g = svg.append('g').attr('transform', `translate(${margin.left + effectiveChartWidth / 2}, ${margin.top + effectiveChartHeight / 2})`);

    // Add gradients for arcs
    leftArcs.forEach((arc, i) => {
      const baseColor = arc.color;
      const lighterColor = d3.color(baseColor)?.brighter(0.3).toString() || baseColor;
      defs.append('linearGradient')
        .attr('id', `left-arc-gradient-${i}`)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', 1)
        .selectAll('stop')
        .data([
          { offset: '0%', color: baseColor },
          { offset: '100%', color: lighterColor }
        ])
        .enter()
        .append('stop')
        .attr('offset', d => d.offset)
        .attr('stop-color', d => d.color);
    });
    rightArcs.forEach((arc, i) => {
      const baseColor = arc.color;
      const lighterColor = d3.color(baseColor)?.brighter(0.3).toString() || baseColor;
      defs.append('linearGradient')
        .attr('id', `right-arc-gradient-${i}`)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', 1)
        .selectAll('stop')
        .data([
          { offset: '0%', color: baseColor },
          { offset: '100%', color: lighterColor }
        ])
        .enter()
        .append('stop')
        .attr('offset', d => d.offset)
        .attr('stop-color', d => d.color);
    });
    g.selectAll('path.left-arc')
      .data(leftArcs)
      .enter()
      .append('path')
      .attr('class', 'left-arc')
      .attr('d', d => arcGen({ startAngle: d.startAngle, endAngle: d.endAngle } as any))
      .attr('fill', (d, i) => `url(#left-arc-gradient-${i})`)
      .attr('opacity', d => d.opacity)
      .on('mouseenter', function(event, d) {
        if (d.value === 0) return;
        setTooltip({
          x: event.pageX,
          y: event.pageY,
          content: (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{(d.name || 'Unknown').toString().replace(/_/g, ' ')}</div>
              <div>Count: {d.value}</div>
            </div>
          )
        });
      })
      .on('mouseleave', () => setTooltip(null));
    g.selectAll('path.right-arc')
      .data(rightArcs)
      .enter()
      .append('path')
      .attr('class', 'right-arc')
      .attr('d', d => arcGen({ startAngle: d.startAngle, endAngle: d.endAngle } as any))
      .attr('fill', (d, i) => `url(#right-arc-gradient-${i})`)
      .attr('opacity', d => d.opacity)
      .on('mouseenter', function(event, d) {
        if (d.value === 0) return;
        setTooltip({
          x: event.pageX,
          y: event.pageY,
          content: (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{(d.name || 'Unknown').toString().replace(/_/g, ' ')}</div>
              <div>Count: {d.value}</div>
            </div>
          )
        });
      })
      .on('mouseleave', () => setTooltip(null));

    // Draw ribbons for connections (distributed along arc, proportional thickness)
    // Use d3.ribbon() for each connection, but set the width by using the full segment for each connection
    const ribbonRadius = Math.max(60, radius * 0.75); // Ensure minimum radius for ribbons
    const ribbonGen = d3.ribbon().radius(ribbonRadius);
    const connections = [];
    for (let i = 0; i < sourceArray.length; i++) {
      for (let j = 0; j < targetArray.length; j++) {
        const value = connectionMatrix[i][j];
        if (value > 0) {
          // Find the segment for this connection on both arcs
          const leftSeg = leftArcs[i];
          const rightSeg = rightArcs[j];
          // Compute arc midpoints for gradient direction
          const leftMidAngle = (leftSeg.startAngle + leftSeg.endAngle) / 2 - Math.PI / 2;
          const rightMidAngle = (rightSeg.startAngle + rightSeg.endAngle) / 2 - Math.PI / 2;
          const leftX = Math.cos(leftMidAngle) * ribbonRadius;
          const leftY = Math.sin(leftMidAngle) * ribbonRadius;
          const rightX = Math.cos(rightMidAngle) * ribbonRadius;
          const rightY = Math.sin(rightMidAngle) * ribbonRadius;
          // Add gradient for this ribbon
          const leftColor = leftArcs[i].color || d3.schemeCategory10[i % 10];
          const rightColor = rightArcs[j].color || d3.schemeCategory10[(j + 5) % 10];
          defs.append('linearGradient')
            .attr('id', `ribbon-gradient-${i}-${j}`)
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('x1', leftX)
            .attr('y1', leftY)
            .attr('x2', rightX)
            .attr('y2', rightY)
            .selectAll('stop')
            .data([
              { offset: '0%', color: leftColor },
              { offset: '100%', color: rightColor }
            ])
            .enter()
            .append('stop')
            .attr('offset', d => d.offset)
            .attr('stop-color', d => d.color);
          connections.push({
            source: {
              startAngle: leftSeg.startAngle,
              endAngle: leftSeg.endAngle,
              index: i
            },
            target: {
              startAngle: rightSeg.startAngle,
              endAngle: rightSeg.endAngle,
              index: j
            },
            value,
            left: leftArcs[i],
            right: rightArcs[j],
            gradientId: `ribbon-gradient-${i}-${j}`
          });
        }
      }
    }
    g.selectAll('path.ribbon')
      .data(connections)
      .enter()
      .append('path')
      .attr('class', 'ribbon')
      .attr('d', function(d) { const path = ribbonGen({ source: d.source, target: d.target } as any); return typeof path === 'string' ? path : ''; })
      .attr('fill', d => `url(#${d.gradientId})`)
      .attr('opacity', 0.6)
      .on('mouseenter', function(event, d) {
        setTooltip({
          x: event.pageX,
          y: event.pageY,
          content: (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                {(d.left.name || 'Unknown').toString().replace(/_/g, ' ')} ↔ {(d.right.name || 'Unknown').toString().replace(/_/g, ' ')}
              </div>
              <div>Connections: {d.value}</div>
            </div>
          )
        });
      })
      .on('mouseleave', () => setTooltip(null));

    // --- Label placement: properly spaced around circle ---
    const labelRadius = Math.max(120, radius * 1.45); // Even more space for full text labels
    const labelGroup = svg.append('g').attr('transform', `translate(${margin.left + effectiveChartWidth / 2}, ${margin.top + effectiveChartHeight / 2})`);
    
    // Combine all arcs for unified label placement
    const allArcs = [...leftArcs.map(arc => ({...arc, side: 'left'})), ...rightArcs.map(arc => ({...arc, side: 'right'}))];
    
    // Add labels with smart positioning to avoid overlap
    labelGroup.selectAll('text.arc-label')
      .data(allArcs)
      .enter()
      .append('text')
      .attr('class', 'arc-label')
      .attr('transform', d => {
        const angle = (d.startAngle + d.endAngle) / 2 - Math.PI / 2;
        const x = labelRadius * Math.cos(angle);
        const y = labelRadius * Math.sin(angle);
        const rotation = angle * 180 / Math.PI;
        
        // Rotate text for better readability
        if (angle > Math.PI / 2 || angle < -Math.PI / 2) {
          return `translate(${x}, ${y}) rotate(${rotation + 180})`;
        } else {
          return `translate(${x}, ${y}) rotate(${rotation})`;
        }
      })
      .attr('text-anchor', d => {
        const angle = (d.startAngle + d.endAngle) / 2 - Math.PI / 2;
        if (angle > Math.PI / 2 || angle < -Math.PI / 2) {
          return 'end';
        } else {
          return 'start';
        }
      })
      .attr('alignment-baseline', 'middle')
      .style('font-family', labelFontFamily)
      .style('font-weight', labelFontWeight)
             .style('font-size', d => {
         // Dynamic font size based on number of labels - larger since we're showing full text
         const totalLabels = allArcs.length;
         if (totalLabels > 12) return '13px';
         if (totalLabels > 10) return '14px';
         if (totalLabels > 8) return '15px';
         return `${Math.max(16, labelFontSize)}px`;
       })
       .style('fill', labelColor)
       .style('text-transform', 'uppercase')
       .text(d => {
         const text = (d.name || 'Unknown').toString().replace(/_/g, ' ');
         // Show full text - no truncation
         return text;
       })
       .on('mouseenter', function(event, d) {
         const fullText = (d.name || 'Unknown').toString().replace(/_/g, ' ');
         setTooltip({
           x: event.pageX,
           y: event.pageY,
           content: (
             <div>
               <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{fullText}</div>
               <div>Count: {d.value}</div>
               <div>Side: {d.side}</div>
             </div>
           )
         });
       })
       .on('mouseleave', () => setTooltip(null));

    // Update insights
    const totalConnections = connections.reduce((sum, d) => sum + d.value, 0);
    const strongestConnection = connections.length > 0 
      ? connections.reduce((max, d) => d.value > max.value ? d : max, connections[0])
      : null;
    setInsights([
      { title: 'Total Responses', value: filteredData.length.toString() },
      { title: 'Current View', value: `${currentSource} ↔ ${currentTarget}` },
      strongestConnection
        ? { 
            title: 'Strongest Connection', 
            value: `${strongestConnection.left.name || 'Unknown'} ↔ ${strongestConnection.right.name || 'Unknown'}`, 
            description: `${strongestConnection.value} connections` 
          }
        : { title: 'Strongest Connection', value: 'No connections found', description: '' },
      { title: 'Total Connections', value: totalConnections.toString() },
    ]);

  }, [data, currentSource, currentTarget, rotationAngle, settings.useTestData, settings.categoryColors, isLoading, lastCategoryChange, isContainerTooSmall, chartWidth, chartHeight, showSecondaryChord]);

  // Render secondary chord when peak performance is involved
  useEffect(() => {
    if (showSecondaryChord) {
      renderSecondaryChord();
    }
  }, [showSecondaryChord, data, settings.useTestData, settings.isDarkMode, labelColor]);

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

  // Apply theme based on global settings
  const themeClass = settings.isDarkMode ? 'dark' : '';
  const backgroundColor = settings.isDarkMode ? '#1a1a1a' : '#ffffff';
  const textColor = settings.isDarkMode ? '#ffffff' : '#0A0A0F';

  // Handle case where container is too small
  if (isContainerTooSmall) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${themeClass}`} style={{ backgroundColor }}>
        <div className="text-center" style={{ color: textColor }}>
          <p className="text-lg mb-2">Container too small</p>
          <p className="text-sm opacity-70">Minimum size: 200x200px</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center ${themeClass}`} style={{ backgroundColor }}>
      <GlobalControlsNav />
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="w-full flex flex-col items-center justify-center mb-4">
          <QuestionSelector
            availableFields={availableFields}
            currentSource={currentSource}
            currentTarget={currentTarget}
            onChange={(source, target) => {
              const corrected = ensureDifferentCategories(source, target);
              setCurrentSource(corrected.source);
              setCurrentTarget(corrected.target);
              setLastCategoryChange(corrected);
            }}
          />
        </div>
        <div 
          className="w-full flex justify-center items-center relative"
          style={{ height: height * 0.85 }} // Use 85% of available height for the chart to account for labels
        >
          {showSecondaryChord ? (
            // Two-chord layout when peak performance is involved
            <div className="w-full flex justify-center items-center gap-16">
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-bold mb-4" style={{ color: textColor }}>
                  Main Relationships
                </h3>
                <svg
                  ref={svgRef}
                  width={width * 0.45}
                  height={height * 0.8}
                  style={{ display: 'block', background: 'transparent', color: textColor }}
                />
              </div>
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-bold mb-4" style={{ color: textColor }}>
                  Years × Performance Types
                </h3>
                <svg
                  ref={secondarySvgRef}
                  width={width * 0.45}
                  height={height * 0.8}
                  style={{ display: 'block', background: 'transparent', color: textColor }}
                />
              </div>
            </div>
          ) : (
            // Single chord layout when peak performance is not involved
            <svg
              ref={svgRef}
              width={width}
              height={height * 0.85}
              style={{ display: 'block', margin: '0 auto', background: 'transparent', color: textColor }}
            />
          )}
          {tooltipEl}
        </div>
      </div>
    </div>
  );
} 