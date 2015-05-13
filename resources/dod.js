//Add CSV
test = function(){
//Set the margins
var margin = {top: 20, right: 120, bottom: 30, left: 120},
    width = 700 - margin.left - margin.right,
    height = 350 - margin.top - margin.bottom;

//Set x scale
var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

//Set y scale
var y = d3.scale.linear()
    .rangeRound([height, 0]);

//Set color bands, left to right leads to bottom-top
var color = d3.scale.ordinal()
    .range(["#98abc5", "#6b8d08", "#4172b3", "#ff8c00"]);

//Use x scale to set a bottom axis
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

//Use y scale to set a left axis
var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".2s"));

//Add the chart to the page's body
var svg = d3.select("#dod").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  d3.csv("resources/InfDODTotal.csv", function(error, data) {
    //Map columns to colors
    color.domain(d3.keys(data[0]).filter(function(key) { return key !== "year"; }));
    data.forEach(function(d) {
      var y0 = 0;
      d.types = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
      d.total = d.types[d.types.length - 1].y1;
    });

  //Sort columns by year
    data.sort(function(a, b) { return a.year - b.year; });

  //X domain is the set of years
    x.domain(data.map(function(d) { return d.year; }));
    
    //Y domain is from zero to highest total
    y.domain([0, d3.max(data, function(d) { return d.total; })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(20," + height + ")")
        .call(xAxis);

  //Add description of Y axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Grants and Sponsors in 2014 dollars");

  //Actually making the rectangles for data values
    var year = svg.selectAll(".year")
        .data(data)
      .enter().append("g")
        .attr("class", "g")
        .attr("transform", function(d) { return "translate(" + (x(d.year) + 20) + ",0)"; });

    year.selectAll("rect")
        .data(function(d) { return d.types; })
      .enter().append("rect")
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.y1); })
        .attr("height", function(d) { return y(d.y0) - y(d.y1); })
        .style("fill", function(d) { return color(d.name); });

  //Adding a legend
    var legend = svg.selectAll(".legend")
        .data(color.domain().slice().reverse())
      .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(35," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", width + 85)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });

  });
}
test();