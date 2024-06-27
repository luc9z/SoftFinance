import React from 'react';
import { Chart } from 'react-google-charts';

const ResultChart = ({ data }) => {
  const options = {
    pieHole: 0.4,
    is3D: false,
  };

  console.log('Chart Data:', data);

  return (
    <Chart
      chartType="PieChart"
      width="100%"
      height="400px"
      data={data}
      options={options}
    />
  );
};

export default ResultChart;
