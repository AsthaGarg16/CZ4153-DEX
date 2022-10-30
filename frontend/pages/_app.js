import '../styles/globals.css'
import Navbar from "../components/Navbar";
import FloatingNav from "../components/FloatingNav";
import VirtualizedList from "../components/VirtualizedList"
import {MoralisProvider} from 'react-moralis'

function MyApp({ Component, pageProps }) {
  return (
  <MoralisProvider initializeOnMount={false}>
    <Navbar />
    {/* <Component {...pageProps} /> */}
    <div class="wrapper">
      <div class="one"><FloatingNav /></div>
      <div class="two">
        <h3>Order Book</h3>
        <h4 className='customh4buy'>Buy</h4>
        <VirtualizedList/>
        <h4 className='customh4sell'>Sell</h4>
        <VirtualizedList/>
      </div>
      <div class="three">Three</div>
    </div>
  </MoralisProvider>
  )
}

export default MyApp


