// @TODO: YOUR CODE HERE!
// Step 1: Set up our chart
//= ================================
var svgWidth = 1200;
var svgHeight = 800;

var margin = {
    top: 50,
    right: 100,
    bottom: 100,
    left:110
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

//create svg wrapper and append an asv group to hold chart and shift
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

    //append an svg group
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
        
    
    //initial params
var chosenXAxis = 'smokes'
var chosenYAxis = 'income'
var xAxisLabels = ["smokes", "healthcare", "poverty"];  
var yAxisLabels = ["age", "obesity", "income"];
var labelsTitle = { "poverty": " Percent In Poverty ", 
                    "age": "(Median) Age", 
                    "income": "Household Income",
                    "obesity": "Percent of Obesity", 
                    "smokes": "Percent that Smokes", 
                    "healthcare": "Percent that Needs Healthcare" }
//function to update sxacale var upon click on axis label
function xScale(incomedata, chosenxAxis){
    //createscales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(incomedata, d=>d[chosenxAxis]) * .8, d3.max(incomedata, d=>d[chosenxAxis]) * 1.2])
        .range([0,width]);
    return xLinearScale;
}

function yScale(incomedata, chosenYAxis){
    // Create Scales.
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(incomedata, d=>d[chosenYAxis]) *.9, d3.max(incomedata, d=>d[chosenYAxis]) * 1.1 ])
        .range([height, 0]);
  
    return yLinearScale;
  }
// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
}

function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}
// function used for updating circles group with a transition to 
//new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));
    return circlesGroup;
}
//function to render text
function renderText(circletextGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    circletextGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis]));
        
    return circletextGroup;
  }

  //function used for updating cirlces group with tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    
    if (chosenXAxis === "smokes") {
        var xlabel ="Percentge of Smokers:";
    }
    else if (chosenXAxis === "healthcare") {
        var xlabel = "Percent without Healthcare:"
    }
    else {
        var xlabel ="poverty:"
    }

    if (chosenYAxis === "age") {
        var ylabel = "median age: ";
    }
    else if (chosenYAxis === "obesity") {
        var ylabel = "Obesity:"
    }
    else {
        var ylabel = "Income: "
    }

    var toolTip = d3.tip()
    .attr("class", "tooltip")
    .style("background", "white")
    .offset([100, -60])
    .html(function(d) {
        if (chosenXAxis === "smokes") {
                // All yAxis tooltip labels presented and formated as %.
            return (`${d.state}<hr>${xlabel} ${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}`);
//poverty
            } else if (chosenXAxis !== "healthcare" && chosenXAxis !== "smokes") {
                // Display Income in dollars for xAxis.
            return (`${d.state}<hr>${xlabel}${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}`);
            } else {
                // Display healthcare as percentage for xAxis.
            return (`${d.state}<hr>${xlabel}${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}`);
            }    
    });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data,this);
    })
        //onmouseoutevent
    .on("mouseout", function(data, index) {
    toolTip.hide(data);
    });
return circlesGroup;
}
//retrieve data from csvfile and excute
d3.csv("assets/data/data.csv").then(function(incomedata, err) {
    if (err) throw err;

    //parsedata
    incomedata.forEach(function(data) {
        data.income = +data.income;
        data.age = +data.age;
        data.poverty = +data.poverty;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
        data.healthcare = +data.healthcare;
    });

    //xlinera scal function above csv file
    var xLinearScale = xScale(incomedata, chosenXAxis);
    var yLinearScale = yScale(incomedata, chosenYAxis);
    //vreate y scale ufnction
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
    
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    //append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
    .data(incomedata)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    .attr("fill", "salmon")
    .attr("opacity", ".25");

    var circletextGroup = chartGroup.selectAll()
    .data(incomedata)
    .enter()
    .append("text")
    .text(d => (d.abbr))
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .style("font-size", "13px")
    .style("text-anchor", "middle")
    .style('fill', 'black');

  // Create group for two x-axis labels
    var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var smokingLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 38)
        .attr("value", "smokes") // value to grab for event listener
        .classed("active", true)
        .text("% who Smoke");

    var healthcareLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 58)
        .attr("value", "healthcare") // value to grab for event listener
        .classed("inactive", true)
        .text("% who Need Healthcare");

    var povertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 18)
        .attr("value", "poverty") // value to grab for event listener.
        .classed("inactive", true)
        .text("% In Poverty ");

    var ageLabel = labelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 400)
        .attr("y", -430 )
        .attr("value", "age") // value to grab for event listener.
        .classed("active", true)
        .text("Median Age");

    var incomeLabel = labelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 400)
        .attr("y",-450)
        .attr("value", "income") // value to grab for event listener.
        .classed("inactive", true)
        .text("Median Household Income");

    var obesityLabel = labelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 400)
        .attr("y", -470)
        .attr("value", "obesity") // value to grab for event listener.
        .classed("inactive", true)
        .text("% Obesity");

        
    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  
    // x axis labels event listener
    labelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if  (true) {
            if (value === "smokes" || value === "poverty" || value === "healthcare") {
  
          // replaces chosenXAxis with value
            chosenXAxis = value;
   
          // functions here found above csv import
        // updates x scale for new data
            xLinearScale = xScale(incomedata, chosenXAxis);

        // updates x axis with transition
            xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x and values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
        
        //update circle text
            circletextGroup = renderText(circletextGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
        // changes classes to change bold text
            if (chosenXAxis === "poverty") {
                povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);

                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
            
                smokingLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenXAxis === "healthcare"){
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);

                healthcareLabel
                    .classed("active", true)
                    .classed("inactive", false);

               smokingLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else {
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);

                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true)

                smokingLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }}

        else {
            chosenYAxis = value;
            //console.log("you choosed y axis")
      
            // Update y scale for new data.
            yLinearScale = yScale(incomedata, chosenYAxis);

            // Updates y axis with transition.
            yAxis = renderYAxis(yLinearScale, yAxis);

            // Update circles with new x values.
            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

            // Update tool tips with new info.
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // Update circles text with new values.
            circletextGroup = renderText(circletextGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
            // Changes classes to change bold text.
                if (chosenYAxis === "age") {

                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);


                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);

                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                  }
                else if (chosenYAxis === "obesity"){
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);

                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false);

                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    }
                else {
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);

                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);

                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }}}})})