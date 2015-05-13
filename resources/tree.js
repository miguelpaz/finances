var width = 900,
    height = 600,
    color = d3.scale.category20c(),
    div = d3.select("#sponsor_tree").append("div")
       .style("position", "relative");

var treemap = d3.layout.treemap()
    .size([width, height])
    .sticky(true)
    .value(function(d) { return d.size; });

var node = div.datum(spo_tree).selectAll(".node")
      .data(treemap.nodes)
    .enter().append("div")
      .attr("class", "node")
      .on("mouseover", function (d) { showPopover.call(this, d); })
      .on("mouseout", function (d) { removePopovers(); })
      .on("click", function (d) { populate_table_spo(d["name"]); })
      .call(position_this)
      .style("background-color", function(d) {
          return d.name == 'tree' ? '#fff' : color(d.name); })
      .append('div')
      .style("font-size", function(d) {
          // compute font size based on sqrt(area)
          console.log(d.area)
          a = Math.max(8, 0.08*Math.sqrt(d.area))+'px';
          if (d.area <990){
            a=0;
          }
          return  a})
      .text(function(d) { return d.children ? null : d.name; })
      

function position_this() {
  this.style("left", function(d) { return d.x + "px"; })
      .style("top", function(d) { return d.y + "px"; })
      .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
      .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
}

  function removePopovers () {
    $('.popover').each(function() {
      $(this).remove();
    }); 
  }

  function showPopover (d) {
    $(this).popover({
      placement: 'auto top',
      container: 'body',
      trigger: 'manual',
      html : true,
      content: function() { 
        console.log(d)
        return "Sponsor: " + d["name"] + "<br/>FY2014 Exp: $" + commas(d["size"]); 
      }
    });
    $(this).popover('show')
  }