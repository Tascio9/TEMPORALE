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
  const marginChart = { top: 50, right: 40, bottom: 10, left: 0 }
  const widthChart = 30;
  const heightChart = 150;
  // const formatDate = d3.timeFormat('%Y-%m-%d');
  const chartWidth = widthChart + marginChart.left + marginChart.right
  const chartHeight = heightChart + marginChart.top + marginChart.bottom

  const svgChart = d3.select('#chart')
    .attr('width', chartWidth)
    .attr('height', chartHeight)
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
  // Container SLIDER -------------------------------------------------------------------------
  const marginSlider = { top: 50, right: 40, bottom: 10, left: 0 }
  const widthSlider = 140;
  const heightSlider = 600;
  // const formatDate = d3.timeFormat('%Y-%m-%d');
  const sliderWidth = widthSlider + marginSlider.left + marginSlider.right
  const sliderHeight = heightSlider + marginSlider.top + marginSlider.bottom

  const svgSlider1 = d3.select("#slider")
    .attr("width", sliderWidth)
    .attr("height", sliderHeight).append("g")
    // classic transform to position g
    .attr("transform", "translate(" + marginSlider.left + "," + marginSlider.top + ")");

  const formatDate = d3.timeFormat('%Y');
  const dateScale = d3.scaleTime()
    .domain([new Date(minPublishTime), new Date(maxPublishTime)])
    .range([0, heightSlider])
    .clamp(true);

  svgSlider1.append("rect")
    .style("pointer-events", "all")
    .style("fill", "none")
    .style("opacity", "0.6")
    .attr("width", widthSlider)
    .attr("height", heightSlider)
    .style("cursor", "crosshair");

  // add the X gridlines
  svgSlider1.append("g")
    .attr("class", "grid")
    .attr("transform", "translate(" + widthSlider / 4 + ",0)")
    .call(d3.axisRight(dateScale)
      .ticks(d3.timeYear.every(1))
      .tickSize((widthSlider / 2))
      .tickFormat("")
      .tickSizeOuter(0)
    )
    .select("path").style("opacity", "0");

  svgSlider1.append("g")
    .attr("class", "numbers")
    .attr("width", "100")
    // put in middle of screen
    //.attr("transform", "translate(0," + heightSlider / 2 + ")")
    .attr("transform", "translate(" + widthSlider / 2 + ",0)")
    // introduce axis
    .call(d3.axisRight()
      .scale(dateScale)
      .tickFormat(d => formatDate(d))
      .tickValues(dateScale.ticks(6).concat(dateScale.domain()))
      // .ticks(10)
      .tickSize(0)
      .tickPadding(45)
    )
    .select(".domain")
    .select(function () {
      return this.parentNode.appendChild(this.cloneNode(true));
    })
    .attr("class", "halo");

  const brush1 = d3.brushY()
    // .extent([[0, 0], [widthSlider, heightSlider]]) --> Original one
    // .extent([[widthSlider, heightSlider], [0, 0]])
    .extent([[0, 0], [widthSlider, heightSlider]])
    .on("brush", upgradePaper)
    .on("end", filterPaperByDate);
  svgSlider1.append("g")
    .attr("class", "brush1")
    .style("opacity", "0")
    .on('dblclick', resetPaper)
    .call(brush1);
  const handle1 = svgSlider1.append("g")
    .attr("class", "handle1");
  handle1.append("path")
    // .attr("transform", "translate(0," + heightSlider / 2 + ")") --> Original one
    .attr("transform", "translate(" + widthSlider / 2 + ",0)")
    .attr("d", "M -60 0 H 60 60");
  const text1 = handle1.append('text')
    .text(formatDate(dateScale.domain()[0]))
    // .attr("transform", "translate(" + (-12) + " ," + (heightSlider / 2 - 45) + ")"); --> Original one
    .attr("transform", "translate(" + (widthSlider + 2) + " ," + (+5) + ")");
  const handle2 = svgSlider1.append("g")
    .attr("class", "handle2");
  handle2.append("path")
    // .attr("transform", "translate(0," + heightSlider / 2 + ")") --> Origianl one
    .attr("transform", "translate(" + widthSlider / 2 + ",0)")
    .attr("d", "M -60 0 H 60 60");
  const text2 = handle2.append('text')
    .text(formatDate(dateScale.domain()[1]))
    // .attr("transform", "translate(" + (-14) + " ," + (heightSlider / 2 - 45) + ")"); --> Original one
    .attr("transform", "translate(" + (widthSlider + 2) + " ," + (+5) + ")");
  handle1.attr('transform', 'translate(0,0)');
  // handle2.attr('transform', 'translate(' + widthSlider + ",0)");
  handle2.attr('transform', 'translate(0, ' + heightSlider + ')');



  function upgradePaper() {
    // EVENT LISTENER SLIDER 1 DATA 4/7/2017
    // selection1 = d3.brushSelection(d3.select(".brush1").node());
    // handle1.attr('transform', 'translate(' + selection1[0] + ",0)");
    // text1.text(formatDate(dateScale.invert(selection1[0])));
    // handle2.attr('transform', 'translate(' + selection1[1] + ",0)");
    // text2.text(formatDate(dateScale.invert(selection1[1])));
    selection1 = d3.brushSelection(d3.select(".brush1").node());
    handle1.attr('transform', 'translate(0,' + selection1[0] + ')')
    text1.text(formatDate(dateScale.invert(selection1[0])));
    handle2.attr('transform', 'translate(0,' + selection1[1] + ')')
    text2.text(formatDate(dateScale.invert(selection1[1])));

    // APPLY THE FILTER ON THE DATES:    colorMap(data[1])
  }

  function resetPaper() {
    selection1[0] = 0;
    // selection1[1] = widthSlider;
    selection1[1] = heightSlider;
    // handle1.attr('transform', 'translate(' + selection1[0] + ",0)");
    // text1.text(formatDate(timeScale1.invert(selection1[0])));
    // handle2.attr('transform', 'translate(' + selection1[1] + ",0)");
    // text2.text(formatDate(timeScale1.invert(selection1[1])));
    handle1.attr('transform', 'translate(0,' + selection1[0] + ')')
    text1.text(formatDate(dateScale.invert(selection1[0])));
    handle2.attr('transform', 'translate(0,' + selection1[1] + ')')
    text2.text(formatDate(dateScale.invert(selection1[1])));

    colorMap(data[1])
  }

  function filterPaperByDate(event) {
    const selection1 = d3.brushSelection(d3.select(".brush1").node());
    if (!event.sourceEvent || !selection1) return;
    console.log({ selection1 })
    const [x0, x1] = selection1.map(d => d3.timeYear.every(1).round(dateScale.invert(d)));
    d3.select(this).transition().call(brush1.move, x1 > x0 ? [x0, x1].map(dateScale) : null);

    const newData = data[1].filter(function (d) {
      return ((new Date(moment(d.Publish_time, 'YYYY-MM-DD').format('YYYY-MM-DD'))) >= dateScale.invert(selection1[0])
        && ((new Date(moment(d.Publish_time, 'YYYY-MM-DD').format('YYYY-MM-DD')))) <= dateScale.invert(selection1[1]))
    })

    console.log({ newData })

    colorMap(newData)

  }
});
