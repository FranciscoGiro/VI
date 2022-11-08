var year = 2014
var defaultIndicators = ["EBITDA Margin (%)","ROA","ROE", "ROIC", "D/E", "P/B"]
var indicators = ["EBITDA Margin (%)","ROA","ROE", "ROIC", "D/E", "P/B"]
var indexToRemove = 0
var defaultCompanies = ["PG", "KR", "GIS"]
var selectedCompanies = ["PG", "KR", "GIS"]
var hide = []
var selectedColors = new Map();
selectedColors.set("PG","steelblue")
selectedColors.set("KR","orange") 
selectedColors.set("GIS","palevioletred")
var availableColors = ["limegreen", "orange", "steelblue", "palevioletred ", "grey"]
var sectors = ["CD","BM","H", "CC", "I", "RE", "T", "CS", "E", "FS", "U"]
var allSectors = ["CD","BM","H", "CC", "I", "RE", "T", "CS", "E", "FS", "U"]

var sector_to_abrev = {"Consumer Defensive":"CD", "Basic Materials":"BM", "Healthcare":"H", 
                "Consumer Cyclical":"CC", "Industrials": "I","Real Estate":"RE", "Technology":"T",
                "Communication Services":"CS", "Energy":"E", "Financial Services":"FS", "Utilities":"U"}

var abrev_to_sector = {"CD":"Consumer Defensive", "BM":"Basic Materials", "H":"Healthcare", 
                "CC":"Consumer Cyclical", "I":"Industrials","RE":"Real Estate", "T":"Technology",
                "CS":"Communication Services", "E":"Energy", "FS":"Financial Services", "U":"Utilities"}
var maxValues = {}
var activeBrushes = new Map();

//

var indicator_to_abrev = {"Gross Margin (%)":"GM","ROE":"ROE","Net Profit Margin (%)":"NPM","ROIC":"ROIC","3Y Revenue Growth (%)":"3Y RG","3Y Net Income Growth (%)":"3Y IG","D/E":"D/E","Net Debt to EBITDA":"NDE","P/E":"P/E","EV/EBITDA":"EV/E","P/B":"P/B","EBITDA Margin (%)":"EM","ROA":"ROA"}


function init() {
  updateColorLabels()
  for(let i=0; i < defaultIndicators.length; i++)
    createScatterPlot(`vi${i+1}`, defaultIndicators[i])

    createRadarChart("#vi7")
    createLineChart("#vi8")
    createBubbleChart("#vi9")
    createParallelCoordinates("#vi10")

  d3.select("#b2014")
    .style("background-color", "black")
    .style("color", "white")
    .on("click", () => {
    year = 2014
    updateAll()
  });
  d3.select("#b2015").on("click", () => {
    year = 2015;
    d3.selectAll('#clica').dispatch('click');
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
    indicators = ["ROA","EBITDA Margin (%)","ROE", "ROIC", "D/E", "P/B"] 
    indexToRemove = 0
    selectedCompanies = ["PG", "KR", "GIS"]
    selectedColors = new Map();
    selectedColors.set("PG","red")
    selectedColors.set("KR","green") 
    selectedColors.set("GIS","yellow")
    sectors = ["CD","BM","H", "CC", "I", "RE", "T", "CS", "E", "FS", "U"]
    updateAll()
  });

}

//Scatterplots

