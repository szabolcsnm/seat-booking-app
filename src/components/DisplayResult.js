const DisplayResult = ({errorMessage, bestPlaces, db}) => {
  return (
    <div className='result-container'>
      <div className='input-title'>Best Seats</div>
      {errorMessage && <p>{errorMessage}</p>}
      {bestPlaces.length !== 0 && (
        <div>
          <div>{`Area: ${db[bestPlaces[0]].area}`}</div>
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
