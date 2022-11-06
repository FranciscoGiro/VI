var year = 2014
var defaultIndicators = ["returnOnAssets","EBITDA Margin","returnOnEquity", "ROIC", "Debt to Equity", "priceBookValueRatio"]
var indicators = ["returnOnAssets","EBITDA Margin","returnOnEquity", "ROIC", "Debt to Equity", "priceBookValueRatio"]
var indexToRemove = 0
var defaultCompanies = ["PG", "KR", "GIS", "OHAI"]
var selectedCompanies = ["PG", "KR", "GIS", "OHAI"]
var selectedColors = new Map();
selectedColors.set("PG","red")
selectedColors.set("KR","green") 
selectedColors.set("GIS","yellow")
selectedColors.set("OHAI","purple")
var availableColors = ["red", "green", "yellow", "purple", "orange"]
var sectors = ["CD","BM","H", "CC", "I", "RE", "T", "CS", "E", "FS", "U"]
var allSectors = ["CD","BM","H", "CC", "I", "RE", "T", "CS", "E", "FS", "U"]

var sector_to_abrev = {"Consumer Defensive":"CD", "Basic Materials":"BM", "Healthcare":"H", 
                "Consumer Cyclical":"CC", "Industrials": "I","Real Estate":"RE", "Technology":"T",
                "Communication Services":"CS", "Energy":"E", "Financial Services":"FS", "Utilities":"U"}

var abrev_to_sector = {"CD":"Consumer Defensive", "BM":"Basic Materials", "H":"Healthcare", 
                "CC":"Consumer Cyclical", "I":"Industrials","RE":"Real Estate", "T":"Technology",
                "CS":"Communication Services", "E":"Energy", "FS":"Financial Services", "U":"Utilities"}




function init() {
  updateColorLabels()
  for(let i=0; i < defaultIndicators.length; i++)
    createScatterPlot(`vi${i+1}`, defaultIndicators[i])

    createLineChart("#vi8")
    createBubbleChart("#vi9")
    createParallelCoordinates("#vi10")

  d3.select("#b2014").on("click", () => {
    year = 2014
    updateAll()
  });
  d3.select("#b2015").on("click", () => {
    year = 2015;
    updateAll()

  });
  d3.select("#b2016").on("click", () => {
    year = 2016;
    updateAll()

  });
  d3.select("#b2017").on("click", () => {
    year = 2017;
    updateAll()
  });
  d3.select("#b2018").on("click", () => {
    year = 2018;
    updateAll()
  });
  d3.select("#reset").on("click", () => {
    year = 2014
    indicators = ["returnOnAssets","EBITDA Margin","returnOnEquity", "ROIC", "Debt to Equity", "priceBookValueRatio"] 
    indexToRemove = 0
    defaultCompanies = ["PG", "KR", "GIS"]
    sectors = ["CD","BM","H", "CC", "I", "RE", "T", "CS", "E", "FS", "U"]
    updateAll()
  });

}

//Scatterplots

function createScatterPlot(id, indicator) {
  var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);



  const margin = { top: 20, right: 30, bottom: 40, left: 40 };
  const width = 200 - margin.left - margin.right;
  const height = 160 - margin.top - margin.bottom;


  const svg = d3
    .select(`#${id}`)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("id", `gScatterPlot-${id}`)
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

    svg.append("text")
    .attr("text-anchor", "end")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .attr("class", "indicatorText")
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

    d3.csv("./dataset/2014.csv").then(function (data) {

    const x = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => +d[indicator]))
      .range([0, width]);
    svg
      .append("g")
      .attr("id", "gXAxis")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).ticks(6));
      
    const y = d3.scaleLinear()
                .domain(d3.extent(data, (d) => +d.priceVar))
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
      .style("fill", (d) => {
        return selectedCompanies.includes(d.Company) ?
        selectedColors.get(d.Company)
        :
        "steelblue"
      })
      .on("mouseover", (event, d) => {	
        div.transition()		
            .duration(200)		
            .style("opacity", 1);		
        div.html(d.Company + "<br/>")	
            .style("left", (event.pageX) + "px")		
            .style("top", (event.pageY - 28) + "px");	
        handleMouseOver(d.Company)
        })		
      .on("mouseleave", (event, d) => handleMouseLeave(d.Company))
      .on("mouseout", function(d) {		
        div.transition()		
            .duration(500)		
            .style("opacity", 0);	
      })
      .on("click", (event, d) => handleLineChartMouseClick(d.Company))
  });
}

