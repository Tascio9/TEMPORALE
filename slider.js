Promise.all([
    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'),
    d3.json("myFirstDatasetCleaned.json")
]).then(data => {
    // data[0] is the first dataset "world"
    // data[1] is the second dataset by me
    const minPublishTime = d3.min(data[1], d => d.Publish_time);
    const maxPublishTime = d3.max(data[1], d => d.Publish_time);

    const marginSlider = { top: 50, right: 40, bottom: 10, left: 0 }
    const widthSlider = "140";
    const heightSlider = "300";
    // const formatDate = d3.timeFormat('%Y-%m-%d');
    const rectWidth = Number(widthSlider) + marginSlider.left + marginSlider.right
    const rectHeight = Number(heightSlider) + marginSlider.top + marginSlider.bottom

    const svgSlider1 = d3.select("#slider")
        .attr("width", rectWidth)
        .attr("height", rectHeight).append("g")
        // classic transform to position g
        .attr("transform", "translate(" + marginSlider.left + "," + marginSlider.top + ")");

    const yearSelected = 2000

    const formatDate = d3.timeFormat('%B');
    const dateScale = d3.scaleTime()
        .domain([new Date(yearSelected, 0, 1), new Date(yearSelected, 11, 31)])
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
        .attr("transform", "translate(" + (Number(widthSlider) + 2) + " ," + (+5) + ")");
    const handle2 = svgSlider1.append("g")
        .attr("class", "handle2");
    handle2.append("path")
        // .attr("transform", "translate(0," + heightSlider / 2 + ")") --> Origianl one
        .attr("transform", "translate(" + widthSlider / 2 + ",0)")
        .attr("d", "M -60 0 H 60 60");
    const text2 = handle2.append('text')
        .text(formatDate(dateScale.domain()[1]))
        // .attr("transform", "translate(" + (-14) + " ," + (heightSlider / 2 - 45) + ")"); --> Original one
        .attr("transform", "translate(" + (Number(widthSlider) + 2) + " ," + (+5) + ")");
    handle1.attr('transform', 'translate(0,0)');
    // handle2.attr('transform', 'translate(' + widthSlider + ",0)");
    handle2.attr('transform', 'translate(0, ' + heightSlider + ')');

    function drawScatterPlotPaper() {
        // Compute summary statistics used for the box: outlier == paper
        const paper = data[1].filter(function (d) {
            return ((new Date(moment(d.Publish_time, 'YYYY-MM-DD').format('YYYY-MM-DD'))) >= dateScale.invert(0)
                && ((new Date(moment(d.Publish_time, 'YYYY-MM-DD').format('YYYY-MM-DD')))) <= dateScale.invert(heightSlider))
        });

        console.log({ paper })

        // g2 = new Map();
        // for (var i = 0; i < paper.length; i++) {
        //     if (g2.has(outlier[i].Timestamp) === false)
        //         g2.set(outlier[i].Timestamp, parseInt(outlier[i].TotalFwdPackets));
        //     else
        //         g2.set(outlier[i].Timestamp, g2.get(outlier[i].Timestamp) + parseInt(outlier[i].TotalFwdPackets));
        // }
        // g2 = new Map([...g2.entries()]);
        // day1Dot = Array.from(g2.keys()).sort(function (a, b) {
        //     return new Date(a) - new Date(b);
        // });
        // colorScaleDay1 = d3.scaleSequential(d3.interpolateViridis).domain([0, d3.max(Array.from(g2.values()))]);

        // var i = 15;
        // svgSlider1.selectAll(".dot")
        //     .data(day1Dot)
        //     //.data(newData)
        //     .enter().append("circle")
        //     .attr("class", "dotDay")
        //     .attr("r", 2.6)
        //     .attr("cy", function () {
        //         if (i >= 87)
        //             i = 15;
        //         else
        //             i += 7;
        //         return i;
        //     })
        //     .attr("cx", function (d) {
        //         return (timeScale1(new Date(moment(d, 'DDMMYYYY HH:mm').format('MM/DD/YYYY HH:mm'))))
        //     })
        //     .style("fill", function (d) {
        //         return colorScaleDay1(g2.get(d))
        //     });

        // continuous("#controller1", colorScaleDay1, 505, 427)
    }

    function upgradePaper() {
        // EVENT LISTENER SLIDER 1 DATA 4/7/2017
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
    }

    function filterPaperByDate(event) {
        const selection1 = d3.brushSelection(d3.select(".brush1").node());
        if (!event.sourceEvent || !selection1) return;
        // console.log({ selection1 })
        const [x0, x1] = selection1.map(d => d3.timeMonth.every(1).round(dateScale.invert(d)));
        d3.select(this).transition().call(brush1.move, x1 > x0 ? [x0, x1].map(dateScale) : null);

        const newData = data[1].filter(function (d) {
            return ((new Date(moment(d.Publish_time, 'YYYY-MM-DD').format('YYYY-MM-DD'))) >= dateScale.invert(selection1[0])
                && ((new Date(moment(d.Publish_time, 'YYYY-MM-DD').format('YYYY-MM-DD')))) <= dateScale.invert(selection1[1]))
        })

        console.log({ newData })

    }
})