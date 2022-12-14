const margin = { top: 20, right: 30, bottom: 40, left: 35 };
const width = 200 - margin.left - margin.right;
const height = 160 - margin.top - margin.bottom;

var currentYear = 2014
var sector = ""
var eliminate = ""

let display = []
let defaultCompanies = ["PG", "KR", "GIS"]

let defaultIndicators = ["returnOnAssets","EBITDA Margin","returnOnEquity", "ROIC", "Debt to Equity", "priceBookValueRatio"] 

const getColor = () => {
  colors = ['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999']
  random = Math.floor(Math.random() * 9);
  return colors[random]
}


function init() {
  
  createScatterPlot("#vi1", "returnOnAssets");
  createScatterPlot("#vi2", "EBITDA Margin");
  createScatterPlot("#vi3", "returnOnEquity");
  createScatterPlot("#vi4", "ROIC");
  createScatterPlot("#vi5", "Debt to Equity");
  createScatterPlot("#vi6", "priceBookValueRatio");
  createLineChart("#vi8")

  d3.select("#b2014").on("click", () => {
    currentYear = 2014;
    updateYear();
  });
  d3.select("#b2015").on("click", () => {
    currentYear = 2015;
    updateYear();

  });
  d3.select("#b2016").on("click", () => {
    currentYear = 2016;
    updateYear();

  });
  d3.select("#b2017").on("click", () => {
    currentYear = 2017;
    updateYear();

  });
  d3.select("#b2018").on("click", () => {
    currentYear = 2018;
    updateYear();

  });
  d3.select("#reset").on("click", () => {
    let defaultCompanies = ["PG", "KR", "GIS"]
    defaultCompanies = ["PG", "KR", "GIS"]
    updateYear(2014);
  });
}

function createScatterPlot(id, indicator) {
    var div = d3.select("body").append("div")	
      .attr("class", "tooltip")				
      .style("opacity", 0);



  console.log(`gScatterPlot-${id}`)
  const svg = d3
    .select(id)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("id", `gScatterPlot`)
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  d3.csv("./dataset/data.csv").then(function (data) {

    console.log(data)

    min = 0
    data.map(d => {
      if(d[indicator] < -1)
        min = d[indicator]
    })

    const x = d3
      .scaleLinear()
      .domain([d3.min(data, (d) => parseInt(d[indicator])), d3.max(data, (d) => parseInt(d[indicator]))])
      .range([0, width]);
    svg
      .append("g")
      .attr("id", "gXAxis")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).ticks(6));


    svg.append("text")
    .attr("text-anchor", "end")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .attr("x", width)
    .attr("y", height + margin.top + 10)
    .text(indicator);

    svg.append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .attr("y", -margin.left+10)
    .attr("x", -margin.top+20)
    .text("Price Var %")


    const y = d3
            .scaleLinear()
            .domain([-100,100])
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
      .on("mouseover", (event, d) => {	
        div.transition()		
            .duration(200)		
            .style("opacity", 1);		
        div.html(d.Company + "<br/>")	
            .style("left", (event.pageX) + "px")		
            .style("top", (event.pageY - 28) + "px");	
        handleMouseOver(d)
        })		
      .on("mouseleave", (event, d) => handleMouseLeave(d))			
      .on("mouseout", function(d) {		
          div.transition()		
              .duration(500)		
              .style("opacity", 0);	
      })
      .on("click", (event, d) => handleScatterplotMouseClick(d));
  });
}


