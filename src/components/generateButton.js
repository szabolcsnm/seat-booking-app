import {useEffect, useState} from 'react';
import database from '../database/db';

const DB_LENGTH = Object.keys(database).length;
const MIN_NUMBER_OF_SEATS_RESERVED = Math.floor((20 * DB_LENGTH) / 100);

/* ------------------- Generate reserved seats from original db ------------------- */
const GenerateReservedSeats = (db, seats) => {
  let result = [];
  for (let i = 0; i < seats; i++) {
    result = Object.keys(db)
      .sort(() => 0.5 - Math.random())
      .slice(0, seats);
  }
  return result;
};

function GenerateButton({setDb}) {
  const [numberOfReservedSeats, setNumberOfReservedSeats] = useState(
    MIN_NUMBER_OF_SEATS_RESERVED
  );
  const [reservedSeats, setReservedSeats] = useState([]);

  const changeHandler = (event) => {
    setNumberOfReservedSeats(Number(event.target.value));
  };

  useEffect(() => {
    setReservedSeats(GenerateReservedSeats(database, numberOfReservedSeats));
  }, [numberOfReservedSeats]);

  /* ------------------- Update database with reserved seats in state db ------------------- */
  const clickHandler = () => {
    let data = {...database};

    for (let i = 0; i < reservedSeats.length; i++) {
      data = {...data, [reservedSeats[i]]: {...data[reservedSeats[i]], reserved: true}};
      setDb(data);
    }

    setReservedSeats(GenerateReservedSeats(database, numberOfReservedSeats));
  };

  return (
    <div className='occupied-input-container'>
      <div className='input-title'>Occupied seats</div>
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
          Generate
        </button>
      </div>
    </div>
  );
}

export default GenerateButton;