function updateScatterPlot(id, indicator) {

  var div = d3.select("body").append("div")	
  .attr("class", "tooltip")				
  .style("opacity", 0);

  const margin = { top: 20, right: 30, bottom: 40, left: 40 };
  const width = 200 - margin.left - margin.right;
  const height = 160 - margin.top - margin.bottom;

  
  d3.csv(`./dataset/${year}.csv`).then(function (data) {
    
    if(sectors.length == 1){
      let real_sector = abrev_to_sector[sectors[0]]
      data = data.filter(d => d.Sector == real_sector)
    }

    const svg = d3.select(`#gScatterPlot-${id}`);


    svg.select(".indicatorText")
        .text(indicator)

    const x = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => +d[indicator]))
      .range([0, width]);
    svg
      .select("#gXAxis")
      .call(d3.axisBottom(x).ticks(6));

    const y = d3.scaleLinear()
                .domain(d3.extent(data, (d) => +d.priceVar))
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
            .attr("cx", (d) => x(+d[indicator]))
            .attr("cy", (d) => y(0))
            .attr("r", 2)
            .style("fill", (d) => {
              return selectedCompanies.includes(d.Company) ?
              selectedColors.get(d.Company)
              :
              "steelblue"
            })
            .on("mouseover", (event, d) => {	
              div.transition()		
                  .duration(200)		
                  .style("opacity", 1);		
              div.html(d.Company + "<br/>")	
                  .style("left", (event.pageX) + "px")		
                  .style("top", (event.pageY - 28) + "px");	
              handleMouseOver(d.Company)
              })		
            .on("mouseleave", (event, d) => handleMouseLeave(d.Company))
            .on("click", (event, d) => handleLineChartMouseClick(d.Company))
            .on("mouseout", function(d) {		
              div.transition()		
                  .duration(500)		
                  .style("opacity", 0);	
          })
          circles
            .transition()
            .duration(1000)
            .attr("cy", (d) => y(+d.priceVar));
        },
        (update) => {
          update
            .transition()
            .duration(1000)
            .attr("cx", (d) => x(+d[indicator]))
            .attr("cy", (d) => y(+d.priceVar))
            .attr("r", 2);
        },
        (exit) => {
          exit.remove();
        }
      );
  });
}

//Line Chart

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

  data = data.filter(d => defaultCompanies.includes(d.Company))

  let sumstat = d3.group(data, d => d.Company);
  sumstat = new Map([...sumstat.entries()].sort());

  // Create the X axis:
  x.domain(d3.extent(data, d => +d.year)) ;
  svg.selectAll(".myXaxis")
    .call(d3.axisBottom(x).ticks(5).tickFormat((x) => x));

  // create the Y axis
  y.domain(d3.extent(data, d => +d.priceVar));
  svg.selectAll(".myYaxis")
    .call(yAxis);

  // Create a update selection: bind to the new data

  svg.selectAll(".lineTest")
  .data(sumstat, d => d[0])
  .join("path")
    .attr("fill", "none")
    .attr("stroke", function(d){ return selectedColors.get(d[0])})
    .attr("stroke-width", 1.5)
    .attr("class", "lineTest")
    .attr("d", function(d){
      return d3.line()
        .x(d => x(d.year))
        .y(d => y(+d.priceVar)) 
        (d[1])
    })
    .on("mouseover", (event, d) => {		
      div.transition()		
          .duration(200)		
          .style("opacity", .9);		
      div.html(d[0] + "<br/>")	
          .style("left", (event.pageX) + "px")		
          .style("top", (event.pageY - 28) + "px");	
      handleMouseOver(d[0])
      })		
  .on("mouseout", function(d) {		
      div.transition()		
          .duration(500)		
          .style("opacity", 0);	
  })
  .on("mouseleave", (event, d) => handleLineChartMouseLeave(d[0], selectedColors.get(d[0])))			
  .on("click", (event, d) => {
      handleLineChartMouseClick(d[0])
      div.transition()		
            .duration(500)		
            .style("opacity", 0);	
    });

    svg
      .selectAll("circle.lineValues") 
      .data(data, (d) => d.Company) 
      .join("circle")
      .attr("class", "lineValues")
      .attr("cx", (d) => x(d.year))
      .attr("cy", (d) => y(+d.priceVar))
      .attr("r", 3.3)
      .style("fill", d => selectedColors.get(d.Company))
      .on("click", (event, d) => {
        handleLineChartMouseClick(d.Company)
        div.transition()		
              .duration(500)		
              .style("opacity", 0);	
      })
      .on("mouseover", (event, d) => {		
        div.transition()		
            .duration(200)		
            .style("opacity", .9);		
        div.html(`${d.Company}\n${Number(d.priceVar).toFixed(2)}` + "<br/>")	
            .style("left", (event.pageX) + "px")		
            .style("top", (event.pageY - 28) + "px");	
        handleMouseOver(d.Company)
        })	
      .on("mouseleave", (event, d) => handleLineChartMouseLeave(d.Company, selectedColors.get(d.Company)))
      .on("mouseout", function(d) {		
        div.transition()		
            .duration(500)		
            .style("opacity", 0);	
    })
  });
}

