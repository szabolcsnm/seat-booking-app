import './App.css';
import {useCallback, useEffect, useState} from 'react';
import GenerateButton from './components/generateButton';
import FindPlaces from './components/findPlaces';
import database from './database/db.js';

const DEFAULT_PLACES = 2;
const CATEGORY_ARRAY = [
  {id: 1, seats: []}, // Auditorium 5000
  {id: 2, seats: []}, // Balcony-Mid 5000
  {id: 3, seats: []}, // Auditorium 4000
  {id: 4, seats: []}, // Balcony-Mid 4000
  {id: 5, seats: []}, // Auditorium 3000
  {id: 6, seats: []}, // Balcony-Mid 3000
  {id: 9, seats: []}, // Balcony-Mid 2000
];

/* ------------------- Calculate row number  -------------------*/
const calculateRowNumber = (db, category) => {
  let categoryArr = category.map((item) => db[item].row);
  return [...new Set(categoryArr)];
};

/* ------------------- Calculate seat weigthing -------------------*/
const calculateSeatWeigthing = (db, seat_id) => {
  let rowId;
  let areaId;
  let seatNumber;
  let seatCounter = 0;

  for (let i = 0; i < Object.keys(db).length; i++) {
    if (seat_id === Number(Object.keys(db)[i])) {
      seatNumber = Object.values(db)[i].seat;
      areaId = Object.values(db)[i].area;
      rowId = Object.values(db)[i].row;
      break;
    }
  }
  for (let i = 0; i < Object.keys(db).length; i++) {
    if (Object.values(db)[i].area === areaId && Object.values(db)[i].row === rowId) {
      seatCounter++;
    }
  }

  if (seatCounter % 2 === 0) {
    if (seatNumber === seatCounter / 2) {
      return 0;
    }

    if (seatNumber < seatCounter / 2) {
      return seatCounter / 2 - seatNumber;
    }

    if (seatNumber > seatCounter / 2) {
      return seatNumber - seatCounter / 2 - 1;
    }
  }

  if (seatCounter % 2 !== 0) {
    if (seatNumber === Math.ceil(seatCounter / 2)) {
      return 0;
    }

    if (seatNumber < Math.ceil(seatCounter / 2)) {
      return Math.ceil(seatCounter / 2) - seatNumber;
    }

    if (seatNumber > Math.ceil(seatCounter / 2)) {
      return seatNumber - Math.ceil(seatCounter / 2);
    }
  }
};

/* ------------------- Find place options -------------------*/
const findPlaceOptions = (db, placesToBook, category) => {
  let optionsArray = [];
  let tempResult = [];
  let tempWeigth = 0;
  let counter = 0;
  let currentRow = Math.min(...calculateRowNumber(db, category));

  for (let i = 0; i < category.length; i++) {
    if (counter === placesToBook) {
      optionsArray.push({[tempWeigth + currentRow * currentRow]: [...tempResult]});
      tempResult = [];
      tempWeigth = 0;
      counter = 0;
      i = i - (placesToBook - 1);
    }

    if (counter < placesToBook) {
      if (currentRow !== Object.entries(db)[Number(category[i]) - 1][1].row) {
        tempResult = [];
        tempWeigth = 0;
        counter = 0;
      }

      if (Object.entries(db)[Number(category[i]) - 1][1].reserved === false) {
        tempResult.push(Object.keys(db)[Number(category[i]) - 1]);
        tempWeigth += calculateSeatWeigthing(db, Number(category[i]));
        currentRow = Object.entries(db)[Number(category[i] - 1)][1].row;
        counter++;
      }

      if (Object.entries(db)[Number(category[i]) - 1][1].reserved === true) {
        tempResult = [];
        tempWeigth = 0;
        counter = 0;
      }

      if (i === category.length - 1 && tempResult.length === placesToBook) {
        optionsArray.push({[tempWeigth + currentRow * currentRow]: [...tempResult]});
      }
    }
  }
  console.log(optionsArray);
  return optionsArray;
};

