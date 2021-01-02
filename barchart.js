Promise.all([
    d3.json("Dataset201214Classification.json"),
    d3.json("CovidEuropean.json")
]).then(data => {
    const datasetClass = d3.group(data[0], d => d.Nation, d => d.Classification)
    console.log({ datasetClass })

    const listNation = []
    // const listNation = ['Italy', 'Germany']

    var svg = d3.select("#barchart"),
        margin = { top: 20, right: 20, bottom: 30, left: 40 },
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // The scale spacing the groups:
    var y0 = d3.scaleBand()
        .rangeRound([0, width])
        .paddingInner(0.1);

    // The scale for spacing each group's bar:
    var y1 = d3.scaleBand()
        .padding(0.05);

    var x = d3.scaleLinear()
        .rangeRound([height, 0]);

    var z = d3.scaleOrdinal()
        // .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56"]);

    // var keys = data.columns.slice(1);
    // const keys = Array.from(data[0], (v, k) => v.Classification).map(v => v.Classification).keys()
    // const keys = d3.map(data, function(d) {return d.value;}).keys()
    const keys = [...new Set(Array.from(data[0], v => v.Classification))]

    console.log(keys)



    console.log(datasetClass.get('Italy'))
    console.log(datasetClass.get('Germany'))

    // x0 --> y0
    // x1 --> y1
    // y  --> x

    y0.domain(datasetClass.values());
    y1.domain(keys).rangeRound([0, y0.bandwidth()]);
    x.domain([0, d3.max(data[0], function (d) { return d3.max(keys, function (key) { return d[key]; }); })]).nice();

    g.append("g")
        .selectAll("g")
        .data(datasetClass)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function (d) { return "translate(" + y0(d.Classification) + ",0)"; })
        .selectAll("rect")
        .data(function (d) { return keys.map(function (key) { return { key: key, value: d[key] }; }); })
        .enter().append("rect")
        .attr("x", function (d) { return x(d.value); })
        .attr("y", function (d) { return y1(d.key); })
        .attr("width", y1.bandwidth())
        .attr("height", function (d) { return height - y(d.value); })
        .attr("fill", function (d) { return z(d.key); });

    g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(y0));

    g.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(x).ticks(null, "s"))
        .append("text")
        .attr("x", 2)
        .attr("y", y(y.ticks().pop()) + 0.5)
        .attr("dy", "0.32em")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .text("Population");

    var legend = g.append("g")
        .attr("font-family", "sans-serif")
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
        .on("click", function (d) { update(d) });

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function (d) { return d; });

    var filtered = [];

    ////
    //// Update and transition on click:
    ////

    function update(d) {

        //
        // Update the array to filter the chart by:
        //

        // add the clicked key if not included:
        if (filtered.indexOf(d) == -1) {
            filtered.push(d);
            // if all bars are un-checked, reset:
            if (filtered.length == keys.length) filtered = [];
        }
        // otherwise remove it:
        else {
            filtered.splice(filtered.indexOf(d), 1);
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
        y.domain([0, d3.max(data, function (d) { return d3.max(keys, function (key) { if (filtered.indexOf(key) == -1) return d[key]; }); })]).nice();

        // update the y axis:
        svg.select(".y")
            .transition()
            .call(d3.axisLeft(y).ticks(null, "s"))
            .duration(500);


        //
        // Filter out the bands that need to be hidden:
        //
        var bars = svg.selectAll(".bar").selectAll("rect")
            .data(function (d) { return keys.map(function (key) { return { key: key, value: d[key] }; }); })

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

})