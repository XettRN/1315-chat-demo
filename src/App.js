import React, { useRef, useState } from 'react';
import './App.css';

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, orderBy, limit, query, addDoc, serverTimestamp } from '@firebase/firestore';
import { getAnalytics } from 'firebase/analytics'

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { getAuth, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, signOut } from '@firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAVWpEBV8YaAYQ9xiTtuUpk4dTlT-S4Zqk",
  authDomain: "chat-demo-7da3e.firebaseapp.com",
  projectId: "chat-demo-7da3e",
  storageBucket: "chat-demo-7da3e.appspot.com",
  messagingSenderId: "1019347150054",
  appId: "1:1019347150054:web:3d14a52869b1b47f224727",
  measurementId: "G-5XCJTHWX6D"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const analytics = getAnalytics(app);

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>⚛️🔥💬</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    signInWithPopup(auth, new GoogleAuthProvider());
  }

  const emailLogin = async (e, p) => {
    await signInWithEmailAndPassword(auth, e, p);
  }

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <>
      <form>
        <input className='loginInfo' 
          type='text' 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder='Email' />
      </form>
      <form>
        <input className='loginInfo'
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='Password' />
      </form>
      <button className="googleLogin" onClick={() => emailLogin(email, password)} disabled={!email || !password}>Sign in with Email</button>
      <button className="googleLogin" onClick={signInWithGoogle}>Sign in with Google</button>
    </>
  )
}

function SignOut() {
  return (
    <button className="sign-out" onClick={() => signOut(auth)}>Sign Out</button>
  )
}

function ChatRoom() {
  const dummy = useRef();
  const messageRef = collection(firestore, 'message');
  const q = query(messageRef, orderBy('createdAt'), limit(25));

  const [messages] = useCollectionData(q, {idField: 'id'});

  const[formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();
    
    const { uid, photoURL } = auth.currentUser;

    await addDoc(messageRef, {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({behavior: 'smooth'});
  }

  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

        <span ref={dummy}></span>
      </main>

      <form className='messageBox' onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />

        <button className='send' type="submit" disabled={!formValue}>🕊️</button>
      </form>
    </>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <>
      <div className={`message ${messageClass}`}>
        <img src={photoURL || 'https://www.tenforums.com/geek/gars/images/2/types/thumb_15951118880user.png'}/>
        <p>{text}</p>
      </div>
    </>
  )
}

export default App;
