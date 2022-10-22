const margin = { top: 20, right: 30, bottom: 40, left: 30 };
const width = 140 - margin.left - margin.right;
const height = 150 - margin.top - margin.bottom;

var currentYear = 2014

let display = []

function init() {
  createScatterPlot("#vi1", "returnOnAssets");
  createScatterPlot("#vi2", "returnOnAssets");
  createScatterPlot("#vi3", "returnOnAssets");
  createScatterPlot("#vi4", "returnOnAssets");
  createScatterPlot("#vi5", "returnOnAssets");
  createScatterPlot("#vi6", "returnOnAssets");
  createLineChart("#vi8")

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

function createScatterPlot(id, indicator) {
  const svg = d3
    .select(id)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("id", "gScatterPlot")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  d3.csv("./dataset/2014.csv").then(function (data) {

    const x = d3
      .scaleLinear()
      .domain( [-5, d3.max(data, (d) => d[indicator])])
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
      .attr("cx", (d) => x(d[indicator]))
      .attr("cy", (d) => y(d.priceVar))
      .attr("r", 2)
      .style("fill", "steelblue")

      //.on("click", (event, d) => handleScatterplotMouseClick(d))
      .on("click", (event, d) => handleBubbleMouseClick(d))
      .text((d) => d.Company);
  });
}

function createLineChart(id) {

  const margin = { top: 20, right: 30, bottom: 40, left: 30 };
  const width = 250 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;
  const svg = d3.select(id)
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    //Read the data
    d3.csv("./dataset/total.csv").then( function(data) {

        companies = ["PG", "KR", "GIS"]

        data = data.filter(d => companies.includes(d.Company) )

    
      // group the data: I want to draw one line per group
      const sumstat = d3.group(data, d => d.Company); // nest function allows to group the calculation per level of a factor
    
      // Add X axis --> it is a date format
      const x = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { return d.year; }))
        .range([ 0, width ]);
      svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).ticks(5));
    
      // Add Y axis
      console.log(height)
      const y = d3.scaleLinear()
        .domain([-50, d3.max(data, function(d) { return +d.priceVar; })])
        .range([ height, 0 ]);
      svg.append("g")
        .call(d3.axisLeft(y));
    
      // color palette
      const color = d3.scaleOrdinal()
        .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999'])
    
      // Draw the line
      svg.selectAll(".line")
          .data(sumstat)
          .join("path")
            .attr("fill", "none")
            .attr("stroke", function(d){ return color(d[0]) })
            .attr("stroke-width", 1.5)
            .attr("d", function(d){
              return d3.line()
                .x(function(d) { return x(d.year); })
                .y(function(d) { return y(+d.priceVar); })
                (d[1])
            })
    
    })
}



function updateScatterPlot(sector) {

    d3.csv(`./dataset/${currentYear}.csv`).then(function (data) {

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