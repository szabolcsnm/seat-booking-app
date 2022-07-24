import {useState} from 'react';
import database from '../database/db';

const DB_LENGTH = Object.keys(database).length;
const MIN_NUMBER_OF_SEATS_RESERVED = Math.floor(20 * DB_LENGTH / 100);

function GenerateButton({setReservedSeats}) {
  const [numberOfReservedSeats, setNumberOfReservedSeats] = useState(MIN_NUMBER_OF_SEATS_RESERVED);

  const changeHandler = (event) => {
    setNumberOfReservedSeats(Number(event.target.value));
  };
  
  const clickHandler = () => {
    GenerateReservedSeats(database, numberOfReservedSeats);
  };
  
  const GenerateReservedSeats = (db, seats) => {
    let result = [];
    for(let i = 0; i < seats; i++) {
      result = Object.keys(db).sort(() => 0.5 - Math.random()).slice(0, seats);
    }
    setReservedSeats(result);
  };

  return (
    <div>
      <input
        type='number'
        name='reservedSeats'
        min={MIN_NUMBER_OF_SEATS_RESERVED}
        max={DB_LENGTH}
        value={numberOfReservedSeats}
        onChange={changeHandler}
      />
      <button type='button' onClick={clickHandler}>
        Generate occupied seats
      </button>
    </div>
  );
}

export default GenerateButton;
