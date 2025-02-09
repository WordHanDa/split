import './App.css';
import AddGroup from './AddGroup';
import ShowGroup from './ShowGroup';
import AddUser from './AddUser';
import ShowUser from './ShowUser';
import ShowRate from './ShowRate';


function App() {

  return (
    <div className="App">
      <AddGroup/>
      <ShowGroup/>
      <AddUser/>
      <ShowUser/>
      <ShowRate/>
    </div>
  );
}

export default App;