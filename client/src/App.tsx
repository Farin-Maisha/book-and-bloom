import { Outlet, Route, Routes } from 'react-router';
import BaseLayout from './views/BaseLayout';
import Books      from "./views/Books";
import Home from './views/Home';
import Login from './views/Login';
import Categories from "./views/Categories";
import Signup from './views/Signup';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Routes>
        <Route
          element={
            <BaseLayout>
              <Outlet />
            </BaseLayout>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/books"      element={<Books />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/signup" element={<Signup />} />
        </Route>
      </Routes>
      <Toaster position="top-center" toastOptions={{ error: { duration: 5000 } }} />
    </>
  );
}

export default App;