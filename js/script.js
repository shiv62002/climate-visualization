// Utility for tooltip
function createTooltip(containerId) {
    return d3.select(containerId)
        .append("div")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "#fff")
        .style("border", "1px solid #ccc")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("font-size", "12px")
        .style("pointer-events", "none");
}

// CO₂ Concentration Chart (just a line and dots, no fill)
d3.csv("data/Atmospheric_CO₂_Concentrations.csv", d => {
    const [year, month] = d.Date.split("M");
    return {
        date: new Date(+year, +month - 1),
        value: +d.Value
    };
}).then(data => {
    const svg = d3.select("#co2Chart").append("svg")
        .attr("width", 600)
        .attr("height", 300);
    const tooltip = createTooltip("#co2Chart");

    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([50, 550]);

    const y = d3.scaleLinear()
        .domain(d3.extent(data, d => d.value))
        .range([250, 50]);

    const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.value));

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#cc0000")
        .attr("stroke-width", 2)
        .attr("d", line);

    svg.selectAll("circle")
        .data(data.filter((_, i) => i % 12 === 0)) // every 12 months
        .enter()
        .append("circle")
        .attr("cx", d => x(d.date))
        .attr("cy", d => y(d.value))
        .attr("r", 2)
        .attr("fill", "#cc0000")
        .on("mouseover", (event, d) => {
            tooltip.style("visibility", "visible")
                .text(`${d.date.toDateString()} - CO₂: ${d.value} ppm`);
        })
        .on("mousemove", event => tooltip
            .style("top", `${event.pageY - 40}px`)
            .style("left", `${event.pageX + 10}px`))
        .on("mouseout", () => tooltip.style("visibility", "hidden"));

    svg.append("g")
        .attr("transform", "translate(0,250)")
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("transform", "translate(50,0)")
        .call(d3.axisLeft(y));

    svg.append("text")
        .attr("x", 400)
        .attr("y", 60)
        .text("CO₂ ppm")
        .attr("fill", "#cc0000");
});


// Temperature & Precipitation Trends (both as lines)
d3.csv("data/gsom_sample_csv.csv").then(raw => {
    const data = raw.map(d => ({
        date: new Date(d.DATE),
        tavg: (+d.TMAX + +d.TMIN) / 2,
        prcp: +d.PRCP
    })).filter(d => !isNaN(d.tavg) && !isNaN(d.prcp));

    const svg = d3.select("#tempPrecipChart").append("svg").attr("width", 600).attr("height", 300);
    const tooltip = createTooltip("#tempPrecipChart");

    const x = d3.scaleTime().domain(d3.extent(data, d => d.date)).range([50, 550]);
    const yLeft = d3.scaleLinear().domain([d3.min(data, d => d.tavg), d3.max(data, d => d.tavg)]).range([250, 50]);
    const yRight = d3.scaleLinear().domain([0, d3.max(data, d => d.prcp)]).range([250, 50]);

    // Axes
    svg.append("g").attr("transform", "translate(0,250)").call(d3.axisBottom(x));
    svg.append("g").attr("transform", "translate(50,0)").call(d3.axisLeft(yLeft));
    svg.append("g").attr("transform", "translate(550,0)").call(d3.axisRight(yRight));

    // Temperature line (orange)
    const tempLine = d3.line().x(d => x(d.date)).y(d => yLeft(d.tavg));
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "orange")
        .attr("stroke-width", 2)
        .attr("d", tempLine);

    // Precipitation line (steelblue)
    const precipLine = d3.line().x(d => x(d.date)).y(d => yRight(d.prcp));
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", precipLine);

    // Tooltips on dots (optional)
    svg.selectAll("circle.temp")
        .data(data)
        .enter().append("circle")
        .attr("class", "temp")
        .attr("cx", d => x(d.date))
        .attr("cy", d => yLeft(d.tavg))
        .attr("r", 3)
        .attr("fill", "orange")
        .on("mouseover", (event, d) => {
            tooltip.style("visibility", "visible").text(`${d.date.toDateString()} | Temp: ${d.tavg.toFixed(1)}°F`);
        })
        .on("mousemove", event => tooltip.style("top", `${event.pageY - 40}px`).style("left", `${event.pageX + 10}px`))
        .on("mouseout", () => tooltip.style("visibility", "hidden"));

    svg.selectAll("circle.prcp")
        .data(data)
        .enter().append("circle")
        .attr("class", "prcp")
        .attr("cx", d => x(d.date))
        .attr("cy", d => yRight(d.prcp))
        .attr("r", 3)
        .attr("fill", "steelblue")
        .on("mouseover", (event, d) => {
            tooltip.style("visibility", "visible").text(`${d.date.toDateString()} | Precip: ${d.prcp.toFixed(2)} in`);
        })
        .on("mousemove", event => tooltip.style("top", `${event.pageY - 40}px`).style("left", `${event.pageX + 10}px`))
        .on("mouseout", () => tooltip.style("visibility", "hidden"));

    // Legend
    svg.append("circle").attr("cx", 420).attr("cy", 30).attr("r", 5).style("fill", "orange");
    svg.append("text").attr("x", 430).attr("y", 34).text("Avg Temp").style("font-size", "12px");

    svg.append("circle").attr("cx", 420).attr("cy", 50).attr("r", 5).style("fill", "steelblue");
    svg.append("text").attr("x", 430).attr("y", 54).text("Precipitation").style("font-size", "12px");
});


// Sea Level Rise Chart (unchanged)
d3.csv("data/Change_in_Mean_Sea_Levels.csv").then(raw => {
    const data = raw
        .filter(d => d.Date && d.Value)
        .map(d => ({
            date: new Date(d.Date.replace("D", "")),
            value: +d.Value
        }))
        .filter(d => !isNaN(d.value));

    const svg = d3.select("#seaLevelChart").append("svg").attr("width", 600).attr("height", 300);
    const tooltip = createTooltip("#seaLevelChart");

    const x = d3.scaleTime().domain(d3.extent(data, d => d.date)).range([50, 550]);
    const y = d3.scaleLinear().domain(d3.extent(data, d => d.value)).range([250, 50]);

    const line = d3.line().x(d => x(d.date)).y(d => y(d.value));
    svg.append("path").datum(data).attr("fill", "none").attr("stroke", "seagreen").attr("stroke-width", 2).attr("d", line);

    svg.selectAll("circle")
        .data(data.filter((_, i) => i % 15 === 0))
        .enter()
        .append("circle")
        .attr("cx", d => x(d.date))
        .attr("cy", d => y(d.value))
        .attr("r", 3)
        .attr("fill", "seagreen")
        .on("mouseover", function (event, d) {
            tooltip.style("visibility", "visible").text(`Date: ${d.date.toDateString()} | Sea Level: ${d.value.toFixed(2)} mm`);
        })
        .on("mousemove", event => tooltip.style("top", `${event.pageY - 40}px`).style("left", `${event.pageX + 10}px`))
        .on("mouseout", () => tooltip.style("visibility", "hidden"));

    svg.append("g").attr("transform", "translate(0,250)").call(d3.axisBottom(x));
    svg.append("g").attr("transform", "translate(50,0)").call(d3.axisLeft(y));

    svg.append("text").attr("x", 400).attr("y", 60).text("Sea Level (mm)").attr("fill", "seagreen");
});
