const MARGIN = { LEFT: 100, RIGHT: 10, TOP: 10, BOTTOM: 100 };
const WIDTH = 800 - MARGIN.LEFT - MARGIN.RIGHT;
const HEIGHT = 500 - MARGIN.TOP - MARGIN.BOTTOM;

const svg = d3.select('#chart-area').append('svg')
    .attr('width', WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
    .attr('height', HEIGHT + MARGIN.TOP + MARGIN.BOTTOM);

const g = svg.append("g")
    .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

let time = 0;

//Tooltip
let tip = d3.tip()
    .attr("class", "d3-tip")
    .html(d => {
        let text = `<strong>Country:</strong> <span style="color: red; text-transform: capitalize">${d.country}</span><br>`
        text += `<strong>Continent:</strong> <span style="color: red; text-transform: capitalize">${d.continent}</span><br>`
        text += `<strong>Life Expectancy:</strong> <span style="color: red">${d3.format(".2f")(d.life_exp)}</span><br>`
        text += `<strong>GDP per Capita:</strong> <span style="color: red">${d3.format("$,.0f")(d.income)}</span><br>`
        text += `<strong>Population:</strong> <span style="color: red">${d3.format(",.0f")(d.population)}</span><br>`
        return text;
    });

g.call(tip);

// x scale
const x = d3.scaleLog()
    .base(10)
    .domain([142, 150000])
    .range([0, WIDTH]);

// y scale
const y = d3.scaleLinear()
    .domain([0, 90])
    .range([HEIGHT, 0]);

// continent color
const continentColor = d3.scaleOrdinal(d3.schemePastel1);

const area = d3.scaleLinear()
    .range([25 * Math.PI, 1500 * Math.PI])
    .domain([2000, 1400000000]);

// x label
const xLabel = g.append("text")
    .attr("class", "x-axis-label")
    .attr("x", WIDTH / 2)
    .attr("y", HEIGHT + 65)
    .attr("font-size", "20px")
    .attr("font-weight", "700")
    .attr("text-anchor", "middle")
    .text("GDP Per Capita ($)");

// y label
const yLabel = g.append("text")
    .attr("class", "y axis-label")
    .attr("x", -(HEIGHT / 2))
    .attr("y", -60)
    .attr("font-size", "20px")
    .attr("font-weight", "700")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Life Expectancy (Years)");

// time label
const timeLabel = g.append("text")
    .attr("class", "time-label")
    .attr("x", WIDTH - 40)
    .attr("y", HEIGHT - 10)
    .attr("font-size", "40px")
    .attr("opacity", "0.4")
    .attr("text-anchor", "middle")
    .text("1800");

// X axis
const xAxisCall = d3.axisBottom(x)
    .tickValues([400, 4000, 40000])
    .tickFormat(d3.format("$"));
g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0 , ${HEIGHT})`)
    .call(xAxisCall);

// Y axis
const yAxisCall = d3.axisLeft(y)
g.append("g")
    .attr("class", "y-axis")
    .call(yAxisCall)

//Legend
const continents = ["europe", "asia", "america", "africa"]

const legend = g.append("g")
    .attr("transform", `translate(${WIDTH - 10}, ${HEIGHT - 125})`)

continents.forEach((continent, i) => {
    const legendRow = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`)

    legendRow.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", continentColor(continent))

    legendRow.append("text")
        .attr("x", -10)
        .attr("y", 10)
        .attr("text-anchor", "end")
        .style("text-transform", "capitalize")
        .text(continent)
})

d3.json("data/data.json").then((data) => {
    console.log(data);

    const formattedData = data.map((year) => {
        return year["countries"]
            .filter((country) => {
                const dataExists = country.income && country.life_exp;
                return dataExists;
            })
            .map((country) => {
                country.income = Number(country.income);
                country.life_exp = Number(country.life_exp);
                return country;
            });
    });

    d3.interval(() => {
        time = time < 214 ? time + 1 : 0;
        update(formattedData[time])
    }, 100);

    update(formattedData[0]);
});

const update = (data) => {
    const t = d3.transition().duration(100);

    // JOIN new data with old elements.
    const circles = g.selectAll("circle").data(data, d => d.country);

    // EXIT old elements not present in new data.
    circles.exit().remove();

    // ENTER new elements present in new data.
    circles.enter().append("circle")
        .attr("fill", d => continentColor(d.continent))
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide)
        .merge(circles)
        .transition(t)
        .attr("cx", d => x(d.income))
        .attr("cy", d => y(d.life_exp))
        .attr("r", d => Math.sqrt(area(d.population) / Math.PI));

    // update the time label
    timeLabel.text(String(time + 1800))
}