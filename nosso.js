const margin = { top: 20, right: 30, bottom: 40, left: 90 };
const width = 450 - margin.left - margin.right;
const height = 470 - margin.top - margin.bottom;

var currentYear = 2014

let display = []

function init() {
  createScatterPlot("#vi1");
  createLineChart("#vi3");

  d3.select("#b2014").on("click", () => {
    currentYear=2014
    updateScatterPlot("");
  });
  d3.select("#b2015").on("click", () => {
    currentYear=2015
    updateScatterPlot("");
  });
  d3.select("#b2016").on("click", () => {
    currentYear=2016
    updateScatterPlot("");
  });
  d3.select("#b2017").on("click", () => {
    currentYear=2017
    updateScatterPlot("");
  });
  d3.select("#b2018").on("click", () => {
    currentYear=2018
    updateScatterPlot("");
  });
  d3.select("#reset").on("click", () => {
    currentYear=2014
    updateScatterPlot("");
  });
}

function createScatterPlot(id) {
  const svg = d3
    .select(id)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("id", "gScatterPlot")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  d3.csv("./dataset/2014.csv").then(function (data) {

    var min = d3.min(data, (d) => d.returnOnAssets)

    const x = d3
      .scaleLinear()
      .domain( [-5, d3.max(data, (d) => d.returnOnAssets)])
      .range([0, width]);
    svg
      .append("g")
      .attr("id", "gXAxis")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x));


    const y = d3
            .scaleLinear()
            .domain([0, d3.max(data, (d) => d.priceVar)])
            .range([height, 0]);
    svg
      .append("g")
      .attr("id", "gYAxis")
      .call(d3.axisLeft(y));

    svg
      .selectAll("circle.circleValues") 
      .data(data, (d) => d.Company) 
      .enter()
      .append("circle")
      .attr("class", "circleValues itemValue")
      .attr("cx", (d) => x(d.returnOnAssets))
      .attr("cy", (d) => y(d.priceVar))
      .attr("r", 2)
      .style("fill", "steelblue")

      //.on("click", (event, d) => handleScatterplotMouseClick(d))
      .on("click", (event, d) => handleBubbleMouseClick(d))
      .text((d) => d.Company);
  });
}


function createLineChart(id) {
  const svg = d3
    .select(id)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("id", "gLineChart")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  d3.csv("./dataset/total.csv").then(function (data) {

    const x = d3.time.scale()
    .range([200, 0]);
    .domain(["2018","2017","2016","2015","2014"])
    svg
      .append("g")
      .attr("id", "gXAxis")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x));

    const y = d3
      .scaleLinear()
      .domain([-50, d3.max(data, (d) => d.priceVar)])
      .range([height, 0]);
    svg
      .append("g")
      .attr("id", "gYAxis")
      .call(d3.axisLeft(y));

    svg
      .append("path")
      .datum(data)
      .attr("class", "pathValue") 
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr(
        "d",
        d3
          .line()
          .x((d) => x(d.year))
          .y((d) => y(d.priceVar))
      );
  });
}




function updateScatterPlot(sector) {

  console.log("Vou dar update")
    d3.csv(`./dataset/${currentYear}.csv`).then(function (data) {

      console.log(currentYear)
        if(sector != ""){
          data = data.filter(function (elem) {
            return  sector == elem.oscar_year;
          });
        }
    
        const svg = d3.select("#gScatterPlot");
    
        const x = d3
          .scaleLinear()
          .domain([0, d3.max(data, (d) => d.returnOnAssets)])
          .range([0, width]);
        svg
          .select("#gXAxis")
          .call(d3.axisBottom(x));
    
        const y = d3
          .scaleLinear()
          .domain([0, d3.max(data, (d) => d.priceVar)])
          .range([height, 0]);
        svg.select("gYAxis").call(d3.axisLeft(y));
    
        svg
          .selectAll("circle.circleValues")
          .data(data, (d) => d.Company)
          .join(
            (enter) => {
              circles = enter
                .append("circle")
                .attr("class", "circleValues itemValue")
                .attr("cx", (d) => x(d.returnOnAssets))
                .attr("cy", (d) => y(d.priceVar))
                .attr("r", 2)
                .style("fill", "steelblue")
              circles
                .transition()
                .duration(1000)
                .attr("cy", (d) => y(d.rating));
              circles.append("title").text((d) => d.Company);
            },
            (update) => {
              update
                .transition()
                .duration(1000)
                .attr("cx", (d) => x(d.returnOnAssets))
                .attr("cy", (d) => y(d.priceVar))
                .attr("r", 2);
            },
            (exit) => {
              exit.remove();
            }
          );
      });
  }





function handleBubbleMouseClick(item) {

    updateScatterPlot(item.setor)

    d3.selectAll(".itemValue")
        .filter(function (d, i) {
        return d.Company != item.Company;
        })
        .style("opacity", "0");
}




function handleScatterplotMouseClick(item) {
    d3.selectAll(".itemValue")
        .filter(function (d, i) {
        return d.Company != item.Company;
        })
        .style("opacity", "0");
}