function updateLineChart() {


  var div = d3.select("body").append("div")	
  .attr("class", "tooltip")				
  .style("opacity", 0);


  const margin = { top: 20, right: 30, bottom: 40, left: 30 };
  const width = 250 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;

  d3.csv(`./dataset/total.csv`).then(function (data) {


/*     if(sectors.length == 1){
      let real_sector = abrev_to_sector[sectors[0]]
      data = data.filter(d => d.Sector == real_sector)
    } */


    const color = d3.scaleOrdinal()
      .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999'])

    data = data.filter(d => selectedCompanies.includes(d.Company) )

    const sumstat = d3.group(data, d => d.Company);

    const svg = d3.select("#gLineChart");

    // Create the X axis:
    var x = d3.scaleLinear()
      .range([0,width])
      .domain(d3.extent(data, function(d) { return d.year; })) ;
    svg.selectAll(".myXaxis")
      .call(d3.axisBottom(x).ticks(5).tickFormat((x) => x));

    // create the Y axis
    const y = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { return +d.priceVar; }))
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
        .attr("stroke", function(d){ return selectedColors.get(d[0]) })
        .attr("stroke-width", 1.5)
        .on("mouseover", (event, d) => {	
          div.transition()		
              .duration(200)		
              .style("opacity", .9);		
          div.html(d[0] + "<br/>")	
              .style("left", (event.pageX) + "px")		
              .style("top", (event.pageY - 28) + "px");	
          handleMouseOver(d[0])
          })		
        .on("mouseleave", (event, d) => handleLineChartMouseLeave(d[0], selectedColors.get(d[0])))			
        .on("mouseout", function(d) {		
            div.transition()		
                .duration(500)		
                .style("opacity", 0);	
        })
        .on("click", (event, d) => {
          handleLineChartMouseClick(d[0])
          div.transition()		
                .duration(500)		
                .style("opacity", 0);	
        });
        },
        (update) => {
          update
            .attr("cx", (d) => x(d.year))
            .attr("cy", (d) => y(+d.priceVar))
            .attr("r", 4);
        },
        (exit) => {
            exit.remove();
          }
      );


      svg
      .selectAll("circle.lineValues")
      .data(data, (d) => d.Company)
      .join(
        (enter) => {
          circles = enter
            .append("circle")
            .attr("class", "lineValues")
            .attr("cx", (d) => x(d.year))
            .attr("cy", (d) => y(+d.priceVar))
            .attr("r", 3.3)
            .style("fill", d => selectedColors.get(d.Company))
            .on("mouseout", function(d) {		
              div.transition()		
                  .duration(500)		
                  .style("opacity", 0);	
          })
          .on("mouseover", (event, d) => {		
              div.transition()		
                  .duration(200)		
                  .style("opacity", .9);		
              div.html(`${d.Company}\n${Number(d.priceVar).toFixed(2)}` + "<br/>")	
                  .style("left", (event.pageX) + "px")		
                  .style("top", (event.pageY - 28) + "px");	
              handleMouseOver(d.Company)
              })	
            .on("mouseleave", (event, d) => handleLineChartMouseLeave(d.Company, selectedColors.get(d.Company)))
            .on("click", (event, d) => {
              handleLineChartMouseClick(d.Company)
              div.transition()		
                    .duration(500)		
                    .style("opacity", 0);	
            });
        },
        (update) => {
          update
            .attr("cx", (d) => x(d.year))
            .attr("cy", (d) => y(+d.priceVar))
            .attr("r", 3.3)
            .style("fill", d => selectedColors.get(d.Company));
        },
        (exit) => {
          exit.remove();
        }
      );
  });
}

