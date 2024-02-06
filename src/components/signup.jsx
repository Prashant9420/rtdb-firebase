import React,{useState} from 'react'
import bgImg from '../imgs/bgImg2.jpg'
import styles from './signup.module.css'
// import {toast} from 'react-toastify';
import {useNavigate} from 'react-router-dom'
import VisibilityIcon from '@mui/icons-material/Visibility';
import {auth} from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth'; 
// import SERVER_URL from '../utils/Server_Url';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
const Signup = () => {
  const [username,setUsername]=useState();
  const [email,setEmail]=useState();
  const [password,setPassword]=useState();
  const [confirmPassword,setConfirmPassword]=useState();
  const [visible,setVisible]=useState(1);
  const [visible2,setVisible2]=useState(1);
  const saveUser=async ()=>{
    try {
      await createUserWithEmailAndPassword(auth,email, password);
      console.log('user created');
      navigate('/signin');
    } catch (error) {
      console.log(error.message);
      if(error.message==='Firebase: Error (auth/email-already-in-use).'){
        alert('Email already in use');
      }
      else if(error.message==='Firebase: Error (auth/invalid-email).'){
        alert('invalid email');
      } 

    }
  }
  const handleSignUp=()=>{
    if(!username || !email || !password || !confirmPassword){
      alert("please fill all the fields");
        return;
    }
    else if(password!==confirmPassword){
     alert("password and confirm password are'nt matching");
        return;
    }
    saveUser();
  
  }
  
  const navigate=useNavigate();
  return (
    <div className='Container' style={{
        height:'100vh',
        backgroundImage:`url(${bgImg})`,
        backgroundRepeat:'no-repeat',
        backgroundSize:'cover',
        display:'flex',
        justifyContent:'center',
        alignItems:'center'
    }}>
      <div style={{width:'30%',display:'flex',flexDirection:'column',justifyContent:'space-around',alignItems:'center',height:'460px'}}>
      <h1 style={{color:'white',}}>Sign Up</h1>
      <div style={{display:'flex',flexDirection:'column',width:'100%',height:'60%',position:'relative'}}>
        <input value={username} type='text' className={styles.inputField} placeholder='Username' onChange={(e)=>setUsername(e.target.value)}/>
        <input value={email} type='email' className={styles.inputField} placeholder='Email' onChange={(e)=>setEmail(e.target.value)}/>
        <input value={password} type={(visible===0)?'text':'password'} className={styles.inputField} placeholder='Password' onChange={(e)=>setPassword(e.target.value)}/>
        <input value={confirmPassword} type={(visible2===0)?'text':'password'} className={styles.inputField} placeholder='Confirm Password' onChange={(e)=>setConfirmPassword(e.target.value)}/>
        <div style={{cursor:'pointer',position:'absolute',right:'0',top:'135px',paddingRight:'10px'}}>{(visible===1)?<VisibilityIcon  sx={{color:'white'}} onClick={()=>setVisible(0)}/>:<VisibilityOffIcon sx={{color:'white'}} onClick={()=>setVisible(1)}/>}
        </div>
        <div style={{cursor:'pointer',position:'absolute',right:'0',top:'200px',paddingRight:'10px'}}>{(visible2===1)?<VisibilityIcon  sx={{color:'white'}} onClick={()=>setVisible2(0)}/>:<VisibilityOffIcon sx={{color:'white'}} onClick={()=>setVisible2(1)}/>}
        </div>
      </div>
      <button className={styles.but} onClick={handleSignUp}>Sign Up</button>
      <h3 onClick={()=>navigate('/signin')} className={styles.signin}>already have an account? sign in</h3>
      </div>


    </div>
  )
}

export default Signup