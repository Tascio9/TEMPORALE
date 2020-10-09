// const height = 300
// const width = 100

Promise.all([
  d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'),
  d3.json("myFirstDatasetCleaned.json"),
  d3.json("CovidEuropean.json")
]).then(data => {
  // data[0] is the first dataset "world"
  // data[1] is the second dataset by me
  // data[2] CovidEuropean: cases and deaths for nation + date
  const groupByYear = d3.group(data[1], d => d.Publish_time.split('-').slice(0, 1).join('-'))
  const groupByMonth = d3.group(data[1], d => d.Publish_time.split('-').slice(0, 2).join('-'))

  let yearValue = '2020'
  let colorChartBoolean = false           // Variable to set true when the brush on 'colorChart' happends
  let countriesChart = []                 // Variable to store the countries obtained by the brush action on 'colorChart'
  let colorPalette = d3.select('input[name="colorPalette"]:checked').property('value')

  console.log({ colorPalette })
  console.log({ groupByYear })
  console.log({ groupByMonth })

  const sortedGroupByYear = Array.from(groupByYear.keys()).sort((a, b) => d3.descending(a, b))

  for (let d of sortedGroupByYear) {
    d3.select('#selectYear')
      .append('option')
      .attr('value', d)
      .text(d)
  }
  d3.select('#selectYear').append('option').attr('value', 'All').text('All')

  const dataset2020 = groupByYear.get(yearValue)

  // Container LINE-CHART ---------------------------------------------------------------------
  // Draw the left chart bar for the colors
  chart(data[2])

  // Container CHART --------------------------------------------------------------------------
  // Draw the left chart bar for the colors
  // colorChart(data[1])
  colorChart(dataset2020)

  // Container MAP ----------------------------------------------------------------------------
  // Draw the map with the respective colors
  // colorMap(data[1])
  colorMap(dataset2020)

  // Container SLIDER -------------------------------------------------------------------------
  // sliderTime(data[1])
  sliderTime(dataset2020)

  // Handling events on:
  // - Dropdown selection
  d3.select('#selectYear').on('change', function (d) {
    if (this.value === 'All') {
      colorChartBoolean = false
      colorMap(data[1])
      colorChart(data[1])
      sliderTime(data[1])
      chart(data[2])
    } else {
      yearDataset = groupByYear.get(this.value)
      colorChartBoolean = false
      colorMap(yearDataset)
      colorChart(yearDataset)
      sliderTime(yearDataset)
      chart(data[2])
    }
  })

  // - Radio button
  d3.selectAll('input[name="colorPalette"]').on('change', function () {
    colorPalette = this.value
    yearValue = d3.select('#selectYear').property('value')
    console.log({ yearValue })
    if (yearValue === 'All') {
      colorChartBoolean = false
      colorMap(data[1])
      colorChart(data[1])
      sliderTime(data[1])
    } else {
      yearDataset = groupByYear.get(yearValue)
      colorChartBoolean = false
      colorMap(yearDataset)
      colorChart(yearDataset)
      sliderTime(yearDataset)
    }
  });

  // -----------------------------------------------------------------------------------------------
  // Given a dataset, it returns a color palette (Viridis/Magma) based on the radio button checked
  function palette(dataset) {
    const min = d3.min(Array.from(dataset.values())).length;
    const max = d3.max(Array.from(dataset.values())).length;
    console.log({ min })
    console.log({ max })
    if (colorPalette === 'Viridis') {
      return d3.scaleSequential(d3.interpolateViridis)
        .domain([min, max])
    } else {
      return d3.scaleSequential(d3.interpolateMagma)
        .domain([min, max])
    }
  }


  // ---------------------------------------------------
  // Draw the chart on the left according to the dataset
  function colorChart(dataset) {
    const datasetState = d3.group(dataset, d => d.Nation);
    // const minDatasetState = d3.min(Array.from(datasetState.values())).length;
    // const maxDatasetState = d3.max(Array.from(datasetState.values())).length;

    let colorscale = palette(datasetState)
    let filterDataset = []

    const heightLegend = 300;
    const widthLegend = 100;
    const marginLegend = { top: 20, right: 80, bottom: 10, left: 2 };

    d3.selectAll(".legendScale").remove();
    d3.selectAll(".canvas").remove();

    const canvas = d3.select(".chart-div")
      .style("height", heightLegend + "px")
      .style("width", widthLegend + "px")
      .style("position", "relative")
      .append("canvas")
      .attr("height", heightLegend - marginLegend.top - marginLegend.bottom)
      .attr("width", 1)
      .attr("class", "canvas")
      .style("height", (heightLegend - marginLegend.top - marginLegend.bottom) + "px")
      .style("width", (widthLegend - marginLegend.left - marginLegend.right) + "px")
      .style("border", "1px solid #000")
      .style("position", "absolute")
      .style("top", "25px")
      .style("left", "30px")
      .node();

    // https://cran.r-project.org/web/packages/viridis/vignettes/intro-to-viridis.html
    // const colorscale = d3.scaleSequential(d3.interpolateViridis)
    //   .domain([minDatasetState, maxDatasetState])

    const ctx = canvas.getContext("2d");

    const legendscale = d3.scaleLinear()
      .range([1, heightLegend - marginLegend.top - marginLegend.bottom])
      .domain(colorscale.domain());

    const image = ctx.createImageData(1, heightLegend);

    d3.range(heightLegend).forEach(function (i) {
      c = d3.rgb(colorscale(legendscale.invert(i)));
      image.data[4 * i] = c.r;
      image.data[4 * i + 1] = c.g;
      image.data[4 * i + 2] = c.b;
      image.data[4 * i + 3] = 255;
    });
    ctx.putImageData(image, 0, 0);

    // http://bl.ocks.org/zanarmstrong/05c1e95bf7aa16c4768e
    const formatNumber = d3.format('.0f')

    const legendscaleaxis = d3.scaleLinear()
      .range([1, heightLegend - marginLegend.top - marginLegend.bottom])
      .domain(colorscale.domain());

    const legendaxis = d3.axisRight()
      .scale(legendscaleaxis)
      .tickFormat(d => formatNumber(d))
      .tickValues(legendscaleaxis.ticks(10).concat(legendscaleaxis.domain()));

    const svgLegend = d3.select(".chart-div")
      .append("svg")
      .attr("class", "legendScale")
      .attr("height", (heightLegend) + "px")
      .attr("width", (widthLegend) + "px")
      .style("position", "absolute")
      .style("left", "30px")
      .style("top", "5px")
      .on("dblclick", function () {
        Table(dataset)
        d3.select("#worldMap").selectAll("path").transition().duration(100).style("opacity", "1")
        colorChartBoolean = false
        countriesChart = []
        filterDataset = []
      });

    const brushLegend = d3.brushY()
      .extent([[0, 0], [widthLegend - marginLegend.left - marginLegend.right, heightLegend - marginLegend.top - marginLegend.bottom]])
      .on("brush", function filterView(event) {
        // const selection1 = d3.brushSelection(d3.select(".brush1").node());
        // if (!event.sourceEvent || !selection1) return;
        // const [x0, x1] = selection1.map(d => d3.timeMonth.every(1).round(dateScale.invert(d)));
        // d3.select(this).transition().call(brush1.move, x1 > x0 ? [x0, x1].map(dateScale) : null);

        const selection1 = d3.brushSelection(d3.select(".brushLegend").node());
        if (!event.sourceEvent || !selection1) return;
        const selectionLegendBegin = parseInt(legendscaleaxis.invert(d3.brushSelection(d3.select(".brushLegend").node())[0]));
        const selectionLegendEnd = parseInt(legendscaleaxis.invert(d3.brushSelection(d3.select(".brushLegend").node())[1]));
        d3.select(this).transition().call(brushLegend.move, selectionLegendEnd > selectionLegendBegin ? [selectionLegendBegin, selectionLegendEnd].map(legendscaleaxis) : null);

        d3.select("#worldMap").selectAll("path").transition().duration(100).style("opacity", "0.4")
        colorChartBoolean = true
        countriesChart = []
        filterDataset = []

        Array.from(datasetState).filter(function (d) {
          if (selectionLegendBegin <= d[1].length && d[1].length <= selectionLegendEnd) {
            d3.select("#worldMap").select(`path[id='${d[0]}']`).transition().duration(100).style("opacity", "1")
            countriesChart.push(d[0])
            d[1].forEach(function (e) {
              filterDataset.push(e)
            })
          }
        })
        console.log({ countriesChart })
        Table(filterDataset)
      })

    svgLegend.append("g")
      .attr("class", "brushLegend")
      .attr("transform", "translate(" + (0) + "," + (marginLegend.top) + ")")
      .call(brushLegend);

    svgLegend.append("g")
      .attr("transform", "translate(" + (widthLegend - marginLegend.left - marginLegend.right + 1) + "," + (marginLegend.top) + ")")
      .attr("class", "y axis")
      .call(legendaxis);

    svgLegend.append("g")
      .append("text")
      .attr("class", "label")
      .attr("x", widthLegend / 2 - 15)
      .attr("y", 12)
      .style("text-anchor", "end")
      .style("font-size", "8.5px")
      .text("N° Paper");
  }


  // -------------------------------------------------------------------------------------------------
  // *IMPROVEMENT* take a look on this: https://www.d3-graph-gallery.com/graph/interactivity_zoom.html
  function sliderTime(dataset) {
    const marginSlider = { top: 10, right: 40, bottom: 10, left: 0 }
    const widthSlider = 100;
    const heightSlider = 290;
    const sliderWidth = widthSlider + marginSlider.left + marginSlider.right
    const sliderHeight = heightSlider + marginSlider.top + marginSlider.bottom
    const minPublishTime = d3.min(dataset, d => d.Publish_time);
    const maxPublishTime = d3.max(dataset, d => d.Publish_time);
    const formatDate = d3.timeFormat('%Y');
    const formatMonth = d3.timeFormat('%B');
    const formatMonthLabel = d3.timeFormat('%b');


    selectedYear = d3.select('#selectYear').node().value
    console.log({ selectedYear })

    d3.select('#slider').remove()
    d3.select('.legend-div').append('svg').attr('id', 'slider')

    const svgSlider1 = d3.select("#slider")
      .attr("width", sliderWidth)
      .attr("height", sliderHeight).append("g")
      // classic transform to position g
      .attr("transform", "translate(" + marginSlider.left + "," + marginSlider.top + ")");

    console.log(d3.select('#selectYear').node().value)

    if (selectedYear === 'All') {
      // YEAR IS 'ALL'
      const dateScale = d3.scaleTime()
        .domain([new Date(moment(minPublishTime, 'YYYY').format('YYYY')), new Date(moment(maxPublishTime, 'YYYY').format('YYYY')) - 1])
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
          .tickValues(dateScale.ticks(d3.timeYear.every(1)).concat(dateScale.domain()))
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
        .on("brush", function upgradePaper() {
          selection1 = d3.brushSelection(d3.select(".brush1").node());
          handle1.attr('transform', 'translate(0,' + selection1[0] + ')')
          text1.text(formatDate(dateScale.invert(selection1[0])));
          handle2.attr('transform', 'translate(0,' + selection1[1] + ')')
          text2.text(formatDate(dateScale.invert(selection1[1])));
        })
        .on("end", function filterPaperByDate(event) {
          const selection1 = d3.brushSelection(d3.select(".brush1").node());
          if (!event.sourceEvent || !selection1) return;
          const [x0, x1] = selection1.map(d => d3.timeYear.every(1).round(dateScale.invert(d)));
          d3.select(this).transition().call(brush1.move, x1 > x0 ? [x0, x1].map(dateScale) : null);

          const newData = dataset.filter(function (d) {
            return ((new Date(moment(d.Publish_time, 'YYYY').format('YYYY'))) >= new Date(moment(x0, 'YYYY-MM-DD').format('YYYY'))
              && ((new Date(moment(d.Publish_time, 'YYYY').format('YYYY')))) <= new Date(moment(x1, 'YYYY-MM-DD').format('YYYY')))
          })

          if (newData.length != 0) {
            colorChart(newData)
            colorMap(newData)
          } else {
            alert('No papers available in this period')
          }

          colorChart(newData)
          colorMap(newData)
        });

      svgSlider1.append("g")
        .attr("class", "brush1")
        .style("opacity", "0")
        .on('dblclick', function resetPaper() {
          selection1[0] = 0;
          selection1[1] = heightSlider;
          handle1.attr('transform', 'translate(0,' + selection1[0] + ')')
          text1.text(formatDate(dateScale.invert(selection1[0])));
          handle2.attr('transform', 'translate(0,' + selection1[1] + ')')
          text2.text(formatDate(dateScale.invert(selection1[1])));

          colorChart(dataset)
          colorMap(dataset)
        })
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
    } else {
      // YEAR IS SELECTED
      const dateScale = d3.scaleTime()
        .domain([new Date(selectedYear, 0, 1), new Date(selectedYear, 10, 31)])
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
          .ticks(d3.timeMonth.every(1))
          .tickValues(dateScale.ticks(d3.timeMonth.every(1)).concat(dateScale.domain()))
          .tickSize((widthSlider / 2))
          .tickFormat("")
          .tickSizeOuter(0)
        )
        .select("path").style("opacity", "0");

      svgSlider1.append("g")
        .attr("class", "months")
        .attr("width", "100")
        .attr("transform", "translate(" + widthSlider / 2 + ",0)")
        // introduce axis
        .call(d3.axisRight()
          .scale(dateScale)
          .tickFormat(d => formatMonthLabel(d))
          .tickValues(dateScale.ticks(12).concat(dateScale.domain()))
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
        .on("brush", function upgradePaper() {
          selection1 = d3.brushSelection(d3.select(".brush1").node());
          handle1.attr('transform', 'translate(0,' + selection1[0] + ')')
          // text1.text(formatMonthLabel(dateScale.invert(selection1[0])));
          handle2.attr('transform', 'translate(0,' + selection1[1] + ')')
          // text2.text(formatMonthLabel(dateScale.invert(selection1[1])));
        })
        .on("end", function filterPaperByMonth(event) {
          const selection1 = d3.brushSelection(d3.select(".brush1").node());
          if (!event.sourceEvent || !selection1) return;
          const [x0, x1] = selection1.map(d => d3.timeMonth.every(1).round(dateScale.invert(d)));
          d3.select(this).transition().call(brush1.move, x1 > x0 ? [x0, x1].map(dateScale) : null);

          console.log(dateScale.invert(selection1[0]))
          console.log(x0)
          console.log(moment(dateScale.invert(selection1[1]), 'YYYY-MM-DD').format('YYYY-MM'))
          console.log(x1)

          const newData = dataset.filter(function (d) {
            return ((new Date(moment(d.Publish_time, 'YYYY-MM').format('YYYY-MM'))) >= new Date(moment(x0, 'YYYY-MM-DD').format('YYYY-MM'))
              && ((new Date(moment(d.Publish_time, 'YYYY-MM').format('YYYY-MM')))) <= new Date(moment(x1, 'YYYY-MM-DD').format('YYYY-MM')))
          })

          if (newData.length != 0) {
            colorChart(newData)
            colorMap(newData)
          } else {
            alert('No papers available in this period')
          }
        });

      svgSlider1.append("g")
        .attr("class", "brush1")
        .style("opacity", "0")
        .on('dblclick', function resetPaper() {
          selection1[0] = 0;
          selection1[1] = heightSlider;
          handle1.attr('transform', 'translate(0,' + selection1[0] + ')')
          // text1.text(formatMonthLabel(dateScale.invert(selection1[0])));
          handle2.attr('transform', 'translate(0,' + selection1[1] + ')')
          // text2.text(formatMonthLabel(dateScale.invert(selection1[1])));

          colorChart(dataset)
          colorMap(dataset)
        })
        .call(brush1);
      const handle1 = svgSlider1.append("g")
        .attr("class", "handle1");
      handle1.append("path")
        .attr("transform", "translate(" + widthSlider / 2 + ",0)")
        .attr("d", "M -60 0 H 60 60");
      // const text1 = handle1.append('text')
      //   .text(formatMonthLabel(dateScale.domain()[0]))
      //   .attr("transform", "translate(" + (widthSlider + 2) + " ," + (+5) + ")");
      const handle2 = svgSlider1.append("g")
        .attr("class", "handle2");
      handle2.append("path")
        .attr("transform", "translate(" + widthSlider / 2 + ",0)")
        .attr("d", "M -60 0 H 60 60");
      // const text2 = handle2.append('text')
      //   .text(formatMonthLabel(dateScale.domain()[1]))
      //   .attr("transform", "translate(" + (widthSlider + 2) + " ," + (+5) + ")");
      handle1.attr('transform', 'translate(0,0)');
      handle2.attr('transform', 'translate(0, ' + heightSlider + ')');
    }
  }


  // -------------------------------------------------------------------------------------------------
  // 
  function chart(dataset) {
    const formatMonthLabel = d3.timeFormat('%b');
    console.log('line-chart')
    console.log({ dataset })
    const dayFormat = d3.timeFormat("%Y-%m-%d")
    // const x = d3.group(data.records, d => d.dateRep)
    // const casesMap = d3.rollup(data.records, v => d3.sum(v, e => e.cases), k => k.dateRep);
    // const casesMap = d3.rollup(dataset.records, v => d3.sum(v, e => e.cases), function (k) {
    //   return dayFormat(new Date(moment(k.dateRep, 'DD/MM/YYYY').format("YYYY-MM-DD")))
    // })

    const casesMap = d3.rollup(dataset.records, function (v) {
      console.log(v)
      return { date: dayFormat(new Date(moment(v.dateRep, 'DD/MM/YYYY').format("YYYY-MM-DD"))), cases: d3.sum(v, e => e.cases) }
    }, function (k) {
      return dayFormat(new Date(moment(k.dateRep, 'DD/MM/YYYY').format("YYYY-MM-DD")))
    })


    // const deathsMap = d3.rollup(data.records, v => d3.sum(v, e => e.deaths), k => k.dateRep);
    const deathsMap = d3.rollup(dataset.records, v => d3.sum(v, e => e.deaths), function (k) {
      return dayFormat(new Date(moment(k.dateRep, 'DD/MM/YYYY').format("YYYY-MM-DD")))
    })

    // d3.rollup(data.records, v => d3.sum(v.cases), d => d.dateRep);
    // for (record in data.records) {
    //     console.log(data.records[record].dateRep)
    // }

    // const groupByDate = Array.from(x)
    // const casesMap = new Map()
    // const deathsMap = new Map()

    // groupByDate.forEach(function (d) {
    //     casesMap.set(d[0], d3.sum(d[1], v => v.cases))
    //     deathsMap.set(d[0], d3.sum(d[1], v => v.deaths))
    // })

    // const test = Array.from(casesMap)
    const test = Array.from(casesMap.values())
    console.log({ casesMap })
    console.log({ deathsMap })

    test.sort((x, y) => d3.ascending(x[0], y[0]))
    yearValue = d3.select('#selectYear').property('value')
    console.log({ yearValue })
    const filter = test.filter(d => new Date(d.date).getFullYear() == yearValue)
    console.log({ test })
    console.log({ filter })

    const width = 1000
    const height = 300
    const margin = ({ top: 20, right: 40, bottom: 70, left: 150 })

    d3.select('#line-chart').remove()
    d3.select('.chart').append('svg').attr('id', 'line-chart')

    const svg = d3.select('#line-chart')
      .attr("viewBox", [0, 0, width, height])

    const x = d3.scaleTime()
      .domain([new Date(moment(d3.min(filter, d => d.date), 'YYYY-MM-DD')), new Date(moment(d3.max(filter, d => d.date), 'YYYY-MM-DD'))])
      .range([margin.left, width - margin.right])


    const y = d3.scaleLinear()
      .domain([0, d3.max(Array.from(casesMap), d => d.cases)]).nice()
      .range([height - margin.bottom, margin.top])


    const line = d3.line()
      .defined(d => !isNaN(new Date(moment(d.date, 'YYYY-MM-DD').format('YYYY-MM-DD'))))
      .defined(d => !isNaN(d.cases))
      .x(d => x(new Date(moment(d.date, 'YYYY-MM-DD').format('YYYY-MM-DD'))))
      .y(d => y(d[1]))

    const xAxis = g => g
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x)
        .tickFormat(d => formatMonthLabel(d)).ticks(width / 80).tickSizeOuter(0))
      .attr("font-size", "2vh")

    const yAxis = g => g
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .attr("font-size", "2.5vh")
      .call(g => g.select(".domain").remove())                // Remove the y-axis line
      .call(g => g.select(".tick:last-of-type text").clone()
        .attr("x", 3)
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text('Number')
      )

    svg.append("g")
      .call(xAxis);

    svg.append("g")
      .call(yAxis);

    svg.append("path")
      .datum(filter)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", line);

    const tooltip = svg.append("g");

    svg.on("touchmove mousemove", function (event) {
      const { date, value } = bisect(d3.pointer(event, this)[0])

      tooltip
        .attr("transform", `translate(${x(date)},${y(value)})`)
        // .call(callout, `Cases: ${value}\nDate: ${dayFormat(date)}`);
        .call(callout, `${value}\n${dayFormat(date)}`);

    });

    svg.on("touchend mouseleave", () => tooltip.call(callout, null));

    bisect = (point) => {
      const date = x.invert(point)
      const value = casesMap.get(dayFormat(date))

      return { date, value }
    }

    callout = (g, value) => {
      if (value.split(/\n/)[0] === 'undefined') return g.style("display", "none");

      g
        .style("display", null)
        .style("pointer-events", "none")
        .style("font", "2.5vh");

      const path = g.selectAll("path")
        .data([null])
        .join("path")
        .attr("fill", "white")
        .attr("stroke", "black");

      const text = g.selectAll("text")
        .data([null])
        .join("text")
        .call(text => text
          .selectAll("tspan")
          .data((value + "").split(/\n/))
          .join("tspan")
          .attr("x", 0)
          .attr("y", (d, i) => `${i * 1.1}em`)
          .style("font-weight", (_, i) => i ? null : "bold")
          .text(d => d));

      const { x, y, width: w, height: h } = text.node().getBBox();

      text.attr("transform", `translate(${-w / 2},${15 - y})`);
      path.attr("d", `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`);
    }
  }


  // --------------------------------------------------------------------------------
  // Draw the map according to the dataset passed, which inside there are the papers.
  function colorMap(dataset) {
    const widthWindow = window.innerWidth
    const heightWindow = window.innerHeight
    const height = heightWindow - 388;
    const width = widthWindow - 500;
    // const projection = d3.geoNaturalEarth1();
    const projection = d3.geoPatterson().scale(1070)
      .translate([width / 2, height / 2]);
    const pathGenerator = d3.geoPath().projection(projection);
    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", function zoomed(event) {
        const { transform } = event;
        g.attr("transform", transform)
      });
    const countries = topojson.feature(data[0], data[0].objects.countries);
    console.log({ dataset })
    const datasetState = d3.group(dataset, d => d.Nation);
    const minDatasetState = d3.min(Array.from(datasetState.values())).length;
    const maxDatasetState = d3.max(Array.from(datasetState.values())).length;
    const svg = d3.select('#worldMap');

    // let colorscale = palette(datasetState)

    svg
      // .attr('height', height)
      // .attr('width', width)
      .attr("viewBox", [0, 0, width, height])
      .on("click", function reset() {
        svg.transition().duration(750).call(
          zoom.transform,
          d3.zoomIdentity,
          d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
        );
      })
      .call(zoom)

    const g = svg.append("g")

    g.append('rect')
      .attr('width', width)
      .attr('height', height)
      .style('fill', 'none')

    svg.selectAll('path').remove()      // Necessary to update the mapcolors

    projection.scale([200])
      .translate([width / 2, height / 1.7]);

    const logScale = d3.scaleLinear()
      .domain([minDatasetState, maxDatasetState])
      .range([0, 1]);

    //declaration of the tooltipCountry (extra info on over)
    const tooltipCountry = d3.select('body').append('div')
      .style('display', "none")
      .attr('class', 'd3-tip');

    g.append('g')
      .attr('id', 'states')
      .selectAll('path')
      .data(countries.features)
      .enter()
      .append('path')
      .attr('class', 'boundary')
      .attr('d', pathGenerator)
      .attr('id', d => d.properties.name)
      .style('fill', function (d) {
        if (colorPalette === 'Viridis') {
          return (datasetState.get(this.id)) ? d3.interpolateViridis(logScale(datasetState.get(this.id).length)) : '#444444'

        } else {
          return (datasetState.get(this.id)) ? d3.interpolateMagma(logScale(datasetState.get(this.id).length)) : '#444444'
        }
        // return (datasetState.get(this.id)) ? d3.interpolateViridis(linearScale(datasetState.get(this.id).length)) : d3.interpolateViridis(linearScale(0))
        // return (datasetState.get(this.id)) ? colorscale(logScale(datasetState.get(this.id).length)) : colorscale(logScale(0))
      })
      // .on('mouseover', function (d) {
      //   d3.select(this).style('stroke', 'orange');
      //   d3.select(this).style('stroke-opacity', '1');
      //   if (datasetState.get(this.id)) {
      //     d3.select('#state').text(this.id + ": " + datasetState.get(this.id).length);
      //   } else {
      //     d3.select('#state').text(this.id + ": 0");
      //   }
      //   // d3.select(this).style('fill', function (d) {
      //   //   return (datasetState.get(d.properties.name)) ? d3.interpolateViridis(linearScale(datasetState.get(this.id).length)) : d3.interpolateViridis(linearScale(0))
      //   // })
      // })
      .on('mousemove', function (d) {
        d3.select(this).style('stroke', 'coral');
        d3.select(this).style('stroke-opacity', '1');
        tooltipCountry.transition().duration(150)
          .style('display', "block");
        tooltipCountry.html(contentCountryTip(datasetState, d))
          .style('left', (d.clientX + 50) + 'px')
          .style('top', (d.clientY) + 'px');
        handleMouseMoveCountry(d);
      })
      .on('mouseout', function (d) {
        tooltipCountry.transition().duration(150)
          .style('display', "none");
        if (!colorChartBoolean) {
          handleMouseOutCountry()
        } else {
          handleMouseOutCountryChart(countriesChart)
        }
        // d3.select(this).style('fill', d3.interpolateViridis(linearScale(datasetState.get(this.id).length)));
        d3.select(this).style('stroke', 'white')
        d3.select(this).style('stroke-opacity', '0.4');
      })
      .on('click', function (d) {
        Table(datasetState.get(this.id))
      })
    // .call(d3.zoom().on("zoom", function (event) {
    //   projection.translate(event.translate).scale(event.scale);
    //   svg.selectAll('path').attr("d", pathGenerator)
    // }))

    // Remove the Antarctica State
    svg.select('#Antarctica').remove()
    Table(dataset)
  }


  // ---------------------------------------------------------------
  // Show additional information on the country (div that show/hide)
  function contentCountryTip(dataset, d) {
    const nPaper = (dataset.get(d.target.id)) ? dataset.get(d.target.id).length : "0"
    var content = "<h5 align='center'>Country</h5>";
    content += "<table align='center' id='tooltip'>" +
      "<tr><td>Name:</td> <td>" + d.target.id + "</td></tr>" +
      "<tr><td>Number of paper:</td><td align='left'>" + nPaper + "</td></tr>" +
      "</table>"
    return content;
  }


  // ---------------------------------------------------
  // Effect to highlight the country which you pass over
  function handleMouseMoveCountry(country) {
    d3.select("#worldMap").selectAll("path").transition().duration(100).style("opacity", function (d) {
      if (this.id === country.target.id)
        return "1";
      else
        return "0.4";
    });
  }


  // -------------------------------------
  // Reset of the "handleMouseMoveCountry"
  function handleMouseOutCountry() {
    d3.select("#worldMap").selectAll("path").transition().duration(150).style("opacity", "1");
  }


  // -------------------------------------
  // Reset of the "handleMouseMoveCountry"
  function handleMouseOutCountryChart(countries) {
    console.log({ countries })
    d3.select("#worldMap").selectAll("path").transition().duration(150).style("opacity", "0.4");
    countries.forEach(function (d) {
      d3.select("#worldMap").select(`path[id='${d}']`).transition().duration(100).style("opacity", "1")
    })
  }



});