//Bubble Chart

function createBubbleChart(id) {

  var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);
  
  var div2 = d3.select("body").append("div")	
    .attr("class", "sectorName")				
    .style("opacity", 0);

  const margin = {top: 10, right: 20, bottom: 30, left: 50}
  const width = 400 - margin.left - margin.right;
  const height = 230 - margin.top - margin.bottom;
    

    console.log(height + margin.top + margin.bottom)
    // append the svg object to the body of the page
    const svg = d3.select(id)
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("id", "gBubbleChart")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    var x = d3.scaleBand()
        .domain(sectors)
        .range([0, width])
        .padding(1)
    var xAxis = d3.axisBottom().scale(x);
    var xaxis = svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .attr("class","myXaxis")

    var y = d3.scaleLinear().range([height, 0]);
    var yAxis = d3.axisLeft().scale(y);
    svg.append("g")
        .attr("class","myYaxis")

    svg.append("text")
    .attr("text-anchor", "end")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .attr("x", width - 20)
    .attr("y", height + margin.top + 20)
    .text("Sectors");

    svg.append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .attr("y", -margin.left+10)
    .attr("x", -margin.top)
    .text("Price Var %")

    // Add a scale for bubble color
    const myColor = d3.scaleOrdinal()
    .domain(allSectors)
    .range(d3.schemeSet2);

    d3.csv(`./dataset/${year}.csv`).then( function(data) {

    
      // Add X axis
      var newaxis = svg.selectAll(".myXaxis")
         .call(xAxis);

        newaxis.selectAll(".tick")
            .on("mouseout", function(d) {		
              div2.transition()		
                  .duration(500)		
                  .style("opacity", 0);	
            })
            .on("mouseover", (event, d) => {		
                div2.transition()		
                    .duration(200)		
                    .style("opacity", .9);		
                div2.html(`${abrev_to_sector[d]}` + "<br/>")	
                    .style("left", (event.pageX-20) + "px")		
                    .style("top", (event.pageY+10) + "px")
                    .style("background", myColor(d));
                //handleMouseOver(d.Company) TODO 
            })

    
      // Add Y axis

      y.domain(d3.extent(data, (d) => +d.priceVar));
        svg.selectAll(".myYaxis")
            .call(yAxis);

      // Add a scale for bubble size
      const z = d3.scaleLinear()
        .domain(d3.extent(data, (d) => +d["Market Capitalisation"]))
        .range([ 4, 20]);
  
    
      // Add dots
       svg
        .selectAll(".bubbleValues")
        .data(data)
        .join("circle")
          .attr("class", "bubbleValues")
          .attr("cx", d => x(sector_to_abrev[d.Sector]))
          .attr("cy", d => y(+d.priceVar))
          .attr("r", d => z(d["Market Capitalisation"]))
          .style("fill", d => myColor(sector_to_abrev[d.Sector]))
          .style("opacity", "0.7")
          .attr("stroke", "white")
          .style("stroke-width", "2px")
          .on("click", (event, d) => handleBubbleChartClick(d.Sector))
          .on("mouseout", function(d) {		
            div.transition()		
                .duration(500)		
                .style("opacity", 0);	
          })
          .on("mouseover", (event, d) => {		
              div.transition()		
                  .duration(200)		
                  .style("opacity", .9);		
              div.html(`${d.Company}` + "<br/>")	
                  .style("left", (event.pageX) + "px")		
                  .style("top", (event.pageY - 28) + "px");	
              handleMouseOver(d.Company)
              })
            .on("mouseleave", (event,d) => handleMouseLeave(d.Company))
      })
}

