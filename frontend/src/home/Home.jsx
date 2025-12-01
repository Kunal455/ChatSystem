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
    <div className="flex justify-between w-screen h-screen bg-gradient-to-br from-gray-900 to-gray-700 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`w-full md:w-2/5 ${isSidebarVisible ? 'flex' : 'hidden'
          } md:flex flex-col`}
      >
        <Sidebar onSelectUser={handleUserSelect} />
      </div>

      {/* Divider (visible on desktop) */}
      <div className="hidden md:flex bg-white/5 w-[1px]" />

      {/* Message Container */}
      <div
        className={`flex-1 ${selectedUser ? 'flex' : 'hidden md:flex'
          } flex-col`}
      >
        <MessageContainer onBackUser={handleShowSidebar} />
      </div>
    </div>
  );
};

export default Home;
