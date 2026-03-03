import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import ServerList from './pages/ServerList';
import ServerDetail from './pages/ServerDetail';
import AddServerUser from './pages/AddServerUser';
import ServerForm from './components/ServerForm';
import Terminal from './components/Terminal';
import './styles/base.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/servers" element={<ServerList />} />
            <Route path="/servers/:id" element={<ServerDetail />} />
            <Route path="/servers/:id/add-user" element={<AddServerUser />} />
            <Route path="/servers/:serverId/users/:userId/edit" element={<AddServerUser />} />
            <Route path="/add-server" element={<ServerForm />} />
            <Route path="/terminal/:serverId/:userId" element={<Terminal />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