function updateBubbleChart() {
  
    var div = d3.select("body").append("div")	
      .attr("class", "tooltip")				
      .style("opacity", 0);

    const margin = {top: 10, right: 20, bottom: 30, left: 50}
    const width = 400 - margin.left - margin.right;
    const height = 230 - margin.top - margin.bottom;
    

    // append the svg object to the body of the page
    const svg = d3.select("#gBubbleChart")

    var x = d3.scaleBand()
    .domain(allSectors)
    .range([0, width])
    .padding(1)
      
    d3.csv(`./dataset/${year}.csv`).then( function(data) {

      console.log(sectors)
      if(sectors.length == 1){
        let real_sector = abrev_to_sector[sectors[0]]
        data = data.filter(d => d.Sector == real_sector)
      }
      // Add Y axis
      const y = d3.scaleLinear()
            .domain(d3.extent(data, (d) => +d.priceVar))
            .range([height, 0]);
      svg.select("myYaxis").call(d3.axisLeft(y));

      // Add a scale for bubble size
      const z = d3.scaleLinear()
        .domain([0, 100])
        .range([ 4, 40]);
    
      // Add a scale for bubble color
      const myColor = d3.scaleOrdinal()
        .domain(sectors)
        .range(d3.schemeSet2);
    
      // Add dots
      svg
      .selectAll(".bubbleValues")
      .data(data, (d) => d.Company)
      .join(
        (enter) => {
          circles = enter
            .append("circle")
            .attr("class","bubbleValues")
            .attr("cx", d => x(sector_to_abrev[d.Sector]))
            .attr("cy", d => y(d.priceVar))
            .attr("r", d => z(d["Market Capitalisation"]))
            .attr("fill", d => myColor(d.Sector))
            .style("opacity", "0.7")
            .attr("stroke", "white")
            .style("stroke-width", "2px")
            .on("click", (event, d) => handleBubbleChartClick(d.Sector))
            .on("mouseout", function(d) {		
              div.transition()		
                  .duration(500)		
                  .style("opacity", 0);	
            })
            .on("mouseover", (event, d) => {		
                div.transition()		
                    .duration(200)		
                    .style("opacity", .9);		
                div.html(`${d.Company}` + "<br/>")	
                    .style("left", (event.pageX) + "px")		
                    .style("top", (event.pageY - 28) + "px");	
                //handleMouseOver(d.Company) TODO 
                })
          circles
            .transition()
            .duration(1000)
            .attr("cy", d => y(d.priceVar))
        },
        (update) => {
          update
            .attr("cx", d => x(sector_to_abrev[d.Sector]))
            .attr("cy", (d) => y(+d.priceVar))
            .attr("r", d => z(d["Market Capitalisation"]))
        },
        (exit) => {
          exit.remove();
        }
      );
    })
}

// Parallel Coordinates

