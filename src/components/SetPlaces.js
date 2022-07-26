function SetPlaces({places, setPlaces, minNumberOfPlacesToBook, maxNumberOfPlacesToBook}) {
  const incrementHandler = () => {
    places < 8 && setPlaces(places + 1);
  };
  const decrementHandler = () => {
    places > 2 && setPlaces(places - 1);
  };

  return (
    <div className='seat-input-container'>
      <div className='input-title'>Seats</div>
      <div>
        <button type='button' onClick={decrementHandler} disabled={places === 2}>
          -
        </button>
        <span className='input-result'>{places}</span>
        <button type='button' onClick={incrementHandler} disabled={places === 8}>
          +
        </button>
      </div>
      <small>{`(Min: ${minNumberOfPlacesToBook}, Max: ${maxNumberOfPlacesToBook})`}</small>
    </div>
  );
}

export default SetPlaces;
