import isSameDay from "date-fns/isSameDay";

const aggregateData = (data) => {
  const aggregatedData = [];

  data.forEach((dataPoint) => {
    const existingDateIndex = aggregatedData.findIndex((aggregatedDataPoint) =>
      isSameDay(
        new Date(aggregatedDataPoint.timestamp),
        new Date(dataPoint.timestamp),
      ),
    );

    if (existingDateIndex >= 0) {
      aggregatedData[existingDateIndex].count += 1;
    } else {
      aggregatedData.push({
        timestamp: dataPoint.timestamp,
        count: 1,
        location: dataPoint.location,
      });
    }
  });

  return aggregatedData;
};

export default aggregateData;
