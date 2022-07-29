import {useEffect, useState} from 'react';
import database from '../database/db';

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

function GenerateButton({
  setDb,
  numberOfReservedSeats,
  setNumberOfReservedSeats,
  databaseLength,
  minNumberOfReservedSeats,
}) {
  const [reservedSeats, setReservedSeats] = useState([]);
  const [error, setError] = useState(false);

  const changeHandler = (event) => {
    if (event.target.validity.valid) {
      const value = event.target.value;

      setNumberOfReservedSeats(value);

      if (value < 43 || value > 217) {
        setError(true);
      } else {
        setError(false);
      }
    }
  };

  useEffect(() => {
    setReservedSeats(GenerateReservedSeats(database, numberOfReservedSeats));
  }, [numberOfReservedSeats]);

  /* ------------------- Update database with reserved seats in state db ------------------- */
  const clickHandler = () => {
    if (error) {
      return;
    } else {
      let data = {...database};

      for (let i = 0; i < reservedSeats.length; i++) {
        data = {...data, [reservedSeats[i]]: {...data[reservedSeats[i]], reserved: true}};
        setDb(data);
      }

      setReservedSeats(GenerateReservedSeats(database, numberOfReservedSeats));
    }
  };

  return (
    <div className='occupied-input-container'>
      <div className='input-title'>Occupied seats</div>
      <div>
        <input
          type='text'
          name='reservedSeats'
          pattern='[0-9]*'
          value={numberOfReservedSeats}
          onChange={changeHandler}
        />
        <button type='button' onClick={clickHandler} disabled={error}>
          Generate
        </button>
      </div>
      {error ? (
        <small className='error'>{`(Min: ${minNumberOfReservedSeats}, Max: ${databaseLength})`}</small>
      ) : (
        <small>{`(Min: ${minNumberOfReservedSeats}, Max: ${databaseLength})`}</small>
      )}
    </div>
  );
}

export default GenerateButton;
