import './App.css';
import {useCallback, useEffect, useState} from 'react';
import GenerateButton from './components/GenerateButton';
import SetPlaces from './components/SetPlaces';
import DisplayResult from './components/DisplayResult';
import ResetButton from './components/ResetButton';
import database from './database/db.js';

const MIN_NUMBER_OF_PLACES_TO_BOOK = 2;
const MAX_NUMBER_OF_PLACES_TO_BOOK = 8;
const CATEGORY_ARRAY = [
  {id: 1, seats: []}, // Auditorium 5000
  {id: 2, seats: []}, // Balcony-Mid 5000
  {id: 3, seats: []}, // Auditorium 4000
  {id: 4, seats: []}, // Balcony-Mid 4000
  {id: 5, seats: []}, // Balcony-Left 4000
  {id: 6, seats: []}, // Balcony-Right 4000
  {id: 7, seats: []}, // Auditorium 3000
  {id: 8, seats: []}, // Balcony-Mid 3000
  {id: 9, seats: []}, // Balcony-Left 3000
  {id: 10, seats: []}, // Balcony-Right 3000
  {id: 11, seats: []}, // Box-Left-1 3000
  {id: 12, seats: []}, // Box-Left-2 3000
  {id: 13, seats: []}, // Box-Right-1 3000
  {id: 14, seats: []}, // Box-Right-2 3000
  {id: 15, seats: []}, // Balcony-Mid 2000
  {id: 16, seats: []}, // Balcony-Left 2000
  {id: 17, seats: []}, // Balcony-Right 2000
  {id: 18, seats: []}, // Box-Left-1 2000
  {id: 19, seats: []}, // Box-Left-2 2000
  {id: 20, seats: []}, // Box-Right-1 2000
  {id: 21, seats: []}, // Box-Right-2 2000
];
const PRICE_CATEGORY = {
  5000: 'seat-red',
  4000: 'seat-yellow',
  3000: 'seat-blue',
  2000: 'seat-green',
};
const DB_LENGTH = Object.keys(database).length;
const MIN_NUMBER_OF_SEATS_RESERVED = Math.floor((20 * DB_LENGTH) / 100);

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

      if (typeof Object.entries(db)[Number(category[i] - 2)] !== 'undefined') {
        if (category[i] - category[i - 1] !== 1) {
          tempResult = [];
          tempWeigth = 0;
          counter = 0;
        }
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
  return optionsArray;
};

