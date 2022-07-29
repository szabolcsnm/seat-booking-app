import database from '../database/db';

const ResetButton = ({
  minNumberOfPlacesToBook,
  setPlaces,
  setBestPlaces,
  setErrorMessage,
  setNumberOfReservedSeats,
  setDb,
  minNumberOfReservedSeats,
}) => {
  const clickHandler = () => {
    setPlaces(minNumberOfPlacesToBook);
    setBestPlaces([]);
    setErrorMessage('');
    setNumberOfReservedSeats(minNumberOfReservedSeats);
    setDb(database);
  };

  return (
    <div className='reset-button-container'>
      <button type='button' onClick={clickHandler}>
        Reset
      </button>
    </div>
  );
};

export default ResetButton;
