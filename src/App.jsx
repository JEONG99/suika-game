import { isMobile } from "react-device-detect";
import Mobile from "./Mobile";
import Desktop from "./Desktop";

function App() {
  return isMobile ? <Mobile /> : <Desktop />;
}

export default App;
