import "../styles/globals.css";
import Navbar from "../components/Navbar";
import FloatingNav from "../components/FloatingNav";
import { MoralisProvider, useMoralis, useWeb3Contract } from "react-moralis";
import networkMapping from "../constants/networkMapping.json";

function MyApp({ Component, pageProps }) {
  return (
    <MoralisProvider initializeOnMount={false}>
      <Navbar />
      <FloatingNav />
      {/* <Component {...pageProps} /> */}
      {/* <div className="wrapper">
      <div className="one">
        <FloatingNav />
        <div className='onerow1'>
          hi
        </div>
        <div className='onerow2'>
          <HistoryTable/>
        </div>
      </div>
      <div className="two">
        <h3>Order Book</h3>
        <div className="heightgap"></div>
        <h4 className='customh4buy'>BUY</h4>
        <OrderBook/>
        <div className="heightgap"></div>
        <div className="heightgap"></div>
        <h4 className='customh4sell'>SELL</h4>
        <OrderBook/>
      </div>
      <div className="three">
        <div className='threerow1'>
        <CreateOrder/>
        </div>
        <div className='threerow2'>
        <h3>Balances</h3>
        <Balances/>
        </div>
        <div className='threerow3'>
        <DepositWithdraw/>
        </div>
      </div>
    </div> */}
    </MoralisProvider>
  );
}

export default MyApp;