function updateScatterPlot(id,sector, indicator) {

    d3.csv(`./dataset/data.csv`).then(function (data) {


      if(eliminate !== ""){
        data = data.filter(d => d.Company !== eliminate); 
        console.log(data)
      }

      if(sector !== "")
        data = data.filter(d => d.Company === sector); 


        const svg = d3.select(`#gScatterPlot`);
        const x = d3
          .scaleLinear()
          .domain([0, d3.max(data, (d) => d[indicator])])
          .range([0, width]);
        svg
          .select("#gXAxis")
          .call(d3.axisBottom(x));
    
        const y = d3
          .scaleLinear()
          .domain([-100, 100])
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
                .attr("cy", (d) => y(d.priceVar))
                .attr("r", 2)
                .style("fill", "steelblue")
              circles
                .attr("cx", (d) => x(d[indicator]))
                .attr("cy", (d) => y(d.priceVar));
              circles.append("title").text((d) => d.Company);
            },
            (update) => {
              update
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




function handleScatterplotMouseClick(item) {
  defaultCompanies.includes(item.Company) ?
      defaultCompanies.pop(item.Company)
      :
      defaultCompanies.push(item.Company)

  updateLineChart("#vi8")  
}

function handleLineChartMouseClick(item) {
  defaultCompanies.pop(item[0])

  updateLineChart("#vi8")  
}

function handleMouseOver(item) {

  company = item[0] || item.Company

  eliminate = company
  updateScatterPlot("#vi1", "returnOnAssets")

  d3.selectAll(".itemValue")
    .filter(function (d, i) {
      return d.Company == company;
    })
    .style("fill", "black").attr("r", 6);

    
  d3.selectAll(".lineTest")
    .filter(function (d, i) {
    return d[0] == company;
    })
    .style("stroke", "black")
    .attr("stroke-width", 3);
}


function handleMouseLeave(item) {
  company = item[0] || item.Company
  const color = d3.scaleOrdinal()
      .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999'])
      
  d3.selectAll(".itemValue").style("fill", "steelblue").attr("r", 2);

  d3.selectAll(".lineTest")
    .filter(function (d, i) {
      return d[0] == company;
    })
    .style("stroke", function(d){ return color(d[0])})
    .attr("stroke-width", 1.5);
}

function updateLineChart(id) {
  const margin = { top: 20, right: 30, bottom: 40, left: 30 };
  const width = 250 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;

  d3.csv("./dataset/total.csv").then(function (data) {

    var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

    const color = d3.scaleOrdinal()
      .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999'])

    data = data.filter(d => defaultCompanies.includes(d.Company) )

    const sumstat = d3.group(data, d => d.Company);

    const svg = d3.select("#gLineChart");

    // Create the X axis:
    var x = d3.scaleLinear()
      .range([0,width])
      .domain(d3.extent(data, function(d) { return d.year; })) ;
    svg.selectAll(".myXaxis")
      .call(d3.axisBottom(x).ticks(5));

    // create the Y axis
    const y = d3.scaleLinear()
        .domain([-50, d3.max(data, function(d) { return +d.priceVar; })])
        .range([height, 0]);
    var yAxis = d3.axisLeft().scale(y);
    
    svg.selectAll(".myYaxis")
      .call(yAxis);

    // Create a update selection: bind to the new data
    var u = svg.selectAll(".lineTest")
      .data(sumstat);

    // Updata the line
    u
      .join(
        (enter) => {
        circles = enter
        .append("path")
        .attr("class","lineTest")
        .merge(u)
        .attr("d", function(d){
                return d3.line()
                  .x(function(d) { return x(d.year); })
                  .y(function(d) { return y(+d.priceVar); })
                  (d[1])
              })
        .attr("fill", "none")
        .attr("stroke", function(d){ return color(d[0]) })
        .attr("stroke-width", 1.5)
        .on("mouseover", (event, d) => {	
          div.transition()		
              .duration(200)		
              .style("opacity", .9);		
          div.html(d[0] + "<br/>")	
              .style("left", (event.pageX) + "px")		
              .style("top", (event.pageY - 28) + "px");	
          handleMouseOver(d)
          })		
        .on("mouseleave", (event, d) => handleMouseLeave(d))			
        .on("mouseout", function(d) {		
            div.transition()		
                .duration(500)		
                .style("opacity", 0);	
        })
        .on("click", (event, d) => {
          handleLineChartMouseClick(d)
          div.transition()		
                .duration(500)		
                .style("opacity", 0);	
        });
        },
        (update) => {
          update
            .transition()
            .duration(1000)
            .attr("cx", (d) => x(d.year))
            .attr("cy", (d) => y(d.priceVar))
            .attr("r", 4);
        },
        (exit) => {
            exit.remove();
          }
      )
      ;
  });
}

function createLineChart(id) {

  var div = d3.select("body").append("div")	
      .attr("class", "tooltip")				
      .style("opacity", 0);

  const margin = { top: 20, right: 30, bottom: 40, left: 50 };
  const width = 300 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3.select(id)
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("id", "gLineChart")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");





  // Initialise a X axis:
  var x = d3.scaleLinear().range([0,width]);
  svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .attr("class","myXaxis")

  // Initialize an Y axis
  var y = d3.scaleLinear().range([height, 0]);
  var yAxis = d3.axisLeft().scale(y);
  svg.append("g")
  .attr("class","myYaxis")

  const color = d3.scaleOrdinal()
      .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999'])


    svg.append("text")
    .attr("text-anchor", "end")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .attr("x", width)
    .attr("y", height + margin.top + 10)
    .text("year");

    svg.append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .attr("y", -margin.left+20)
    .attr("x", -margin.top+20)
    .text("Price Var %")

  
  d3.csv("./dataset/total.csv").then(function (data) {

  data = data.filter(d => defaultCompanies.includes(d.Company) )

  const sumstat = d3.group(data, d => d.Company);

  // Create the X axis:
  x.domain(d3.extent(data, function(d) { return d.year; })) ;
  svg.selectAll(".myXaxis")
    .call(d3.axisBottom(x).ticks(5).tickFormat((x) => x));

  // create the Y axis
  y.domain([-50, d3.max(data, function(d) { return +d.priceVar; })]);
  svg.selectAll(".myYaxis")
    .call(yAxis);

  // Create a update selection: bind to the new data

  svg.selectAll(".lineTest")
  .data(sumstat)
  .join("path")
    .attr("fill", "none")
    .attr("stroke", function(d){ return color(d[0]) })
    .attr("stroke-width", 1.5)
    .attr("class", "lineTest")
    .attr("d", function(d){
      return d3.line()
        .x(function(d) { return x(d.year); })
        .y(function(d) { return y(+d.priceVar); })
        (d[1])
    })
    .on("mouseover", (event, d) => {		
      div.transition()		
          .duration(200)		
          .style("opacity", .9);		
      div.html(d[0] + "<br/>")	
          .style("left", (event.pageX) + "px")		
          .style("top", (event.pageY - 28) + "px");	
      handleMouseOver(d)
      })		
    .on("mouseleave", (event, d) => handleMouseLeave(d))			
    .on("mouseout", function(d) {		
        div.transition()		
            .duration(500)		
            .style("opacity", 0);	
    })
    .on("click", (event, d) => {
      handleLineChartMouseClick(d)
      div.transition()		
            .duration(500)		
            .style("opacity", 0);	
    });
    ;


});
}


function updateYear() {

  for(var i = 0; i < defaultIndicators.length; i++){
    updateScatterPlot(`#vi${i+1}`, "", defaultIndicators[i])
  }

  updateLineChart()
}