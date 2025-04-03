

import { Route, Routes } from 'react-router-dom'
import { UserProfile } from './components/user/UserProfile'
import Login from './components/common/Login'
import SignUp from './components/common/SignUp'
import axois from "axios"
import PrivateRoutes from './components/hooks/PrivateRoute'
import { AddRide } from './components/ride/AddRide'
import Homepage from './components/pages/Homepage'
import { RidesPage } from './components/pages/RidesPage'
import { RideDetails } from './components/pages/RideDetails'
import { ResetPassword } from './components/common/ResetPassword'
// import DriverDashboard from './components/layouts/DriverDashboard'
import OfferRide from './components/layouts/OfferRide'
import MyRides from './components/layouts/MyRides'
import Earnings from './components/layouts/Earnings'
import DriverProfile from './components/layouts/DriverProfile'
import DriverLogin from './components/layouts/DriverLogin'
// import { NavbarSelector } from './components/layouts/NavbarSelector'
import Dashboard from './components/layouts/DriverDashboard'
import { RideConfirmation } from './components/pages/RideConfirmation'
import UserNavbar from "./components/layouts/UserNavbar";
import DriverSignup from './components/layouts/DriverSignup'
import DriverNavbar from './components/layouts/DriverNavbar'
import DriverDashboard from './components/layouts/DriverDashboard'
import DriverLandingPage from './components/layouts/DriverLandingPage'

function App() {
  axois.defaults.baseURL = "http://localhost:3000"

  return (
    <div className="flex flex-col">
      <UserNavbar />
      {/* <body className="layout-fixed sidebar-expand-lg bg-body-tertiary">
       <div className='app-wrapper'> */}
      <Routes>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/register" element={<SignUp />}></Route>
        <Route path="/" element={<Homepage />} />
        <Route path="/resetpassword/:token" element={<ResetPassword />}></Route>

        <Route path="" element={<PrivateRoutes />}>
          <Route path="/addride" element={<AddRide />} />
          <Route path="/ride-details/:id" element={<RideDetails />} />
          <Route path="/myrides" element={<RidesPage />} />
          {/* <Route path='/detail' element={<RideDetails />} /> */}
          <Route path="/profile" element={<UserProfile />}></Route>
        </Route>

        <Route path="/driver/dashboard/:driverId" element={<Dashboard />} />
        <Route path="/driver/offer-ride" element={<OfferRide />} />
        <Route path="/driver/rides" element={<MyRides />} />
        <Route path="/driver/earnings" element={<Earnings />} />
        <Route path="/ride/:id" element={<RideDetails />} />
        <Route path="/ride-confirmation" element={<RideConfirmation />} />
        <Route path="/driver/profile" element={<DriverProfile />} />
        <Route path="/driver/login" element={<DriverLogin />} />
        <Route path="/driver/signup" element={<DriverSignup />} />
        <Route path="/driver/dashboard" element={<DriverDashboard />} />
        <Route path="/driver/profile" element={<DriverProfile />} />
        <Route path="/driver/dashboard" element={<DriverDashboard />} />
        <Route path="/driver" element={<DriverLandingPage />} />
      </Routes>
      {/* <Footer /> */}
      {/* </div>
     </body> */}
    </div>
  );
}

export default App
