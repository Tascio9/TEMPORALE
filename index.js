/* import { select, json, geoPath, geoMercator } from 'd3';
import { feature } from 'topojson'; */

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

Promise.all([
  d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'),
  d3.json("myFirstDatasetCleaned.json")
]).then(data => {
  // data[0] is the first dataset "world"
  // data[1] is the second dataset by me

  const datasetState = d3.group(data[1], d => d.Nation);
  const minDatasetState = d3.min(Array.from(datasetState.values())).length;
  const maxDatasetState = d3.max(Array.from(datasetState.values())).length;


  colorMap(data[1])

  // Container CHART --------------------------------------------------------
  // const marginChart = { top: 50, right: 40, bottom: 10, left: 0 }
  // const widthChart = 30;
  // const heightChart = 500;
  // const chartWidth = widthChart + marginChart.left + marginChart.right
  // const chartHeight = heightChart + marginChart.top + marginChart.bottom

  // const svgChart = d3.select('#chart')
  //   .attr('width', chartWidth)
  //   .attr('height', chartHeight)
  //   .append('g')

  // const colorScale = d3.scaleSequential(d3.interpolateViridis)
  //   .domain([heightChart, 0])

  // svgChart.selectAll(".bars")
  //   .data(d3.range(heightChart), d => d)
  //   .enter()
  //   .append('rect')
  //   .attr('class', 'bars')
  //   .attr('x', 0)
  //   .attr('y', (d, i) => i)
  //   .attr('height', 1)
  //   .attr('width', widthChart)
  //   .style('fill', (d, i) => colorScale(d));

  const legendheight = 300,
    legendwidth = 180,
    margin = { top: 10, right: 60, bottom: 10, left: 8 };

  const canvas = d3.select('.chart-div').append('g')
    .attr('class', 'canbru')
    .append("canvas")
    .attr("height", legendheight)
    .attr("width", 1)
    .style("height", (legendheight) + "px")
    .style("width", (legendwidth - margin.left - margin.right) + "px")
    .style("border", "1px solid #000")
    .style("position", "absolute")
    .node();

  const ctx = canvas.getContext("2d");

  const colorscale = d3.scaleSequential(d3.interpolateViridis)
    .domain([minDatasetState, maxDatasetState])

  const legendscale = d3.scaleLinear()
    .domain(colorscale.domain())
    .range([0, legendheight])
    .clamp(true)

  const image = ctx.createImageData(1, legendheight);

  d3.range(legendheight).forEach(function (i) {
    var c = d3.rgb(colorscale(legendscale.invert(i)));
    image.data[4 * i] = c.r;
    image.data[4 * i + 1] = c.g;
    image.data[4 * i + 2] = c.b;
    image.data[4 * i + 3] = 255;
  });
  ctx.putImageData(image, 0, 0);

  const legendaxis = d3.axisRight()
    .scale(legendscale)
    .tickValues(legendscale.ticks(3).concat(legendscale.domain()))
    .tickSize(4);

  const svgChart = d3.select('#chart')
    .attr("height", (legendheight + margin.top + margin.bottom + 10) + "px")
    .attr("width", (legendwidth + margin.left + margin.right + 10) + "px")
    .style("position", "absolute")

  svgChart.append('rect')
    .attr('height', legendheight)
    .attr('width', legendwidth)
    .style('fill', 'none')

  svgChart.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + (legendwidth - 68) + "," + (0) + ")")
    .call(legendaxis)

  // Container SLIDER -------------------------------------------------------------------------
  const marginSlider = { top: 50, right: 40, bottom: 10, left: 0 }
  const widthSlider = 140;
  const heightSlider = 600;
  const sliderWidth = widthSlider + marginSlider.left + marginSlider.right
  const sliderHeight = heightSlider + marginSlider.top + marginSlider.bottom
  const minPublishTime = d3.min(data[1], d => d.Publish_time);
  const maxPublishTime = d3.max(data[1], d => d.Publish_time);

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
    .attr("transform", "translate(" + widthSlider / 2 + ",0)")
    // introduce axis
    .call(d3.axisRight()
      .scale(dateScale)
      .tickFormat(d => formatDate(d))
      .tickValues(dateScale.ticks(6).concat(dateScale.domain()))
      .tickSize(0)
      .tickPadding(45)
    )
    .select(".domain")
    .select(function () {
      return this.parentNode.appendChild(this.cloneNode(true));
    })
    .attr("class", "halo");

  const brush1 = d3.brushY()
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
    .attr("transform", "translate(" + widthSlider / 2 + ",0)")
    .attr("d", "M -60 0 H 60 60");
  const text1 = handle1.append('text')
    .text(formatDate(dateScale.domain()[0]))
    .attr("transform", "translate(" + (widthSlider + 2) + " ," + (+5) + ")");
  const handle2 = svgSlider1.append("g")
    .attr("class", "handle2");
  handle2.append("path")
    .attr("transform", "translate(" + widthSlider / 2 + ",0)")
    .attr("d", "M -60 0 H 60 60");
  const text2 = handle2.append('text')
    .text(formatDate(dateScale.domain()[1]))
    .attr("transform", "translate(" + (widthSlider + 2) + " ," + (+5) + ")");
  handle1.attr('transform', 'translate(0,0)');
  handle2.attr('transform', 'translate(0, ' + heightSlider + ')');


  // function colorMap() {
  //   const linearScale = d3.scaleLog()
  //     .domain([minDatasetState, maxDatasetState])
  //     .range([0, 1]);

  //   svg.selectAll('path')
  //     .data(countries.features)
  //     .enter()
  //     .append('path')
  //     .attr('d', pathGenerator)
  //     .attr('id', d => d.properties.name)
  //     .style('fill', function (d) {
  //       return (datasetState.get(d.properties.name)) ? d3.interpolateViridis(linearScale(datasetState.get(this.id).length)) : d3.interpolateViridis(linearScale(0))
  //     })
  //     .on('mouseover', function (d) {
  //       d3.select(this).style('stroke', 'orange');
  //       d3.select(this).style('stroke-opacity', '1');
  //       d3.select('#state').text(this.id);
  //       d3.select(this).style('fill', function (d) {
  //         return (datasetState.get(d.properties.name)) ? d3.interpolateViridis(linearScale(datasetState.get(this.id).length)) : d3.interpolateViridis(linearScale(0))
  //       })
  //     })
  //     .on('mouseout', function (d) {
  //       console.log(this)
  //       // d3.select(this).style('fill', d3.interpolateViridis(linearScale(datasetState.get(this.id).length)));
  //       d3.select(this).style('stroke', 'white')
  //       d3.select(this).style('stroke-opacity', '0.4');
  //     })
  // }

  function colorMap(dataset) {
    const svg = d3.select('#worldMap');
    svg.attr('height', height)
      .attr('width', width)

    svg.selectAll('path').remove()      // Necessary to update the mapcolors

    // const projection = d3.geoNaturalEarth1();
    const projection = d3.geoPatterson();
    projection.scale([200])
      .translate([width / 2, height / 2]);
    const pathGenerator = d3.geoPath().projection(projection);

    const countries = topojson.feature(data[0], data[0].objects.countries);
    console.log({ svg })
    console.log({ dataset })
    const datasetState = d3.group(dataset, d => d.Nation);
    const minDatasetState = d3.min(Array.from(datasetState.values())).length;
    const maxDatasetState = d3.max(Array.from(datasetState.values())).length;

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
        return (datasetState.get(this.id)) ? d3.interpolateViridis(linearScale(datasetState.get(this.id).length)) : d3.interpolateViridis(linearScale(0))
      })
      .on('mouseover', function (d) {
        d3.select(this).style('stroke', 'orange');
        d3.select(this).style('stroke-opacity', '1');
        if (datasetState.get(this.id)) {
          d3.select('#state').text(this.id + ": " + datasetState.get(this.id).length);
        } else {
          d3.select('#state').text(this.id + ": 0");
        }
        // d3.select(this).style('fill', function (d) {
        //   return (datasetState.get(d.properties.name)) ? d3.interpolateViridis(linearScale(datasetState.get(this.id).length)) : d3.interpolateViridis(linearScale(0))
        // })
      })
      .on('mouseout', function (d) {
        console.log(this)
        // d3.select(this).style('fill', d3.interpolateViridis(linearScale(datasetState.get(this.id).length)));
        d3.select(this).style('stroke', 'white')
        d3.select(this).style('stroke-opacity', '0.4');
      })

    Table(dataset)
  }

  function upgradePaper() {
    selection1 = d3.brushSelection(d3.select(".brush1").node());
    handle1.attr('transform', 'translate(0,' + selection1[0] + ')')
    text1.text(formatDate(dateScale.invert(selection1[0])));
    handle2.attr('transform', 'translate(0,' + selection1[1] + ')')
    text2.text(formatDate(dateScale.invert(selection1[1])));
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
    const [x0, x1] = selection1.map(d => d3.timeYear.every(1).round(dateScale.invert(d)));
    d3.select(this).transition().call(brush1.move, x1 > x0 ? [x0, x1].map(dateScale) : null);

    const newData = data[1].filter(function (d) {
      return ((new Date(moment(d.Publish_time, 'YYYY-MM-DD').format('YYYY-MM-DD'))) >= dateScale.invert(selection1[0])
        && ((new Date(moment(d.Publish_time, 'YYYY-MM-DD').format('YYYY-MM-DD')))) <= dateScale.invert(selection1[1]))
    })

    colorMap(newData)
  }
});
