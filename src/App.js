import './App.css';
import database from './database/db.js';

function App() {
  return (
    <div className='App'>
      <div className='grid-container'>
        <div className='grid-item-a'>Stage</div>
        <div className='grid-item-b'>
          <div className='seat-container'>
            {Object.keys(database).map((item, index) => {
              return (
                index < 14 && (
                  <div className='seat' key={`id_${index}`}>
                    {database[item].seat},{database[item].price}
                  </div>
                )
              );
            })}
          </div>
          <div className='seat-container'>
            {Object.keys(database).map((item, index) => {
              return (
                index >= 14 &&
                index < 29 && (
                  <div className='seat' key={`id_${index}`}>
                    {database[item].seat},{database[item].price}
                  </div>
                )
              );
            })}
          </div>
          <div className='seat-container'>
            {Object.keys(database).map((item, index) => {
              return (
                index >= 29 &&
                index < 45 && (
                  <div className='seat' key={`id_${index}`}>
                    {database[item].seat},{database[item].price}
                  </div>
                )
              );
            })}
          </div>
          <div className='seat-container'>
            {Object.keys(database).map((item, index) => {
              return (
                index >= 45 &&
                index < 62 && (
                  <div className='seat' key={`id_${index}`}>
                    {database[item].seat},{database[item].price}
                  </div>
                )
              );
            })}
          </div>
          <div className='seat-container'>
            {Object.keys(database).map((item, index) => {
              return (
                index >= 62 &&
                index < 80 && (
                  <div className='seat' key={`id_${index}`}>
                    {database[item].seat},{database[item].price}
                  </div>
                )
              );
            })}
          </div>
          <div className='seat-container'>
            {Object.keys(database).map((item, index) => {
              return (
                index >= 80 &&
                index < 99 && (
                  <div className='seat' key={`id_${index}`}>
                    {database[item].seat},{database[item].price}
                  </div>
                )
              );
            })}
          </div>
          <div className='seat-container'>
            {Object.keys(database).map((item, index) => {
              return (
                index >= 99 &&
                index < 119 && (
                  <div className='seat' key={`id_${index}`}>
                    {database[item].seat},{database[item].price}
                  </div>
                )
              );
            })}
          </div>
          <div className='seat-container'>
            {Object.keys(database).map((item, index) => {
              return (
                index >= 119 &&
                index < 140 && (
                  <div className='seat' key={`id_${index}`}>
                    {database[item].seat},{database[item].price}
                  </div>
                )
              );
            })}
          </div>
        </div>
        <div className='grid-item-c'>
        <div className='seat-container'>
            {Object.keys(database).map((item, index) => {
              return (
                index >= 140 &&
                index < 158 && (
                  <div className='seat' key={`id_${index}`}>
                    {database[item].seat},{database[item].price}
                  </div>
                )
              );
            })}
          </div>
          <div className='seat-container'>
            {Object.keys(database).map((item, index) => {
              return (
                index >= 158 &&
                index < 177 && (
                  <div className='seat' key={`id_${index}`}>
                    {database[item].seat},{database[item].price}
                  </div>
                )
              );
            })}
          </div>
        </div>
        <div className='grid-item-d'>
          Legend
        </div>
      </div>
    </div>
  );
}

export default App;
