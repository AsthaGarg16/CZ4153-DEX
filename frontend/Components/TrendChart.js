import styled from "styled-components";
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto";

const data = {
  labels: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,28,29,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60],
  datasets: [
    {
      fill: false,
      lineTension: 0.1,
      backgroundColor: "#e1e0e0",
      borderColor: "#e1e0e0",
      borderCapStyle: "butt",
      borderDash: [],
      borderDashOffset: 0.0,
      borderJoinStyle: "miter",
      pointBorderColor: "#e1e0e0",
      pointBackgroundColor: "#e1e0e0",
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: "#e1e0e0",
      pointHoverBorderColor: "#e1e0e0",
      pointHoverBorderWidth: 2,
      pointRadius: 1,
      pointHitRadius: 10,
      // data: [10,8,13,20,3,17,6,2,9,19,12,14,16,18,5,11,7,1,5,4,5,20,11,19,16,7,3,4,8,5,13,2,10,9,17,14,6,12,18,18,8,20,4,3,7,19,2,9,12,14,5,10,6,17,13,11,16,15,11,8,10],
    },
  ],
};

const options = {
  plugins: {
    legend: {
      display: false,
    },
  },
};

const BalanceChart = () => {
  return (
    <div>
      <h3>Hourly Token Price Trends</h3>
      <Wrapper>
        <Line data={data} options={options} width={400} height={120} />
      </Wrapper>
    </div>
  );
};

export default BalanceChart;

const Wrapper = styled.div``;
