const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';

fetch(url)
  .then(res => res.json())
  .then(data => {
    const baseTemp = data.baseTemperature;
    const monthlyData = data.monthlyVariance;

    const margin = { top: 60, right: 20, bottom: 100, left: 100 };
    const width = 1200 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select('#heatmap')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const chart = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const years = monthlyData.map(d => d.year);
    const months = Array.from({ length: 12 }, (_, i) => i);
    const parseYear = d3.extent(years);

    // Fix: Use linear scale for x-axis (numeric years)
    const xScale = d3.scaleLinear()
      .domain(parseYear)
      .range([0, width]);

    const yScale = d3.scaleBand()
      .domain(months)
      .range([0, height]);

    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.format('d'))
      .tickValues(d3.range(parseYear[0], parseYear[1] + 1, 10));

    const yAxis = d3.axisLeft(yScale)
      .tickFormat(m => d3.timeFormat('%B')(new Date(0, m)));

    chart.append('g')
      .attr('id', 'x-axis')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis);

    chart.append('g')
      .attr('id', 'y-axis')
      .call(yAxis);

    const temps = monthlyData.map(d => baseTemp + d.variance);

    const colorScale = d3.scaleQuantile()
      .domain(temps)
      .range(['#313695', '#4575b4', '#74add1', '#abd9e9', '#fee090', '#fdae61', '#f46d43', '#d73027']);

    // Tooltip
    const tooltip = d3.select('#tooltip');

    chart.selectAll('.cell')
      .data(monthlyData)
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('data-month', d => d.month - 1)
      .attr('data-year', d => d.year)
      .attr('data-temp', d => baseTemp + d.variance)
      .attr('x', d => xScale(d.year))
      .attr('y', d => yScale(d.month - 1))
      .attr('width', width / (parseYear[1] - parseYear[0]))
      .attr('height', yScale.bandwidth())
      .attr('fill', d => colorScale(baseTemp + d.variance))
      .on('mouseover', (event, d) => {
        tooltip.transition().style('opacity', 0.9);
        tooltip
          .html(`${d.year} - ${d3.timeFormat('%B')(new Date(0, d.month - 1))}<br/>
                 Temp: ${(baseTemp + d.variance).toFixed(2)}℃<br/>
                 Variance: ${d.variance.toFixed(2)}℃`)
          .attr('data-year', d.year)
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 28 + 'px');
      })
      .on('mouseout', () => tooltip.transition().style('opacity', 0));

    // Legend SVG
    const legendWidth = 400;
    const legendHeight = 30;
    const legendRectWidth = legendWidth / colorScale.range().length;

    const legendSvg = d3.select('#legend')
      .append('svg')
      .attr('width', legendWidth)
      .attr('height', 50)
      .attr('id', 'legend');

    const legend = legendSvg.selectAll('rect')
      .data(colorScale.range())
      .enter()
      .append('rect')
      .attr('x', (d, i) => i * legendRectWidth)
      .attr('y', 10)
      .attr('width', legendRectWidth)
      .attr('height', legendHeight)
      .attr('fill', d => d);
  });