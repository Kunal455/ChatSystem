import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MessageContainer from './components/MessageContainer';

const Home = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setIsSidebarVisible(false);
  };

  const handleShowSidebar = () => {
    setIsSidebarVisible(true);
    setSelectedUser(null);
  };

  return (
    <div
      className="
        flex justify-between w-full md:w-[70%] h-[95vh] mx-auto 
        rounded-xl shadow-lg bg-gray-100 
        backdrop-blur-lg bg-opacity-90 overflow-hidden border border-gray-300
      "
    >
      {/* Sidebar */}
      <div
        className={`w-full md:w-1/3 ${
          isSidebarVisible ? 'flex' : 'hidden'
        } md:flex`}
      >
        <Sidebar onSelectUser={handleUserSelect} />
      </div>

      {/* Divider (visible on desktop) */}
      <div className="hidden md:flex bg-gray-400 w-[1px]" />

      {/* Message Container */}
      <div
        className={`flex-auto ${
          selectedUser ? 'flex' : 'hidden md:flex'
        }`}
      >
        <MessageContainer onBackUser={handleShowSidebar} />
      </div>
    </div>
  );
};

export default Home;
