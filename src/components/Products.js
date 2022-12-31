import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import ProductCard from "./ProductCard";
import Cart from "./Cart";
import { generateCartItemsFrom } from "./Cart";
import "./Products.css";

/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 *
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} productId - Unique ID for the product
 */

const Products = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [prodArr, setProdArr] = useState(null);
  const [allProductArray, setAllProductArray] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [cartData, setCartData] = useState([]);

  useEffect(() => {
    performAPICall();
    fetchCart(localStorage.getItem("token"));
  }, []);

  useEffect(() => {
    setCartData(generateCartItemsFrom(cartItems, allProductArray))
  }, [cartItems, allProductArray]);

  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */

  const performAPICall = async () => {
    setLoading(true);
    try {
      const res = await axios.get(config.endpoint + "/products");
      setAllProductArray(res.data);
      setProdArr(res.data);
      return res.data;
    } catch (err) {
      if (err.response && err.response.status === 500) {
        enqueueSnackbar(err.response.data.message, { variant: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
  const performSearch = async (text) => {
    setLoading(true);
    try {
      const res = await axios.get(
        config.endpoint + `/products/search?value=${text}`
      );
      setProdArr(res.data);
    } catch (err) {
      if (err.response.status === 404) {
        setProdArr(null);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
  let timeout;
  const debounceSearch = (event, debounceTimeout) => {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      performSearch(event.target.value);
    }, debounceTimeout);
  };

  /**
   * Perform the API call to fetch the user's cart and return the response
   *
   * @param {string} token - Authentication token returned on login
   *
   * @returns { Array.<{ productId: string, qty: number }> | null }
   *    The response JSON object
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 401
   * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * }
   */
  const fetchCart = async (token) => {
    if (!token) return;

    try {
      const url = config.endpoint + "/cart";
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCartItems(res.data);
      return res.data;
    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };

  /**
   * Return if a product already is present in the cart
   *
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { String } productId
   *    Id of a product to be checked
   *
   * @returns { Boolean }
   *    Whether a product of given "productId" exists in the "items" array
   *
   */
  const isItemInCart = (items, productId) => {
    for (let product of items) {
      if (product._id === productId) return true;
    }
    return false;
  };

  /**
   * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
   *
   * @param {string} token
   *    Authentication token returned on login
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { Array.<Product> } products
   *    Array of objects with complete data on all available products
   * @param {string} productId
   *    ID of the product that is to be added or updated in cart
   * @param {number} qty
   *    How many of the product should be in the cart
   * @param {boolean} options
   *    If this function was triggered from the product card's "Add to Cart" button
   *
   * Example for successful response from backend:
   * HTTP 200 - Updated list of cart items
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 404 - On invalid productId
   * {
   *      "success": false,
   *      "message": "Product doesn't exist"
   * }
   */

  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
    if (localStorage.getItem("username") === null) {
      enqueueSnackbar("Login to add an item to the Cart", {
        variant: "warning",
      });
      return;
    }
    if (options.preventDuplicate && isItemInCart(cartData, productId)) {
      enqueueSnackbar(
        "Item already in cart. Use the cart sidebar to update quantity or remove item.",
        {
          variant: "warning",
        }
      );
    } else {
      try{
        let res = await axios.post(`${config.endpoint}/cart`, {productId, qty},{
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setCartItems(res.data);
      } catch(e) {
        if (e.response && e.response.status === 404) {
          enqueueSnackbar(e.response.data.message, { variant: "error" });
        } else {
          enqueueSnackbar(
            "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
            {
              variant: "error",
            }
          );
        }
      }
    }
  };

  return (
    <div>
      <Header>
        {" "}
        {/* Search view for desktop */}
        <div className="search-div">
          <TextField
            className="search-desktop"
            size="small"
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Search color="primary" />
                </InputAdornment>
              ),
            }}
            placeholder="Search for items/categories"
            name="search"
            onChange={(e) => {
              debounceSearch(e, 500);
            }}
          />
        </div>
      </Header>

      {/* Search view for mobiles */}
      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange={(e) => {
          debounceSearch(e, 500);
        }}
      />
      <Grid container>
        <Grid
          item
          xs={12}
          md={localStorage.getItem("username") === null ? 12 : 9}
        >
          <Grid container>
            <Grid item className="product-grid">
              <Box className="hero">
                <p className="hero-heading">
                  India’s
                  <span className="hero-highlight">FASTEST DELIVERY</span> to
                  your door step
                </p>
              </Box>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            {loading ? (
              <div className="loading">
                <CircularProgress color="success" />
                <h5>Loading Products...</h5>
              </div>
            ) : (
              <>
                {" "}
                {prodArr == null && (
                  <div className="no-prod-div">
                    <SentimentDissatisfied />
                    <p>No products found</p>
                  </div>
                )}
                {prodArr !== null &&
                  prodArr.map((item) => {
                    
                    return (
                      
                      <Grid item xs={6} md={3} key={item._id}>
                        <ProductCard
                          product={item}
                          handleAddToCart={async () =>
                            await addToCart(
                              window.localStorage.getItem("token"),
                              cartData,
                              prodArr,
                              item._id,
                              1,
                              { preventDuplicate: true }
                            )
                          }
                        />
                      </Grid>
                    );
                  })}{" "}
              </>
            )}{" "}
          </Grid>
        </Grid>
        {localStorage.getItem("username") !== null && (
          <Grid item xs={12} md={3}>
            <Cart
              items={cartData}
              handleQuantity={addToCart}
              products={allProductArray}
            />
          </Grid>
        )}
      </Grid>
      <Footer />
    </div>
  );
};

export default Products;
