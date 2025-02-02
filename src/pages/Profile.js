import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase-config';
import { signOut } from 'firebase/auth';
import { IoBookmarksOutline } from 'react-icons/io5';
import { useStateContext } from '../Context/ContextProvider';
import { Link, useNavigate } from 'react-router-dom';

const Profile = () => {
  const nav = useNavigate();
  const [myRoom, setMyRoom] = useState([]);
  const { setPathName } = useStateContext();

  // Sign out user and navigate to home
  const signOutUser = () => {
    signOut(auth)
      .then(() => {
        setPathName('/');
        nav('/');
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // Fetch user's rooms from Firestore
  useEffect(() => {
    const getData = async () => {
      const filteredQuery = query(collection(db, 'room'), where('roomAdmin', '==', Cookies.get('name')));
      const data = await getDocs(filteredQuery);
      setMyRoom(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    getData();
  }, []);

  // Exit room functionality
  const handleExitRoom = async () => {
    const roomCode = sessionStorage.getItem('roomCode');
    if (!roomCode) {
      console.error("No room code found in session storage.");
      return; // Exit if no room code is present
    }

    const roomRef = doc(db, 'room', roomCode);
    try {
      const currentMembersSnapshot = await getDocs(query(collection(db, 'room'), where('roomCode', '==', roomCode)));
      
      if (!currentMembersSnapshot.empty) {
        const currentMembers = currentMembersSnapshot.docs[0].data().members || [];
        const updatedMembers = currentMembers.filter(member => member !== Cookies.get('name'));
        
        await updateDoc(roomRef, { members: updatedMembers });

        // Clear session storage and update state
        sessionStorage.removeItem('roomCode');
        setMyRoom([]); // Optionally clear the rooms state

        // Redirect to home page after exiting the room
        nav('/'); // Redirect to home page
      } else {
        console.error("Room not found or members list is empty.");
      }
    } catch (error) {
      console.error("Error exiting room:", error);
    }
  };

  return (
    <div className='flex flex-col bg-black min-h-screen p-4'>
      <div className='text-white text-2xl font-bold mb-4'>Profile</div>
      
      <div className="flex flex-col items-center mb-6">
        <img src={Cookies.get('photoUrl')} alt="Profile" className='rounded-full h-24 w-24 mb-2' />
        <p className='text-slate-100 text-lg'>{Cookies.get('name')}</p>
        <p className='text-slate-100 text-sm'>{Cookies.get('email')}</p>
        <p className='text-slate-100 text-sm'>
          {sessionStorage.getItem('roomCode') ? `Current Room: ${sessionStorage.getItem('roomCode')}` : 'No room joined'}
        </p>
      </div>

      <div className='text-white text-lg font-semibold mb-2'>My Rooms</div>
      <div className="bg-gray-800 text-slate-200 rounded-md p-2 h-32 overflow-y-auto">
        {myRoom.length > 0 ? (
          myRoom.map((data) => (
            <div key={data.id} className='flex items-center gap-2 p-1 hover:bg-gray-700 rounded'>
              <IoBookmarksOutline color='white' size={16} />
              <span>{data.roomCode}</span>
            </div>
          ))
        ) : (
          <div className='text-center text-slate-100'>No rooms created yet!</div>
        )}
      </div>

      {/* Exit Room Button */}
      {sessionStorage.getItem('roomCode') && (
        <button 
          className='mt-4 text-slate-50 flex items-center justify-start text-sm bg-red-60 hover:bg-red-500 p-2 rounded'
          onClick={handleExitRoom}>
          Exit Room
        </button>
      )}

      {/* Other Links */}
      <div className='mt-4 mb-4 flex flex-col gap-3'>
        <h6 className='text-white font-semibold'>Others</h6>
        
        <Link to={'/third-party'} className='no-underline'>
          <button className='text-slate-50 flex items-center justify-start text-sm bg-gray-70 hover:bg-gray-600 p-2 rounded'>
            Third-party Software
          </button>
        </Link>

        <Link to={'/privacy-policy'} className='no-underline'>
          <button className='text-slate-50 flex items-center justify-start text-sm bg-gray-70 hover:bg-gray-600 p-2 rounded'>
            Privacy Policy
          </button>
        </Link>

        <Link to={'/terms'} className='no-underline'>
          <button className='text-slate-50 flex items-center justify-start text-sm bg-gray-70 hover:bg-gray-600 p-2 rounded'>
            Terms and Conditions
          </button>
        </Link>

        <button 
         className='text-slate-50 flex items-center justify-start text-sm bg-gray-70 hover:bg-gray-600 p-2 rounded'
          onClick={() => window.location.href = 'https://www.instagram.com/_umangggg__'}>
          Go to Instagram
        </button>

        <button 
          className='text-slate-50 flex items-center justify-start text-sm bg-red-60 hover:bg-red-500 p-2 rounded'
          onClick={signOutUser}>
          Log out
        </button>
      </div>
    </div>
  );
}

export default Profile;