function App() {
  const [places, setPlaces] = useState(DEFAULT_PLACES);
  const [bestPlaces, setBestPlaces] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [db, setDb] = useState(database);
  console.log('---------------render---------------');

  /* ------------------- Create category based on original database -------------------*/
  useEffect(() => {
    const createCategory = (db, categoryArray) => {
      for (let i = 0; i < Object.keys(db).length; i++) {
        if (Object.values(db)[i].price === 5000) {
          if (Object.values(db)[i].area === 'auditorium') {
            Object.values(categoryArray[0])[1].push(Object.keys(db)[i]);
          }
          if (Object.values(db)[i].area === 'balcony-mid') {
            Object.values(categoryArray[1])[1].push(Object.keys(db)[i]);
          }
        }

        if (Object.values(db)[i].price === 4000) {
          if (Object.values(db)[i].area === 'auditorium') {
            Object.values(categoryArray[2])[1].push(Object.keys(db)[i]);
          }
          if (Object.values(db)[i].area === 'balcony-mid') {
            Object.values(categoryArray[3])[1].push(Object.keys(db)[i]);
          }
        }

        if (Object.values(db)[i].price === 3000) {
          if (Object.values(db)[i].area === 'auditorium') {
            Object.values(categoryArray[4])[1].push(Object.keys(db)[i]);
          }
          if (Object.values(db)[i].area === 'balcony-mid') {
            Object.values(categoryArray[5])[1].push(Object.keys(db)[i]);
          }
        }

        if (Object.values(db)[i].price === 2000) {
          if (Object.values(db)[i].area === 'balcony-mid') {
            Object.values(categoryArray[6])[1].push(Object.keys(db)[i]);
          }
        }
      }
      console.log('category created');
    };
    createCategory(database, CATEGORY_ARRAY);
  }, []);

  /* ------------------- Find best places after having the best place options -------------------*/
  const findBestPlaces = useCallback(
    (db, categoryArray) => {
      let allPlaceOption = [];
      let bestOptions;
      let bestPlaces;

      for (let i = 0; i < categoryArray.length; i++) {
        allPlaceOption = findPlaceOptions(db, places, Object.values(categoryArray[i])[1]);

        if (allPlaceOption.length !== 0) {
          break;
        }

        if (i === categoryArray.length - 1 && allPlaceOption.length === 0) {
          setErrorMessage('Based on the input parameters no seat can be selected!');
          setBestPlaces([]);
          return null;
        }
      }

      if (allPlaceOption.length !== 0) {
        console.log(allPlaceOption);

        bestOptions = Math.min(
          ...allPlaceOption.map((item) => {
            return Object.keys(item)[0];
          })
        );
        console.log(bestOptions);

        bestPlaces = Object.values(
          Object.values(
            allPlaceOption.filter((item) => {
              return item[bestOptions];
            })[0]
          )
        )[0];
        console.log(bestPlaces);

        setBestPlaces(bestPlaces);
        setErrorMessage('');
      }
    },
    [places]
  );
  useEffect(() => {
    findBestPlaces(db, CATEGORY_ARRAY);
  }, [db, findBestPlaces]);

  return (
    <div className='App'>
      <div className='grid-container'>
        <div className='grid-item-a'>Stage</div>
        <div className='grid-item-b'>
          <div className='seat-container'>
            {Object.keys(db).map((item, index) => {
              return (
                index < 14 && (
                  <div
                    className={`seat ${db[item].reserved ? 'seat-reserved' : ''} ${
                      bestPlaces.includes(item) ? 'best-seats' : ''
                    }`}
                    key={`id_${index}`}
                  >
                    {db[item].seat},{db[item].price}
                  </div>
                )
              );
            })}
          </div>
          <div className='seat-container'>
            {Object.keys(db).map((item, index) => {
              return (
                index >= 14 &&
                index < 29 && (
                  <div
                    className={`seat ${db[item].reserved ? 'seat-reserved' : ''} ${
                      bestPlaces.includes(item) ? 'best-seats' : ''
                    }`}
                    key={`id_${index}`}
                  >
                    {db[item].seat},{db[item].price}
                  </div>
                )
              );
            })}
          </div>
          <div className='seat-container'>
            {Object.keys(db).map((item, index) => {
              return (
                index >= 29 &&
                index < 45 && (
                  <div
                    className={`seat ${db[item].reserved ? 'seat-reserved' : ''} ${
                      bestPlaces.includes(item) ? 'best-seats' : ''
                    }`}
                    key={`id_${index}`}
                  >
                    {db[item].seat},{db[item].price}
                  </div>
                )
              );
            })}
          </div>
          <div className='seat-container'>
            {Object.keys(db).map((item, index) => {
              return (
                index >= 45 &&
                index < 62 && (
                  <div
                    className={`seat ${db[item].reserved ? 'seat-reserved' : ''} ${
                      bestPlaces.includes(item) ? 'best-seats' : ''
                    }`}
                    key={`id_${index}`}
                  >
                    {db[item].seat},{db[item].price}
                  </div>
                )
              );
            })}
          </div>
          <div className='seat-container'>
            {Object.keys(db).map((item, index) => {
              return (
                index >= 62 &&
                index < 80 && (
                  <div
                    className={`seat ${db[item].reserved ? 'seat-reserved' : ''} ${
                      bestPlaces.includes(item) ? 'best-seats' : ''
                    }`}
                    key={`id_${index}`}
                  >
                    {db[item].seat},{db[item].price}
                  </div>
                )
              );
            })}
          </div>
          <div className='seat-container'>
            {Object.keys(db).map((item, index) => {
              return (
                index >= 80 &&
                index < 99 && (
                  <div
                    className={`seat ${db[item].reserved ? 'seat-reserved' : ''} ${
                      bestPlaces.includes(item) ? 'best-seats' : ''
                    }`}
                    key={`id_${index}`}
                  >
                    {db[item].seat},{db[item].price}
                  </div>
                )
              );
            })}
          </div>
          <div className='seat-container'>
            {Object.keys(db).map((item, index) => {
              return (
                index >= 99 &&
                index < 119 && (
                  <div
                    className={`seat ${db[item].reserved ? 'seat-reserved' : ''} ${
                      bestPlaces.includes(item) ? 'best-seats' : ''
                    }`}
                    key={`id_${index}`}
                  >
                    {db[item].seat},{db[item].price}
                  </div>
                )
              );
            })}
          </div>
          <div className='seat-container'>
            {Object.keys(db).map((item, index) => {
              return (
                index >= 119 &&
                index < 140 && (
                  <div
                    className={`seat ${db[item].reserved ? 'seat-reserved' : ''} ${
                      bestPlaces.includes(item) ? 'best-seats' : ''
                    }`}
                    key={`id_${index}`}
                  >
                    {db[item].seat},{db[item].price}
                  </div>
                )
              );
            })}
          </div>
        </div>
        <div className='grid-item-c'>
          <div className='seat-container'>
            {Object.keys(db).map((item, index) => {
              return (
                index >= 140 &&
                index < 158 && (
                  <div
                    className={`seat ${db[item].reserved ? 'seat-reserved' : ''} ${bestPlaces.includes(item) ? 'best-seats' : ''}`}
                    key={`id_${index}`}
                  >
                    {db[item].seat},{db[item].price}
                  </div>
                )
              );
            })}
          </div>
          <div className='seat-container'>
            {Object.keys(db).map((item, index) => {
              return (
                index >= 158 &&
                index < 177 && (
                  <div
                    className={`seat ${db[item].reserved ? 'seat-reserved' : ''}  ${bestPlaces.includes(item) ? 'best-seats' : ''}`}
                    key={`id_${index}`}
                  >
                    {db[item].seat},{db[item].price}
                  </div>
                )
              );
            })}
          </div>
        </div>
        <div className='grid-item-d'>
          <div>Legend</div>
          <GenerateButton setDb={setDb} />
          <FindPlaces places={places} setPlaces={setPlaces} />
          {errorMessage && <p>{errorMessage}</p>}
        </div>
      </div>
    </div>
  );
}

export default App;
