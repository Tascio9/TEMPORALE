d3.json("CovidEuropean.json").then(function (data) {
    console.log('line-chart.js')
    console.log({ data })
    // const x = d3.group(data.records, d => d.dateRep)
    // const casesMap = d3.rollup(data.records, v => d3.sum(v, e => e.cases), k => k.dateRep);
    const casesMap = d3.rollup(data.records, v => d3.sum(v, e => e.cases), function (k) {
        const dayFormat = d3.timeFormat("%Y-%m-%d")
        return dayFormat(new Date(moment(k.dateRep, 'DD/MM/YYYY').format("YYYY-MM-DD")))
    })
    // const deathsMap = d3.rollup(data.records, v => d3.sum(v, e => e.deaths), k => k.dateRep);
    const deathsMap = d3.rollup(data.records, v => d3.sum(v, e => e.deaths), function (k) {
        const dayFormat = d3.timeFormat("%Y-%m-%d")
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

    const test = Array.from(casesMap)
    console.log({ casesMap })
    console.log({ deathsMap })

    test.sort((x, y) => d3.ascending(x[0], y[0]))
    const filter = test.filter(d => new Date(d[0]).getFullYear() === 2020)
    console.log({ test })
    console.log({ filter })

    const width = 600
    const height = 200
    const margin = ({ top: 20, right: 30, bottom: 30, left: 40 })
    const svg = d3.select('#line-chart')
        .attr("viewBox", [0, 0, width, height])
    // .attr("width", `${margin.left + width}`)
    // .attr("height", height)
    // .attr("transform", `translate(${margin.left},0)`)

    // const x = d3.scaleUtc()
    //     .domain(d3.extent(Array.from(casesMap), d => d[0]))
    //     .range([margin.left, width - margin.right])

    const x = d3.scaleTime()
        .domain([new Date(moment(d3.min(filter, d => d[0]), 'YYYY-MM-DD')), new Date(moment(d3.max(filter, d => d[0]), 'YYYY-MM-DD'))])
        // .domain([new Date("2020-01-01"), new Date("2020-12-31")])
        .range([margin.left, width - margin.right])


    const y = d3.scaleLinear()
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

    const xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
        .attr("font-size", 7)

    const yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .attr("font-size", 7)
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

    // const tooltip = svg.append("g");

    // const bisect = {
    //     bisect = d3.bisector(d => d.date).left;
    //     return mx => {
    //         const date = x.invert(mx);
    //         const index = bisect(data, date, 1);
    //         const a = data[index - 1];
    //         const b = data[index];
    //         return b && (date - a.date > b.date - date) ? b : a;
    //     }
    // }

    // svg.on("touchmove mousemove", function (event) {
    //     const { date, value } = bisect(d3.pointer(event, this)[0]);

    //     tooltip
    //         .attr("transform", `translate(${x(date)},${y(value)})`)
    //         .call(callout, `${formatValue(value)}
    //   ${formatDate(date)}`);
    // });

    // svg.on("touchend mouseleave", () => tooltip.call(callout, null));

    // callout = (g, value) => {
    //     if (!value) return g.style("display", "none");

    //     g
    //         .style("display", null)
    //         .style("pointer-events", "none")
    //         .style("font", "10px sans-serif");

    //     const path = g.selectAll("path")
    //         .data([null])
    //         .join("path")
    //         .attr("fill", "white")
    //         .attr("stroke", "black");

    //     const text = g.selectAll("text")
    //         .data([null])
    //         .join("text")
    //         .call(text => text
    //             .selectAll("tspan")
    //             .data((value + "").split(/\n/))
    //             .join("tspan")
    //             .attr("x", 0)
    //             .attr("y", (d, i) => `${i * 1.1}em`)
    //             .style("font-weight", (_, i) => i ? null : "bold")
    //             .text(d => d));

    //     const { x, y, width: w, height: h } = text.node().getBBox();

    //     text.attr("transform", `translate(${-w / 2},${15 - y})`);
    //     path.attr("d", `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`);
    // }

    // function formatValue(value) {
    //     return value.toLocaleString("en", {
    //         style: "currency",
    //         currency: "USD"
    //     });
    // }

    function formatDate(date) {
        return date.toLocaleString("en", {
            month: "short",
            day: "numeric",
            year: "numeric",
            timeZone: "UTC"
        });
    }

    // svg.append("path")
    //     .datum(deathsMap)
    //     .attr("fill", "none")
    //     .attr("stroke", "red")
    //     .attr("stroke-width", 1.5)
    //     .attr("stroke-linejoin", "round")
    //     .attr("stroke-linecap", "round")
    //     .attr("d", line);

})

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