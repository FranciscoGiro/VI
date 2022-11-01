const margin = { top: 20, right: 30, bottom: 40, left: 90 };
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

function init() {
    createScatterPlot("#vi2");
}



function createScatterPlot(id) {
    const svg = d3
    .select(id)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("id", "gScatterPlot")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

    d3.csv("../dataset/data.csv").then(function (data) {
    const x = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => parseInt(d.returnOnAssets)))
    .range([0, width]);
    svg
    .append("g")
    .attr("id", "gXAxis")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));



    
    const y = d3.scaleLinear()
                .domain(d3.extent(data, (d) => parseInt(d.priceVar)))
                .range([height, 0]);
    svg
    .append("g")
    .attr("id", "gYAxis")
    .call(d3.axisLeft(y));

    svg
    .selectAll("circle.circleValues") 
    .data(data, (d) => d.title) 
    .enter()
    .append("circle")
    .attr("class", "circleValues itemValue")
    .attr("cx", (d) => x(d.budget))
    .attr("cy", (d) => y(d.rating))
    .attr("r", 4)
    .style("fill", "steelblue")
    .on("mouseover", (event, d) => handleMouseOver(d))
    .on("mouseleave", (event, d) => handleMouseLeave())
    .append("title")
    .text((d) => d.title);
});
}

function updateScatterPlot(start, finish) {
    d3.json("data.json").then(function (data) {
      data = data.filter(function (elem) {
        return start <= elem.oscar_year && elem.oscar_year <= finish;
      });
  
      const svg = d3.select("#gScatterPlot");
  
      const x = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.budget)])
        .range([0, width]);
      svg
        .select("#gXAxis")
        .call(d3.axisBottom(x).tickFormat((x) => x / 1000000 + "M"));
  
      const y = d3.scaleLinear().domain([0, 10]).range([height, 0]);
      svg.select("gYAxis").call(d3.axisLeft(y));
  
      svg
        .selectAll("circle.circleValues")
        .data(data, (d) => d.title)
        .join(
          (enter) => {
            circles = enter
              .append("circle")
              .attr("class", "circleValues itemValue")
              .attr("cx", (d) => x(d.budget))
              .attr("cy", (d) => y(0))
              .attr("r", 4)
              .style("fill", "steelblue")
              .on("mouseover", (event, d) => handleMouseOver(d))
              .on("mouseleave", (event, d) => handleMouseLeave())
            circles
              .transition()
              .duration(1000)
              .attr("cy", (d) => y(d.rating));
            circles.append("title").text((d) => d.title);
          },
          (update) => {
            update
              .transition()
              .duration(1000)
              .attr("cx", (d) => x(d.budget))
              .attr("cy", (d) => y(d.rating))
              .attr("r", 4);
          },
          (exit) => {
            exit.remove();
          }
        );
    });
  }
  
function handleMouseOver(item) {
    d3.selectAll(".itemValue")
        .filter(function (d, i) {
        return d.title == item.title;
        })
        .attr("r", 10)
        .style("fill", "red");
}
  
function handleMouseLeave() {
    d3.selectAll(".itemValue").style("fill", "steelblue").attr("r", 4);
}