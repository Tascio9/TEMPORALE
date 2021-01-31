d3.json("CovidEuropean_new.json").then(function (data) {
    console.log('line-chart.js')
    console.log({ data })
    const dayFormat = d3.timeFormat("%Y-%m-%d")
    // const x = d3.group(data.records, d => d.dateRep)
    // const casesMap = d3.rollup(data.records, v => d3.sum(v, e => e.cases), k => k.dateRep);

    // ------ ORIGINAL
    const casesMap = d3.rollup(data.records, v => d3.sum(v, e => e.cases_weekly), function (k) {
        return dayFormat(new Date(moment(k.dateRep, 'DD/MM/YYYY').format("YYYY-MM-DD")))
    })
    // const deathsMap = d3.rollup(data.records, v => d3.sum(v, e => e.deaths), k => k.dateRep);
    const deathsMap = d3.rollup(data.records, v => d3.sum(v, e => e.deaths_weekly), function (k) {
        return dayFormat(new Date(moment(k.dateRep, 'DD/MM/YYYY').format("YYYY-MM-DD")))
    })
    // ---------------

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

    const test = Array.from(casesMap)
    console.log({ casesMap })
    console.log({ deathsMap })

    const filterCasesByYear = new Map()

    casesMap.forEach(function (v, k) {
        const date = k.split('-')
        if (date[0] === "2020") {
            filterCasesByYear.set(k, v)
        }
    });

    test.sort((x, y) => d3.ascending(x[0], y[0]))
    const filter = test.filter(d => new Date(d[0]).getFullYear() === 2020)
    console.log({ test })
    console.log({ filter })

    const width = 1000
    const height = 300
    const margin = ({ top: 20, right: 30, bottom: 30, left: 40 })
    const svg = d3.select('#line-chart')
        .attr("viewBox", [0, 0, width, height])
    // .attr("width", `${margin.left + width}`)
    // .attr("height", height)
    // .attr("transform", `translate(${margin.left},0)`)

    // const x = d3.scaleUtc()
    //     .domain(d3.extent(Array.from(casesMap), d => d[0]))
    //     .range([margin.left, width - margin.right])

    // Add a clipPath: everything out of this area won't be drawn.
    var clip = svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("fill", "red")
        .attr("width", width - margin.left - margin.right)
        .attr("height", height - margin.top - margin.bottom)
        .attr("x", margin.left)
        .attr("y", margin.top);

    var x = d3.scaleTime()
        // .domain(d3.extent(filter, d => moment(d[0], 'YYYY-MM-DD')))
        .domain([new Date(moment(d3.min(filter, d => d[0]), 'YYYY-MM-DD')), new Date(moment(d3.max(filter, d => d[0]), 'YYYY-MM-DD'))])
        // .domain([new Date("2020-01-01"), new Date("2020-12-31")])
        .range([margin.left, width - margin.right])

    console.log(x('2020-01-06'))


    var y = d3.scaleLinear()
        .domain([0, d3.max(Array.from(casesMap), d => d[1])]).nice()
        .range([height - margin.bottom, margin.top])

    // console.log(d3.min(test))

    // test.forEach(function (d) {
    //     console.log(d[0])
    //     console.log(x(new Date(moment(d[0], 'YYYY-MM-DD').format('YYYY-MM-DD'))))
    // })


    const line = d3.line()
        // .defined(d => !isNaN(d.value))
        // .x(d => x(d.date))
        // .y(d => y(d.value))
        .defined(d => !isNaN(new Date(moment(d[0], 'YYYY-MM-DD').format('YYYY-MM-DD'))))
        .defined(d => !isNaN(d[1]))
        .x(d => x(new Date(moment(d[0], 'YYYY-MM-DD').format('YYYY-MM-DD'))))
        .y(d => y(d[1]))
    // .defined(Array.from(casesMap), d => !isNaN(d[1]))
    // .x(Array.from(casesMap), d => x(d[0]))
    // .y(Array.from(casesMap), d => console.log(d[1]), y(d[1]))

    // A function that set idleTimeOut to null
    var idleTimeout
    function idled() { idleTimeout = null; }

    const brush = d3.brushX()
        // .extent([[0, 0], [width - margin.left - margin.right, height - margin.top - margin.bottom]])
        .extent([[margin.left, 0], [width - margin.right, 30]])
        .on("end", function updateChart(event) {
            extent = event.selection

            // If no selection, back to initial coordinate. Otherwise, update X axis domain
            if (!extent) {
                if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
                x.domain([new Date(moment(d3.min(filter, d => d[0]), 'YYYY-MM-DD')), new Date(moment(d3.max(filter, d => d[0]), 'YYYY-MM-DD'))])
            } else {
                x.domain([x.invert(extent[0]), x.invert(extent[1])])
                d3.select('#xDate').call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
            }

            console.log(x.domain()[0])
            // Update axis and line position
            d3.select('#xDate').transition().duration(1000)
                // .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
                .call(d3.axisBottom(x).ticks(d3.timeWeek.every(1)).tickFormat(function (d, i) {
                    return "W" + (i + 1) + " - " + d3.timeFormat("%d/%m/%y")(d)
                }))
            plan
                .select('#chart-cases')
                .transition()
                .duration(1000)
                .attr('d', line)

            var dots = plan.selectAll(".dot")
                .data(filter)
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

            dots.transition()
                .delay(1000)
                .duration(1000)

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
        })

    const xAxis = g => g
        .attr("id", "xDate")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
        .attr("font-size", 7)
        .attr("color", "white")
        .call(brush)

    const yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .attr("font-size", 7)
        .attr("color", "white")
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

    var plan = svg.append('g')
        .attr("id", "plan")
        .attr("clip-path", "url(#clip)")

    plan.append("path")
        .datum(filter)
        .attr('id', 'chart-cases')
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 3)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", line)

    var dots = plan.selectAll(".dot")
        .data(filter)
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

    dots.transition()
        .delay(1000)
        .duration(1000)

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

    svg.on('dblclick', function reset() {
        x.domain([new Date(moment(d3.min(filter, d => d[0]), 'YYYY-MM-DD')), new Date(moment(d3.max(filter, d => d[0]), 'YYYY-MM-DD'))])
        d3.select('#xDate').transition().duration(1000).call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
        plan
            .select('#chart-cases')
            .transition()
            .duration(1000)
            .attr('d', d3.line()
                .x(d => x(new Date(moment(d[0], 'YYYY-MM-DD').format('YYYY-MM-DD'))))
                .y(d => y(d[1]))
            )

        var dots = plan.selectAll(".dot")
            .data(filter)
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

        dots.transition()
            .delay(1000)
            .duration(1000)

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
    })

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
        if (value == null) return g.style("display", "none");

        g
            .style("display", null)
            // .append("circle").attr("r", 3)
            .style("pointer-events", "none")
            .style("font", "10px sans-serif");

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

        text.attr("transform", `translate(${-w / 2},${x - 25})`);
        path.attr("d", `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`)
            .attr("transform", "rotate(180)");

        // path.append("circle").attr("r", 10)
    }

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
})
    .then(function () {
        document.getElementById("overlay").style.display = "none";
        document.getElementById("loader").style.display = "none";
    })



// function lockUI() {
//     console.log("ON")
//     var main = d3.select('body')
//     main
//         .append('div')
//         .attr('id', 'overlay')
//         .append('h1', 'Prova!')
// }

// function unlockUI() {
//     console.log("OFF")
//     d3.select('#overlay').remove()
// }

// Promise.all([
//     d3.json("CovidEuropean.json")
// ]).then(data => {
//     // data[0]: CovidEuropean
//     console.log({ data })
//     data.forEach(function show(d, i) {
//         console.log(d.dateRep)
//     })


//     const datasetState = d3.group(data, (d, i) => d[i].dateRep);
//     // const minDatasetState = d3.min(Array.from(datasetState.values())).length;
//     // const maxDatasetState = d3.max(Array.from(datasetState.values())).length;

//     console.log({ datasetState })

// })