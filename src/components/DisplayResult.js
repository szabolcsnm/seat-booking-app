const DisplayResult = ({errorMessage, bestPlaces, db}) => {
  const AREA_NAMES = {
    'auditorium': 'Auditorium',
    'balcony-mid': 'Balcony Middle',
    'balcony-left': 'Balcony Left',
    'balcony-right': 'Balcony-Right',
    'box-left-1': 'Box Left 1.',
    'box-left-2': 'Box Left 2.',
    'box-right-1': 'Box Right 1.',
    'box-right-2': 'Box Right 2.',
  }

  return (
    <div className='result-container'>
      <div className='input-title'>Best Seats</div>
      {errorMessage && <div className="error">{errorMessage}</div>}
      {bestPlaces.length !== 0 && (
        <div className="result">
          <div>{`Area: ${AREA_NAMES[db[bestPlaces[0]].area]}`}</div>
          <div>{`Row: ${db[bestPlaces[0]].row}.`}</div>
          <div>
            Seats:{' '}
            {bestPlaces.map((_, index) => {
              return <span key={`result_${index}`}>{`${db[bestPlaces[index]].seat}. `}</span>;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplayResult;
