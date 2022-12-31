import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useHistory, Link } from "react-router-dom";
import React, { useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Register.css";

const Register = () => {
  
  const [input, setInput] = useState({username: "", password: "", confirmPw: ""});

  const [loading, setLoading] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const history = useHistory();


  // TODO: CRIO_TASK_MODULE_REGISTER - Implement the register function
  /**
   * Definition for register handler
   * - Function to be called when the user clicks on the register button or submits the register form
   *
   * @param {{ username: string, password: string, confirmPassword: string }} formData
   *  Object with values of username, password and confirm password user entered to register
   * 
   *
   * API endpoint - "POST /auth/register"
   *
   * Example for successful response from backend for the API call:
   * HTTP 201
   * {
   *      "success": true,
   * }
   *
   * Example for failed response from backend for the API call:
   * HTTP 400
   * {
   *      "success": false,
   *      "message": "Username is already taken"
   * }
   * 
   */
  const register = async (e, formData) => {
    e.preventDefault();
    let isDataValid = validateInput(formData);
    if(isDataValid) {
      try{
        setLoading('true');

        const url = config.endpoint + '/auth/register';
        await axios.post(url,{
          username:formData.username,
          password:formData.password
        });

          enqueueSnackbar('Registered Successfully', {
            variant: 'success'})
    
          // setting the input back to empty strings
          setInput({username: "", password: "", confirmPw: ""});

          history.push('/login');
      }


      catch(err) {
        
        if(err?.response && err.response.status >= 400 && err.response.status < 500)  {
          let errData = err.response.data;
          // console.log(errData);
          enqueueSnackbar(errData?.message, {variant: 'error'});
        }
        else {
          enqueueSnackbar("Something went wrong. Check that the backend is running, reachable and returns valid JSON", {variant: 'error'});
        }
      }


      finally {
        setLoading(false);
      }
    }
  };

  // TODO: CRIO_TASK_MODULE_REGISTER - Implement user input validation logic
  /**
   * Validate the input values so that any bad or illegal values are not passed to the backend.
   *
   * @param {{ username: string, password: string, confirmPassword: string }} data
   *  Object with values of username, password and confirm password user entered to register
   *
   * @returns {boolean}
   *    Whether validation has passed or not
   *
   * Return false if any validation condition fails, otherwise return true.
   * (NOTE: The error messages to be shown for each of these cases, are given with them)
   * -    Check that username field is not an empty value - "Username is a required field"
   * -    Check that username field is not less than 6 characters in length - "Username must be at least 6 characters"
   * -    Check that password field is not an empty value - "Password is a required field"
   * -    Check that password field is not less than 6 characters in length - "Password must be at least 6 characters"
   * -    Check that confirmPassword field has the same value as password field - Passwords do not match
   */
  const validateInput = (data) => {
    if(data.username === '') {
      enqueueSnackbar('Username is a required field', {
        variant: 'warning'
      });
      return false;
    }
    if(data.username.length < 6) {
      enqueueSnackbar('Username must be atleast 6 characters', {
        variant: 'warning'
      });
      return false;
    }
    if(data.password === '') {
      enqueueSnackbar('Password is a required field', {
        variant: 'warning'
      });
      return false;
    }
    if(data.password.length < 6) {
      enqueueSnackbar('Password must be at least 6 characters', {
        variant: 'warning'
      });
      return false;
    }
    if(data.confirmPw !== data.password) {
      enqueueSnackbar('Password do not match', {
        variant: 'warning'
      });
      return false;
    }

    return true;
  };

  const handleUserName = (data) => {
    // console.log(data.target.value);
    setInput({
      ...input,
      username: data.target.value
    });
  };

  const handlePassword = (data) => {
    // console.log(data.target.value);
    setInput({
      ...input,
      password: data.target.value
    });
  };

  const handleConfirmPassword = (data) => {
    // console.log(data.target.value);
    setInput({
      ...input,
      confirmPw: data.target.value
    });
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons />
      <Box className="register-content">
        <Stack spacing={2} className="register-form">
          <h2 className="title">Register</h2>
          <TextField
            id="username"
            label="Username"
            variant="outlined"
            title="Username"
            name="username"
            placeholder="Enter Username"
            fullWidth
            value={input.username} onChange={handleUserName}
          />
          <TextField
            id="password"
            variant="outlined"
            label="Password"
            name="password"
            type="password"
            helperText="Password must be atleast 6 characters length"
            fullWidth
            placeholder="Enter a password with minimum 6 characters"
            value={input.password} onChange={handlePassword}
          />
          <TextField
            id="confirmPassword"
            variant="outlined"
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            fullWidth
            value={input.confirmPw} onChange={handleConfirmPassword}
          />
            <Stack alignItems="center" spacing={5}>
              {loading && <CircularProgress color="success" />}
            </Stack>
            {!loading && <Button className="button" variant="contained" onClick={(e) => register(e, input)}>
            register Now
           </Button>}
          <p className="secondary-action">
            Already have an account?{" "}
             <Link to = '/login' className="link" href="#">
              Login here
             </Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Register;
