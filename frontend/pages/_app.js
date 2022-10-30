import '../styles/globals.css'
import Navbar from "../components/Navbar";
import FloatingNav from "../components/FloatingNav";
import OrderBook from "../Components/OrderBook"
import CreateOrder from "../Components/CreateOrder"
import Balances from "../Components/Balances"
import {MoralisProvider} from 'react-moralis'

function MyApp({ Component, pageProps }) {
  return (
  <MoralisProvider initializeOnMount={false}>
    <Navbar />
    {/* <Component {...pageProps} /> */}
    <div className="wrapper">
      <div className="one"><FloatingNav /></div>
      <div className="two">
        <h3>Order Book</h3>
        <h4 className='customh4buy'>BUY</h4>
        <OrderBook/>
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
      </div>
    </div>
  </MoralisProvider>
  )
}

export default MyApp


