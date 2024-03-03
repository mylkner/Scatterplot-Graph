import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const fetchData = async () => {
    try {
        const res = await axios.get(
            "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
        );
        return res.data;
    } catch (err) {
        console.log(err);
    }
};

const render = async () => {
    const data = await fetchData();
    const timesYears = data.map((item) => {
        return [
            d3.timeParse("%M:%S")(item.Time),
            item.Year,
            item.Doping,
            item.Name,
            item.Nationality,
        ];
    });

    const h = 500;
    const w = 825;

    const xScale = d3
        .scaleLinear()
        .domain(d3.extent(timesYears, (d) => d[1]))
        .nice()
        .range([0, w]);

    const yScale = d3
        .scaleTime()
        .domain(d3.extent(timesYears, (d) => d[0]))
        .nice()
        .range([0, h]);

    const svg = d3
        .select(".container")
        .append("svg")
        .attr("id", "title")
        .attr("height", h)
        .attr("width", w);

    svg.selectAll("circle")
        .data(timesYears)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("data-xvalue", (d) => d[1])
        .attr("data-yvalue", (d) => d[0])
        .attr("cx", (d) => xScale(d[1]))
        .attr("cy", (d) => yScale(d[0]))
        .attr("r", 5)
        .attr("fill", (d) => {
            return d[2] ? "blue" : "orange";
        })
        .on("mouseover", (d, i) => {
            d3.select(".container")
                .append("div")
                .attr("id", "tooltip")
                .attr("data-year", i[1])
                .style("position", "absolute")
                .style("left", xScale(i[1]) + 240 + "px")
                .style("top", yScale(i[0]) + 50 + "px")
                .html(() => {
                    return `
                        <p>${i[3]}: ${i[4]}</p>
                        <p>Year: ${i[1]}, Time: ${i[0]
                        .toString()
                        .substring(19, 24)}</p>
                        ${i[2] ? `<br><p>${i[2]}</p>` : ""}
                        `;
                })
                .style("opacity", 0)
                .transition()
                .duration(200)
                .style("opacity", 0.9);
        })
        .on("mouseout", () =>
            d3
                .selectAll("#tooltip")
                .transition()
                .duration(200)
                .style("opacity", 0)
                .remove()
        );

    const xAxis = d3.axisBottom(xScale).ticks(20).tickFormat(d3.format("d"));
    svg.append("g")
        .attr("id", "x-axis")
        .attr("transform", `translate(0, ${h})`)
        .call(xAxis);

    const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%M:%S"));
    svg.append("g")
        .attr("id", "y-axis")
        .attr("transform", "translate(0, 0)")
        .call(yAxis);
};

render();