function createParallelCoordinates(id) {

  var div = d3.select("body").append("div")	
  .attr("class", "tooltip")				
  .style("opacity", 0);

  const margin = {top: 30, right: 50, bottom: 10, left: 100},
      width = 850 - margin.left - margin.right,
      height = 250 - margin.top - margin.bottom;
    
    // append the svg object to the body of the page
    const svg = d3.select("#vi10")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("id", "gParallelCoordinatesChart")
      .attr("transform",
            `translate(${margin.left},${margin.top})`);
    
    // Parse the Data
    d3.csv(`./dataset/${year}.csv`).then( function(data) {

      if(sectors.length == 1){
        let real_sector = abrev_to_sector[sectors[0]]
        data = data.filter(d => d.Sector == real_sector)
      }

    
      // Here I set the list of dimension manually to control the order of axis:
      dimensions = ["priceVar","Gross Margin","EBITDA Margin","Net Profit Margin","returnOnEquity","ROIC","returnOnAssets","Net Debt to EBITDA","Debt to Equity","PE ratio","Enterprise Value over EBITDA","priceBookValueRatio"]
    
      // For each dimension, I build a linear scale. I store all in a y object
      const y = {}
      for (i in dimensions) {
        name = dimensions[i]
        y[name] = d3.scaleLinear()
          .domain(d3.extent(data, (d) => +d[name]))
          // --> different axis range for each group --> .domain( [d3.extent(data, function(d) { return +d[name]; })] )
          .range([height, 0])
      }
    
      // Build the X scale -> it find the best position for each Y axis
      x = d3.scalePoint()
        .range([0, width])
        .domain(dimensions);
    
      // Highlight the specie that is hovered
    
      // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
      function path(d) {
          return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
      }
    
      // Draw the lines
      svg
        .selectAll("myPath")
        .data(data)
        .join("path")
          .attr("class", "myPath" ) 
          .attr("d",  path)
          .style("fill", "none" )
          .style("stroke", function(d){ return( pathColorParallel(+d.priceVar))} )
          .style("stroke-width", 1.5)
          .style("opacity", 0.5)
          .on("mouseout", function(d) {		
            div.transition()		
                .duration(500)		
                .style("opacity", 0);	
          })
          .on("mouseleave", (event, d) => handleMouseLeave(d.Company))
          .on("mouseover", (event, d) => {		
              div.transition()		
                  .duration(200)		
                  .style("opacity", .9);		
              div.html(`${d.Company}` + "<br/>")	
                  .style("left", (event.pageX) + "px")		
                  .style("top", (event.pageY - 28) + "px");
              handleMouseOver(d.Company)
          })
    
      // Draw the axis:
      svg.selectAll("myAxis")
        // For each dimension of the dataset I add a 'g' element:
        .data(dimensions)
        .enter()
        .append("g")
        .attr("class", "axis")
        // I translate this element to its right position on the x axis
        .attr("transform", function(d) { return `translate(${x(d)})`})
        // And I build the axis with the call function
        .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
        .on("click", (event, d) => handleParallelCoordinatesClick(d))
        // Add axis title
        .append("text")
          .style("text-anchor", "middle")
          .attr("y", -9)
          .text(function(d) { return d; })
          .style("fill", "black")
          .style("cursor", d => d == "priceVar" ? "auto" : "pointer")
          .attr("transform", "rotate(-45)")
    
    })
}



// Handle Events

function handleMouseOver(company) {
  //lines in Parallel Coordinates
  d3.selectAll(".myPath")
  .filter(d => d.Company == company)
  .style("stroke-width", 3)
  .style("stroke", "black")
  .style("opacity", 1)

  //circles in bubble chart
  d3.selectAll(".bubbleValues")
  .filter(d => d.Company == company)
  .style("fill", "black")

  //circles in line chart
  d3.selectAll(".lineValues")
    .filter(d => d.Company == company)
    .style("fill", "black")
    .attr("r", 4);

  //circles in scatterplots
  d3.selectAll(".itemValue")
    .filter(function (d, i) {
      return d.Company == company;
    })
    .attr("r", 4)
    .style("fill", "black");

  //line chart path
  d3.selectAll(".lineTest")
    .filter(function (d, i) {
      return d[0] == company;
    })
    .attr("stroke", "black")
    .style("stroke-width", 3);

}

function handleMouseLeave(company) {

  const sectorColor = d3.scaleOrdinal()
  .domain(allSectors)
  .range(d3.schemeSet2);

  //parallel coordinates lines
  d3.selectAll(".myPath")
  .filter(d => d.Company == company)
  .style("stroke-width", 1.5)
  .style("stroke", (d) => pathColorParallel(d.priceVar))
  .style("opacity", 0.5)

  d3.selectAll(".bubbleValues")
  .filter(d => d.Company == company)
  .style("fill", (d) => sectorColor(sector_to_abrev[d.Sector]))

  //scatterplots dot
  d3.selectAll(".itemValue")
    .style("fill", (d) => {
      return selectedCompanies.includes(d.Company) ?
      selectedColors.get(d.Company)
      :
      "steelblue"
    })
    .attr("r", 2);
  

  // dots in Line Chart
  d3.selectAll(".lineValues")
    .filter(d => d.Company == company)
    .attr("r", 3.3)
    .style("fill", (d) => selectedColors.get(d.Company));
    
  //line chart lines
  d3.selectAll(".lineTest")
    .filter(function (d, i) {
      return d[0] == company;
    })
    .attr("stroke", (d) => selectedColors.get(d[0]))
    .style("stroke-width", 1.5);
}