function createScatterPlot(id, indicator) {
  var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);



  const margin = { top: 20, right: 15, bottom: 40, left: 55 };
  const width = 220 - margin.left - margin.right;
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
    .attr("font-size", "10px")
    .attr("font-family", "sans-sarif")
    .attr("font-weight", "bold")
    .attr("class", "indicatorText")
    .attr("x", width)
    .attr("y", height + margin.top + 10)
    .text(indicator);

    svg.append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("font-size", "10px")
    .attr("font-family", "sans-sarif")
    .attr("font-weight", "bold")
    .attr("y", -margin.left+20)
    .attr("x", -margin.top+20)
    .text("Price Change (%)")

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
                .domain(d3.extent(data, (d) => +d["Price Change (%)"]))
                .range([height, 0]);
    svg
      .append("g")
      .attr("id", "gYAxis")
      .call(d3.axisLeft(y).ticks(8));

    svg
      .selectAll("circle.circleValues") 
      .data(data, (d) => d.Company) 
      .enter()
      .append("circle")
      .attr("class", "circleValues itemValue")
      .attr("cx", (d) => x(d[indicator]))
      .attr("cy", (d) => y(d["Price Change (%)"]))
      .attr("r", (d) => {
        return selectedCompanies.includes(d.Company) ?
        4
        :
        2
      })
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
      .on("mouseleave", (event, d) => handleMouseLeave())
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

  const margin = { top: 20, right: 15, bottom: 40, left: 55 };
  const width = 220 - margin.left - margin.right;
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
                .domain(d3.extent(data, (d) => +d["Price Change (%)"]))
                .range([height, 0]);
    svg.select("#gYAxis").call(d3.axisLeft(y).ticks(8));

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
            .attr("r", (d) => { return selectedCompanies.includes(d.Company) ? 4 : 2})
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
            .on("mouseleave", (event, d) => handleMouseLeave())
            .on("click", (event, d) => handleLineChartMouseClick(d.Company))
            .on("mouseout", function(d) {		
              div.transition()		
                  .duration(500)		
                  .style("opacity", 0);	
          })
          circles
            .transition()
            .duration(1000)
            .attr("cy", (d) => y(+d["Price Change (%)"]));
        },
        (update) => {
          update
            .transition()
            .duration(1000)
            .attr("cx", (d) => x(+d[indicator]))
            .attr("cy", (d) => y(+d["Price Change (%)"]))
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

  const margin = { top: 15, right: 30, bottom: 40, left: 50 };
  const width = 350 - margin.left - margin.right;
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


  const color = d3.scaleOrdinal()
      .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999'])


  svg.append("text")
  .attr("text-anchor", "end")
  .attr("font-size", "10px")
  .attr("font-family", "sans-serif")
  .attr("font-weight", "bold")
  .attr("x", width)
  .attr("y", height + margin.top + 10)
  .text("year");

  svg.append("text")
  .attr("text-anchor", "end")
  .attr("transform", "rotate(-90)")
  .attr("font-size", "10px")
  .attr("font-family", "sans-serif")
  .attr("font-weight", "bold")
  .attr("y", -margin.left+20)
  .attr("x", -margin.top+20)
  .text("Price Change (%)")

  
  d3.csv("./dataset/total.csv").then(function (data) {

  data = data.filter(d => defaultCompanies.includes(d.Company))

  let sumstat = d3.group(data, d => d.Company);
  sumstat = new Map([...sumstat.entries()].sort());

  // Create the X axis:
  x.domain(d3.extent(data, d => +d.year)) ;
  svg.selectAll(".myXaxis")
    .call(d3.axisBottom(x).ticks(5).tickFormat((x) => x));

    // Initialize an Y axis
  var y = d3.scaleLinear()
            .domain(d3.extent(data, d => +d["Price Change (%)"]))
            .range([height, 0]);
  svg.append("g")
     .attr("id", "gYAxis")
     .call(d3.axisLeft(y));

  // Create a update selection: bind to the new data

  svg.selectAll(".lineTest")
  .data(sumstat, d => d[0])
  .enter()
  .append("path")
    .attr("fill", "none")
    .attr("stroke", function(d){ return selectedColors.get(d[0])})
    .attr("stroke-width", 1.5)
    .attr("class", "lineTest")
    .attr("d", function(d){
      return d3.line()
        .x(d => x(d.year))
        .y(d => y(+d["Price Change (%)"])) 
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
  .on("mouseleave", (event, d) => handleMouseLeave())			
  .on("click", (event, d) => {
      handleLineChartMouseClick(d[0])
      div.transition()		
            .duration(500)		
            .style("opacity", 0);	
    });

    svg
      .selectAll("circle.lineValues") 
      .data(data, (d) => d.Company) 
      .enter()
      .append("circle")
      .attr("class", "lineValues")
      .attr("cx", (d) => x(d.year))
      .attr("cy", (d) => y(+d["Price Change (%)"]))
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
        div.html(`${d.Company}\n${Number(d["Price Change (%)"]).toFixed(2)}` + "<br/>")	
            .style("left", (event.pageX) + "px")		
            .style("top", (event.pageY - 28) + "px");	
        handleMouseOver(d.Company)
        })	
      .on("mouseleave", (event, d) => handleMouseLeave())
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


  const margin = { top: 15, right: 30, bottom: 40, left: 50 };
  const width = 350 - margin.left - margin.right;
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
        .domain(d3.extent(data, function(d) { return +d["Price Change (%)"]; }))
        .range([height, 0]);
    
    svg.select("#gYAxis")
      .call(d3.axisLeft(y));

    
    var u = svg.selectAll("path.lineTest")
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
                  .y(function(d) { return y(0); })
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
        circles
          .transition()
          .duration(1000)
          .attr("d", function(d){
            return d3.line()
              .x(function(d) { return x(d.year); })
              .y(function(d) { return y(+d["Price Change (%)"]); })
              (d[1])
          })
        },
        (update) => {
          update
            .transition()
            .duration(1000)
            .attr("d", function(d){
              return d3.line()
                .x(function(d) { return x(d.year); })
                .y(function(d) { return y(+d["Price Change (%)"]); })
                (d[1])
            })
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
            .attr("cy", (d) => y(0))
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
              div.html(`${d.Company}\n${Number(d["Price Change (%)"]).toFixed(2)}` + "<br/>")	
                  .style("left", (event.pageX) + "px")		
                  .style("top", (event.pageY - 28) + "px");	
              handleMouseOver(d.Company)
              })	
            .on("mouseleave", (event, d) => handleMouseLeave())
            .on("mouseout", function(d) {		
              div.transition()		
                  .duration(500)		
                  .style("opacity", 0);	
          })
            circles
            .transition()
            .duration(1000)
            .attr("cy", (d) => y(+d["Price Change (%)"]));
        },
        (update) => {
          update
            .transition()
            .duration(1000)
            .attr("cx", (d) => x(d.year))
            .attr("cy", (d) => y(+d["Price Change (%)"]))
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

  const margin = {top: 10, right: 20, bottom: 30, left: 60}
  const width = 420 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;
    

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
    .attr("font-size", "10px")
    .attr("font-family", "sans-serif")
    .attr("font-weight", "bold")
    .attr("x", width - 20)
    .attr("y", height + margin.top + 20)
    .text("Sectors");

    svg.append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("font-size", "10px")
    .attr("font-family", "sans-serif")
    .attr("font-weight", "bold")
    .attr("y", -margin.left+20)
    .attr("x", -margin.top)
    .text("Price Change (%)")

    // Add a scale for bubble color
    const myColor = d3.scaleOrdinal()
    .domain(allSectors)
    .range(d3.schemeSet2);

    d3.csv(`./dataset/${year}.csv`).then( function(data) {

    
      // Add X axis
      var newaxis = svg.selectAll(".myXaxis")
         .call(xAxis);

        newaxis.selectAll(".tick")
            .attr("cursor", "pointer")
            .on("click", (event, d) => handleBubbleChartClick(abrev_to_sector[d]))
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
                    .style("top", (event.pageY+20) + "px")
                    .style("background", myColor(d));
            })

    
      // Add Y axis

      y.domain(d3.extent(data, (d) => +d["Price Change (%)"]));
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
          .attr("cy", d => y(+d["Price Change (%)"]))
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
            .on("mouseleave", (event,d) => handleMouseLeave())
      })
}

