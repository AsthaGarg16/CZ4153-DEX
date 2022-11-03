import styled from "styled-components";
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto";

const data = {
  labels: [
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
    "Jan",
  ],
  datasets: [
    {
      fill: false,
      lineTension: 0.1,
      backgroundColor: "#8c00ff",
      borderColor: "#8c00ff",
      borderCapStyle: "butt",
      borderDash: [],
      borderDashOffset: 0.0,
      borderJoinStyle: "miter",
      pointBorderColor: "#8c00ff",
      pointBackgroundColor: "#8c00ff",
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: "#8c00ff",
      pointHoverBorderColor: "#8c00ff",
      pointHoverBorderWidth: 2,
      pointRadius: 1,
      pointHitRadius: 10,
      data: [65, 59, 80, 81, 56, 72, 45, 67, 55, 42],
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
      <h3>Token Price Trends</h3>
      <Wrapper>
        <Line data={data} options={options} width={400} height={120} />
      </Wrapper>
    </div>
  );
};

export default BalanceChart;

const Wrapper = styled.div``;
