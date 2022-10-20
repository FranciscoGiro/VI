// set the dimensions and margins of the graph
var margin = {top: 10, right: 20, bottom: 30, left: 50},
    width = 400 - margin.left - margin.right,
    height = 220 - margin.top - margin.bottom;
const padding = 20


function init(){
    createBubbleChart();
}


function createBubbleChart(){
    // append the svg object to the body of the page
    var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    //Read the data
    d3.csv("./dataset/2014.csv", function(data) {

    sectorsMap = {"Consumer Defensive":"CD", 
                "Healthcare":"HC", 
                "Consumer Cyclical":"CC", 
                "Industrials":"I",
                "Real Estate":"RS",
                "Communication Services":"CS",
                "Energy":"E",
                "Financial Services":"FS",
                "Utilities":"U",
                "Technology":"T"    
            }
    sectors = ["HC","CC","I","RE","CS","E", "FS", "U", "T"]

    //Read the data
    // Add X axis
    var x = d3.scaleBand()
    .domain(sectors)
    .range([1, 400])
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

/*     var x = d3.scaleLinear()
    .domain([0, 200])
    .range([ 0, width ]);
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x)); */

    // Add Y axis
    var y = d3.scaleLinear()
    .domain([-5, 5])
    .range([ height, 0]);
    svg.append("g")
    .call(d3.axisLeft(y));

    // Add a scale for bubble size
    var z = d3.scaleLinear()
    .domain([200000, 1310000000])
    .range([ 1, 40]);



    console.log("passei aqui")
    // Add dots

    svg.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
        .attr("cx", x("HC")) //(d) => x(sectorsMap[d.Sector]))
        .attr("cy", y(3)) //(d) => y(d.priceVar2015))
        .attr("r",  5) //(d) => z(2000000))
        .style("fill", "#69b3a2")
        .style("opacity", "0.7")
        .attr("stroke", "black")

    })

/*     svg
    .append("circle")
    .attr("cx", x("CC"))
    .attr("cy", 50)
    .attr("r", 8)

    svg
    .append("circle")
    .attr("cx", x("I"))
    .attr("cy", 50)
    .attr("r", 8) */

}