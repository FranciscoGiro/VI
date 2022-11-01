var eliminate = ""
var sector = ""
var year = 2014
var defaultIndicators = ["returnOnAssets","EBITDA Margin","returnOnEquity", "ROIC", "Debt to Equity", "priceBookValueRatio"] 

function init() {
  createScatterPlot("vi1", "returnOnAssets")
  createScatterPlot("vi2", "priceBookValueRatio")
}


function createScatterPlot(id, indicator) {

  const margin = { top: 20, right: 30, bottom: 40, left: 35 };
  const width = 200 - margin.left - margin.right;
  const height = 160 - margin.top - margin.bottom;


  const svg = d3
    .select(`#${id}`)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("id", `gScatterPlot-${id}`)
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  d3.csv("./dataset/data.csv").then(function (data) {

    console.log(data)
    const x = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => parseInt(d[indicator])))
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
      .data(data, (d) => d.Company) 
      .enter()
      .append("circle")
      .attr("class", "circleValues itemValue")
      .attr("cx", (d) => x(d[indicator]))
      .attr("cy", (d) => y(d.priceVar))
      .attr("r", 2)
      .style("fill", "steelblue")
      .on("mouseover", (event, d) => handleMouseOver(d))
      .on("mouseleave", (event, d) => handleMouseLeave())
      .append("title")
      .text((d) => d.Company);
  });
}

function updateScatterPlot(id, indicator) {

  const margin = { top: 20, right: 30, bottom: 40, left: 35 };
  const width = 200 - margin.left - margin.right;
  const height = 160 - margin.top - margin.bottom;

  
  d3.csv("./dataset/data.csv").then(function (data) {
    if(eliminate !== "")
      data = data.filter(d => d.Company !== eliminate)

    if(sector !== "")
      data = data.filter(d => d.Sector === sector)

    const svg = d3.select(`#gScatterPlot-${id}`);

    const x = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => parseInt(d[indicator])))
      .range([0, width]);
    svg
      .select("#gXAxis")
      .call(d3.axisBottom(x));

    const y = d3.scaleLinear()
                .domain(d3.extent(data, (d) => parseInt(d.priceVar)))
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
            .attr("cx", (d) => x(d[indicator]))
            .attr("cy", (d) => y(0))
            .attr("r", 2)
            .style("fill", "steelblue")
            .on("mouseover", (event, d) => handleMouseOver(d))
            .on("mouseleave", (event, d) => handleMouseLeave())
          circles
            .transition()
            .duration(1000)
            .attr("cy", (d) => y(d.priceVar));
          circles.append("title").text((d) => d.Company);
        },
        (update) => {
          update
            .transition()
            .duration(1000)
            .attr("cx", (d) => x(d[indicator]))
            .attr("cy", (d) => y(d.priceVar))
            .attr("r", 2);
        },
        (exit) => {
          exit.remove();
        }
      );
  });
}

function handleMouseOver(item) {

  eliminate = item.Company
  updateScatterPlot("vi1", "returnOnAssets")
  updateScatterPlot("vi2", "priceBookValueRatio")
  eliminate = ""
  updateScatterPlot("vi1", "returnOnAssets")
  updateScatterPlot("vi2", "priceBookValueRatio")

  d3.selectAll(".itemValue")
    .filter(function (d, i) {
      return d.Company == item.Company;
    })
    .attr("r", 4)
    .style("fill", "red");
}

function handleMouseLeave() {
  d3.selectAll(".itemValue").style("fill", "steelblue").attr("r", 2);
}