import type { NextPage } from "next";
import {
  select,
  scaleBand,
  scaleLinear,
  max,
  axisBottom,
  axisLeft,
  line,
} from "d3";
import { useEffect, useRef, useState } from "react";
import * as ss from "simple-statistics";
import { usePapaParse } from "react-papaparse";
import format from "date-fns/format";
import { aggregateData } from "../utils";

const height = 500;
const width = 960;
const margin = { top: 50, right: 50, bottom: 50, left: 50 };

const threshold = 3;

const HomePage: NextPage = () => {
  const { readRemoteFile } = usePapaParse();
  const svg = useRef<SVGAElement>(null);
  const [data, setData] = useState<any>(null);

  const drawChart = (svgRef: React.RefObject<SVGSVGElement>) => {
    // grab hold of ref to DOM element
    const svg = select(svgRef.current);

    // width of chart accounting for margins
    const innerHeight = height - margin.top - margin.bottom;
    const innerWidth = width - margin.left - margin.right;

    const xScale = scaleBand()
      .domain(data.map((dataPoint) => dataPoint.date))
      .range([0, innerWidth])
      .padding(0.1);

    const yScale = scaleLinear()
      .domain([0, max(data, (dataPoint) => dataPoint.count)])
      .range([innerHeight, 0]);

    // derive a linear regression
    var linearRegression = ss.linearRegression(
      data.map((data) => [+data.date, data.count]),
    );

    // function to create regression line
    const linearRegressionLine = ss.linearRegressionLine(linearRegression);

    // Create a line based on the beginning and endpoints of the range
    var lineData = xScale.domain().map((x) => {
      return {
        date: x,
        count: linearRegressionLine(+x),
      };
    });

    const regressionEndpoints = [
      {
        date: linearRegressionLine(new Date(data[0].timestamp).getTime()),
        count: data[0].count,
      },
      {
        date: linearRegressionLine(
          new Date(data[data.length - 1].timestamp).getTime(),
        ),
        count: data[data.length - 1].count,
      },
    ];

    svg.attr("viewBox", [0, 0, width, height]);

    // move graph to account for margin
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // x-axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(axisBottom(xScale))
      .append("text")
      .attr("y", 40)
      .attr("x", innerWidth / 2)
      .attr("text-anchor", "end")
      .attr("stroke", "black")
      .text("Date");

    // y-axis
    g.append("g")
      .call(axisLeft(yScale).ticks(10))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("x", -(innerHeight / 2))
      .attr("dy", -40)
      .attr("text-anchor", "end")
      .attr("stroke", "black")
      .text("Number of bathroom visits");

    // draw bars
    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .classed("bar", true)
      .attr("width", xScale.bandwidth())
      .attr("height", (data) => innerHeight - yScale(data.count))
      .attr("x", (data) => xScale(data.date))
      .attr("y", (data) => yScale(data.count))
      .attr("fill", (data) => (data.count > threshold ? "red" : "orange"));

    // draw line
    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr(
        "d",
        line()
          .x((data) => xScale(data.date))
          .y((data) => yScale(data.count)),
      );

    // draw regression line
    // TODO: fix this
    g.append("path")
      .attr("id", "linear-regression-fitted-line")
      .datum(regressionEndpoints)
      .attr("fill", "none")
      .attr("stroke", "green")
      .attr("stroke-width", 3)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr(
        "d",
        line()
          .x((data) => xScale(data.date))
          .y((data) => yScale(data.count)),
      );
  };

  useEffect(() => {
    // parse csv file
    readRemoteFile("/BATHROOM_VISIT_DATA.csv", {
      header: true,
      complete: (results) => {
        const formattedData = aggregateData(results.data);
        const formattedDataWithSortedDates = formattedData
          .sort((a, b) => {
            const dateA = new Date(a.timestamp);
            const dateB = new Date(b.timestamp);
            return +dateA - +dateB;
          })
          .map((data) => ({
            ...data,
            date: format(new Date(data.timestamp), "d MMM"),
          }));

        // TODO: slicing the first 10 days for now as cant figure out how to display lots of data yet
        setData(formattedDataWithSortedDates.slice(0, 10));
      },
      download: true,
    });
  }, [readRemoteFile]);

  useEffect(() => {
    if (!data) return;

    drawChart(svg);
  }, [svg, data]);

  return (
    <div>
      <main>
        <svg ref={svg} />
      </main>
    </div>
  );
};

export default HomePage;
