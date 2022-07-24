import './App.css';
import {useCallback, useEffect, useState} from 'react';
import GenerateButton from './components/generateButton';
import FindPlaces from './components/findPlaces';
import database from './database/db.js';

const DEFAULT_PLACES = 2;
let category_1 = []; // Auditorium 5000
let category_2 = []; // Balcony-Mid 5000
let category_3 = []; // Auditorium 4000
let category_4 = []; // Balcony-Mid 4000
let category_5 = []; // Auditorium 3000
let category_6 = []; // Balcony-Mid 3000
let category_9 = []; // Balcony-Mid 2000

function App() {
  const [reservedSeats, setReservedSeats] = useState([]);
  const [places, setPlaces] = useState(DEFAULT_PLACES);
  const [bestPlaces, setBestPlaces] = useState([]);
  const [db, setDb] = useState(database);

  console.log('---------------render---------------');

  /* Create reserved seats */
  const updateSeatsReserved = useCallback(
    (db, seats) => {
      let data = {...db};
      for (let i = 0; i < seats.length; i++) {
        data = {...data, [seats[i]]: {...data[seats[i]], reserved: true}};
        setDb(data);
      }
    },
    []
  );

  useEffect(() => {
    category_1 = []; // Auditorium 5000
    category_2 = []; // Balcony-Mid 5000
    category_3 = []; // Auditorium 4000
    category_4 = []; // Balcony-Mid 4000
    category_5 = []; // Auditorium 3000
    category_6 = []; // Balcony-Mid 3000
    category_9 = []; // Balcony-Mid 2000
    updateSeatsReserved(database, reservedSeats); 
  }, [updateSeatsReserved, reservedSeats]);
  /* Create reserved seats */

  /* Create category */
  const createCategory = useCallback((db) => {
    for (let i = 0; i < Object.keys(db).length; i++) {
      if (Object.values(db)[i].price === 5000) {
        if (Object.values(db)[i].area === 'auditorium') {
          category_1.push(Object.keys(db)[i]);
        }
        if (Object.values(db)[i].area === 'balcony-mid') {
          category_2.push(Object.keys(db)[i]);
        }
      }

      if (Object.values(db)[i].price === 4000) {
        if (Object.values(db)[i].area === 'auditorium') {
          category_3.push(Object.keys(db)[i]);
        }
        if (Object.values(db)[i].area === 'balcony-mid') {
          category_4.push(Object.keys(db)[i]);
        }
      }

      if (Object.values(db)[i].price === 3000) {
        if (Object.values(db)[i].area === 'auditorium') {
          category_5.push(Object.keys(db)[i]);
        }
        if (Object.values(db)[i].area === 'balcony-mid') {
          category_6.push(Object.keys(db)[i]);
        }
      }

      if (Object.values(db)[i].price === 2000) {
        if (Object.values(db)[i].area === 'balcony-mid') {
          category_9.push(Object.keys(db)[i]);
        }
      }
    }
  }, []);

  useEffect(() => {
    createCategory(db);
  }, [createCategory, db]);
  /* Create category */


  const calculateRowNumber = (db, category) => {
    let categoryArr = category.map((item) => db[item].row);
    return [...new Set(categoryArr)];
  };

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
      if(seatNumber === seatCounter / 2) {
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

  const findPlaceOptions = useCallback((db) => {
    let optionsArray = [];
    let tempResult = [];
    let tempWeigth = 0;
    let counter = 0;
    let currentRow = Math.min(...calculateRowNumber(db, category_1));

    // debugger;
    for (let i = 0; i < category_1.length; i++) {

      if(counter === places) {
        optionsArray.push({[tempWeigth + currentRow * currentRow]: [...tempResult]});
        tempResult = [];
        tempWeigth = 0;
        counter = 0;
        i = i - (places - 1);
      }

      if(counter < places) {
        if(currentRow !== Object.entries(db)[Number(category_1[i]) - 1][1].row) {
          tempResult = [];
          tempWeigth = 0;
          counter = 0;
        }

        if (Object.entries(db)[Number(category_1[i]) - 1][1].reserved === false) {
          tempResult.push(Object.keys(db)[Number(category_1[i]) - 1]);
          tempWeigth += calculateSeatWeigthing(db, Number(category_1[i]));
          currentRow = Object.entries(db)[Number(category_1[i] - 1)][1].row;
          counter++;
        }

        if(Object.entries(db)[Number(category_1[i]) - 1][1].reserved === true) {
          tempResult = [];
          tempWeigth = 0;
          counter = 0;
        }

        if(i === category_1.length - 1 && tempResult.length === places) {
          optionsArray.push({[tempWeigth + currentRow * currentRow]: [...tempResult]});
        }

      }
    }
    return optionsArray;
  }, [places]);


  const findBestPlaces2 = useCallback((db) => {
    let result = [];
    let counter = 0;

    // debugger;
    for (let i = 0; i < category_1.length; i++) {  
      if(counter === places) {

        if(result !== []) {
          if(Object.values(db)[Number(category_1[i]) - 1].row !== Number(result[result.length - 1][1].row)) {
            counter = 0;
            result = [];
            continue;
          }
        }

        if (!Object.values(db)[Number(category_1[i]) - 1].reserved && calculateSeatWeigthing(db, Number(category_1[i])) < calculateSeatWeigthing(db, Number(result[0][0]))) {
          result.push(Object.entries(db)[Number(category_1[i]) - 1]);
          result.shift();
        }

        if(!Object.values(db)[Number(category_1[i]) - 1].reserved && calculateSeatWeigthing(db, Number(category_1[i])) > calculateSeatWeigthing(db, Number(result[0][0]))) {
          return result;
        }
  
        if(Object.values(db)[Number(category_1[i]) - 1].reserved === true) {
          // continue;
          return result;
        }
      }

      if(counter < places) {
        if (!Object.entries(db)[Number(category_1[i]) - 1].reserved) {
          result.push(Object.entries(db)[Number(category_1[i]) - 1]);
          counter++;

          if(result !== []) {
            if(Object.values(db)[Number(category_1[i]) - 1].row !== Number(result[result.length - 1][1].row)) {
              counter = 0;
              result = [];
              continue;
            }
          }
        }
  
        if(Object.values(db)[Number(category_1[i]) - 1].reserved === true) {
          counter = 0;
          result = [];
        }
      }
    }
    return result;
  }, [places]);

  useEffect(() => {
    // console.log(calculateRowNumber(db, category_1));
    // console.log(calculateSeatWeigthing(db, 37));
    console.log(findPlaceOptions(db));
    
    let options = findPlaceOptions(db);
    let bestOptions = Math.min(...options.map((item) => {
      return Object.keys(item)[0];
    }));
    let bestPlaces = Object.values(Object.values(options.filter((item) => {
      return item[bestOptions];
    })[0]))[0];

    console.log(bestOptions);
    console.log(bestPlaces);
    setBestPlaces(bestPlaces);
    

    // console.log(Object.values(bestPlaces[0]));
  }, [db, findPlaceOptions, places]);

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
                index >= 14 &&
                index < 29 && (
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
                index >= 29 &&
                index < 45 && (
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
                index >= 45 &&
                index < 62 && (
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
                index >= 62 &&
                index < 80 && (
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
                index >= 80 &&
                index < 99 && (
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
                index >= 99 &&
                index < 119 && (
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
                index >= 119 &&
                index < 140 && (
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
        </div>
        <div className='grid-item-c'>
          <div className='seat-container'>
            {Object.keys(db).map((item, index) => {
              return (
                index >= 140 &&
                index < 158 && (
                  <div
                    className={`seat ${db[item].reserved ? 'seat-reserved' : ''}`}
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
                    className={`seat ${db[item].reserved ? 'seat-reserved' : ''}`}
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
          <GenerateButton setReservedSeats={setReservedSeats} />
          <FindPlaces places={places} setPlaces={setPlaces} />
        </div>
      </div>
    </div>
  );
}

export default App;