function App() {
  const [places, setPlaces] = useState(MIN_NUMBER_OF_PLACES_TO_BOOK);
  const [bestPlaces, setBestPlaces] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [numberOfReservedSeats, setNumberOfReservedSeats] = useState(
    MIN_NUMBER_OF_SEATS_RESERVED
  );
  const [db, setDb] = useState(database);

  /* ------------------- Create categories based on original database -------------------*/
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
          if (Object.values(db)[i].area === 'balcony-left') {
            Object.values(categoryArray[4])[1].push(Object.keys(db)[i]);
          }
          if (Object.values(db)[i].area === 'balcony-right') {
            Object.values(categoryArray[5])[1].push(Object.keys(db)[i]);
          }
        }

        if (Object.values(db)[i].price === 3000) {
          if (Object.values(db)[i].area === 'auditorium') {
            Object.values(categoryArray[6])[1].push(Object.keys(db)[i]);
          }
          if (Object.values(db)[i].area === 'balcony-mid') {
            Object.values(categoryArray[7])[1].push(Object.keys(db)[i]);
          }
          if (Object.values(db)[i].area === 'balcony-left') {
            Object.values(categoryArray[8])[1].push(Object.keys(db)[i]);
          }
          if (Object.values(db)[i].area === 'balcony-right') {
            Object.values(categoryArray[9])[1].push(Object.keys(db)[i]);
          }
          if (Object.values(db)[i].area === 'box-left-1') {
            Object.values(categoryArray[10])[1].push(Object.keys(db)[i]);
          }
          if (Object.values(db)[i].area === 'box-left-2') {
            Object.values(categoryArray[11])[1].push(Object.keys(db)[i]);
          }
          if (Object.values(db)[i].area === 'box-right-1') {
            Object.values(categoryArray[12])[1].push(Object.keys(db)[i]);
          }
          if (Object.values(db)[i].area === 'box-right-2') {
            Object.values(categoryArray[13])[1].push(Object.keys(db)[i]);
          }
        }

        if (Object.values(db)[i].price === 2000) {
          if (Object.values(db)[i].area === 'balcony-mid') {
            Object.values(categoryArray[14])[1].push(Object.keys(db)[i]);
          }
          if (Object.values(db)[i].area === 'balcony-left') {
            Object.values(categoryArray[15])[1].push(Object.keys(db)[i]);
          }
          if (Object.values(db)[i].area === 'balcony-right') {
            Object.values(categoryArray[16])[1].push(Object.keys(db)[i]);
          }
          if (Object.values(db)[i].area === 'box-left-1') {
            Object.values(categoryArray[17])[1].push(Object.keys(db)[i]);
          }
          if (Object.values(db)[i].area === 'box-left-2') {
            Object.values(categoryArray[18])[1].push(Object.keys(db)[i]);
          }
          if (Object.values(db)[i].area === 'box-right-1') {
            Object.values(categoryArray[19])[1].push(Object.keys(db)[i]);
          }
          if (Object.values(db)[i].area === 'box-right-2') {
            Object.values(categoryArray[20])[1].push(Object.keys(db)[i]);
          }
        }
      }
    };
    createCategory(database, CATEGORY_ARRAY);
  }, []);

  /* ------------------- Find best places from the place options list -------------------*/
  const findBestPlaces = useCallback(
    (db, categoryArray) => {
      let allPlaceOption = [];
      let bestOptions;
      let bestPlaces;
      let checkReserved = [];

      Object.values(db).map((item) => checkReserved.push(item.reserved));

      if (checkReserved.includes(true)) {
        for (let i = 0; i < categoryArray.length; i++) {
          allPlaceOption = findPlaceOptions(
            db,
            places,
            Object.values(categoryArray[i])[1]
          );

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
          bestOptions = Math.min(
            ...allPlaceOption.map((item) => {
              return Object.keys(item)[0];
            })
          );

          bestPlaces = Object.values(
            Object.values(
              allPlaceOption.filter((item) => {
                return item[bestOptions];
              })[0]
            )
          )[0];

          setBestPlaces(bestPlaces);
          setErrorMessage('');
        }
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
        <div className='grid-item-header'>
          <hr className='stage'></hr>
        </div>

        <div className='grid-item-middle'>
          {/* Auditorium */}
          <div className='area-container-middle'>
            <div className='area-title'>Auditorium</div>
            <div className='seat-container'>
              <p className='row-number'>1</p>
              {Object.keys(db).map((item, index) => {
                return (
                  index < 14 && (
                    <div
                      className={`seat ${PRICE_CATEGORY[db[item].price]} ${
                        db[item].reserved ? 'seat-reserved' : ''
                      } ${bestPlaces.includes(item) ? 'seat-best' : ''}`}
                      key={`id_${index}`}
                    >
                      {db[item].seat}
                    </div>
                  )
                );
              })}
            </div>
            <div className='seat-container'>
              <p className='row-number'>2</p>
              {Object.keys(db).map((item, index) => {
                return (
                  index >= 14 &&
                  index < 29 && (
                    <div
                      className={`seat ${PRICE_CATEGORY[db[item].price]} ${
                        db[item].reserved ? 'seat-reserved' : ''
                      } ${bestPlaces.includes(item) ? 'seat-best' : ''}`}
                      key={`id_${index}`}
                    >
                      {db[item].seat}
                    </div>
                  )
                );
              })}
            </div>
            <div className='seat-container'>
              <p className='row-number'>3</p>
              {Object.keys(db).map((item, index) => {
                return (
                  index >= 29 &&
                  index < 45 && (
                    <div
                      className={`seat ${PRICE_CATEGORY[db[item].price]} ${
                        db[item].reserved ? 'seat-reserved' : ''
                      } ${bestPlaces.includes(item) ? 'seat-best' : ''}`}
                      key={`id_${index}`}
                    >
                      {db[item].seat}
                    </div>
                  )
                );
              })}
            </div>
            <div className='seat-container'>
              <p className='row-number'>4</p>
              {Object.keys(db).map((item, index) => {
                return (
                  index >= 45 &&
                  index < 62 && (
                    <div
                      className={`seat ${PRICE_CATEGORY[db[item].price]} ${
                        db[item].reserved ? 'seat-reserved' : ''
                      } ${bestPlaces.includes(item) ? 'seat-best' : ''}`}
                      key={`id_${index}`}
                    >
                      {db[item].seat}
                    </div>
                  )
                );
              })}
            </div>
            <div className='seat-container'>
              <p className='row-number'>5</p>
              {Object.keys(db).map((item, index) => {
                return (
                  index >= 62 &&
                  index < 80 && (
                    <div
                      className={`seat ${PRICE_CATEGORY[db[item].price]} ${
                        db[item].reserved ? 'seat-reserved' : ''
                      } ${bestPlaces.includes(item) ? 'seat-best' : ''}`}
                      key={`id_${index}`}
                    >
                      {db[item].seat}
                    </div>
                  )
                );
              })}
            </div>
            <div className='seat-container'>
              <p className='row-number'>6</p>
              {Object.keys(db).map((item, index) => {
                return (
                  index >= 80 &&
                  index < 99 && (
                    <div
                      className={`seat ${PRICE_CATEGORY[db[item].price]} ${
                        db[item].reserved ? 'seat-reserved' : ''
                      } ${bestPlaces.includes(item) ? 'seat-best' : ''}`}
                      key={`id_${index}`}
                    >
                      {db[item].seat}
                    </div>
                  )
                );
              })}
            </div>
            <div className='seat-container'>
              <p className='row-number'>7</p>
              {Object.keys(db).map((item, index) => {
                return (
                  index >= 99 &&
                  index < 119 && (
                    <div
                      className={`seat ${PRICE_CATEGORY[db[item].price]} ${
                        db[item].reserved ? 'seat-reserved' : ''
                      } ${bestPlaces.includes(item) ? 'seat-best' : ''}`}
                      key={`id_${index}`}
                    >
                      {db[item].seat}
                    </div>
                  )
                );
              })}
            </div>
            <div className='seat-container'>
              <p className='row-number'>8</p>
              {Object.keys(db).map((item, index) => {
                return (
                  index >= 119 &&
                  index < 140 && (
                    <div
                      className={`seat ${PRICE_CATEGORY[db[item].price]} ${
                        db[item].reserved ? 'seat-reserved' : ''
                      } ${bestPlaces.includes(item) ? 'seat-best' : ''}`}
                      key={`id_${index}`}
                    >
                      {db[item].seat}
                    </div>
                  )
                );
              })}
            </div>
          </div>
          {/* Balcony-Middle */}
          <div className='area-container-middle'>
            <div className='area-title'>Balcony Middle</div>
            <div className='seat-container'>
              <p className='row-number'>1</p>
              {Object.keys(db).map((item, index) => {
                return (
                  index >= 140 &&
                  index < 158 && (
                    <div
                      className={`seat ${PRICE_CATEGORY[db[item].price]} ${
                        db[item].reserved ? 'seat-reserved' : ''
                      } ${bestPlaces.includes(item) ? 'seat-best' : ''}`}
                      key={`id_${index}`}
                    >
                      {db[item].seat}
                    </div>
                  )
                );
              })}
            </div>
            <div className='seat-container'>
              <p className='row-number'>2</p>
              {Object.keys(db).map((item, index) => {
                return (
                  index >= 158 &&
                  index < 177 && (
                    <div
                      className={`seat ${PRICE_CATEGORY[db[item].price]} ${
                        db[item].reserved ? 'seat-reserved' : ''
                      }  ${bestPlaces.includes(item) ? 'seat-best' : ''}`}
                      key={`id_${index}`}
                    >
                      {db[item].seat}
                    </div>
                  )
                );
              })}
            </div>
          </div>
        </div>

        <div className='grid-item-left'>
          {/* Box-Left-1 */}
          <div className='area-container-side'>
            <div className='area-title'>Box Left 1.</div>
            <div className='seat-container'>
              <p className='row-number'>1</p>
              {Object.keys(db).map((item, index) => {
                return (
                  index >= 193 &&
                  index < 196 && (
                    <div
                      className={`seat ${PRICE_CATEGORY[db[item].price]} ${
                        db[item].reserved ? 'seat-reserved' : ''
                      } ${bestPlaces.includes(item) ? 'seat-best' : ''}`}
                      key={`id_${index}`}
                    >
                      {db[item].seat}
                    </div>
                  )
                );
              })}
            </div>
            <div className='seat-container'>
              <p className='row-number'>2</p>
              {Object.keys(db).map((item, index) => {
                return (
                  index >= 196 &&
                  index < 199 && (
                    <div
                      className={`seat ${PRICE_CATEGORY[db[item].price]} ${
                        db[item].reserved ? 'seat-reserved' : ''
                      }  ${bestPlaces.includes(item) ? 'seat-best' : ''}`}
                      key={`id_${index}`}
                    >
                      {db[item].seat}
                    </div>
                  )
                );
              })}
            </div>
          </div>
          {/* Box-Left-2 */}
          <div className='area-container-side'>
            <div className='area-title'>Box Left 2.</div>
            <div className='seat-container'>
              <p className='row-number'>1</p>
              {Object.keys(db).map((item, index) => {
                return (
                  index >= 199 &&
                  index < 202 && (
                    <div
                      className={`seat ${PRICE_CATEGORY[db[item].price]} ${
                        db[item].reserved ? 'seat-reserved' : ''
                      } ${bestPlaces.includes(item) ? 'seat-best' : ''}`}
                      key={`id_${index}`}
                    >
                      {db[item].seat}
                    </div>
                  )
                );
              })}
            </div>
            <div className='seat-container'>
              <p className='row-number'>2</p>
              {Object.keys(db).map((item, index) => {
                return (
                  index >= 202 &&
                  index < 205 && (
                    <div
                      className={`seat ${PRICE_CATEGORY[db[item].price]} ${
                        db[item].reserved ? 'seat-reserved' : ''
                      }  ${bestPlaces.includes(item) ? 'seat-best' : ''}`}
                      key={`id_${index}`}
                    >
                      {db[item].seat}
                    </div>
                  )
                );
              })}
            </div>
          </div>
          {/* Balcony-Left */}
          <div className='area-container-side'>
            <div className='area-title'>Balcony Left</div>
            <div className='seat-container'>
              <p className='row-number'>1</p>
              {Object.keys(db).map((item, index) => {
                return (
                  index >= 177 &&
                  index < 181 && (
                    <div
                      className={`seat ${PRICE_CATEGORY[db[item].price]} ${
                        db[item].reserved ? 'seat-reserved' : ''
                      } ${bestPlaces.includes(item) ? 'seat-best' : ''}`}
                      key={`id_${index}`}
                    >
                      {db[item].seat}
                    </div>
                  )
                );
              })}
            </div>
            <div className='seat-container'>
              <p className='row-number'>2</p>
              {Object.keys(db).map((item, index) => {
                return (
                  index >= 181 &&
                  index < 185 && (
                    <div
                      className={`seat ${PRICE_CATEGORY[db[item].price]} ${
                        db[item].reserved ? 'seat-reserved' : ''
                      }  ${bestPlaces.includes(item) ? 'seat-best' : ''}`}
                      key={`id_${index}`}
                    >
                      {db[item].seat}
                    </div>
                  )
                );
              })}
            </div>
          </div>
        </div>

        <div className='grid-item-right'>
          {/* Box-Right-1 */}
          <div className='area-container-side'>
            <div className='area-title'>Box Right 1.</div>
            <div className='seat-container'>
              <p className='row-number'>1</p>
              {Object.keys(db).map((item, index) => {
                return (
                  index >= 205 &&
                  index < 208 && (
                    <div
                      className={`seat ${PRICE_CATEGORY[db[item].price]} ${
                        db[item].reserved ? 'seat-reserved' : ''
                      } ${bestPlaces.includes(item) ? 'seat-best' : ''}`}
                      key={`id_${index}`}
                    >
                      {db[item].seat}
                    </div>
                  )
                );
              })}
            </div>
            <div className='seat-container'>
              <p className='row-number'>2</p>
              {Object.keys(db).map((item, index) => {
                return (
                  index >= 208 &&
                  index < 211 && (
                    <div
                      className={`seat ${PRICE_CATEGORY[db[item].price]} ${
                        db[item].reserved ? 'seat-reserved' : ''
                      }  ${bestPlaces.includes(item) ? 'seat-best' : ''}`}
                      key={`id_${index}`}
                    >
                      {db[item].seat}
                    </div>
                  )
                );
              })}
            </div>
          </div>
          {/* Box-Right-2 */}
          <div className='area-container-side'>
            <div className='area-title'>Box Right 2.</div>
            <div className='seat-container'>
              <p className='row-number'>1</p>
              {Object.keys(db).map((item, index) => {
                return (
                  index >= 211 &&
                  index < 214 && (
                    <div
                      className={`seat ${PRICE_CATEGORY[db[item].price]} ${
                        db[item].reserved ? 'seat-reserved' : ''
                      } ${bestPlaces.includes(item) ? 'seat-best' : ''}`}
                      key={`id_${index}`}
                    >
                      {db[item].seat}
                    </div>
                  )
                );
              })}
            </div>
            <div className='seat-container'>
              <p className='row-number'>2</p>
              {Object.keys(db).map((item, index) => {
                return (
                  index >= 214 &&
                  index < 217 && (
                    <div
                      className={`seat ${PRICE_CATEGORY[db[item].price]} ${
                        db[item].reserved ? 'seat-reserved' : ''
                      }  ${bestPlaces.includes(item) ? 'seat-best' : ''}`}
                      key={`id_${index}`}
                    >
                      {db[item].seat}
                    </div>
                  )
                );
              })}
            </div>
          </div>
          {/* Balcony-Right */}
          <div className='area-container-side'>
            <div className='area-title'>Balcony Right</div>
            <div className='seat-container'>
              <p className='row-number'>1</p>
              {Object.keys(db).map((item, index) => {
                return (
                  index >= 185 &&
                  index < 189 && (
                    <div
                      className={`seat ${PRICE_CATEGORY[db[item].price]} ${
                        db[item].reserved ? 'seat-reserved' : ''
                      } ${bestPlaces.includes(item) ? 'seat-best' : ''}`}
                      key={`id_${index}`}
                    >
                      {db[item].seat}
                    </div>
                  )
                );
              })}
            </div>
            <div className='seat-container'>
              <p className='row-number'>2</p>
              {Object.keys(db).map((item, index) => {
                return (
                  index >= 189 &&
                  index < 193 && (
                    <div
                      className={`seat ${PRICE_CATEGORY[db[item].price]} ${
                        db[item].reserved ? 'seat-reserved' : ''
                      }  ${bestPlaces.includes(item) ? 'seat-best' : ''}`}
                      key={`id_${index}`}
                    >
                      {db[item].seat}
                    </div>
                  )
                );
              })}
            </div>
          </div>
        </div>

        <div className='grid-item-legend'>
          <div className='legend-container'>
            <ul className='legend-item'>
              <li className='seat-red'></li>
              <li>5.000 Ft</li>
            </ul>
            <ul className='legend-item'>
              <li className='seat-yellow'></li>
              <li>4.000 Ft</li>
            </ul>
            <ul className='legend-item'>
              <li className='seat-blue'></li>
              <li>3.000 Ft</li>
            </ul>
            <ul className='legend-item'>
              <li className='seat-green'></li>
              <li>2.000 Ft</li>
            </ul>
            <ul className='legend-item'>
              <li className='seat-reserved'></li>
              <li>Occupied</li>
            </ul>
            <ul className='legend-item'>
              <li className='seat-best'></li>
              <li>Best</li>
            </ul>
          </div>
        </div>

        <div className='grid-item-input'>
          <div className='input-container'>
            <div className='input-item'>
              <GenerateButton
                setDb={setDb}
                numberOfReservedSeats={numberOfReservedSeats}
                setNumberOfReservedSeats={setNumberOfReservedSeats}
                databaseLength={DB_LENGTH}
                minNumberOfReservedSeats={MIN_NUMBER_OF_SEATS_RESERVED}
              />
            </div>
            <div className='input-item'>
              <SetPlaces
                places={places}
                setPlaces={setPlaces}
                minNumberOfPlacesToBook={MIN_NUMBER_OF_PLACES_TO_BOOK}
                maxNumberOfPlacesToBook={MAX_NUMBER_OF_PLACES_TO_BOOK}
              />
            </div>
            <div className='input-item'>
              <DisplayResult
                errorMessage={errorMessage}
                bestPlaces={bestPlaces}
                db={db}
              />
            </div>
          </div>
        </div>

        <div className='grid-item-footer'>
          <ResetButton
            minNumberOfPlacesToBook={MIN_NUMBER_OF_PLACES_TO_BOOK}
            setPlaces={setPlaces}
            setBestPlaces={setBestPlaces}
            setErrorMessage={setErrorMessage}
            setNumberOfReservedSeats={setNumberOfReservedSeats}
            setDb={setDb}
            minNumberOfReservedSeats={MIN_NUMBER_OF_SEATS_RESERVED}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
