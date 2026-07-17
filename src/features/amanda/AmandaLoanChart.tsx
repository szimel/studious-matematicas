import React, { useRef, useEffect, useCallback } from 'react';
import * as d3 from 'd3';
import { SchedulePoint } from '../../utils/amortization';

interface AmandaLoanChartProps {
  baselineSchedule: SchedulePoint[];
  acceleratedSchedule: SchedulePoint[];
  extraPerMonth: number;
}

const MOBILE_BREAKPOINT = 520;

const toShortDollars = (value: number | d3.NumberValue): string => {
  const n = typeof value === 'number' ? value : value.valueOf();
  if (n >= 1_000_000) { return '$' + (n / 1_000_000).toFixed(1) + 'M'; }
  if (n >= 1_000) { return '$' + (n / 1000).toFixed(0) + 'k'; }
  return '$' + n.toFixed(0);
};

export const AmandaLoanChart: React.FC<AmandaLoanChartProps> = ({
  baselineSchedule,
  acceleratedSchedule,
  extraPerMonth,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const draw = useCallback(() => {
    if (!containerRef.current || !svgRef.current) {
      return;
    }

    const containerWidth = containerRef.current.getBoundingClientRect().width;
    const isMobile = containerWidth < MOBILE_BREAKPOINT;

    const margin = isMobile
      ? { top: 44, right: 16, bottom: 52, left: 54 }
      : { top: 44, right: 28, bottom: 60, left: 72 };

    const totalWidth = Math.max(containerWidth, 260);
    const chartW = totalWidth - margin.left - margin.right;
    const chartH = Math.max(isMobile ? 200 : 260, totalWidth * 0.4) - margin.top - margin.bottom;
    const totalHeight = chartH + margin.top + margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', totalWidth).attr('height', totalHeight);

    // ── Gradient defs ─────────────────────────────────────────────────────────
    const defs = svg.append('defs');

    const makeGrad = (id: string, color: string) => {
      const g = defs.append('linearGradient')
        .attr('id', id).attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
      g.append('stop').attr('offset', '0%').attr('stop-color', color).attr('stop-opacity', 0.28);
      g.append('stop').attr('offset', '100%').attr('stop-color', color).attr('stop-opacity', 0.02);
    };
    makeGrad('amc-baseline-fill', '#ff8552');
    makeGrad('amc-accel-fill', '#87f6b4');

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // ── Scales ────────────────────────────────────────────────────────────────
    const maxMonths = Math.max(
      baselineSchedule[baselineSchedule.length - 1]?.month ?? 0,
      acceleratedSchedule[acceleratedSchedule.length - 1]?.month ?? 0,
      1,
    );
    const maxBalance = Math.max(
      baselineSchedule[0]?.balance ?? 0,
      acceleratedSchedule[0]?.balance ?? 0,
      1,
    );

    const xScale = d3.scaleLinear().domain([0, maxMonths]).range([0, chartW]);
    const yScale = d3.scaleLinear().domain([0, maxBalance]).range([chartH, 0]).nice();

    // ── Grid lines ────────────────────────────────────────────────────────────
    g.append('g')
      .call(
        d3.axisLeft(yScale)
          .ticks(5)
          .tickSize(-chartW)
          .tickFormat(() => ''),
      )
      .call(sg => sg.select('.domain').remove())
      .call(sg => sg.selectAll('.tick line')
        .attr('stroke', 'rgba(215, 239, 255, 0.1)')
        .attr('stroke-dasharray', '3,4'),
      );

    // ── Axes ──────────────────────────────────────────────────────────────────
    const xAxisTicks = isMobile ? 4 : 6;
    const xAxisEl = g.append('g')
      .attr('transform', `translate(0,${chartH})`)
      .call(d3.axisBottom(xScale).ticks(xAxisTicks).tickFormat(d => `${d}`));

    xAxisEl.select('.domain').attr('stroke', '#d7efff');
    xAxisEl.selectAll('.tick line').attr('stroke', '#d7efff');
    xAxisEl.selectAll('.tick text')
      .attr('fill', '#d7efff')
      .style('font-family', 'RobotoMono, monospace')
      .style('font-size', isMobile ? '10px' : '12px');

    const yAxisEl = g.append('g')
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(toShortDollars));

    yAxisEl.select('.domain').attr('stroke', '#d7efff');
    yAxisEl.selectAll('.tick line').attr('stroke', '#d7efff');
    yAxisEl.selectAll('.tick text')
      .attr('fill', '#d7efff')
      .style('font-family', 'RobotoMono, monospace')
      .style('font-size', isMobile ? '10px' : '12px');

    // ── Axis labels ───────────────────────────────────────────────────────────
    g.append('text')
      .attr('x', chartW / 2)
      .attr('y', chartH + (isMobile ? 40 : 50))
      .attr('text-anchor', 'middle')
      .attr('fill', '#f8f1d4')
      .style('font-family', 'RobotoMono, monospace')
      .style('font-size', isMobile ? '11px' : '12px')
      .text('Months since first payment');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -(margin.left - 14))
      .attr('x', -(chartH / 2))
      .attr('text-anchor', 'middle')
      .attr('fill', '#f8f1d4')
      .style('font-family', 'RobotoMono, monospace')
      .style('font-size', isMobile ? '11px' : '12px')
      .text('Remaining debt ($)');

    // ── Path generators ───────────────────────────────────────────────────────
    const lineGen = d3.line<SchedulePoint>()
      .x(d => xScale(d.month))
      .y(d => yScale(d.balance))
      .curve(d3.curveCatmullRom.alpha(0.5));

    const areaGen = d3.area<SchedulePoint>()
      .x(d => xScale(d.month))
      .y0(chartH)
      .y1(d => yScale(d.balance))
      .curve(d3.curveCatmullRom.alpha(0.5));

    // ── Filled areas ──────────────────────────────────────────────────────────
    g.append('path')
      .datum(baselineSchedule)
      .attr('fill', 'url(#amc-baseline-fill)')
      .attr('d', areaGen);

    g.append('path')
      .datum(acceleratedSchedule)
      .attr('fill', 'url(#amc-accel-fill)')
      .attr('d', areaGen);

    // ── Lines ─────────────────────────────────────────────────────────────────
    g.append('path')
      .datum(baselineSchedule)
      .attr('fill', 'none')
      .attr('stroke', '#ff8552')
      .attr('stroke-width', isMobile ? 2 : 2.8)
      .attr('d', lineGen);

    g.append('path')
      .datum(acceleratedSchedule)
      .attr('fill', 'none')
      .attr('stroke', '#87f6b4')
      .attr('stroke-width', isMobile ? 2 : 2.8)
      .attr('d', lineGen);

    // ── Endpoint dots ─────────────────────────────────────────────────────────
    const baselineEnd = baselineSchedule[baselineSchedule.length - 1];
    const accelEnd = acceleratedSchedule[acceleratedSchedule.length - 1];

    g.append('circle')
      .attr('cx', xScale(baselineEnd.month))
      .attr('cy', yScale(baselineEnd.balance))
      .attr('r', 4)
      .attr('fill', '#ff8552');

    g.append('circle')
      .attr('cx', xScale(accelEnd.month))
      .attr('cy', yScale(accelEnd.balance))
      .attr('r', 4)
      .attr('fill', '#87f6b4');

    // ── Legend ────────────────────────────────────────────────────────────────
    const legendY = -30;
    const legendFontSize = isMobile ? '10px' : '12px';

    const legendItems = [
      {
        color: '#ff8552',
        label: 'Original loan (no extra payment)',
      },
      {
        color: '#87f6b4',
        label: extraPerMonth > 0
          ? 'Paying $' + extraPerMonth.toLocaleString() + '/mo extra \u2192 pays off sooner'
          : 'With extra payment',
      },
    ];

    legendItems.forEach((item, idx) => {
      const xOff = idx === 0 ? 0 : (isMobile ? chartW / 2 : chartW / 2 + 10);
      const row = g.append('g').attr('transform', 'translate(' + xOff + ', ' + legendY + ')');

      row.append('rect')
        .attr('x', 0).attr('y', -5).attr('width', 20).attr('height', 4).attr('rx', 2)
        .attr('fill', item.color);

      row.append('text')
        .attr('x', 26).attr('y', 0)
        .attr('fill', '#f8f1d4')
        .style('font-family', 'RobotoMono, monospace')
        .style('font-size', legendFontSize)
        .text(item.label);
    });

  }, [baselineSchedule, acceleratedSchedule, extraPerMonth]);

  useEffect(() => {
    draw();

    const onResize = () => draw();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [draw]);

  return (
    <div ref={containerRef} className='amanda-chart-d3-wrap'>
      <svg ref={svgRef} style={{ display: 'block', width: '100%' }} />
    </div>
  );
};