function updateBubbleChart() {
  
    var div = d3.select("body").append("div")	
      .attr("class", "tooltip")				
      .style("opacity", 0);

    const margin = {top: 10, right: 20, bottom: 30, left: 60}
    const width = 420 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
    

    // append the svg object to the body of the page
    const svg = d3.select("#gBubbleChart")

    var x = d3.scaleBand()
    .domain(allSectors)
    .range([0, width])
    .padding(1)
      
    d3.csv(`./dataset/${year}.csv`).then( function(data) {

      if(sectors.length == 1){
        let real_sector = abrev_to_sector[sectors[0]]
        data = data.filter(d => d.Sector == real_sector)
      }
      // Add Y axis
      const y = d3.scaleLinear()
            .domain(d3.extent(data, (d) => +d["Price Change (%)"]))
            .range([height, 0]);
      svg.select(".myYaxis").call(d3.axisLeft(y));

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
            .attr("cy", d => y(d["Price Change (%)"]))
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
            .attr("cy", d => y(d["Price Change (%)"]))
        },
        (update) => {
          update
            .attr("cx", d => x(sector_to_abrev[d.Sector]))
            .attr("cy", (d) => y(+d["Price Change (%)"]))
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

  const margin = {top: 43, right: 50, bottom: 10, left: 15},
      width = 1000 - margin.left - margin.right,
      height = 310 - margin.top - margin.bottom;
    
    // append the svg object to the body of the page
    const svg = d3.select("#vi10")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("id", "gParallelCoordinatesChart")
      .attr("transform",
            `translate(${margin.left},${margin.top})`);

      svg.append('circle')
            .attr('cx', width/2 - 130)
            .attr('cy', height)
            .attr('r', 5)
            .attr("border-radius", "0px")
            .attr('stroke', '#5F021F')
            .attr('fill', '#5F021F'); 


        svg.append("text")
        .attr("font-size", "10px")
        .attr("font-family", "sans-serif")
        .attr("font-weight", "bold")
        .attr("y", height+5)
        .attr("x", width/2 -120)
        .text("< - 30 %")

      svg.append('circle')
          .attr('cx', width/2 - 60)
          .attr('cy', height)
          .attr('r', 5)
          .attr("border-radius", "0px")
          .attr('stroke', 'red')
          .attr('fill', 'red'); 

          svg.append("text")
        .attr("font-size", "10px")
        .attr("font-family", "sans-serif")
        .attr("font-weight", "bold")
        .attr("y", height+5)
        .attr("x", width/2 -50)
        .text("< 0 %")

          svg.append('circle')
          .attr('cx', width/2)
          .attr('cy', height)
          .attr('r', 5)
          .attr("border-radius", "0px")
          .attr('stroke', 'grey')
          .attr('fill', 'grey'); 

          svg.append("text")
          .attr("font-size", "10px")
          .attr("font-family", "sans-serif")
          .attr("font-weight", "bold")
          .attr("y", height+5)
          .attr("x", width/2 +10)
          .text("< 10 %")

          svg.append('circle')
          .attr('cx', width/2 + 60)
          .attr('cy', height)
          .attr('r', 5)
          .attr("border-radius", "0px")
          .attr('stroke', 'lightgreen')
          .attr('fill', 'lightgreen'); 

          svg.append("text")
          .attr("font-size", "10px")
          .attr("font-family", "sans-serif")
          .attr("font-weight", "bold")
          .attr("y", height+5)
          .attr("x", width/2 +70)
          .text("< 40 %")

          svg.append('circle')
          .attr('cx', width / 2 + 120)
          .attr('cy', height)
          .attr('r', 5)
          .attr("border-radius", "0px")
          .attr('stroke', 'green')
          .attr('fill', 'green'); 

          svg.append("text")
          .attr("font-size", "10px")
          .attr("font-family", "sans-serif")
          .attr("font-weight", "bold")
          .attr("y", height+5)
          .attr("x", width/2 +130)
          .text(">= 40 %")
        


    
    // Parse the Data
    d3.csv(`./dataset/2014.csv`).then( function(data) {

      if(sectors.length == 1){
        let real_sector = abrev_to_sector[sectors[0]]
        data = data.filter(d => d.Sector == real_sector)
      }

    
      // Here I set the list of dimension manually to control the order of axis:
      var dimensions = ["Price Change (%)","Gross Margin (%)","ROE","Net Profit Margin (%)","ROIC","3Y Revenue Growth (%)","3Y Net Income Growth (%)","D/E","Net Debt to EBITDA","P/E","EV/EBITDA","P/B","EBITDA Margin (%)","ROA"]
    
      // For each dimension, I build a linear scale. I store all in a y object
      const y = {}
      for (i in dimensions) {
        name = dimensions[i]
        y[name] = d3.scaleLinear()
          .domain(d3.extent(data, (d) => +d[name]))
          // --> different axis range for each group --> .domain( [d3.extent(data, function(d) { return +d[name]; })] )
          .range([height-30, 0])
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
          .style("stroke", function(d){ return( pathColorParallel(+d["Price Change (%)"]))} )
          .style("stroke-width", 1.5)
          .style("opacity", 0.5)
          .on("mouseout", function(d) {		
            div.transition()		
                .duration(500)		
                .style("opacity", 0);	
          })
          .on("mouseleave", (event, d) => handleMouseLeave())
          .on("mouseover", (event, d) => {		
              div.transition()		
                  .duration(200)		
                  .style("opacity", .9);		
              div.html(`${d.Company}` + "<br/>")	
                  .style("left", (event.pageX) + "px")		
                  .style("top", (event.pageY - 28) + "px");
              handleMouseOver(d.Company)
          })


          function updateBrushing() {

            d3.selectAll("path.myPath").classed("hidden", d => {

              var path_visible = true;
              
              //for every attribute, check if it is brushed
              dimensions.map(attribute => {
                var attr_visible = true;

                //if there is a brush for current attribute
                if(activeBrushes.get(attribute) != undefined){

                  //get event.selection for attribute
                  const y0 = activeBrushes.get(attribute)["selection"][0]
                  const y1 = activeBrushes.get(attribute)["selection"][1]
                  //for current path, get the value for current attribute
                  const value = y[attribute](d[attribute])
                  //check if value in brush selection
                  if(y0 <= value && y1 >= value){attr_visible = true;}
                  else{attr_visible = false;}
                }
                path_visible = (path_visible && attr_visible);
              })
              if(path_visible)
                hide = hide.filter(c => c != d.Company)
              else{
                hide.push(d.Company)
              }
              return !path_visible;
            })

            handlePathVisible()
          }
    

          function brushed(attribute, selection) {
            activeBrushes.set(attribute, selection);
            updateBrushing();
          }
        
          function brushEnd(attribute, selection) {
            if (selection["selection"] !== null) return;
            activeBrushes.delete(attribute);
            updateBrushing();
          }


      // Draw the axis:
      var axes = svg.append("g")
        .selectAll("g")
        .data(dimensions)
        .join("g")
        .attr("class", d => `axis ${d}`)
        // I translate this element to its right position on the x axis
        .attr("transform", function(d) { return `translate(${x(d)})`})
        // And I build the axis with the call function
        .each(function(d) { 
          d3.select(this)
          .call(d3.axisRight().scale(y[d]))
          .call(
            d3
              .brushY()
              .extent([[-10, margin.top-45], [10, height - margin.bottom-18]])
              .on("brush", d => {
                const dim = this.getAttribute("class").substring(5);
                brushed(dim, d)
              })
              .on("end", d => {
                console.log("print")
                const dim = this.getAttribute("class").substring(5);
                brushEnd(dim, d)
              })
          ); 
        })
        .on("click", (event, d) => handleParallelCoordinatesClick(d))
        // Add axis title
        .append("text")
          .style("text-anchor", "start")
          .attr("font-family", "sans-serif")
          .attr("font-weight", "bold")
          .attr("y", -9)
          .text(function(d) { return d; })
          .style("fill", "black")
          .style("cursor", d => d == "Price Change (%)" ? "default" : "pointer")
          .attr("transform", "rotate(-10)")
    
    })
}

function updateParallelCoordinates(id) {

  var div = d3.select("body").append("div")	
  .attr("class", "tooltip")				
  .style("opacity", 0);

  const margin = {top: 43, right: 50, bottom: 10, left: 15},
      width = 1000 - margin.left - margin.right,
      height = 310 - margin.top - margin.bottom;
    
    // append the svg object to the body of the page
    const svg = d3.select("#gParallelCoordinatesChart")
    
    // Parse the Data
    d3.csv(`./dataset/${year}.csv`).then( function(data) {

      if(sectors.length == 1){
        let real_sector = abrev_to_sector[sectors[0]]
        data = data.filter(d => d.Sector == real_sector)
      }

      // Here I set the list of dimension manually to control the order of axis:
      dimensions = ["Price Change (%)","Gross Margin (%)","ROE","Net Profit Margin (%)","ROIC","3Y Revenue Growth (%)","3Y Net Income Growth (%)","D/E","Net Debt to EBITDA","P/E","EV/EBITDA","P/B","EBITDA Margin (%)","ROA"]
    
      // For each dimension, I build a linear scale. I store all in a y object
      const y = {}
      for (i in dimensions) {
        name = dimensions[i]
        y[name] = d3.scaleLinear()
          .domain(d3.extent(data, (d) => +d[name]))
          // --> different axis range for each group --> .domain( [d3.extent(data, function(d) { return +d[name]; })] )
          .range([height-30, 0])
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
        .selectAll("path.myPath")
        .data(data)
        .join(
          (enter) => {
                enter.
                  append("path")
                  .attr("class", "myPath" ) 
                  .attr("d",  path)
                  .style("fill", "none" )
                  .style("stroke", function(d){ return( pathColorParallel(+d["Price Change (%)"]))} )
                  .style("stroke-width", 1.5)
                  .style("opacity", 0.5)
                  .on("mouseout", function(d) {		
                    div.transition()		
                        .duration(500)		
                        .style("opacity", 0);	
                  })
                  .on("mouseleave", (event, d) => handleMouseLeave())
                  .on("mouseover", (event, d) => {		
                      div.transition()		
                          .duration(200)		
                          .style("opacity", .9);		
                      div.html(`${d.Company}` + "<br/>")	
                          .style("left", (event.pageX) + "px")		
                          .style("top", (event.pageY - 28) + "px");
                      handleMouseOver(d.Company)
                  })
                  },
          (update) => {
                update
                  .attr("d",  path)
                  .style("fill", "none" )
                  .style("stroke", function(d){ return( pathColorParallel(+d["Price Change (%)"]))} )
          },
          (exit) => {
                exit.remove()
          })


          function updateBrushing() {

            d3.selectAll("path.myPath").classed("hidden", d => {

              var path_visible = true;
              
              //for every attribute, check if it is brushed
              dimensions.map(attribute => {
                var attr_visible = true;

                //if there is a brush for current attribute
                if(activeBrushes.get(attribute) != undefined){

                  //get event.selection for attribute
                  const y0 = activeBrushes.get(attribute)["selection"][0]
                  const y1 = activeBrushes.get(attribute)["selection"][1]
                  //for current path, get the value for current attribute
                  const value = y[attribute](d[attribute])
                  //check if value in brush selection
                  if(y0 <= value && y1 >= value){attr_visible = true;}
                  else{attr_visible = false;}
                }
                path_visible = (path_visible && attr_visible);
              })
              if(path_visible)
                hide = hide.filter(c => c != d.Company)
              else{
                hide.push(d.Company)
              }
              return !path_visible;
            })

            handlePathVisible()
          }
    

          function brushed(attribute, selection) {
            activeBrushes.set(attribute, selection);
            updateBrushing();
          }
        
          function brushEnd(attribute, selection) {
            if (selection["selection"] !== null) return;
            activeBrushes.delete(attribute);
            updateBrushing();
          }



        svg.selectAll("g.axis")
        // For each dimension of the dataset I add a 'g' element:
        .data(dimensions)
        .attr("class", d => `axis ${d}`)
        // I translate this element to its right position on the x axis
        .each(function(d) { 
          d3.select(this)
          .call(d3.axisRight().scale(y[d]))
          .call(
            d3
              .brushY()
              .extent([[-10, margin.top-45], [10, height - margin.bottom-18]])
              .on("brush", d => {
                const dim = this.getAttribute("class").substring(5);
                brushed(dim, d)
              })
              .on("end", d => {
                console.log("print")
                const dim = this.getAttribute("class").substring(5);
                brushEnd(dim, d)
              })
          ); 
        })
        .on("click", (event, d) => handleParallelCoordinatesClick(d))
        // Add axis title
    })
}

// Radar Chart

function createRadarChart(id) {

  var div = d3.select("body").append("div") 
  .attr("class", "tooltip")               
  .style("opacity", 0);
// set the dimensions and margins of the graph
const margin = { top: 30, right: 0, bottom: 40, left: 40 };
const width = 280 - margin.left - margin.right;
const height = 300 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select(id)
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("id", "gRadar")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  svg.append('line')
  .style("stroke", "grey")
  .style("stroke-width", 2)
  .attr("x1", 112.5)
  .attr("y1", 112.5)
  .attr("x2", 112.5 + Math.cos(30 * Math.PI / 180)*112.5)
  .attr("y2", 112.5 + Math.sin(30 * Math.PI / 180)*112.5)


  svg.append('line')
  .style("stroke", "grey")
  .style("stroke-width", 2)
  .attr("x1", 112.5)
  .attr("y1", 112.5)
  .attr("x2", 112.5 + Math.cos(90 * Math.PI / 180)*112.5)
  .attr("y2", 112.5 + Math.sin(90 * Math.PI / 180)*112.5)


  svg.append('line')
  .style("stroke", "grey")
  .style("stroke-width", 2)
  .attr("x1", 112.5)
  .attr("y1", 112.5)
  .attr("x2", 112.5 + Math.cos(150 * Math.PI / 180)*112.5)
  .attr("y2", 112.5 + Math.sin(150 * Math.PI / 180)*112.5)

  svg.append('line')
  .style("stroke", "grey")
  .style("stroke-width", 2)
  .attr("x1", 112.5)
  .attr("y1", 112.5)
  .attr("x2", 112.5 + Math.cos(210 * Math.PI / 180)*112.5)
  .attr("y2", 112.5 + Math.sin(210 * Math.PI / 180)*112.5)

  svg.append('line')
  .style("stroke", "grey")
  .style("stroke-width", 2)
  .attr("x1", 112.5)
  .attr("y1", 112.5)
  .attr("x2", 112.5 + Math.cos(270 * Math.PI / 180)*112.5)
  .attr("y2", 112.5 + Math.sin(270 * Math.PI / 180)*112.5)

  svg.append('line')
  .style("stroke", "grey")
  .style("stroke-width", 2)
  .attr("x1", 112.5)
  .attr("y1", 112.5)
  .attr("x2", 112.5 + Math.cos(330 * Math.PI / 180)*112.5)
  .attr("y2", 112.5 + Math.sin(330 * Math.PI / 180)*112.5)


  
  let angle = 30 
  for(let i=0; i < indicators.length; i++){
    svg.append("text")
    .attr("text-anchor", () => angle == 150 || angle == 210 ? "end" : "start")
    .attr("font-size", "10px")
    .attr("font-family", "sans-serif")
    .attr("font-weight", "bold")
    .attr("class", `indicator${i}`)
    .attr("y", 112.5 + Math.sin(angle * Math.PI / 180)*112.5)
    .attr("x", 112.5 + Math.cos(angle * Math.PI / 180)*112.5)
    .text(indicator_to_abrev[indicators[i]])
    .on("mouseover", (event) => {div.transition()		
                              .duration(200)		
                              .style("opacity", 1);		
                            div.html(indicators[i])	
                              .style("left", (event.pageX) + "px")		
                              .style("top", (event.pageY - 28) + "px");	
                          })
    .on("mouseout", function(d) {		
      div.transition()		
          .duration(500)		
          .style("opacity", 0);	
    })
    
    angle += 60
  }


  svg
  .append('path')
  .attr('d', d3.line()([[112.5 + Math.cos(30 * Math.PI / 180)*112.5, 112.5 + Math.sin(30 * Math.PI / 180)*112.5], 
                        [112.5 + Math.cos(90 * Math.PI / 180)*112.5, 112.5 + Math.sin(90 * Math.PI / 180)*112.5], 
                        [112.5 + Math.cos(150 * Math.PI / 180)*112.5, 112.5 + Math.sin(150 * Math.PI / 180)*112.5], 
                        [112.5 + Math.cos(210 * Math.PI / 180)*112.5, 112.5 + Math.sin(210 * Math.PI / 180)*112.5], 
                        [112.5 + Math.cos(270 * Math.PI / 180)*112.5,112.5 + Math.sin(270 * Math.PI / 180)*112.5],
                        [112.5 + Math.cos(330 * Math.PI / 180)*112.5,112.5 + Math.sin(330 * Math.PI / 180)*112.5],
                        [112.5 + Math.cos(30 * Math.PI / 180)*112.5,112.5 + Math.sin(30 * Math.PI / 180)*112.5]],
                        ))
  .attr("fill", "none")
  .attr("stroke", "grey")
  .attr("opacity", 0.3)
  .attr("stroke-width", 2)


  svg
  .append('path')
  .attr('d', d3.line()([[112.5 + Math.cos(30 * Math.PI / 180)*37.5, 112.5 + Math.sin(30 * Math.PI / 180)*37.5], 
                        [112.5 + Math.cos(90 * Math.PI / 180)*37.5, 112.5 + Math.sin(90 * Math.PI / 180)*37.5], 
                        [112.5 + Math.cos(150 * Math.PI / 180)*37.5, 112.5 + Math.sin(150 * Math.PI / 180)*37.5], 
                        [112.5 + Math.cos(210 * Math.PI / 180)*37.5, 112.5 + Math.sin(210 * Math.PI / 180)*37.5], 
                        [112.5 + Math.cos(270 * Math.PI / 180)*37.5,112.5 + Math.sin(270 * Math.PI / 180)*37.5],
                        [112.5 + Math.cos(330 * Math.PI / 180)*37.5,112.5 + Math.sin(330 * Math.PI / 180)*37.5],
                        [112.5 + Math.cos(30 * Math.PI / 180)*37.5,112.5 + Math.sin(30 * Math.PI / 180)*37.5]],
                        ))
  .attr("fill", "none")
  .attr("stroke", "grey")
  .attr("opacity", 0.3)
  .attr("stroke-width", 2)

  svg
  .append('path')
  .attr('d', d3.line()([[112.5 + Math.cos(30 * Math.PI / 180)*75, 112.5 + Math.sin(30 * Math.PI / 180)*75], 
                        [112.5 + Math.cos(90 * Math.PI / 180)*75, 112.5 + Math.sin(90 * Math.PI / 180)*75], 
                        [112.5 + Math.cos(150 * Math.PI / 180)*75, 112.5 + Math.sin(150 * Math.PI / 180)*75], 
                        [112.5 + Math.cos(210 * Math.PI / 180)*75, 112.5 + Math.sin(210 * Math.PI / 180)*75], 
                        [112.5 + Math.cos(270 * Math.PI / 180)*75,112.5 + Math.sin(270 * Math.PI / 180)*75],
                        [112.5 + Math.cos(330 * Math.PI / 180)*75,112.5 + Math.sin(330 * Math.PI / 180)*75],
                        [112.5 + Math.cos(30 * Math.PI / 180)*75,112.5 + Math.sin(30 * Math.PI / 180)*75]],
                        ))
  .attr("fill", "none")
  .attr("stroke", "grey")
  .attr("opacity", 0.3)
  .attr("stroke-width", 2)


  function path(d) {
      //vamos a cada indicador
      //indicador*(XMAX-XMIN)/VALORMAXIMO + Xmin            indicador*(YMAX-YMIN)/VALORMAXIMO + Ymin
      var pos = []
      var angle = 30

      for(let i=0; i < 7; i++){
          let index = i % 6
          let indicator = indicators[index]
          let value = +d[indicator] < 0 ? 0 : d[indicator]
          
          let x = Math.cos(angle * Math.PI / 180) * value*112.5/maxValues[indicator] + 112.5
          let y = Math.sin(angle * Math.PI / 180) * value*112.5/maxValues[indicator] + 112.5

          pos.push([x,y])
          angle = (angle + 60) % 360

      }

      return d3.line()(pos)
  }

  d3.csv("./dataset/2014.csv").then(function (data) {

      data = data.filter(d => defaultCompanies.includes(d.Company))

      indicators.map( ind => 
                          maxValues[ind] = d3.max(data, (d) => +d[ind])
      )

      svg
      .selectAll("radarPath")
      .data(data, d => d.Company)
      .join("path")
      .attr("class", "radarPath" ) 
      .attr("d", path)
      .style("fill", d => selectedColors.get(d.Company))
      .style("opacity", 0.3)
      .on("mouseover", (event, d) => {	
        div.transition()		
            .duration(200)		
            .style("opacity", 1);		
        div.html(d.Company)	
            .style("left", (event.pageX) + "px")		
            .style("top", (event.pageY - 28) + "px");	
        handleMouseOver(d.Company)
        })		
      .on("mouseleave", (event, d) => handleMouseLeave())
      .on("mouseout", function(d) {		
        div.transition()		
            .duration(500)		
            .style("opacity", 0);	
      })
      .on("click", (event,d) => handleLineChartMouseClick(d.Company))
      })

}

function updateRadarChart() {

  var div = d3.select("body").append("div") 
  .attr("class", "tooltip")               
  .style("opacity", 0);

  const margin = { top: 30, right: 30, bottom: 40, left: 30 };
  const width = 250 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;


// append the svg object to the body of the page
  var svg = d3.select("#gRadar")

  for(let i=0; i < indicators.length; i++){
    svg.select(`.indicator${i}`)
      .text(indicator_to_abrev[indicators[i]])
      .on("mouseover", (event) => {div.transition()		
                                .duration(200)		
                                .style("opacity", 1);		
                              div.html(indicators[i])	
                                .style("left", (event.pageX) + "px")		
                                .style("top", (event.pageY - 28) + "px");	
                            })
      .on("mouseout", function(d) {		
        div.transition()		
            .duration(500)		
            .style("opacity", 0);	
      })
  }
  
  function path(d) {
      //vamos a cada indicador
      //indicador*(XMAX-XMIN)/VALORMAXIMO + Xmin            indicador*(YMAX-YMIN)/VALORMAXIMO + Ymin
      var pos = []
      var angle = 30

      for(let i=0; i < 7; i++){
        let index = i % 6
        let indicator = indicators[index]
          let value
          if(+d[indicator] == null || +d[indicator] < 0)
              value = 0
          else if(+d[indicator] == 0)
            value = 0.0001
          else
            value = +d[indicator]

          let x = Math.cos(angle * Math.PI / 180) * value*112.5/maxValues[indicator] + 112.5
          let y = Math.sin(angle * Math.PI / 180) * value*112.5/maxValues[indicator] + 112.5

          pos.push([x,y])
          angle = (angle + 60) % 360

      }

      return d3.line()(pos)
  }

  d3.csv(`./dataset/${year}.csv`).then(function (data) {

      data = data.filter(d => selectedCompanies.includes(d.Company))

      indicators.map( ind => maxValues[ind] = d3.max(data, (d) => +d[ind]))


      svg
    .selectAll("path.radarPath")
    .data(data)
    .join(
      (enter) => {
        enter
          .append("path")
          .attr("class", "radarPath")
          .attr("d", path)
          .style("fill", d => selectedColors.get(d.Company) )
          .style("opacity", 0.3)
          .on("mouseover", (event, d) => {	
            div.transition()		
                .duration(200)		
                .style("opacity", 1);		
            div.html(d.Company)	
                .style("left", (event.pageX) + "px")		
                .style("top", (event.pageY - 28) + "px");	
            handleMouseOver(d.Company)
            })		
          .on("mouseleave", (event, d) => handleMouseLeave())
          .on("mouseout", function(d) {		
            div.transition()		
                .duration(500)		
                .style("opacity", 0);	
          })
          .on("click", (event,d) => handleLineChartMouseClick(d.Company))
      },
      (update) => {
        update
          .transition()
          .duration(1000)
          .attr("d", path)
          .style("fill", d => selectedColors.get(d.Company));
      },
      (exit) => {
        exit.remove()
      }
    )
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

  //radar chart
  d3.selectAll(".radarPath")
  .filter(function (d, i) {
    return d.Company == company;
  })
  .style("opacity", 0.7);

}

function handleMouseLeave() {

  const sectorColor = d3.scaleOrdinal()
  .domain(allSectors)
  .range(d3.schemeSet2);

  //parallel coordinates lines
  d3.selectAll(".myPath")
  .style("stroke-width", 1.5)
  .style("stroke", (d) => pathColorParallel(d["Price Change (%)"]))
  .style("opacity", 0.5)

  d3.selectAll(".bubbleValues")
  .style("fill", (d) => sectorColor(sector_to_abrev[d.Sector]))

  //scatterplots dot
  d3.selectAll(".itemValue")
    .style("fill", (d) => {
      return selectedCompanies.includes(d.Company) ?
      selectedColors.get(d.Company)
      :
      "steelblue"
    })
    .attr("r", (d) => { return selectedCompanies.includes(d.Company) ? 4 : 2});
  

  // dots in Line Chart
  d3.selectAll(".lineValues")
    .attr("r", 3.3)
    .style("fill", (d) => selectedColors.get(d.Company));
    
  //line chart lines
  d3.selectAll(".lineTest")
    .attr("stroke", (d) => selectedColors.get(d[0]))
    .style("stroke-width", 1.5);


    //radar chart
      d3.selectAll(".radarPath")
        .style("opacity", 0.3);
  }

function handleLineChartMouseLeave(company, color) {
  const sectorColor = d3.scaleOrdinal()
  .domain(allSectors)
  .range(d3.schemeSet2);

  d3.selectAll(".myPath")
  .filter(d => d.Company == company)
  .style("stroke-width", 1.5)
  .style("stroke", (d) => pathColorParallel(d["Price Change (%)"]))
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
    .attr("r", (d) => { return selectedCompanies.includes(d.Company) ? 4 : 2});

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

    //radar chart
    d3.selectAll(".radarPath")
    .style("opacity", 0.3);
}

function handleLineChartMouseClick(company) {
  if(selectedCompanies.includes(company)){
    if(selectedCompanies.length == 1) return
    selectedCompanies = selectedCompanies.filter(d => d !== company)
    selectedColors.delete(company)
    d3.selectAll(".itemValue")
      .style("fill", (d) => {
        return selectedCompanies.includes(d.Company) ?
        selectedColors.get(d.Company)
        :
        "steelblue"
      })
      .attr("r", (d) => { return selectedCompanies.includes(d.Company) ? 4 : 2 })
    d3.selectAll(".lineTest").style("stroke-width", 1.5);
  }
  else if(selectedCompanies.length < 5){
    selectedCompanies.push(company)
    selectedColors.set(company, getFreeColor())
  }
  else
    return
  updateLineChart()  
  updateColorLabels()
  updateRadarChart()

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
  if(indicators.includes(indicator) || indicator == "Price Change (%)")
    return
  
  indicators[indexToRemove] = indicator

  indexToRemove = (indexToRemove+1) % 6

  updateAllExceptParallel()
}

function handlePathVisible(){
  d3.selectAll(".itemValue")
    .style("opacity", d => hide.includes(d.Company) ? 0.0001 : 1);
}


//Update All charts

function updateAllExceptParallel() {
  for(let i=0; i < indicators.length; i++)
    updateScatterPlot(`vi${i+1}`, indicators[i])

  updateLineChart()
  updateBubbleChart()
  updateColorLabels()
  
  updateRadarChart()

}

function updateAll() {
  for(let i=0; i < indicators.length; i++)
    updateScatterPlot(`vi${i+1}`, indicators[i])

  for(let i = 2014; i < 2019; i++){
    i == year ?
    d3.select(`#b${i}`)
      .style("background-color", "black")
      .style("color", "white")
      .on("Mouseover", () => this.style("background-color", "green"))
    :
    d3.select(`#b${i}`)
    .style("background-color", "white")
    .style("color", "black")
    .on("Mouseover", () => this.style("background-color", "green"))
  }


  updateLineChart()
  updateBubbleChart()
  updateParallelCoordinates()
  updateColorLabels()
  updateRadarChart()
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
      texto += `<h3><span class="dot" id="${selectedColors.get(selectedCompanies[i])}" style="background-color:${selectedColors.get(selectedCompanies[i])}"></span>${selectedCompanies[i]}<h3>\n`
   
    div = d3.select("#colors")
    div.html(texto)	


    availableColors.map( color => {
      d3.select(`#${color}`)
      .on("mouseover", () => {
        for (let [key, value] of selectedColors.entries()) {
          if (value === color){
            handleMouseOver(key)
          }
        }
      })
      .on("mouseleave", () => handleMouseLeave())
    })
    
}