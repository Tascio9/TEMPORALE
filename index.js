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
  const minDatasetState = d3.min(Array.from(datasetState.values())).length;
  const maxDatasetState = d3.max(Array.from(datasetState.values())).length;
  const minPublishTime = d3.min(data[1], d => d.Publish_time);
  const maxPublishTime = d3.max(data[1], d => d.Publish_time);


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

  // Container CHART --------------------------------------------------------
  const widthChart = 30;
  const heightChart = 150;

  const svgChart = d3.select('#chart')
    .attr('width', widthChart)
    .attr('height', heightChart)
    .append('g')

  const colorScale = d3.scaleSequential(d3.interpolateViridis)
    .domain([heightChart, 0])
  
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
  // -------------------------------------------------------------------------
  
  const widthSlider = "100";
  const heightSlider = "300";
  // const formatDate = d3.timeFormat('%Y-%m-%d');
  const formatDate = d3.timeFormat('%Y');
  const dateScale = d3.scaleTime()
  .domain([new Date(minPublishTime), new Date(maxPublishTime)])
  .range([0, heightSlider])
  .clamp(true);

  const svgSlider1 = d3.select("#slider")
        .attr("width", widthSlider)
        .attr("height", heightSlider)
        .append("g")

  svgSlider1.append("rect")
        .style("fill", "white")
        .style("opacity", "0.6")
        .attr("width", widthSlider)
        .attr("height", heightSlider)
        .style("cursor", "crosshair");

  svgSlider1.append("g")
        .attr("class", "y axis")
        // introduce axis
        .call(d3.axisRight()
            .scale(dateScale)
            .tickFormat(function (d) {
                return formatDate(d);
            })
        .ticks(6)
        .tickSize(5)
        .tickPadding(100))
        .select(".domain")
        .select(function () {
            return this.parentNode.appendChild(this.cloneNode(true));
        });

    // add the X gridlines
    svgSlider1.append("g")
        .attr("class", "grid")
        .call( d => d3.axisRight(d)
        );
    
        // svgSlider1.append("g")
        // .attr("class", "grid")
        // .attr("transform", "translate(0," + heightSlider + ")")
        // .call(make_x_gridlines(timeScale1)
        //     .tickSize(-heightSlider + 4)
        //     .tickFormat("").tickSizeOuter(0)
        // );


    function make_x_gridlines(xAxis) {
          return d3.axisBottom(xAxis)
      }

    // drawScatterPlotDay1();
    // var brush1 = d3.brushX()
    //     .extent([[0, 0], [widthSlider, heightSlider]])
    //     .on("brush", upgradeDay1)
    //     .on("end", update);
    // svgSlider1.append("g")
    //     .attr("class", "brush1")
    //     .style("opacity", "0")
    //     .on('dblclick', resetDay1)
    //     .call(brush1);
    // var handle1 = svgSlider1.append("g")
    //     .attr("class", "handle");
    // handle1.append("path")
    //     .attr("transform", "translate(0," + heightSlider / 2 + ")")
    //     .attr("d", "M 0 -40 V 35");
    // var text1 = handle1.append('text')
    //     .text(formatDate(timeScale1.domain()[0]))
    //     .attr("transform", "translate(" + (-12) + " ," + (heightSlider / 2 - 45) + ")");
    // var handle2 = svgSlider1.append("g")
    //     .attr("class", "handle");
    // handle2.append("path")
    //     .attr("transform", "translate(0," + heightSlider / 2 + ")")
    //     .attr("d", "M 0 -40 V 35");
    // var text2 = handle2.append('text')
    //     .text(formatDate(timeScale1.domain()[1]))
    //     .attr("transform", "translate(" + (-14) + " ," + (heightSlider / 2 - 45) + ")");
    // handle1.attr('transform', 'translate(0,0)');
    // handle2.attr('transform', 'translate(' + widthSlider + ",0)");
});
