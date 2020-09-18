Promise.all([
    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'),
    d3.json("myFirstDatasetCleaned.json")
]).then(data => {
    // data[0] is the first dataset "world"
    // data[1] is the second dataset by me

    const datasetState = d3.group(data[1], d => d.Nation);
    const minDatasetState = d3.min(Array.from(datasetState.values())).length;
    const maxDatasetState = d3.max(Array.from(datasetState.values())).length;

    var legendheight = 300,
        legendwidth = 180,
        margin = { top: 10, right: 60, bottom: 10, left: 8 };

    var canvas = d3.select('.map-div')
        .append("canvas")
        .attr("height", legendheight - margin.top - margin.bottom)
        .attr("width", 1)
        .style("height", (legendheight - margin.top - margin.bottom) + "px")
        .style("width", (legendwidth - margin.left - margin.right) + "px")
        .style("border", "1px solid #000")
        .style("position", "absolute")
        .style("top", (10) + "px")
        .style("left", (200) + "px")
        .node();

    var ctx = canvas.getContext("2d");

    const colorscale = d3.scaleSequential(d3.interpolateViridis)
        .domain([0, legendheight - 150])

    var legendscale = d3.scaleLinear()
        .domain([minDatasetState, maxDatasetState])
        .range([0, legendheight - margin.top - margin.bottom])
        .clamp(true)

    var image = ctx.createImageData(1, legendheight);
    d3.range(legendheight).forEach(function (i) {
        var c = d3.rgb(colorscale(legendscale.invert(i)));
        image.data[4 * i] = c.r;
        image.data[4 * i + 1] = c.g;
        image.data[4 * i + 2] = c.b;
        image.data[4 * i + 3] = 255;
    });
    ctx.putImageData(image, 0, 0);

    legendaxis = d3.axisRight()
        .scale(legendscale)
        .tickValues(legendscale.ticks(3).concat(legendscale.domain())).tickSize(4);

    tooltipLegendDay = d3.select('body').append('div')
        .style('display', "none")
        .attr('class', 'd3-tip');

    var svg = d3.select('#chart')
        .attr("height", (legendheight) + "px")
        .attr("width", (legendwidth) + "px")
        .style("position", "absolute")
        .on("mouseover", function () {
            tooltipLegendDay.style("left", d3.event.pageX + 30 + "px")
                .style("top", d3.event.pageY - 70 + "px")
                .style('display', "block")
                .html("N° Mlicious Packages");
        })
        .on("mouseout", function () {
            tooltipLegendDay.style('display', "none")
        });

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + (legendwidth - margin.left - margin.right + 3) + "," + (margin.top) + ")")
        .call(d3.axisRight()
            .scale(legendscale)
            .tickValues(legendscale.ticks(3).concat(legendscale.domain())).tickSize(4))
})