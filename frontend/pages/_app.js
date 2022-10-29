import '../styles/globals.css'
import Navbar from "../components/Navbar";
import FloatingNav from "../components/FloatingNav";
import {MoralisProvider} from 'react-moralis'

function MyApp({ Component, pageProps }) {
  return (
  <MoralisProvider initializeOnMount={false}>
    <Navbar />
    <FloatingNav />
    <Component {...pageProps} />
  </MoralisProvider>
  )
}

export default MyApp
