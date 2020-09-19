Promise.all([
    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'),
    d3.json("myFirstDatasetCleaned.json")
]).then(data => {
    // data[0] is the first dataset "world"
    // data[1] is the second dataset by me

    const datasetState = d3.group(data[1], d => d.Nation);
    const minDatasetState = d3.min(Array.from(datasetState.values())).length;
    const maxDatasetState = d3.max(Array.from(datasetState.values())).length;

    const legendheight = 700,
        legendwidth = 100,
        margin = { top: 10, right: 60, bottom: 10, left: 8 };

    const svgChart = d3.select('#chart')
        .attr("height", (legendheight + margin.top + margin.bottom) + "px")
        .attr("width", (legendwidth + margin.left + margin.right) + "px")

    svgChart.append('rect')
        .attr('height', legendheight)
        .attr('width', legendwidth)
        .append('canvas')
        .attr('id', 'mycanvas')
        // .style('fill', 'white')
        // .style('opacity', '0.4')
        .style("cursor", "crosshair")

    const canvas = document.getElementById('mycanvas')

    const ctx = canvas.getContext("2d");

    const colorscale = d3.scaleSequential(d3.interpolateViridis)
        .domain([minDatasetState, maxDatasetState])

    const legendscale = d3.scaleLog()
        .domain(colorscale.domain())
        .range([0, legendheight])
        .clamp(true)

    svgChart.selectAll(".bars")
        .data(d3.range(legendheight), d => d)
        .enter()
        .append('rect')
        .attr('class', 'bars')
        .attr('x', 0)
        .attr('y', (d, i) => i)
        .attr('height', 1)
        .attr('width', legendwidth)
        .style('fill', (d, i) => legendscale.invert(d));

    // const canvas = d3.select('.map-div').append('g')
    //     .attr('class', 'canbru')
    //     .append("canvas")
    //     .attr("height", legendheight)
    //     .attr("width", 1)
    //     .style("height", (legendheight) + "px")
    //     .style("width", (legendwidth - margin.left - margin.right) + "px")
    //     .style("border", "1px solid #000")
    //     .style("position", "absolute")
    //     .node();

    // const ctx = canvas.getContext("2d");

    // const image = ctx.createImageData(1, legendheight);

    // d3.range(legendheight).forEach(function (i) {
    //     var c = d3.rgb(colorscale(legendscale.invert(i)));
    //     image.data[4 * i] = c.r;
    //     image.data[4 * i + 1] = c.g;
    //     image.data[4 * i + 2] = c.b;
    //     image.data[4 * i + 3] = 255;
    // });
    // ctx.putImageData(image, 0, 0);

    const legendaxis = d3.axisRight()
        .scale(legendscale)
        .tickValues(legendscale.ticks(3).concat(legendscale.domain()))
        .tickSize(4);

    // const svg = d3.select('#chart')
    //     .attr("height", (legendheight + margin.top + margin.bottom) + "px")
    //     .attr("width", (legendwidth + margin.left + margin.right) + "px")
    //     .style("position", "absolute")

    const brush = d3.brushY()
        .extent([[0, 0], [legendwidth, legendheight]])
    // .on("brush", upgradePaper)
    // .on("end", filterPaperByDate);

    // svg.append('rect')
    //     .attr('height', legendheight)
    //     .attr('width', legendwidth)
    //     .style('fill', 'white')
    //     .style('opacity', '0.4')
    //     .style("cursor", "crosshair")
    //     .style("position", "absolute")
    //     .call(brush)

    svgChart.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + (legendwidth) + "," + (0) + ")")
        .call(legendaxis)

    // function upgradePaper() {
    //     selection1 = d3.brushSelection(d3.select(".brush").node());
    //     handle1.attr('transform', 'translate(0,' + selection1[0] + ')')
    //     handle2.attr('transform', 'translate(0,' + selection1[1] + ')')
    // }
})