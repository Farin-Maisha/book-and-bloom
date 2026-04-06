import { Outlet, Route, Routes } from 'react-router';
import BaseLayout from './views/BaseLayout';
import Books      from "./views/Books";
import About       from './views/About';
import Home from './views/Home';
import Login from './views/Login';
import Categories from "./views/Categories";
import MyLibrary   from './views/MyLibrary';
import Admin       from './views/Admin';
import Signup from './views/Signup';
import BookDetail from "./views/BookDetail";
import Events from "./views/Events";

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
          <Route path="/my-library" element={<MyLibrary />}  />
          <Route path="/admin"      element={<Admin />}      />
          <Route path="/categories" element={<Categories />} />
          <Route path="/about"      element={<About />}      />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/events" element={<Events />} />

          <Route path="/signup" element={<Signup />} />
        </Route>
      </Routes>
      <Toaster position="top-center" toastOptions={{ error: { duration: 5000 } }} />
    </>
  );
}

export default App;