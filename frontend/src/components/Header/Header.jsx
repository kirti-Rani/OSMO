import React from 'react'
import Container from '../container/Container.jsx'
import Logo from '../Logo'
import LogoutBtn from './LogoutBtn'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'


function Header() {

  const authStatus = useSelector((state) => state.auth.status)
  const userData = useSelector((state) => state.auth.userData)
  const navigate = useNavigate()

  const navItems = [
    {
      name: 'Home',
      slug: "/",
      active: true,
    },
    {
      name: "Login",
      slug: "/login",
      active: !authStatus,
    },
    {
      name: "Signup",
      slug: "/signup",
      active: !authStatus,
    },
    {
      name: "Token",
      slug: "/token",
      active: authStatus,
    },
    {
      name: "All Posts",
      slug: "/all-posts",
      active: authStatus,
    },
    {
      name: "Add Post",
      slug: "/add-post",
      active: authStatus,
    },
  ];
  return (
    <header className='py-3 shadow bg-slate-800 text-slate-100'>
      <Container>
        <nav className='flex items-center'>
          <div className='mr-4'>
            <Link to='/' className='flex items-center gap-2 text-xl font-bold'>
              <Logo width='50px' />
              <span>OsMo</span>
            </Link>
          </div>
          <ul className='flex ml-auto'>
            {navItems.map((item) =>
              item.active ? (
                <li key={item.name}>
                  <button
                    onClick={() => navigate(item.slug)}
                    className='inline-bock px-6 py-2 duration-200 hover:bg-slate-700 hover:text-white rounded-full'
                  >{item.name}</button>
                </li>
              ) : null
            )}
            {authStatus && (
              <li className="flex items-center gap-4 ml-2">
                <Link to="/profile" className="flex items-center gap-2 px-2 py-1 hover:bg-slate-700 rounded-full transition-colors group">
                  <span className="px-2">Profile</span>
                  <div className="w-9 h-9 rounded-full bg-slate-800 overflow-hidden border-2 border-transparent group-hover:border-teal-400 flex items-center justify-center shadow-sm shrink-0">
                    {userData?.profileImage ? (
                      <img src={`/temp/${userData.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                      </svg>
                    )}
                  </div>
                </Link>
                <LogoutBtn />
              </li>
            )}
          </ul>
        </nav>
      </Container>
    </header>
  )
}

export default Header
