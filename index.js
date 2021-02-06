Promise.all([
  d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'),
  // d3.json("myFirstDatasetCleaned.json"),
  d3.json("Dataset210203ClassificationCleaned.json"),
  d3.json("CovidEuropean_20210206.json")
  // d3.json("https://opendata.ecdc.europa.eu/covid19/casedistribution/json")
]).then(data => {
  // data[0] is the first dataset "world"
  // data[1] is the second dataset by me
  // data[2] CovidEuropean: cases and deaths for nation + date
  const groupByYear = d3.group(data[1], d => d.Publish_time.split('-').slice(0, 1).join('-'))
  const groupByMonth = d3.group(data[1], d => d.Publish_time.split('-').slice(0, 2).join('-'))

  let yearValue = '2020'
  let yearDataset
  let colorChartBoolean = false           // Variable to set true when the brush on 'colorChart' happends
  let countriesChart = []                 // Variable to store the countries obtained by the brush action on 'colorChart'
  let colorPalette = d3.select('input[name="colorPalette"]:checked').property('value')
  let scale = d3.select('input[name="scale"]:checked').property('value')


  console.log({ colorPalette })
  console.log({ scale })
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

  yearValue = d3.select('#selectYear').property('value')

  const dataset2020 = groupByYear.get(yearValue)

  // Container LINE-CHART ---------------------------------------------------------------------
  // Draw the left chart bar for the colors
  chart(data[2])

  // Container LINE-CHART ---------------------------------------------------------------------
  // Draw the left chart bar for the colors
  selectChart()

  // Container CHART --------------------------------------------------------------------------
  // Draw the left chart bar for the colors
  // colorChart(data[1])
  colorChart(dataset2020)

  // Container BAR CHART --------------------------------------------------------------------------
  // Draw the barchart
  // colorChart(data[1])
  barchart(dataset2020)

  // Container MAP ----------------------------------------------------------------------------
  // Draw the map with the respective colors
  // colorMap(data[1])
  colorMap(dataset2020)

  // Container SLIDER -------------------------------------------------------------------------
  // sliderTime(data[1])
  sliderTime(dataset2020)

  // Container PAPER TABLE -------------------------------------------------------------------------
  // sliderTime(data[1])
  Table(dataset2020)

  // Handling events on:
  // - Dropdown selection
  d3.select('#selectYear').on('change', function (d) {
    if (this.value === 'All') {
      colorChartBoolean = false
      colorMap(data[1])
      colorChart(data[1])
      sliderTime(data[1])
      Table(data[1])
    } else {
      yearDataset = groupByYear.get(this.value)
      colorChartBoolean = false
      colorMap(yearDataset)
      colorChart(yearDataset)
      sliderTime(yearDataset)
      Table(yearDataset)
    }
    chart(data[2], '')
    selectChart()
  })

  // - Radio button on Palette
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

  // - Radio button on Scale
  d3.selectAll('input[name="scale"]').on('change', function () {
    scale = this.value
    yearDataset = groupByYear.get(d3.select('#selectYear').property('value'))
    colorChart(yearDataset)
    colorMap(yearDataset)
  });

  // - Button RESET
  d3.select('#buttonReset').on('click', function () {
    d3.select('#selectYear').property('value', '2020')
    chart(data[2], '')
    selectChart()
    colorChart(dataset2020)
    colorMap(dataset2020)
    sliderTime(dataset2020)
    Table(dataset2020)
    barchart(dataset2020)
  })

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


  // -----------------------------------------------------------------------------------------------
  // Draw the chart on the left according to the dataset and the scale in the check
  function colorChart(dataset) {
    const datasetState = d3.group(dataset, d => d.Nation);
    // const minDatasetState = d3.min(Array.from(datasetState.values())).length;
    // const maxDatasetState = d3.max(Array.from(datasetState.values())).length;

    let colorscale = palette(datasetState)
    let legendscale
    let legendscaleaxis
    let filterDataset = []

    const heightLegend = 200; // Original = 300
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

    if (scale === 'Linear') {
      legendscale = d3.scaleLinear()
        .range([1, heightLegend - marginLegend.top - marginLegend.bottom])
        .domain(colorscale.domain());
    } else {
      legendscale = d3.scaleLog()
        .range([1, heightLegend - marginLegend.top - marginLegend.bottom])
        .domain(colorscale.domain());
    }

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

    if (scale === 'Linear') {
      legendscaleaxis = d3.scaleLinear()
        .range([1, heightLegend - marginLegend.top - marginLegend.bottom])
        .domain(colorscale.domain())
        .nice();
    } else {
      legendscaleaxis = d3.scaleLog()
        .range([1, heightLegend - marginLegend.top - marginLegend.bottom])
        .domain(colorscale.domain())
        .nice();
    }

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
      .on("end", function filterView(event) {
        // it was .on("brush", ....
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
            console.log(d[1])
            d[1].forEach(function (e) {
              filterDataset.push(e)
            })
          }
        })
        if (filterDataset.length > 0) {
          console.log({ filterDataset })
          Table(filterDataset)
        } else {
          alert('No countries available in this range')
        }
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
    const marginSlider = { top: 10, right: 40, bottom: 10, left: 30 }
    const widthSlider = 100;
    const heightSlider = 190;  // Original = 290
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
            barchart(newData)
            Table(newData)
          } else {
            alert('No papers available in this period')
          }
          // colorChart(newData)
          // colorMap(newData)
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
          barchart(dataset)
          Table(dataset)
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
            barchart(newData)
            Table(newData)
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
          barchart(dataset)
          Table(dataset)
        })
        .call(brush1);

      svgSlider1.append("svg:defs").append("svg:marker")
        .attr("id", "arrow")
        .attr("refX", 6)
        .attr("refY", 6)
        .attr("markerWidth", 30)
        .attr("markerHeight", 30)
        .attr("markerUnits", "userSpaceOnUse")
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0 0 12 6 0 12 3 6")
        .style("fill", "red");

      const handle1 = svgSlider1.append("g")
        .attr("class", "handle1");
      handle1.append("path")
        .attr("transform", "translate(" + widthSlider / 2 + ",0)")
        .attr("d", "M -30 0 H -10 0")
        .attr('marker-end', 'url(#arrow)')
        .style("fill", "red")
      const text1 = handle1.append('text')
        .attr("class", "text")
        .text("From")
        // const text1 = handle1.append('text')
        //   .text(formatMonthLabel(dateScale.domain()[0]))
        .attr("transform", `translate(${-marginSlider.left},5)`);
      const handle2 = svgSlider1.append("g")
        .attr("class", "handle2");
      handle2.append("path")
        .attr("transform", "translate(" + widthSlider / 2 + ",0)")
        .attr("d", "M -30 0 H -10 0")
        .attr('marker-end', 'url(#arrow)')
        .style("fill", "red")
      const text2 = handle2.append('text')
        .attr("class", "text")
        .text("To")
        // const text2 = handle2.append('text')
        //   .text(formatMonthLabel(dateScale.domain()[1]))
        .attr("transform", `translate(${-marginSlider.left / 2},5)`);
      handle1.attr('transform', 'translate(0,0)');
      handle2.attr('transform', 'translate(0, ' + heightSlider + ')');
    }
  }


  // -------------------------------------------------------------------------------------------------
  // Based on this (https://observablehq.com/@d3/line-chart-with-tooltip), draw a chart using the dataset.
  // If a "nation" is passed, it draws the chart according to the nation passed.
  // CovidEuropean.json to see the cases and deaths
  // IDEA: https://bl.ocks.org/d3noob/5d621a60e2d1d02086bf
  // IDEA: https://bl.ocks.org/pbeshai/484d6bf04edcdecfc3731e00c062f47e
  function chart(dataset, nation) {
    const dayFormat = d3.timeFormat("%Y-%m-%d")
    const yearValue = d3.select('#selectYear').property('value')
    const formatMonthLabel = d3.timeFormat('%b');
    console.log({ dataset })

    let casesMap
    // let deathsMap
    let data = d3.group(dataset.records, d => d.countriesAndTerritories)

    if (nation) {
      nation = nation.split(" ").join("_")
      console.log(nation)
      data = data.get(nation)
      console.log(data)
      casesMap = d3.rollup(data, v => d3.sum(v, e => e.cases_weekly), function (k) {
        return dayFormat(new Date(moment(k.dateRep, 'DD/MM/YYYY').format("YYYY-MM-DD")))
      })
      // deathsMap = d3.rollup(data, v => d3.sum(v, e => e.deaths_weekly), function (k) {
      //   return dayFormat(new Date(moment(k.dateRep, 'DD/MM/YYYY').format("YYYY-MM-DD")))
      // })
    } else {
      casesMap = d3.rollup(dataset.records, v => d3.sum(v, e => e.cases_weekly), function (k) {
        return dayFormat(new Date(moment(k.dateRep, 'DD/MM/YYYY').format("YYYY-MM-DD")))
      })
      // deathsMap = d3.rollup(dataset.records, v => d3.sum(v, e => e.deaths_weekly), function (k) {
      //   return dayFormat(new Date(moment(k.dateRep, 'DD/MM/YYYY').format("YYYY-MM-DD")))
      // })
    }

    // const x = d3.group(data.records, d => d.dateRep)
    // const casesMap = d3.rollup(data.records, v => d3.sum(v, e => e.cases), k => k.dateRep);
    // const deathsMap = d3.rollup(data.records, v => d3.sum(v, e => e.deaths), k => k.dateRep);

    // STANDARD
    // const casesMap = d3.rollup(dataset.records, v => d3.sum(v, e => e.cases), function (k) {
    //   return dayFormat(new Date(moment(k.dateRep, 'DD/MM/YYYY').format("YYYY-MM-DD")))
    // })

    // const deathsMap = d3.rollup(dataset.records, v => d3.sum(v, e => e.deaths), function (k) {
    //   return dayFormat(new Date(moment(k.dateRep, 'DD/MM/YYYY').format("YYYY-MM-DD")))
    // })

    // OBJECT VERSION
    // const casesMap = d3.rollup(dataset.records, function (v) {
    //   return { date: dayFormat(new Date(moment(v[0].dateRep, 'DD/MM/YYYY').format("YYYY-MM-DD"))), cases: d3.sum(v, e => e.cases) }
    // }, function (k) {
    //   return dayFormat(new Date(moment(k.dateRep, 'DD/MM/YYYY').format("YYYY-MM-DD")))
    // })

    const casesArray = Array.from(casesMap)
    // const deathsArray = Array.from(deathsMap)

    // const test = Array.from(casesMap.values())
    // console.log({ casesMap })
    // console.log({ deathsMap })

    casesArray.sort((x, y) => d3.ascending(x[0], y[0]))
    // deathsArray.sort((x, y) => d3.ascending(x[0], y[0]))
    const casesFilteredByYear = casesArray.filter(d => new Date(d[0]).getFullYear() == yearValue)
    // const deathsFilteredByYear = deathsArray.filter(d => new Date(d[0]).getFullYear() == yearValue)


    // console.log({ casesArray })
    // console.log({ casesFilteredByYear })

    const width = 1000
    const height = 300
    // const margin = ({ top: 20, right: 70, bottom: 70, left: 120 })
    const margin = ({ top: 20, right: 20, bottom: 30, left: 75 })

    d3.select('#line-chart').remove()
    d3.select('.chart').append('svg').attr('id', 'line-chart')

    const svg = d3.select('#line-chart')
      .attr("viewBox", [0, 0, width, height])

    // Add a clipPath: everything out of this area won't be drawn.
    var clip = svg.append("defs").append("svg:clipPath")
      .attr("id", "clip")
      .append("svg:rect")
      .attr("fill", "red")
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom)
      .attr("x", margin.left)
      .attr("y", margin.top);

    const x = d3.scaleTime()
      .domain([new Date(moment(d3.min(casesFilteredByYear, d => d[0]), 'YYYY-MM-DD')), new Date(moment(d3.max(casesFilteredByYear, d => d[0]), 'YYYY-MM-DD'))])
      .range([margin.left, width - margin.right])

    const y = d3.scaleLinear()
      .domain([0, d3.max(Array.from(casesFilteredByYear), d => d[1])]).nice()
      .range([height - margin.bottom, margin.top])

    const line = d3.line()
      // .curve(d3.curveStep)
      .defined(d => !isNaN(new Date(moment(d[0], 'YYYY-MM-DD').format('YYYY-MM-DD'))))
      .defined(d => !isNaN(d[1]))
      .x(d => x(new Date(moment(d[0], 'YYYY-MM-DD').format('YYYY-MM-DD'))))
      .y(d => y(d[1]))

    // A function that set idleTimeOut to null
    var idleTimeout
    function idled() { idleTimeout = null; }

    const brush = d3.brushX()
      // .extent([[0, 0], [width - margin.left - margin.right, height - margin.top - margin.bottom]])
      // .extent([[0, 0], [width - margin.left - margin.right, 30]])
      .extent([[margin.left, 0], [width - margin.right, 30]])
      .on("end", function updateChart(event) {
        extent = event.selection

        // If no selection, back to initial coordinate. Otherwise, update X axis domain and Y domain
        if (!extent) {
          if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
          x.domain([new Date(moment(d3.min(casesFilteredByYear, d => d[0]), 'YYYY-MM-DD')), new Date(moment(d3.max(casesFilteredByYear, d => d[0]), 'YYYY-MM-DD'))]).nice()
          y.domain([0, d3.max(Array.from(casesFilteredByYear), d => d[1])]).nice()
        } else {
          const test = casesFilteredByYear.filter(d => new Date(d[0]) >= x.invert(extent[0]) && new Date(d[0]) <= x.invert(extent[1]))
          // console.log(test)
          x.domain([x.invert(extent[0]), x.invert(extent[1])]).nice()
          y.domain([0, d3.max(Array.from(test), d => d[1])]).nice()
          d3.select(this).call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
        }

        // Update axis and line position
        d3.select('#xDate').transition().duration(1000).call(
          d3.axisBottom(x)
            .ticks(width / 160)
          // .tickSizeOuter(0)
        ).attr("font-size", "1vh").attr("color", "white")

        d3.select('#yNumber').transition().duration(1000).call(d3.axisLeft(y))
          .attr("color", "white")
          .on("start", () => {
            d3.select('#yNumber')
            // .select(".domain").remove()                  // Remove the y-axis line
          })

        d3
          .select('#cases')
          .transition()
          .duration(1000)
          .attr('d', d3.line()
            .x(d => x(new Date(moment(d[0], 'YYYY-MM-DD').format('YYYY-MM-DD'))))
            .y(d => y(d[1]))
          )

        d3.selectAll(".dot") // change the circle
          .transition()
          .duration(1000)
          .attr("cx", function (d, i) { return x(new Date(moment(d[0], 'YYYY-MM-DD').format('YYYY-MM-DD'))) })
          .attr("cy", function (d) { return y(d[1]) })

        tippy('[circlechart-tippy]', {
          content(reference) {
            return reference.getAttribute('circlechart-tippy')
          },
          allowHTML: true,
          performance: true,
          arrow: true,
          size: 'large',
          animation: 'scale',
          // followCursor: 'initial'
          // placement: 'auto-start',
          // followCursor: 'vertical',
        })

        // d3
        //   .select('#deaths')
        //   .transition()
        //   .duration(1000)
        //   .attr('d', d3.line()
        //     .x(d => x(new Date(moment(d[0], 'YYYY-MM-DD').format('YYYY-MM-DD'))))
        //     .y(d => y(d[1]))
        //   )
      })

    const xAxis = g => g
      .attr("id", "xDate")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x)
        .tickFormat(d => formatMonthLabel(d))
        .ticks(width / 80)
        //  .tickSizeOuter(0)                   // Remove the last tick
      )
      .attr("font-size", "1vh")
      .attr("color", "white")
      .call(brush)
    // .call(g => g.select(".tick:last-of-type text")
    //   .attr("x", 3)
    //   .attr("text-anchor", "middle")
    //   .attr("font-weight", "bold")
    //   .text('Number')
    // )

    const yAxis = g => g
      .attr("id", "yNumber")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      // .attr("font-size", "1vh")
      .attr("color", "white")
    // .call(g => g.select(".domain").remove())                // Remove the y-axis line


    svg.append("g")
      .call(xAxis);

    svg.append("text")      // text label for the x axis
      .attr("transform", `translate(${width / 2},${height})`)
      .attr("fill", "white")
      .attr("font-size", "1vh")
      .attr("font-weight", "bold")
      .style("text-anchor", "middle")
      .text("Date");

    svg.append("g")
      .call(yAxis);

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("x", 0 - (height / 2) + margin.top)
      .attr("dy", "1em")
      .attr("fill", "white")
      .attr("font-size", "1vh")
      .attr("font-weight", "bold")
      .style("text-anchor", "middle")
      .text("Number");


    var plan = svg.append('g')
      .attr("id", "plan")
      .attr("clip-path", "url(#clip)")

    plan.append("path")
      .attr("id", "cases")
      .datum(casesFilteredByYear)
      .attr("fill", "none")
      // .attr("stroke", "steelgreen")
      .attr("stroke", "#45bd20")
      .attr("stroke-width", 3)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", line)

    var dots = plan.selectAll(".dot")
      .data(casesFilteredByYear)
      .enter().append("circle") // Uses the enter().append() method
      .attr("class", "dot") // Assign a class for styling
      // .attr("stroke", "steelblue")
      .attr("stroke", "#222222")
      .attr("fill", "#45bd20")
      .attr("cx", function (d, i) { return x(new Date(moment(d[0], 'YYYY-MM-DD').format('YYYY-MM-DD'))) })
      .attr("cy", function (d) { return y(d[1]) })
      .attr("r", 5)
      .attr('circlechart-tippy', d => {
        return `<div class="country-tippy">	
              <b>Date</b> ${'&nbsp;'.repeat(2)}${d[0]}<br>
              <b>Cases</b> ${'&nbsp;'.repeat(1)}${d[1]}<br>
          </div>`
      });

    // plan.append("path")
    //   .attr("id", "deaths")
    //   .datum(deathsFilteredByYear)
    //   .attr("fill", "none")
    //   .attr("stroke", "#fb1e05")
    //   .attr("stroke-width", 3)
    //   .attr("stroke-linejoin", "round")
    //   .attr("stroke-linecap", "round")
    //   .attr("d", line).attr('deathschart-tippy', d => {
    //     return `<div class="country-tippy">	
    //         <b>Date</b> ${'&nbsp;'.repeat(2)}${d[0]}<br>
    //         <b>N° Paper</b> ${'&nbsp;'.repeat(1)}${d[1]}<br>
    //     </div>`
    //   });

    svg.on('dblclick', function reset() {
      x.domain([new Date(moment(d3.min(casesFilteredByYear, d => d[0]), 'YYYY-MM-DD')), new Date(moment(d3.max(casesFilteredByYear, d => d[0]), 'YYYY-MM-DD'))])
      y.domain([0, d3.max(Array.from(casesFilteredByYear), d => d[1])]).nice()

      d3.select('#xDate')
        .transition()
        .duration(1000)
        .call(d3.axisBottom(x)
          .tickFormat(d => formatMonthLabel(d))
          .ticks(width / 80)
          // .tickSizeOuter(0)
        )

      d3.select('#yNumber')
        .transition()
        .duration(1000)
        .call(yAxis)
        .on("start", () => {
          d3.select('#yNumber')
          // .select(".domain").remove() 
        })


      plan
        .select('#cases')
        .transition()
        .duration(1000)
        .attr('d', d3.line()
          .x(d => x(new Date(moment(d[0], 'YYYY-MM-DD').format('YYYY-MM-DD'))))
          .y(d => y(d[1]))
        )

      d3.selectAll(".dot") // change the circle
        .transition()
        .duration(1000)
        .attr("cx", function (d, i) { return x(new Date(moment(d[0], 'YYYY-MM-DD').format('YYYY-MM-DD'))) })
        .attr("cy", function (d) { return y(d[1]) })

      tippy('[circlechart-tippy]', {
        content(reference) {
          return reference.getAttribute('circlechart-tippy')
        },
        allowHTML: true,
        performance: true,
        arrow: true,
        size: 'large',
        animation: 'scale',
        // followCursor: 'initial'
        // placement: 'auto-start',
        // followCursor: 'vertical',
      })
      // plan
      //   .select('#deaths')
      //   .transition()
      //   .duration(1000)
      //   .attr('d', d3.line()
      //     .x(d => x(new Date(moment(d[0], 'YYYY-MM-DD').format('YYYY-MM-DD'))))
      //     .y(d => y(d[1]))
      //   )
    })

    tippy('[circlechart-tippy]', {
      content(reference) {
        return reference.getAttribute('circlechart-tippy')
      },
      allowHTML: true,
      performance: true,
      arrow: true,
      size: 'large',
      animation: 'scale',
      // followCursor: 'initial'
      // placement: 'auto-start',
      // followCursor: 'vertical',
    })

  }

  // -----------------------------------------------------------------------------------------------
  // Given a dataset, draw the barchart
  // If the is "nation", which is a list of countries, it draws the list of countries inside "nation"
  function selectChart(nation) {
    d3.select('#selectChart').remove()

    d3.select('.selectChart-div').append('select')
      .attr('id', 'selectChart')
      .attr('class', 'selectChartCountries')
      .append('option')
      .attr('value', 'World')
      .text('-- World --')

    if (nation) {
      for (let d of nation) {
        d3.select('#selectChart')
          .append('option')
          .attr('value', d)
          .text(d)
      }
      // if (nation.length == '1') {
      //   console.log("Dentro")
      //   d3.select('#selectChart').property('value', nation[0])
      // }
    }


    // - Dropdown selection
    d3.select('#selectChart').on('change', function (d) {
      if (this.value === 'World') {
        chart(data[2], '')
      } else {
        chart(data[2], this.value)
      }
    })
  }

  // -----------------------------------------------------------------------------------------------
  // Given a dataset, draw the barchart
  // If the is "nation", which is a list of countries, it draws the list of countries inside "nation"
  function barchart(dataset, nation) {
    var listNation = []

    const datasetClass = d3.group(dataset, d => d.Nation, d => d.Classification)
    console.log({ datasetClass })

    if (nation === undefined || nation.length == 0) {
      const sortDataset = Array.from(d3.group(dataset, d => d.Nation)).sort((x, y) => d3.descending(x[1], y[1]))
      console.log(sortDataset.slice(0, 5))
      for (let elem of sortDataset.slice(0, 5)) {
        listNation.push(elem[0])
      }
    } else {
      listNation = nation
    }

    var width = 1000
    var height = 300

    d3.select('#barchart').remove()
    d3.select('.barchart-div')
      .append('svg')
      .attr('id', 'barchart')
      // .attr('width', 620)
      // .attr('height', 200)
      .attr("viewBox", [0, 0, width, height])

    // width="550" height="200"

    var svg = d3.select("#barchart")
    margin = { top: 20, right: 20, bottom: 30, left: 75 }

    width = +width - margin.left - margin.right
    height = +height - margin.top - margin.bottom
    g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // The scale spacing the groups:
    var x0 = d3.scaleBand()
      .rangeRound([0, width])
      .paddingInner(0.1);

    // The scale for spacing each group's bar:
    var x1 = d3.scaleBand()
      .padding(0.05);

    var y = d3.scaleLinear()
      .rangeRound([height, 0]);

    var z = d3.scaleOrdinal()
      .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    const keys = [...new Set(Array.from(dataset, v => v.Classification))]
    console.log({ keys })

    x0.domain(listNation);
    x1.domain(keys).rangeRound([0, x0.bandwidth()]);
    // y.domain([0, d3.max(listNation, function (d) { return d3.max(keys, function (key) { return datasetClass.get(d).get(key).length; }); })]).nice();
    y.domain([0, d3.max(listNation, function (d) {
      return d3.max(keys, function (key) {
        let value
        try {
          value = datasetClass.get(d).get(key).length;
        } catch {
          value = 0
        }
        return value
      });
    })]).nice();

    g.append("g")
      .selectAll("g")
      .data(listNation)
      .enter().append("g")
      .attr("class", "bar")
      .attr("transform", function (d) { return "translate(" + x0(d) + ",0)"; })
      .selectAll("rect")
      .data(function (d) {
        return keys.map(function (key) {
          console.log(key) // 0, 1, 2, 3, 4
          let value
          try {
            value = datasetClass.get(d).get(key).length
          } catch {
            value = 0
          }
          console.log(value)
          return { key: key, value: value };
        });
      })
      .enter().append("rect")
      .attr("x", function (d) { return x1(d.key); })
      .attr("y", function (d) { return y(d.value); })
      .attr("width", x1.bandwidth())
      .attr("height", function (d) { return height - y(d.value); })
      .attr("fill", function (d) { return z(d.key); })
      .attr('barchart-tippy', d => {
        const nPaper = d.value
        return `<div class="country-tippy">	
                <b>Class</b> ${'&nbsp;'.repeat(2)}${d.key}<br>
                <b>N° Paper</b> ${'&nbsp;'.repeat(1)}${nPaper}<br>
            </div>`
      });

    g.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x0));


    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("x", 0 - (height / 2) - margin.top)
      .attr("dy", "1em")
      .attr("fill", "white")
      .attr("font-size", "1vh")
      .attr("font-weight", "bold")
      .style("text-anchor", "middle")
      .text("N° Paper");

    g.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(y).ticks())   // .ticks(null, "s") ---> 0.1k, 0,2k scale..
    // .append("text")
    // .attr("x", 2)
    // .attr("y", y(y.ticks().pop()) + 0.5)
    // .attr("dy", "0.32em")
    // .attr("fill", "#FFF")
    // .attr("font-weight", "bold")
    // .attr("text-anchor", "start")
    // .text("N° Papers");

    var legend = g.append("g")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
      .selectAll("g")
      .data(keys.slice().reverse())
      .enter().append("g")
      .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
      .attr("x", width - 17)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", z)
      .attr("stroke", z)
      .attr("stroke-width", 2)
      .on("click", d => update(d));

    legend.append("text")
      .attr("fill", "#FFF")
      .attr("x", width - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function (d) { return d; });

    var filtered = [];

    tippy('[barchart-tippy]', {
      content(reference) {
        return reference.getAttribute('barchart-tippy')
      },
      allowHTML: true,
      performance: true,
      arrow: true,
      size: 'large',
      animation: 'scale',
      // placement: 'auto-start',
      // followCursor: 'vertical',
    })

    ////
    //// Update and transition on click:
    ////

    function update(d) {

      var label = d.originalTarget.__data__

      //
      // Update the array to filter the chart by:
      //

      // add the clicked key if not included:
      if (filtered.indexOf(label) == -1) {
        filtered.push(label);
        // if all bars are un-checked, reset:
        if (filtered.length == keys.length) filtered = [];
      }
      // otherwise remove it:
      else {
        filtered.splice(filtered.indexOf(label), 1);
      }

      //
      // Update the scales for each group(/states)'s items:
      //
      var newKeys = [];
      keys.forEach(function (d) {
        if (filtered.indexOf(d) == -1) {
          newKeys.push(d);
        }
      })
      x1.domain(newKeys).rangeRound([0, x0.bandwidth()]);
      // y.domain([0, d3.max(data, function (d) { return d3.max(keys, function (key) { if (filtered.indexOf(key) == -1) return d[key]; }); })]).nice();
      // y.domain([0, d3.max(listNation, function (d) { return d3.max(keys, function (key) { if (filtered.indexOf(key) == -1) return datasetClass.get(d).get(key).length; }); })]).nice();
      y.domain([0, d3.max(listNation, function (d) {
        return d3.max(keys, function (key) {
          let value
          try {
            if (filtered.indexOf(key) == -1) value = datasetClass.get(d).get(key).length;
          } catch {
            value = 0
          }
          return value
        });
      })]).nice();

      // update the y axis:
      svg.select(".y")
        .transition()
        .call(d3.axisLeft(y).ticks())  // .ticks(null, "s")
        .duration(500);


      //
      // Filter out the bands that need to be hidden:
      //
      var bars = svg.selectAll(".bar").selectAll("rect")
        // .data(function (d) { return keys.map(function (key) { return { key: key, value: d[key] }; }); })
        // .data(function (d) { return keys.map(function (key) { return { key: key, value: datasetClass.get(d).get(key).length }; }); })
        .data(function (d) {
          console.log(d) // Italy, Venezuela
          return keys.map(function (key) {
            console.log(key) // 0, 1, 2, 3, 4
            let value
            try {
              value = datasetClass.get(d).get(key).length
            } catch {
              value = 0
            }
            console.log(value)
            return { key: key, value: value };
          });
        })

      bars.filter(function (d) {
        return filtered.indexOf(d.key) > -1;
      })
        .transition()
        .attr("x", function (d) {
          return (+d3.select(this).attr("x")) + (+d3.select(this).attr("width")) / 2;
        })
        .attr("height", 0)
        .attr("width", 0)
        .attr("y", function (d) { return height; })
        .duration(500);

      //
      // Adjust the remaining bars:
      //
      bars.filter(function (d) {
        return filtered.indexOf(d.key) == -1;
      })
        .transition()
        .attr("x", function (d) { return x1(d.key); })
        .attr("y", function (d) { return y(d.value); })
        .attr("height", function (d) { return height - y(d.value); })
        .attr("width", x1.bandwidth())
        .attr("fill", function (d) { return z(d.key); })
        .duration(500);


      // update legend:
      legend.selectAll("rect")
        .transition()
        .attr("fill", function (d) {
          if (filtered.length) {
            if (filtered.indexOf(d) == -1) {
              return z(d);
            }
            else {
              return "white";
            }
          }
          else {
            return z(d);
          }
        })
        .duration(100);
    }
  }
  // --------------------------------------------------------------------------------
  // Draw the map according to the dataset passed, which inside there are the papers.
  function colorMap(dataset) {
    const widthWindow = window.innerWidth
    const heightWindow = window.innerHeight
    const height = heightWindow - 288;
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
    const datasetState = d3.group(dataset, d => d.Nation);
    const minDatasetState = d3.min(Array.from(datasetState.values())).length;
    const maxDatasetState = d3.max(Array.from(datasetState.values())).length;

    d3.select('#worldMap').remove()
    d3.select('.map-div')
      .append('svg')
      .attr('id', 'worldMap')

    const svg = d3.select('#worldMap');

    let colorScale
    var chosenNation = []

    // let colorscale = palette(datasetState)
    console.log({ datasetState })

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

    // svg.selectAll('path').remove()      // Necessary to update the mapcolors

    projection.scale([200])
      .translate([width / 2, height / 1.7]);

    if (scale === 'Linear') {
      colorScale = d3.scaleLinear()
        .domain([minDatasetState, maxDatasetState])
        .range([0, 1]);
    } else {
      colorScale = d3.scaleLog()
        .domain([minDatasetState, maxDatasetState])
        .range([0, 1]);
    }

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
          return (datasetState.get(this.id)) ? d3.interpolateViridis(colorScale(datasetState.get(this.id).length)) : '#444444'

        } else {
          return (datasetState.get(this.id)) ? d3.interpolateMagma(colorScale(datasetState.get(this.id).length)) : '#444444'
        }
        // return (datasetState.get(this.id)) ? d3.interpolateViridis(linearScale(datasetState.get(this.id).length)) : d3.interpolateViridis(linearScale(0))
        // return (datasetState.get(this.id)) ? colorscale(logScale(datasetState.get(this.id).length)) : colorscale(logScale(0))
      })
      .attr('country-tippy', d => {
        const nPaper = (datasetState.get(d.properties.name)) ? datasetState.get(d.properties.name).length : "0"
        return `<div class="country-tippy">	
				<b>Name</b> ${'&nbsp;'.repeat(2)}${d.properties.name}<br>
				<b>N° Paper</b> ${'&nbsp;'.repeat(1)}${nPaper}<br>
			</div>`
      })
      // // .on('mouseover', function (d) {
      // //   d3.select(this).style('stroke', 'orange');
      // //   d3.select(this).style('stroke-opacity', '1');
      // //   if (datasetState.get(this.id)) {
      // //     d3.select('#state').text(this.id + ": " + datasetState.get(this.id).length);
      // //   } else {
      // //     d3.select('#state').text(this.id + ": 0");
      // //   }
      // //   // d3.select(this).style('fill', function (d) {
      // //   //   return (datasetState.get(d.properties.name)) ? d3.interpolateViridis(linearScale(datasetState.get(this.id).length)) : d3.interpolateViridis(linearScale(0))
      // //   // })
      // // })
      // .on('mousemove', function (d) {
      //   if (chosenNation === undefined || chosenNation.length == 0) {
      //     d3.select(this).style('stroke', 'coral');
      //     d3.select(this).style('stroke-opacity', '1');
      //     tooltipCountry.transition().duration(150)
      //       .style('display', "block");
      //     tooltipCountry.html(contentCountryTip(datasetState, d))
      //       .style('left', (d.clientX + 50) + 'px')
      //       .style('top', (d.clientY) + 'px');
      //     handleMouseMoveCountry(d);
      //   }
      // })
      // .on('mouseout', function (d) {
      //   tooltipCountry.transition().duration(150)
      //     .style('display', "none");
      //   if (chosenNation === undefined || chosenNation.length == 0) {
      //     if (!colorChartBoolean) {
      //       handleMouseOutCountry()
      //     } else {
      //       handleMouseOutCountryChart(countriesChart)
      //     }
      //     // d3.select(this).style('fill', d3.interpolateViridis(linearScale(datasetState.get(this.id).length)));
      //     d3.select(this).style('stroke', 'white')
      //     d3.select(this).style('stroke-opacity', '0.4');
      //   }
      // })
      // // .on('click', function (d) {
      // //   Table(datasetState.get(this.id))
      // //   chart(data[2], this.id)
      // // })
      .on('mousedown', function (event, d) {
        if (event.ctrlKey) {
          if (chosenNation.includes(d.properties.name)) {
            var removeNationIndex = chosenNation.indexOf(d.properties.name)
            if (removeNationIndex > -1) {
              chosenNation.splice(removeNationIndex, 1);
            }
          } else {
            if (chosenNation.length > 4) {
              chosenNation.shift()
            }
            chosenNation.push(d.properties.name)
          }
          multipleChosenNation(chosenNation)
          selectChart(chosenNation)
          // chart(data[2], chosenNation)
          barchart(dataset, chosenNation)
        } else if (navigator.appVersion.indexOf("Mac") != -1 && event.metaKey) {
          console.log("CMD")
          if (chosenNation.includes(d.properties.name)) {
            var removeNationIndex = chosenNation.indexOf(d.properties.name)
            if (removeNationIndex > -1) {
              chosenNation.splice(removeNationIndex, 1);
            }
          } else {
            if (chosenNation.length > 4) {
              chosenNation.shift()
            }
            chosenNation.push(d.properties.name)
          }
          multipleChosenNation(chosenNation)
          selectChart(chosenNation)
          // chart(data[2], chosenNation)
          barchart(dataset, chosenNation)
        }
        else {
          chosenNation = []
          chosenNation.push(this.id)
          var clickedNation = datasetState.get(this.id)
          d3.selectAll('path').style('stroke', 'white')
          d3.selectAll('path').style('stroke-opacity', '0.4');
          d3.select("#worldMap").selectAll("path").transition().duration(150).style("opacity", "1");
          chart(data[2], this.id)
          selectChart(chosenNation)
          barchart(dataset, chosenNation)
          Table(clickedNation)
        }
      })
    // .call(d3.zoom().on("zoom", function (event) {
    //   projection.translate(event.translate).scale(event.scale);
    //   svg.selectAll('path').attr("d", pathGenerator)
    // }))

    // Remove the Antarctica State
    svg.select('#Antarctica').remove()

    // Init Tippy for each country
    tippy('[country-tippy]', {
      content(reference) {
        return reference.getAttribute('country-tippy')
      },
      allowHTML: true,
      performance: true,
      arrow: true,
      size: 'large',
      animation: 'scale',
      followCursor: 'horizontal',
      // placement: 'auto-start',
      // followCursor: 'vertical',
    })
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

  // -------------------------------------
  function multipleChosenNation(countries) {
    // console.log({ countries })
    if (countries.length > 0) {
      d3.select("#worldMap").selectAll("path").transition().duration(150).style("opacity", "0.4");
      countries.forEach(function (d) {
        d3.select("#worldMap").select(`path[id='${d}']`).transition().duration(100).style("opacity", "1")
      })
    } else {
      d3.select("#worldMap").selectAll("path").transition().duration(150).style("opacity", "1");
    }
  }
}).then(unlockUI);

// function lockUI() {
//   return new Promise(function () {
//     console.log("lockUI")
//   })
// }

async function lockUI() {
  try {
    console.log("LockUI")
    document.getElementById("overlay").style.display = "block";
    document.getElementById("loader").style.display = "block";

  } catch (error) {
    console.log(error)
  }
}

function unlockUI() {
  console.log("UnlockUI")
  document.getElementById("overlay").style.display = "none";
  document.getElementById("loader").style.display = "none";
}

// $('#main').on("load", function (event) {
//   document.getElementById("overlay").style.display = "block";
//   document.getElementById("loader").style.display = "block";
// })