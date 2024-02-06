import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import bgimg from "./imgs/peakpx.jpg";
import styles from "./App.module.css";
import { ref, onValue, set, remove } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { database } from "./firebase";
import { getAuth, signOut } from "firebase/auth";

function App() {
  const [cityName, setCity] = useState("");
  const [countryCode, setCountry] = useState("");
  const [temp, setTemp] = useState("");
  const [weatherData, setWeatherData] = useState({});
  const [load, setLoad] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [filteredActiveUsers, setFilteredActiveUsers] = useState([]);
  const [admin, setAdmin] = useState({});
  const navigate = useNavigate();
  // https://api.weatherapi.com/v1/current.json?key=80c5918842eeded4613ceabe141915cb=${cityName}
  const handleAddUser = (username) => {};
  const handleDeleteUser = (index) => {
    const newUsers = activeUsers.filter((user, i) => i !== index);
    setActiveUsers(newUsers);
  };
  const filterActiveUsersByDate = (date) => {
    // getData();
    if (date === "") {
      setActiveUsers(filteredActiveUsers);
      return;
    }
    const filteredUsers = filteredActiveUsers.filter((user) => user.date === date);
    setActiveUsers(filteredUsers);
  };
  const getData = async () => {
    // console.log(JSON.parse(localStorage.getItem('userData')).uid);
    const dbRef = ref(database, `users/`);
    onValue(dbRef, (snapshot) => {
      let records = [];
      snapshot.forEach((childSnapshot) => {
        let data = childSnapshot.val();
        if (
          data.uname ===
          JSON.parse(localStorage.getItem("userData"))?.email.split("@")[0]
        ) {
          setAdmin(data);
          data = { ...data, currentUser: true };
        }
        records.push(data);
        // info={...info,[childSnapshot.key]:data};
      });
      // records.push(info);

      setActiveUsers(records);
      setFilteredActiveUsers(records);
    });
  };
  // const activeUsers=[{username:'user1',addedDate:'12/12/2021',status:'inactive'},{username:'user2',addedDate:'12/12/2021',status:'inactive'}]
  const getTemp = async () => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName},${countryCode}&appid=94dd891924a718733889af7b72b92657`
      );
      const data = await res.json();
      setWeatherData(data);
      setTemp(parseFloat(data.main.temp) - 273.15);
    } catch {
      setTemp("");
      setCity("");
      alert("something went wrong");
      return;
    }
    setLoad(false);
  };
  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        // set(ref(database, `users/${JSON.parse(localStorage.getItem('userData')).uid}`), {
        //   status: "inactive",
        // })
        const userRef = ref(
          database,
          `users/${JSON.parse(localStorage.getItem("userData"))?.uid}`
        );

        // Remove the user's data node
        remove(userRef);
        localStorage.removeItem("userData");
        console.log("User data deleted successfully");
      })
      .catch((error) => {
        // An error happened.
        console.log(error);
      });
    navigate("/signin");
  };
  const changeStatus = (e) => {
    console.log(e.target.value);
    set(
      ref(
        database,
        `users/${JSON.parse(localStorage.getItem("userData"))?.uid}`
      ),
      {
        uname: admin.uname,
        status: e.target.value,
        date: admin.date,
      }
    );
  };
  useEffect(() => {
    if (localStorage.getItem("userData") === null) {
      navigate("/signin");
    }
    getData();
  }, [navigate]);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        // border:'2px solid red',
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <div className={styles.activeUsers}>
        <div>filter by date</div>
        <input type="date" onChange={(e) => filterActiveUsersByDate(e.target.value)} />
        
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Added Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {activeUsers.map((user, index) => (
              <tr key={index}>
                <td
                  style={{
                    padding: "0px 5px",
                    backgroundColor: user.status === "active" ? "lime" : "red",
                  }}
                >
                  {user.uname}
                </td>
                <td style={{ backgroundColor: "white", textAlign: "center" }}>
                  {user.date}
                </td>
                <td>
                  {user.currentUser ? (
                    <select
                      defaultValue={user.status}
                      onChange={(e) => changeStatus(e)}
                    >
                      <option>active</option>
                      <option>inactive</option>
                    </select>
                  ) : (
                    <div
                      style={{
                        backgroundColor: "black",
                        textAlign: "center",
                        color: user.status === "active" ? "lime" : "red",
                      }}
                    >
                      {user.status}
                    </div>
                  )}
                </td>
                <td>
                  <Button
                    variant="contained"
                    onClick={() => handleAddUser(user.username)}
                  >
                    Add
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => handleDeleteUser(index)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <img alt="bgimg" src={bgimg} className={styles.back}></img>
      {!localStorage.getItem("userData") ? (
        <div style={{ display: "flex" }}>
          <Button
            sx={{ margin: "20px" }}
            variant="contained"
            onClick={() => navigate("/signin")}
          >
            Sign In
          </Button>
          <Button
            sx={{ margin: "20px" }}
            variant="contained"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </Button>
        </div>
      ) : (
        <Button
          sx={{ margin: "20px" }}
          variant="contained"
          onClick={handleSignOut}
        >
          Sign Out
        </Button>
      )}
      <h1 className={styles.title}>Weather App</h1>
      <div className={styles.country}>
        <FormControl fullWidth variant="filled">
          <InputLabel id="demo-simple-select-filled-label">
            Select Country
          </InputLabel>
          <Select
            labelId="demo-simple-select-filled-label"
            id="demo-simple-select-filled"
            value={countryCode}
            sx={{
              border: "2px solid white",
              backgroundColor: `rgb(${"0,0,0,0.5"})`,
              color: "white",
              marginBottom: window.innerWidth <= 590 ? "20px" : null,
            }}
            onChange={(e) => setCountry(e.target.value)}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            <MenuItem value="AF">Afghanistan</MenuItem>
            <MenuItem value="AX">Aland Islands</MenuItem>
            <MenuItem value="AL">Albania</MenuItem>
            <MenuItem value="DZ">Algeria</MenuItem>
            <MenuItem value="AS">American Samoa</MenuItem>
            <MenuItem value="AD">Andorra</MenuItem>
            <MenuItem value="AO">Angola</MenuItem>
            <MenuItem value="AI">Anguilla</MenuItem>
            <MenuItem value="AQ">Antarctica</MenuItem>
            <MenuItem value="AG">Antigua and Barbuda</MenuItem>
            <MenuItem value="AR">Argentina</MenuItem>
            <MenuItem value="AM">Armenia</MenuItem>
            <MenuItem value="AW">Aruba</MenuItem>
            <MenuItem value="AU">Australia</MenuItem>
            <MenuItem value="AT">Austria</MenuItem>
            <MenuItem value="AZ">Azerbaijan</MenuItem>
            <MenuItem value="BS">Bahamas</MenuItem>
            <MenuItem value="BH">Bahrain</MenuItem>
            <MenuItem value="BD">Bangladesh</MenuItem>
            <MenuItem value="BB">Barbados</MenuItem>
            <MenuItem value="BY">Belarus</MenuItem>
            <MenuItem value="BE">Belgium</MenuItem>
            <MenuItem value="BZ">Belize</MenuItem>
            <MenuItem value="BJ">Benin</MenuItem>
            <MenuItem value="BM">Bermuda</MenuItem>
            <MenuItem value="BT">Bhutan</MenuItem>
            <MenuItem value="BO">Bolivia</MenuItem>
            <MenuItem value="BQ">Bonaire, Sint Eustatius and Saba</MenuItem>
            <MenuItem value="BA">Bosnia and Herzegovina</MenuItem>
            <MenuItem value="BW">Botswana</MenuItem>
            <MenuItem value="BV">Bouvet Island</MenuItem>
            <MenuItem value="BR">Brazil</MenuItem>
            <MenuItem value="IO">British Indian Ocean Territory</MenuItem>
            <MenuItem value="BN">Brunei Darussalam</MenuItem>
            <MenuItem value="BG">Bulgaria</MenuItem>
            <MenuItem value="BF">Burkina Faso</MenuItem>
            <MenuItem value="BI">Burundi</MenuItem>
            <MenuItem value="KH">Cambodia</MenuItem>
            <MenuItem value="CM">Cameroon</MenuItem>
            <MenuItem value="CA">Canada</MenuItem>
            <MenuItem value="CV">Cape Verde</MenuItem>
            <MenuItem value="KY">Cayman Islands</MenuItem>
            <MenuItem value="CF">Central African Republic</MenuItem>
            <MenuItem value="TD">Chad</MenuItem>
            <MenuItem value="CL">Chile</MenuItem>
            <MenuItem value="CN">China</MenuItem>
            <MenuItem value="CX">Christmas Island</MenuItem>
            <MenuItem value="CC">Cocos (Keeling) Islands</MenuItem>
            <MenuItem value="CO">Colombia</MenuItem>
            <MenuItem value="KM">Comoros</MenuItem>
            <MenuItem value="CG">Congo</MenuItem>
            <MenuItem value="CD">
              Congo, Democratic Republic of the Congo
            </MenuItem>
            <MenuItem value="CK">Cook Islands</MenuItem>
            <MenuItem value="CR">Costa Rica</MenuItem>
            <MenuItem value="CI">Cote D'Ivoire</MenuItem>
            <MenuItem value="HR">Croatia</MenuItem>
            <MenuItem value="CU">Cuba</MenuItem>
            <MenuItem value="CW">Curacao</MenuItem>
            <MenuItem value="CY">Cyprus</MenuItem>
            <MenuItem value="CZ">Czech Republic</MenuItem>
            <MenuItem value="DK">Denmark</MenuItem>
            <MenuItem value="DJ">Djibouti</MenuItem>
            <MenuItem value="DM">Dominica</MenuItem>
            <MenuItem value="DO">Dominican Republic</MenuItem>
            <MenuItem value="EC">Ecuador</MenuItem>
            <MenuItem value="EG">Egypt</MenuItem>
            <MenuItem value="SV">El Salvador</MenuItem>
            <MenuItem value="GQ">Equatorial Guinea</MenuItem>
            <MenuItem value="ER">Eritrea</MenuItem>
            <MenuItem value="EE">Estonia</MenuItem>
            <MenuItem value="ET">Ethiopia</MenuItem>
            <MenuItem value="FK">Falkland Islands (Malvinas)</MenuItem>
            <MenuItem value="FO">Faroe Islands</MenuItem>
            <MenuItem value="FJ">Fiji</MenuItem>
            <MenuItem value="FI">Finland</MenuItem>
            <MenuItem value="FR">France</MenuItem>
            <MenuItem value="GF">French Guiana</MenuItem>
            <MenuItem value="PF">French Polynesia</MenuItem>
            <MenuItem value="TF">French Southern Territories</MenuItem>
            <MenuItem value="GA">Gabon</MenuItem>
            <MenuItem value="GM">Gambia</MenuItem>
            <MenuItem value="GE">Georgia</MenuItem>
            <MenuItem value="DE">Germany</MenuItem>
            <MenuItem value="GH">Ghana</MenuItem>
            <MenuItem value="GI">Gibraltar</MenuItem>
            <MenuItem value="GR">Greece</MenuItem>
            <MenuItem value="GL">Greenland</MenuItem>
            <MenuItem value="GD">Grenada</MenuItem>
            <MenuItem value="GP">Guadeloupe</MenuItem>
            <MenuItem value="GU">Guam</MenuItem>
            <MenuItem value="GT">Guatemala</MenuItem>
            <MenuItem value="GG">Guernsey</MenuItem>
            <MenuItem value="GN">Guinea</MenuItem>
            <MenuItem value="GW">Guinea-Bissau</MenuItem>
            <MenuItem value="GY">Guyana</MenuItem>
            <MenuItem value="HT">Haiti</MenuItem>
            <MenuItem value="HM">Heard Island and Mcdonald Islands</MenuItem>
            <MenuItem value="VA">Holy See (Vatican City State)</MenuItem>
            <MenuItem value="HN">Honduras</MenuItem>
            <MenuItem value="HK">Hong Kong</MenuItem>
            <MenuItem value="HU">Hungary</MenuItem>
            <MenuItem value="IS">Iceland</MenuItem>
            <MenuItem value="IN">India</MenuItem>
            <MenuItem value="ID">Indonesia</MenuItem>
            <MenuItem value="IR">Iran, Islamic Republic of</MenuItem>
            <MenuItem value="IQ">Iraq</MenuItem>
            <MenuItem value="IE">Irelancoverd</MenuItem>
            <MenuItem value="IM">Isle of Man</MenuItem>
            <MenuItem value="IL">Israel</MenuItem>
            <MenuItem value="IT">Italy</MenuItem>
            <MenuItem value="JM">Jamaica</MenuItem>
            <MenuItem value="JP">Japan</MenuItem>
            <MenuItem value="JE">Jersey</MenuItem>
            <MenuItem value="JO">Jordan</MenuItem>
            <MenuItem value="KZ">Kazakhstan</MenuItem>
            <MenuItem value="KE">Kenya</MenuItem>
            <MenuItem value="KI">Kiribati</MenuItem>
            <MenuItem value="KP">
              Korea, Democratic People's Republic of
            </MenuItem>
            <MenuItem value="KR">Korea, Republic of</MenuItem>
            <MenuItem value="XK">Kosovo</MenuItem>
            <MenuItem value="KW">Kuwait</MenuItem>
            <MenuItem value="KG">Kyrgyzstan</MenuItem>
            <MenuItem value="LA">Lao People's Democratic Republic</MenuItem>
            <MenuItem value="LV">Latvia</MenuItem>
            <MenuItem value="LB">Lebanon</MenuItem>
            <MenuItem value="LS">Lesotho</MenuItem>
            <MenuItem value="LR">Liberia</MenuItem>
            <MenuItem value="LY">Libyan Arab Jamahiriya</MenuItem>
            <MenuItem value="LI">Liechtenstein</MenuItem>
            <MenuItem value="LT">Lithuania</MenuItem>
            <MenuItem value="LU">Luxembourg</MenuItem>
            <MenuItem value="MO">Macao</MenuItem>
            <MenuItem value="MK">
              Macedonia, the Former Yugoslav Republic of
            </MenuItem>
            <MenuItem value="MG">Madagascar</MenuItem>
            <MenuItem value="MW">Malawi</MenuItem>
            <MenuItem value="MY">Malaysia</MenuItem>
            <MenuItem value="MV">Maldives</MenuItem>
            <MenuItem value="ML">Mali</MenuItem>
            <MenuItem value="MT">Malta</MenuItem>
            <MenuItem value="MH">Marshall Islands</MenuItem>
            <MenuItem value="MQ">Martinique</MenuItem>
            <MenuItem value="MR">Mauritania</MenuItem>
            <MenuItem value="MU">Mauritius</MenuItem>
            <MenuItem value="YT">Mayotte</MenuItem>
            <MenuItem value="MX">Mexico</MenuItem>
            <MenuItem value="FM">Micronesia, Federated States of</MenuItem>
            <MenuItem value="MD">Moldova, Republic of</MenuItem>
            <MenuItem value="MC">Monaco</MenuItem>
            <MenuItem value="MN">Mongolia</MenuItem>
            <MenuItem value="ME">Montenegro</MenuItem>
            <MenuItem value="MS">Montserrat</MenuItem>
            <MenuItem value="MA">Morocco</MenuItem>
            <MenuItem value="MZ">Mozambique</MenuItem>
            <MenuItem value="MM">Myanmar</MenuItem>
            <MenuItem value="NA">Namibia</MenuItem>
            <MenuItem value="NR">Nauru</MenuItem>
            <MenuItem value="NP">Nepal</MenuItem>
            <MenuItem value="NL">Netherlands</MenuItem>
            <MenuItem value="AN">Netherlands Antilles</MenuItem>
            <MenuItem value="NC">New Caledonia</MenuItem>
            <MenuItem value="NZ">New Zealand</MenuItem>
            <MenuItem value="NI">Nicaragua</MenuItem>
            <MenuItem value="NE">Niger</MenuItem>
            <MenuItem value="NG">Nigeria</MenuItem>
            <MenuItem value="NU">Niue</MenuItem>
            <MenuItem value="NF">Norfolk Island</MenuItem>
            <MenuItem value="MP">Northern Mariana Islands</MenuItem>
            <MenuItem value="NO">Norway</MenuItem>
            <MenuItem value="OM">Oman</MenuItem>
            <MenuItem value="PK">Pakistan</MenuItem>
            <MenuItem value="PW">Palau</MenuItem>
            <MenuItem value="PS">Palestinian Territory, Occupied</MenuItem>
            <MenuItem value="PA">Panama</MenuItem>
            <MenuItem value="PG">Papua New Guinea</MenuItem>
            <MenuItem value="PY">Paraguay</MenuItem>
            <MenuItem value="PE">Peru</MenuItem>
            <MenuItem value="PH">Philippines</MenuItem>
            <MenuItem value="PN">Pitcairn</MenuItem>
            <MenuItem value="PL">Poland</MenuItem>
            <MenuItem value="PT">Portugal</MenuItem>
            <MenuItem value="PR">Puerto Rico</MenuItem>
            <MenuItem value="QA">Qatar</MenuItem>
            <MenuItem value="RE">Reunion</MenuItem>
            <MenuItem value="RO">Romania</MenuItem>
            <MenuItem value="RU">Russian Federation</MenuItem>
            <MenuItem value="RW">Rwanda</MenuItem>
            <MenuItem value="BL">Saint Barthelemy</MenuItem>
            <MenuItem value="SH">Saint Helena</MenuItem>
            <MenuItem value="KN">Saint Kitts and Nevis</MenuItem>
            <MenuItem value="LC">Saint Lucia</MenuItem>
            <MenuItem value="MF">Saint Martin</MenuItem>
            <MenuItem value="PM">Saint Pierre and Miquelon</MenuItem>
            <MenuItem value="VC">Saint Vincent and the Grenadines</MenuItem>
            <MenuItem value="WS">Samoa</MenuItem>
            <MenuItem value="SM">San Marino</MenuItem>
            <MenuItem value="ST">Sao Tome and Principe</MenuItem>
            <MenuItem value="SA">Saudi Arabia</MenuItem>
            <MenuItem value="SN">Senegal</MenuItem>
            <MenuItem value="RS">Serbia</MenuItem>
            <MenuItem value="CS">Serbia and Montenegro</MenuItem>
            <MenuItem value="SC">Seychelles</MenuItem>
            <MenuItem value="SL">Sierra Leone</MenuItem>
            <MenuItem value="SG">Singapore</MenuItem>
            <MenuItem value="SX">Sint Maarten</MenuItem>
            <MenuItem value="SK">Slovakia</MenuItem>
            <MenuItem value="SI">Slovenia</MenuItem>
            <MenuItem value="SB">Solomon Islands</MenuItem>
            <MenuItem value="SO">Somalia</MenuItem>
            <MenuItem value="ZA">South Africa</MenuItem>
            <MenuItem value="GS">
              South Georgia and the South Sandwich Islands
            </MenuItem>
            <MenuItem value="SS">South Sudan</MenuItem>
            <MenuItem value="ES">Spain</MenuItem>
            <MenuItem value="LK">Sri Lanka</MenuItem>
            <MenuItem value="SD">Sudan</MenuItem>
            <MenuItem value="SR">Suriname</MenuItem>
            <MenuItem value="SJ">Svalbard and Jan Mayen</MenuItem>
            <MenuItem value="SZ">Swaziland</MenuItem>
            <MenuItem value="SE">Sweden</MenuItem>
            <MenuItem value="CH">Switzerland</MenuItem>
            <MenuItem value="SY">Syrian Arab Republic</MenuItem>
            <MenuItem value="TW">Taiwan, Province of China</MenuItem>
            <MenuItem value="TJ">Tajikistan</MenuItem>
            <MenuItem value="TZ">Tanzania, United Republic of</MenuItem>
            <MenuItem value="TH">Thailand</MenuItem>
            <MenuItem value="TL">Timor-Leste</MenuItem>
            <MenuItem value="TG">Togo</MenuItem>
            <MenuItem value="TK">Tokelau</MenuItem>
            <MenuItem value="TO">Tonga</MenuItem>
            <MenuItem value="TT">Trinidad and Tobago</MenuItem>
            <MenuItem value="TN">Tunisia</MenuItem>
            <MenuItem value="TR">Turkey</MenuItem>
            <MenuItem value="TM">Turkmenistan</MenuItem>
            <MenuItem value="TC">Turks and Caicos Islands</MenuItem>
            <MenuItem value="TV">Tuvalu</MenuItem>
            <MenuItem value="UG">Uganda</MenuItem>
            <MenuItem value="UA">Ukraine</MenuItem>
            <MenuItem value="AE">United Arab Emirates</MenuItem>
            <MenuItem value="GB">United Kingdom</MenuItem>
            <MenuItem value="US">United States</MenuItem>
            <MenuItem value="UM">United States Minor Outlying Islands</MenuItem>
            <MenuItem value="UY">Uruguay</MenuItem>
            <MenuItem value="UZ">Uzbekistan</MenuItem>
            <MenuItem value="VU">Vanuatu</MenuItem>
            <MenuItem value="VE">Venezuela</MenuItem>
            <MenuItem value="VN">Viet Nam</MenuItem>
            <MenuItem value="VG">Virgin Islands, British</MenuItem>
            <MenuItem value="VI">Virgin Islands, U.s.</MenuItem>
            <MenuItem value="WF">Wallis and Futuna</MenuItem>
            <MenuItem value="EH">Western Sahara</MenuItem>
            <MenuItem value="YE">Yemen</MenuItem>
            <MenuItem value="ZM">Zambia</MenuItem>
            <MenuItem value="ZW">Zimbabwe</MenuItem>
          </Select>
        </FormControl>
        {/* <TextField id="outlined-basic" label="Enter City" placeholder='Enter City' variant="outlined" value={cityName} onChange={(e)=>setCity(e.target.value)}/> */}
        <TextField
          InputProps={{
            sx: {
              "& input": {
                backgroundColor: `rgb(${"0,0,0,0.4"})`,
                color: "white",
                border: "2px solid white",
              },
            },
          }}
          value={cityName}
          onChange={(e) => setCity(e.target.value)}
          id="filled-basic"
          label="Enter City Name"
          variant="filled"
        />
        <Button variant="contained" onClick={() => getTemp()}>
          Get Weather Info
        </Button>
      </div>
      {temp.length !== 0 ? (
        <div
          style={{
            border: "10px solid white",
            borderRadius: "20px",
            marginBottom: "20px",
            backgroundColor: `rgb(${"0,0,0,0.7"})`,
            marginTop: window.innerWidth <= 590 ? "100px" : null,
          }}
        >
          <div>
            <h2 style={{ padding: "10px 20px", color: "white" }}>
              {" "}
              {"feels like " +
                Math.round(weatherData.main.temp - 273.15) +
                "°C"}
            </h2>
          </div>
          <div>
            <h2 style={{ padding: "10px 20px", color: "white" }}>
              {" "}
              {"Humidity: " + weatherData.main.humidity + "%"}
            </h2>
          </div>
          <div>
            <h2 style={{ padding: "10px 20px", color: "white" }}>
              {" "}
              {"Pressure: " + weatherData.main.pressure + " hectopascal"}
            </h2>
          </div>
          <div>
            {weatherData.weather.map((we) => (
              <h2 style={{ padding: "10px 20px", color: "white" }}>
                {we.main + ": " + we.description}
              </h2>
            ))}
          </div>
          <div>
            <h2 style={{ padding: "10px 20px", color: "white" }}>
              {" "}
              {"Visibility: " + weatherData.visibility + " meters"}
            </h2>
          </div>
          <div>
            <h2 style={{ padding: "10px 20px", color: "white" }}>
              {" "}
              {"Wind Speed: " + weatherData.wind.speed + " m/s"}
            </h2>
          </div>
          <div>
            <h2 style={{ padding: "10px 20px", color: "white" }}>
              {" "}
              {"Wind Direction: " + weatherData.wind.deg + "°"}
            </h2>
          </div>
        </div>
      ) : load === true ? (
        <h2>
          <CircularProgress />
        </h2>
      ) : (
        <div style={{ height: "50vh" }}></div>
      )}
    </div>
  );
}
export default App;
