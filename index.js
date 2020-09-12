/* import { select, json, geoPath, geoMercator } from 'd3';
import { feature } from 'topojson'; */

const svg = d3.select('#worldMap');
//d3.select('#worldMap').attr("transform", "scale(0.5)");

// const width = + svg.attr('width');
// const height = + svg.attr('height');
// const attrH = svg.attr('height')
// const styleH = svg.style('height')
// console.log({ attrH });
// console.log({ styleH });

const widthWindow = window.innerWidth
const heightWindow = window.innerHeight

const height = heightWindow - 250;
const width = widthWindow - 500;
svg.attr('height', height)
  .attr('width', width)


// const projection = d3.geoNaturalEarth1();
const projection = d3.geoPatterson();
projection.scale([200])
  .translate([width / 2, height / 2]);
const pathGenerator = d3.geoPath().projection(projection);

Promise.all([
  d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'),
  d3.json("myFirstDatasetCleaned.json")
]).then(data => {
  // data[0] is the first dataset "world"
  // data[1] is the second dataset by me
  const countries = topojson.feature(data[0], data[0].objects.countries);
  const datasetState = d3.group(data[1], d => d.Nation);
  var minDatasetState = d3.min(Array.from(datasetState.values())).length;
  var maxDatasetState = d3.max(Array.from(datasetState.values())).length;

  const linearScale = d3.scaleLog()
    .domain([minDatasetState, maxDatasetState])
    .range([0, 1]);

  svg.selectAll('path')
    .data(countries.features)
    .enter()
    .append('path')
    .attr('d', pathGenerator)
    .attr('id', d => d.properties.name)
    .style('fill', function (d) {
      return (datasetState.get(d.properties.name)) ? d3.interpolateViridis(linearScale(datasetState.get(this.id).length)) : d3.interpolateViridis(linearScale(0))
    })
    .on('mouseover', function (d) {
      d3.select(this).style('stroke', 'orange');
      d3.select(this).style('stroke-opacity', '1');
      d3.select('#state').text(this.id);
      d3.select(this).style('fill', function (d) {
        return (datasetState.get(d.properties.name)) ? d3.interpolateViridis(linearScale(datasetState.get(this.id).length)) : d3.interpolateViridis(linearScale(0))
      })
    })
    .on('mouseout', function (d) {
      console.log(this)
      // d3.select(this).style('fill', d3.interpolateViridis(linearScale(datasetState.get(this.id).length)));
      d3.select(this).style('stroke', 'white')
      d3.select(this).style('stroke-opacity', '0.4');
    })

  // Container
  var widthChart = 100;
  var heightChart = 150;
  // Band scale for x-axis
  const xScale = d3.scaleBand()
    .domain([0, 1])
    .range([0, widthChart]);

  // Linear scale for y-axis
  const yScale = d3.scaleLinear()
    .domain([minDatasetState, maxDatasetState])
    .range([heightChart, 0]);

  var svgChart = d3.select('#chart')
    .attr('width', widthChart)
    .attr('height', heightChart)
    .append('g')

  var colorScale = d3.scaleSequential(d3.interpolateViridis)
    .domain([heightChart, 0])

  // var bars = svgChart.selectAll(".bars")
  //   .data(d3.range(widthChart), d => d)
  //   .enter()
  //   .append('rect')
  //   .attr('class', 'bars')
  //   .attr('x', (d, i) => i)
  //   .attr('y', 0)
  //   .attr('height', heightChart)
  //   .attr('width', 1)
  //   .style('fill', function (d, i) { return colorScale(d); });
  svgChart.selectAll(".bars")
    .data(d3.range(heightChart), d => d)
    .enter()
    .append('rect')
    .attr('class', 'bars')
    .attr('x', 0)
    .attr('y', (d, i) => i)
    .attr('height', 1)
    .attr('width', widthChart)
    .style('fill', (d, i) => colorScale(d));

});

// const svgLegend = d3.select('#rectColor');
// svgLegend.select('#rectScaleColor')
//          .style('fill', 'red');
