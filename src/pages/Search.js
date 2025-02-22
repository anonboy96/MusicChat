import React, {  useState } from 'react'
import Sidebar from '../Components/Sidebar'
import Icon from '@mdi/react'
import { mdiMagnify } from '@mdi/js'
import axios from 'axios'
import SongCard from '../Components/SongCard'
import '../App.css'
import Shimmer from '../Components/Shimmer'
import { GoChevronRight, GoChevronUp } from 'react-icons/go'
import Toast from '../Components/Toast'
const Search = () => {
  const [input,setInput]=useState('')
  const [isLoading,setIsLoading]=useState(false)
  const [toastMsg,setToastMsg]=useState('')
  const [toastDisplay,setToastDisplay] = useState(false)
  const [data,setData]=useState([])
    const handleSearch=async(e)=>{
      e.preventDefault();
      setIsLoading(true)
        const options = {
            method: 'GET',
            url: "https://youtube-search-and-download.p.rapidapi.com/search",
            params: {
              query: input+" songs",
              
              hl: 'en',
              gl: 'IN',
              
            },
            headers: {
              'x-rapidapi-key': 'f68befd8f3msha59f7f16fe25898p1057a6jsn1a3a7eebca21',
              'x-rapidapi-host': 'youtube-search-and-download.p.rapidapi.com'
            }
          };

try {
	const response = await axios.request(options);
	setData(response.data.contents)
    setIsLoading(false)
} catch (error) {
	console.error(error);
}

    }
    const shimmerArr=[1,2,3,4,5,6,7,8,9,10,11,12,13,14]
  return (
    <React.Fragment>
     <div className="flex gap-0 h-screen overflow-hidden -mt-8   bg-black ">
    <div className=''>
    <div className='text-white ml-5 text-xl flex justify-start  items-end   '>
      <b>Search</b>
      </div>
    
      <form onSubmit={(e)=>e.preventDefault()} className='flex gap-2'>
      <input 
      type='text'
      value={input}
      onChange={(e)=>setInput(e.target.value)}
      className='border pl-2 pr-2 ml-5 mt-8 w-60 bg-slate-50 rounded-lg text-sm p-2 outline-none text-black'
      placeholder='Find your track...'
      />
        <button type='submit'
        className='bg-slate-50 p-2 rounded-lg text-gray-500 mt-8'
        onClick={(e)=>handleSearch(e)} >
          <Icon path={mdiMagnify} size={1} />
        </button>
      </form>
      <div className=' mt-10 mx-auto mb-10 '>
   
        <div className='flex flex-col overflow-hidden h-screen  overflow-y-scroll w-screen ' style={{height:window.innerHeight}} >
        {
            !isLoading && data.length>0 ?(data.map((obj,index)=>(
                'video' in obj ?(
<SongCard key={index} image={obj.video.thumbnails[0].url} title={obj.video.title} id={obj.video.videoId} channelName={obj.video.channelName} setToastDisplay={setToastDisplay} setToastMsg={setToastMsg}  />
                ):(
                 <>
                 </>
                )  
            ))):(isLoading ? (shimmerArr.map((data,index)=>(<Shimmer />))):(<div className='flex flex-col justify-center items-center mt-14 m-3 text-slate-50'>
            
            <img src={require('../assests/tape.png')} height={200} width={200} />
            <h5 className='mt-7'><b>Find your favorite tracks here</b></h5>
            <p className='text-sm text-center'>Listen your loved tracks and artists works with your loved ones together! </p>
            </div>) )
        }
        </div>
        {
          toastDisplay && (
            <div className='flex justify-center'>
            <Toast message={toastMsg} />
            </div>
          )
        }
      
      </div>
      
    </div>
    
    </div>
    </React.Fragment>
  )
}

export default Search