Promise.all([
    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'),
    d3.json("myFirstDatasetCleaned.json")
  ]).then(data => {
    // data[0] is the first dataset "world"
    // data[1] is the second dataset by me
    const minPublishTime = d3.min(data[1], d => d.Publish_time);
    const maxPublishTime = d3.max(data[1], d => d.Publish_time);
    
    // const widthSlider = "500";
    // const heightSlider = "700";
    // const formatDate = d3.timeFormat('%Y-%m-%d');
  
    // const svgSlider1 = d3.select("#slider")
    //       .attr("width", widthSlider)
    //       .attr("height", heightSlider)
    //       .append("g")
  
    // ========================= SLIDERS ===================================
    var marginSlider = {top: 0, right: 150, bottom: 0, left: 112},
        widthSlider = 100,
        heightSlider = 600;
    const formatDate = d3.timeFormat('%Y');

    // ================= SLIDER 1 GIORNO 4/7/2017 =========================
    const dateScale = d3.scaleTime()
    .domain([new Date(minPublishTime), new Date(maxPublishTime)])
    .range([0, widthSlider])
    .clamp(true);

    var svgSlider1 = d3.select("#slider").append("g")
        // classic transform to position g
        //.attr("transform", "translate(" + marginSlider.left + "," + marginSlider.top + ")");

    svgSlider1.append("rect")
        .style("pointer-events", "all")
        .style("fill", "white")
        .style("opacity", "0.6")
        .attr("width", widthSlider)
        .attr("height", heightSlider)
        .style("cursor", "crosshair");
    svgSlider1.append("g")
        .attr("class", "y axis")
        // put in middle of screen
        //.attr("transform", "translate(0," + heightSlider / 2 + ")")
        // inroduce axis
        .call(d3.axisLeft()
            .scale(dateScale)
            .tickFormat(function (d) {
                return formatDate(d);
            })
            .ticks(6)
            .tickSize(2)
            .tickPadding(45))
        .select(".domain")
        .select(function () {
            return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr("class", "halo");

    // add the X gridlines
    svgSlider1.append("g")
        .attr("class", "grid")
        //.attr("transform", "translate(0," + heightSlider + ")")
        .call(make_x_gridlines(dateScale)
            .tickSize(-heightSlider + 4)
            .tickFormat("").tickSizeOuter(0)
        );

    // svgSlider1.append("rect")
    //     .style("pointer-events", "all")
    //     .style("fill", "white")
    //     .style("opacity", "0.6")
    //     .attr("width", widthSlider)
    //     .attr("height", heightSlider)
    //     .style("cursor", "crosshair");
    // svgSlider1.append("g")
    //     .attr("class", "x axis")
    //     // put in middle of screen
    //     // inroduce axis
    //     .call(d3.axisBottom()
    //         .scale(dateScale)
    //         .tickFormat(function (d) {
    //             return formatDate(d);
    //         })
    //         .ticks(6)
    //         .tickSize(2)
    //         .tickPadding(45))

    // // add the X gridlines
    // svgSlider1.append("g")
    //     .attr("class", "grid")
    //     .call( d => d3.axisBottom(d)
    //         .tickSize(-heightSlider + 4)
    //         .tickFormat("").tickSizeOuter(0)
    //     );
    
    
    function make_x_gridlines(xAxis) {
          return d3.axisLeft(xAxis)
      }
  })