function handleLineChartMouseLeave(company, color) {
  const sectorColor = d3.scaleOrdinal()
  .domain(allSectors)
  .range(d3.schemeSet2);

  d3.selectAll(".myPath")
  .filter(d => d.Company == company)
  .style("stroke-width", 1.5)
  .style("stroke", (d) => pathColorParallel(d.priceVar))
  .style("opacity", 0.2)

  d3.selectAll(".bubbleValues")
  .filter(d => d.Company == company)
  .style("fill", (d) => sectorColor(sector_to_abrev[d.Sector]))


  d3.selectAll(".itemValue")
    .style("fill", (d) => {
      return selectedCompanies.includes(d.Company) ?
      selectedColors.get(d.Company)
      :
      "steelblue"
    })
    .attr("r", 2);

  d3.selectAll(".lineValues")
  .filter(d => d.Company == company)
  .style("fill", color)
  .attr("r", 3.3);


  d3.selectAll(".lineTest")
    .filter(function (d, i) {
      return d[0] == company;
    })
    .attr("stroke", color)
    .style("stroke-width", 1.5);
}

function handleLineChartMouseClick(company) {
  if(selectedCompanies.includes(company)){
    selectedCompanies = selectedCompanies.filter(d => d !== company)
    selectedColors.delete(company)
    d3.selectAll(".itemValue")
      .style("fill", (d) => {
        return selectedCompanies.includes(d.Company) ?
        selectedColors.get(d.Company)
        :
        "steelblue"
      }).attr("r", 2);
    d3.selectAll(".lineTest").style("stroke-width", 1.5);
  }
  else{
    selectedCompanies.push(company)
    selectedColors.set(company, getFreeColor())
  }
  updateLineChart()  
  updateColorLabels()

}

function handleBubbleChartClick(sector) {
  if(sectors.length == 1)
    sectors = ["CD","BM","H", "CC", "I", "RE", "T", "CS", "E", "FS", "U"]
  else{
    let abrev = sector_to_abrev[sector]
    sectors = sectors.filter(s => s == abrev)
  }
  updateAll()
}

function handleParallelCoordinatesClick(indicator){
  if(indicators.includes(indicator) || indicator == "priceVar")
    return
  
  indicators[indexToRemove] = indicator

  indexToRemove = (indexToRemove+1) % 6

  updateAllExceptParallel()
}

//Update All charts

function updateAllExceptParallel() {
  for(let i=0; i < indicators.length; i++)
    updateScatterPlot(`vi${i+1}`, indicators[i])

  updateLineChart()
  updateBubbleChart()
  updateColorLabels()
}

function updateAll() {
  for(let i=0; i < indicators.length; i++)
    updateScatterPlot(`vi${i+1}`, indicators[i])

  updateLineChart()
  updateBubbleChart()
  d3.select("#gParallelCoordinatesChart").remove()
  createParallelCoordinates()
  updateColorLabels()
}

// Auxiliar functions

function randomColor() {
  colors = ["blue", "steelblue", "orange", "yellow", "green", "purple", "red", "pink" ]
  let random = Math.floor(Math.random() * 8);
  return colors[random]
}

function pathColorParallel(priceVar) {
  if(priceVar < -30)
    return "#5F021F"
  else if(priceVar < 0)
    return "red"
  else if(priceVar < 10)
    return "grey"
  else if(priceVar < 40)
    return "lightgreen"
  else 
    return "green"
}

function getFreeColor(){
  const colors = [...selectedColors.values()]
  for(let i=0; i < availableColors.length; i++)
    if(!colors.includes(availableColors[i]))
      return availableColors[i]
}

function updateColorLabels(){
    texto = ""
    for(let i=0; i < selectedCompanies.length; i++)
      texto += `<h3><span class="dot" style="background-color:${selectedColors.get(selectedCompanies[i])}"></span>${selectedCompanies[i]}<h3>\n`
   
    div = d3.select("#colors")
    div.html(texto)	
}