const properties = require("./json/properties.json");
const users = require("./json/users.json");

const { Pool } = require("pg");

const pool = new Pool({
  user: "development",
  password: "development",
  host: "localhost",
  database: "lightbnb",
});
pool.query(`SELECT title FROM properties LIMIT 10;`)


/// Users
/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  return pool
    .query(`SELECT * FROM users WHERE email = $1`, [email])
    .then((result) => {
      if (result.rows.length === 0) {
        return null
      }
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
      return null;
    });
};

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  return pool
    .query(`SELECT * FROM users WHERE id = $1`, [id])
    .then((result) => {
      if (result.rows.length === 0) {
        return null
      }
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
      return null;
    });
};

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  return pool
    .query(`INSERT INTO users (name, email, password)
  VALUES($1, $2, $3) RETURNING *`, [user.name, user.password, user.email])
    .then((result) => {
      console.log(result.rows[0]);
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
      return null;
    })
};

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  return pool
    .query(`SELECT
  reservations.*,
  properties.*,
  avg(rating) as average_rating
FROM
  reservations
  JOIN properties ON reservations.property_id = properties.id
  JOIN property_reviews ON properties.id = property_reviews.property_id
WHERE
  reservations.guest_id = $1 AND reservations.end_date < now()::date
GROUP BY
  properties.id,
  reservations.id
ORDER BY
  reservations.start_date
LIMIT
  $2;`, [guest_id, limit])
    .then((result) => {
      console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    })
};
//--------------------------------------------------------------
/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 * 
 */


const getAllProperties = (options, limit = 10) => {
  // 1
  const queryParams = [];
  let where = false;
  // 2
  let queryString = `
   SELECT properties.*, avg(property_reviews.rating) as average_rating
   FROM properties
   JOIN property_reviews ON properties.id = property_id
   `;

  // 3 
  // Check if a city has been passed in as an option. Add the city to the params array and create a WHERE for the city.
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;
    where = true;
  }
  
  // Check if an owner_id has been passed in as an option. Add the owner_id to the params array and add a WHERE for the owner_id.
  if (options.owner_id) {
    queryParams.push(options.owner_id);
    // If there is a WHERE already, add an AND to the query. Otherwise, add a WHERE.
    queryString += `${where ? 'AND' : 'WHERE'} owner_id = $${queryParams.length} `;
    where = true;
  }

  // Check if a minimum_price_per_night and a maximum_price_per_night have been passed in as options. Add these to the params array and add a WHERE to the query.
  if (options.minimum_price_per_night && options.maximum_price_per_night) {
    queryParams.push(options.minimum_price_per_night * 100); // multiply by 100 to get cents
    queryString += `${where ? 'AND' : 'WHERE'} cost_per_night >= $${queryParams.length} `; // if where is true, add AND, otherwise add WHERE
    queryParams.push(options.maximum_price_per_night * 100)
    queryString += `AND cost_per_night <= $${queryParams.length} `;
    where = true;
  } 
  else if (options.minimum_price_per_night) { // if only minimum price is provided
    queryParams.push(options.minimum_price_per_night * 100);
    queryString += `${where ? 'AND' : 'WHERE'} cost_per_night >= $${queryParams.length} `; // if where is true, add AND, otherwise add WHERE
    where = true;
  } 
  else if (options.maximum_price_per_night) { // if only maximum price is provided
    queryParams.push(options.maximum_price_per_night * 100); 
    queryString += `${where ? 'AND' : 'WHERE'} cost_per_night <= $${queryParams.length} `; 
    where = true;
  }
  // Add a GROUP BY and HAVING to the query to get the average rating of each property.
  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    queryString += `HAVING AVG(property_reviews.rating) >= $${queryParams.length} `;
  }

  // 4
  queryParams.push(limit);
  queryString += `
   GROUP BY properties.id
   ORDER BY cost_per_night
   LIMIT $${queryParams.length};
   `;

  // 5
  console.log(queryString, queryParams);

  // 6
  return pool.query(queryString, queryParams)
    .then((result) => {
      console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};

//--------------------------------------------------------------
/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  return pool.query(
    `INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, street, city, province, post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms)
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14 )
    RETURNING *`, 
    [
      property.owner_id,
      property.title, 
      property.description, 
      property.thumbnail_photo_url, 
      property.cover_photo_url, 
      property.cost_per_night, 
      property.street, 
      property.city, 
      property.province, 
      property.post_code,
      property.country, 
      property.parking_spaces, 
      property.number_of_bathrooms, 
      property.number_of_bedrooms
    ])
    .then((result) => {
      console.log(result.rows[0]);
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
      return null;
    })
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
