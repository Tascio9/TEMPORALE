d3.json("Dataset201214ClassificationCleaned.json", function (d, i, columns) {
    for (var i = 1, n = columns.length; i < n; ++i) d[columns[i]] = +d[columns[i]];
    return d;
}).then(data => {
    const datasetClass = d3.group(data, d => d.Nation, d => d.Classification)
    console.log({ datasetClass })

    // const listNation = []
    const listNation = ['Italy', 'Venezuela']
    console.log(datasetClass.get('Italy').get(0).length)
    // console.log(datasetClass.get('Germany'))

    var svg = d3.select("#barchart"),
        margin = { top: 20, right: 20, bottom: 30, left: 40 },
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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

    // d3.csv("data.csv", function (d, i, columns) {
    //     for (var i = 1, n = columns.length; i < n; ++i) d[columns[i]] = +d[columns[i]];
    //     return d;
    // }, function (error, data) {
    //     if (error) throw error;

    // var keys = data.Classification.value();
    const keys = [...new Set(Array.from(data, v => v.Classification))]
    console.log({ keys })
    console.log(keys.length)



    // x0.domain(data.map(function (d) { return d.State; }));
    // x1.domain(keys).rangeRound([0, x0.bandwidth()]);
    // y.domain([0, d3.max(data, function (d) { return d3.max(keys, function (key) { return d[key]; }); })]).nice();

    x0.domain(listNation);
    x1.domain(keys).rangeRound([0, x0.bandwidth()]);
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

    // g.append("g")
    //     .selectAll("g")
    //     .data(listNation)
    //     .enter().append("g")
    //     .attr("class", "bar")
    //     .attr("transform", function (d) { return "translate(" + x0(d) + ",0)"; })
    //     .selectAll("rect")
    //     .data(function (d) { return keys.map(function (key) { return { key: key, value: d[key] }; }); })
    //     .enter().append("rect")
    //     .attr("x", function (d) { return x1(d.key); })
    //     .attr("y", function (d) { return y(d.value); })
    //     .attr("width", x1.bandwidth())
    //     .attr("height", function (d) { return height - y(d.value); })
    //     .attr("fill", function (d) { return z(d.key); });

    let rect = g.append("g")
        .selectAll("g")
        .data(listNation)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function (d) { return "translate(" + x0(d) + ",0)"; })
        .selectAll("rect")
        .data(function (d) {
            // console.log(d)
            // keys.forEach(function (k) {
            //     console.log(k)
            //     let value
            //     try {
            //         value = datasetClass.get(d).get(k).length
            //     } catch {
            //         value = 0
            //     }
            //     console.log(value)
            //     return { key: k, value: value }
            // })

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
        .enter().append("rect")
        .attr("x", function (d) { return x1(d.key); })
        .attr("y", function (d) { return y(d.value); })
        .attr("width", x1.bandwidth())
        .attr("height", function (d) { return height - y(d.value); })
        .attr("fill", function (d) { return z(d.key); })
        // .on('mouseover', function (d) {
        //     console.log(d)
        //     d.target.append("text")
        //         .attr("class", "label")
        //         //y position of the label is halfway down the bar
        //         .attr("y", function (d) {
        //             return y(d.srcElement.__data__.value) + y.rangeBand() / 2 + 4;
        //         })
        //         //x position is 3 pixels to the right of the bar
        //         .attr("x", function (d) {
        //             return x(d.srcElement.__data__.key) + 3;
        //         })
        //         .text(function (d) {
        //             return d.srcElement.__data__.value;
        //         });
        //     console.log(d.srcElement.__data__.value)
        // })
        .attr('barchart-tippy', d => {
            const nPaper = d.value
            return `<div class="country-tippy">	
                    <b>Name</b> ${'&nbsp;'.repeat(2)}${d.key}<br>
                    <b>N° Paper</b> ${'&nbsp;'.repeat(1)}${nPaper}<br>
                </div>`
        })

    g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x0));

    g.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y).ticks(null, "s"))
        .append("text")
        .attr("x", 2)
        .attr("y", y(y.ticks().pop()) + 0.5)
        .attr("dy", "0.32em")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .text("N° Papers");

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
        .on("click", d => update(d));

    legend.append("text")
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
            .call(d3.axisLeft(y).ticks(null, "s"))
            .duration(500);


        //
        // Filter out the bands that need to be hidden:
        //
        var bars = svg.selectAll(".bar").selectAll("rect")
            // .data(function (d) { return keys.map(function (key) { return { key: key, value: d[key] }; }); })
            .data(function (d) {
                // return keys.map(function (key) { return { key: key, value: datasetClass.get(d).get(key).length }; }); 
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

})
