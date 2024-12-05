import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
// import Invoice from "./Invoice";
import './App.css'
import { useNavigate } from "react-router-dom";
import God from "./assets/krishnaa.png"
import Swal from "sweetalert2";

const Login = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [isLoggedIn] = useState(false);
  const navigate = useNavigate()

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  // Handle login
  // const handleLogin = () => {
  //   const { username, password } = credentials;
  //   if (username === "admin" && password === "sahu123") {
  //     // setIsLoggedIn(true);
  //     navigate('/invoice')
  //   } else {
  //     alert("Invalid Username or Password!");
  //   }
  // };

  const handleLogin = () => {
    const { username, password } = credentials;
    if (username === "admin" && password === "sahu123") {
      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: "Welcome to the Invoice Management System!",
        timer: 2000, // Auto close after 2 seconds
        showConfirmButton: false,
      }).then(() => {
        navigate("/invoice"); // Redirect after alert closes
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: "Invalid Username or Password!",
      });
    }
  };

  // Render the billing page if logged in


  console.log(isLoggedIn, '---- isLoggedIn')

  return (
    <div className="d-flex brand-logo justify-content-center align-items-center vh-100 bg-light" style={{ position: "relative" }}>
      <div style={{ position: 'fixed', top: "20px", width:"158px", height:"158px" }}>
        <img src={God} width='100%' height="100%" style={{borderRadius:"74px"}} />
      </div>
      <div className="card shadow p-4" style={{ width: "400px" }}>
        <h3 className="text-center mb-4">Login</h3>
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input
            type="text"
            className="form-control"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            placeholder="Enter username"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            placeholder="Enter password"
          />
        </div>
        <button className="btn btn-primary w-100" onClick={handleLogin}>
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
